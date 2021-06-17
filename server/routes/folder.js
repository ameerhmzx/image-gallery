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

// Returns folders where owner = authenticated user
router.get('/', authenticated, async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    try {

        let folders = await Folder.find({owner: req.user.id});
        res.status(200).json({
            status: 'success',
            data: folders
        });

    } catch (err) {
        next(err);
    }
});

// Returns folders where partners contain authenticated user
router.get('/shared', authenticated, async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        let folders = await Folder.find({"partners.user": req.user.id});
        folders = folders.populate('owner');
        res.status(200).json({
            status: 'success',
            data: folders
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

// Get partners
router.get('/:folder/partners', authenticated, async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    try {

        let folder = await Folder.findById(req.params.folder);
        if (!isOwner(folder, req.user.id))
            return res.sendStatus(403);

        folder = await folder.populate('partners.user');
        let partners = folder.partners;

        res.status(200).json({
            status: 'success',
            data: partners
        });

    } catch (err) {
        next(err)
    }
});

// Add partner
router.post('/:folder/partners', authenticated, async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        let partner;

        if (!validatePartner(req.user.id, req.body.partner))
            return res.sendStatus(400);

        let folder = await Folder.findById(req.params.folder);
        if (!isOwner(folder, req.user.id))
            return res.sendStatus(403);

        let temp = await User.findOne({email: req.body.partner});
        let partner_id = temp._id;

        for (partner of folder.partners) {
            if (partner.user.toString() === partner_id) {
                let err = {};
                err.status = 409;
                return next(err);
            }
        }

        partner = {user: partner_id};
        if (req.body.access !== undefined && req.body.access === 1)
            partner.access = 1;

        folder.partners.push(partner);
        let data = await folder.save();

        return res.status(200).json({
            status: 'success',
            data: data
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
// TODO: enable partner self remove
router.delete('/:folder/partners/:pid', authenticated, async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        if (!validatePartner(req.user.id, req.params.pid))
            return res.sendStatus(400);

        let folder = await Folder.findById(req.params.folder);
        if (!isOwner(folder, req.user.id))
            return res.sendStatus(403);

        folder.partners = folder.partners.filter(function (partner) {
            return partner.user !== req.params.pid
        });

        let data = await folder.save();
        res.status(200).json({
            status: 'success',
            data: data
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

        let data = await folder.save();
        res.status(200).json({
            status: 'success',
            data: data
        });

    } catch (err) {
        next(err);
    }
});

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
                id: image._id,
                folder: image.folder.toString(),
                path: await getImageDownloadUrl(req, image.path),
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

            // Resize to max 800 width or 800 height
            let image_buffer = await sharp(req.file.buffer).resize(800, 800, {
                withoutEnlargement: true,
                fit: sharp.fit.outside
            }).toBuffer();

            let loc = await uploadImage(req, req.params.folder, image_buffer);

            let image = await Image.create({
                folder: folder._id,
                path: loc,
            });

            image.path = await getImageDownloadUrl(req, loc);

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
        await deleteImage(req, image.path);

        return res.sendStatus(200);

    } catch (err) {
        next(err);
    }
});

export default router;
