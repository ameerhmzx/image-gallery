import { Router } from "express";

import Folder from "../models/folder.js";
import User from "../models/user.js";
import Image from "../models/image.js";

import { uploadImage, getImageDownloadUrl, deleteImage, deleteFolder } from './utils/storage.js';
import { haveReadAccess, haveWriteAccess, isOwner, validatePartner } from "./utils/authorization.js";

import authenticated from "./utils/authenticated.js";

import Multer from 'multer';
import path from 'path';

var upload = Multer({
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

var router = Router();

// Returns folders where owner = authenticated user
router.get('/', authenticated, async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    try {

        var folders = await Folder.find({ owner: req.user.id });
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

        var folders = await Folder.find({ "partners.user": req.user.id });
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

        if (req.body.name == undefined)
            return res.sendStatus(400);

        var folder = await Folder.create({ name: req.body.name, owner: req.user.id });
        res.status(201).json({
            status: 'success',
            data: folder
        });

    } catch (err) {
        next(err);
    }
});

// Update folder name
router.put('/:folder', authenticated, async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    try {

        if (req.body.name == undefined)
            return res.sendStatus(400);

        var filter = { _id: req.params.folder };
        await Folder.findOneAndUpdate(filter, { name: req.body.name });

        var folder = await Folder.findOne(filter);
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

        var folder = await Folder.findById(req.params.folder);
        if (!isOwner(folder, req.user.id))
            return res.sendStatus(403);

        var deleted = await Folder.findByIdAndDelete(req.params.folder);
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

        var folder = await Folder.findById(req.params.folder);
        if (!isOwner(folder, req.user.id))
            return res.sendStatus(403);

        var folder = await folder.populate('partners.user');
        var partners = folder.partners;

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
        if (!validatePartner(req.user.id, req.body.partner))
            return res.sendStatus(400);

        var folder = await Folder.findById(req.params.folder);
        if (!isOwner(folder, req.user.id))
            return res.sendStatus(403);

        var temp = await User.findOne({ email: req.body.partner });
        var partnerid = temp._id;

        for (var partner of folder.partners) {
            if (partner.user.toString() == partnerid) {
                var err = {};
                err.status = 409;
                return next(err);
            }
        }

        var partner = { user: partnerid };
        if (req.body.access != undefined && req.body.access == 1)
            partner.access = 1;

        folder.partners.push(partner);
        var data = await folder.save();

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

        if (req.body.access == undefined || req.body.access > 1 || req.body.access < 0)
            return res.sendStatus(400);

        var folder = await Folder.findById(req.params.folder);
        if (!isOwner(folder, req.user.id))
            return res.sendStatus(403);

        for (var partner of folder.partners) {
            if (partner.user == req.params.pid) {
                partner.access = req.body.access;
                var data = await folder.save();
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
        if (!validatePartner(req.user.id, req.params.pid))
            return res.sendStatus(400);

        var folder = await Folder.findById(req.params.folder);
        if (!isOwner(folder, req.user.id))
            return res.sendStatus(403);

        var filtered = folder.partners.filter(function (partner) { return partner.user != req.params.pid });
        folder.partners = filtered;

        var data = await folder.save();
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
        var folder = await Folder.findById(req.params.folder);
        if (!isOwner(folder, req.user.id))
            return res.sendStatus(403);

        folder.partners = [];

        var data = await folder.save();
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
        var folder = await Folder.findById(req.params.folder);
        if (!haveReadAccess(folder, req.user.id))
            return res.sendStatus(403);

        var images = await Image.findMany({ folder: folder._id }).sort({ createdAt: 'desc' });

        images.map(async (image) => image.path = await getImageDownloadUrl(req, image.path));

        return res.status(200).json({
            status: 'success',
            data: images
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
            var folder = await Folder.findById(req.params.folder);
            if (!haveWriteAccess(folder, req.user.id))
                return res.sendStatus(403);

            var loc = await uploadImage(req, req.params.folder);

            var image = await Image.create({
                folder: folder._id,
                path: loc,
            });

            image.path = await getImageDownloadUrl(req, loc);

            return res.status(200).json({
                status: 'success',
                data: image
            });
        } catch (err) {
            next(err);
        }
    }
    return res.sendStatus(500);
});

// Delete image
router.delete('/:folder/images/:iid', authenticated, async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        var folder = await Folder.findById(req.params.folder);
        if (!haveWriteAccess(folder, req.user.id))
            return res.sendStatus(403);

        var image = await Image.findOneAndDelete({ _id: req.params.iid, folder: req.params.folder });
        await deleteImage(req, image.path);

        return res.sendStatus(200);

    } catch (err) {
        next(err);
    }
});

export default router;
