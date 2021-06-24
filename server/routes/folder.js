import {Router} from "express";

import Folder from "../models/folder.js";
import User from "../models/user.js";
import Image from "../models/image.js";

import {deleteFolder, deleteImage, getImageDownloadUrl, uploadImage} from './utils/storage.js';
import {haveReadAccess, haveWriteAccess, isOwner, validatePartner} from "./utils/authorization.js";

import authenticated from "./utils/authenticated.js";

import Multer from 'multer';
import path from 'path';
import paginate from "express-paginate";
import sharp from "sharp";

const upload = Multer({
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: function (_req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images Only!');
        }
    }
});

const router = Router();

/**
 *  Images
 */

// Get image
router.get('/:folder/images', authenticated, async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        let folder = await Folder.findById(req.params.folder);
        if (!haveReadAccess(folder, req.user.id))
            return res.sendStatus(403);

        const [images, imageCount] = await Promise.all([
            Image.find({folder: folder._id})
                .sort({createdAt: 'desc'})
                .limit(req.query.limit)
                .skip(req.skip)
                .lean()
                .exec(),
            Image.countDocuments({folder: folder._id})
        ]);

        const pageCount = Math.ceil(imageCount / req.query.limit);
        let validImages = [];
        for (let image of images) {
            validImages.push({
                _id: image._id,
                folder: image.folder.toString(),
                path: await getImageDownloadUrl(req, image.path),
                width: image.width,
                height: image.height,
                thumb: await getImageDownloadUrl(req, image.thumb),
                createdAt: image.createdAt
            });
        }

        return res.status(200).json({
            status: 'success',
            has_more: paginate.hasNextPages(req)(pageCount),
            imageCount: imageCount,
            pageCount: pageCount,
            data: validImages
        });
    } catch (err) {
        next(err);
    }
});

// Uploads image
router.post('/:folder/images', authenticated, upload.single('image'), async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    if (req.file) {
        try {
            let folder = await Folder.findById(req.params.folder);
            if (!haveWriteAccess(folder, req.user.id))
                return res.sendStatus(403);

            // Resize & generate thumbnail
            let [image_buffer, thumb_buffer] = await Promise.all([
                sharp(req.file.buffer).resize(800, 800, {
                    withoutEnlargement: true,
                    fit: sharp.fit.outside
                }).toBuffer(),
                sharp(req.file.buffer).resize(300, 300, {
                    withoutEnlargement: true,
                    fit: sharp.fit.outside
                }).toBuffer()
            ]);

            let {width, height} = await sharp(image_buffer).metadata();

            // Upload to Firebase Storage
            let [image_path, thumb_path] = await Promise.all(
                [
                    uploadImage(req, req.params.folder, image_buffer),
                    uploadImage(req, req.params.folder, thumb_buffer)
                ]
            );

            let image = await Image.create({
                folder: folder._id,
                path: image_path,
                thumb: thumb_path,
                width: width,
                height: height
            });

            let [path, thumb] = await Promise.all([
                getImageDownloadUrl(req, image_path),
                getImageDownloadUrl(req, thumb_path)
            ]);

            image.path = path;
            image.thumb = thumb;

            return res.status(200).json({
                status: 'success',
                data: image
            });
        } catch (err) {
            return next(err);
        }
    }
    return res.sendStatus(500);
});

// Delete image
router.delete('/:folder/images/:iid', authenticated, async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        let folder = await Folder.findById(req.params.folder);
        if (!haveWriteAccess(folder, req.user.id))
            return res.sendStatus(403);

        let image = await Image.findOneAndDelete({_id: req.params.iid, folder: req.params.folder});

        await Promise.all([
            deleteImage(req, image.path),
            deleteImage(req, image.thumb)
        ]);

        return res.sendStatus(200);

    } catch (err) {
        next(err);
    }
});

/**
 * Partners
 */

// Get partners
router.get('/:folder/partners', authenticated, async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    try {

        let folder = await Folder.findById(req.params.folder);
        if (!isOwner(folder, req.user.id))
            return res.sendStatus(403);

        let populated = await Folder.populate(folder, {
            path: 'partners.user',
            select: 'email'
        });

        res.status(200).json({
            status: 'success',
            data: populated.partners
        });

    } catch (err) {
        next(err)
    }
});

// Add partner
router.post('/:folder/partners', authenticated, async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        let folder = await Folder.findById(req.params.folder);
        if (!isOwner(folder, req.user.id))
            return res.sendStatus(403);

        let temp = await User.findOne({'email': req.body.partner});

        if (!validatePartner(req.user.id, temp._id))
            return res.sendStatus(400);

        let partner_id = temp._id;

        let partner;

        for (partner of folder.partners) {
            if (partner.user.toString() === partner_id.toString()) {
                let err = {};
                err.status = 409;
                return next(err);
            }
        }

        partner = {user: partner_id};
        if (req.body.access !== undefined && req.body.access === 1)
            partner.access = 1;

        folder.partners.push(partner);
        await folder.save();

        let populated = await Folder.populate(folder, {
            path: 'partners.user',
            select: 'email'
        });

        return res.status(200).json({
            status: 'success',
            data: populated.partners
        });

    } catch (err) {
        next(err);
    }
});

// Change partner access 
router.put('/:folder/partners/:pid', authenticated, async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        if (!validatePartner(req.user.id, req.params.pid))
            return res.sendStatus(400);

        if (req.body.access === undefined || req.body.access > 1 || req.body.access < 0)
            return res.sendStatus(400);

        let folder = await Folder.findById(req.params.folder);
        if (!isOwner(folder, req.user.id))
            return res.sendStatus(403);

        for (let partner of folder.partners) {
            if (partner.user === req.params.pid) {
                partner.access = req.body.access;
                let data = await folder.save();
                return res.status(200).json({
                    status: 'success',
                    data: data
                });
            }
        }

        res.sendStatus(404);

    } catch (err) {
        next(err);
    }
});

// Remove partner where userid = pid
router.delete('/:folder/partners/:pid', authenticated, async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        let folder = await Folder.findById(req.params.folder);
        if (!(isOwner(folder, req.user.id) || req.user.id.toString() === req.params.pid.toString()))
            return res.sendStatus(403);

        folder.partners = folder.partners.filter(function (partner) {
            return partner.user.toString() !== req.params.pid.toString()
        });

        await folder.save();
        res.status(200).json({
            status: 'success'
        });

    } catch (err) {
        next(err);
    }
});

// Remove all partners
router.delete('/:folder/partners', authenticated, async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        let folder = await Folder.findById(req.params.folder);
        if (!isOwner(folder, req.user.id))
            return res.sendStatus(403);

        folder.partners = [];

        await folder.save();
        res.status(200).json({
            status: 'success',
        });

    } catch (err) {
        next(err);
    }
});

/**
 * Folders
 */

// Returns folders where owner = authenticated user
router.get('/', authenticated, async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    try {

        let data = [];
        let folders = await Folder.find({owner: req.user.id});
        let getThumb = async (id) => {
            let image = await Image.find({folder: id})
                .sort({createdAt: 'desc'})
                .limit(1);
            if (image.length > 0) {
                return await getImageDownloadUrl(req, image[0]['thumb']);
            } else {
                return undefined;
            }
        };

        for (let folder of folders) {
            data.push({
                _id: folder._id,
                name: folder.name,
                owner: folder.owner,
                partners: folder.partners,
                createdAt: folder.createdAt,
                thumb: await getThumb(folder._id)
            })
        }

        res.status(200).json({
            status: 'success',
            data: data
        });

    } catch (err) {
        next(err);
    }
});

// Returns folders where partners contain authenticated user
router.get('/shared', authenticated, async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        let folders = await Folder.find({"partners.user": req.user.id}, "-partners");

        let data = [];

        let getThumb = async (id) => {
            let image = await Image.find({folder: id})
                .sort({createdAt: 'desc'})
                .limit(1);
            if (image.length > 0) {
                return await getImageDownloadUrl(req, image[0]['thumb']);
            } else {
                return undefined;
            }
        };

        for (let folder of folders) {
            data.push({
                _id: folder._id,
                name: folder.name,
                owner: folder.owner,
                partners: folder.partners,
                createdAt: folder.createdAt,
                thumb: await getThumb(folder._id)
            })
        }

        res.status(200).json({
            status: 'success',
            data: data
        });
    } catch (err) {
        next(err);
    }
});

// Create New Folder
router.post('/', authenticated, async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    try {

        if (req.body.name === undefined || req.body.name.trim() === '')
            return res.sendStatus(400);

        let folder = await Folder.create({name: req.body.name, owner: req.user.id});
        res.status(201).json({
            status: 'success',
            data: folder
        });

    } catch (err) {
        next(err);
    }
});

// Update folder name
// TODO: verify owner
router.put('/:folder', authenticated, async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    try {

        if (req.body.name === undefined)
            return res.sendStatus(400);

        let filter = {_id: req.params.folder};
        await Folder.findOneAndUpdate(filter, {name: req.body.name});

        let folder = await Folder.findOne(filter);
        res.status(200).json({
            status: 'success',
            data: folder
        });

    } catch (err) {
        next(err);
    }
});

// Delete folder along with images in it
router.delete('/:folder', authenticated, async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    try {

        let folder = await Folder.findById(req.params.folder);
        if (!isOwner(folder, req.user.id))
            return res.sendStatus(403);

        let deleted = await Folder.findByIdAndDelete(req.params.folder);
        await deleteFolder(req, req.params.folder);
        res.status(200).json({
            status: 'success',
            data: deleted
        });

    } catch (err) {
        next(err);
    }
});


export default router;
