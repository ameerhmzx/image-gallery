import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.js"
import authenticated from "./utils/authenticated.js";

const router = Router();

router.post('/login', async function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    try {
        let user = await User.findOne({ 'email': req.body.email });

        if(user.length === 0)
            return res.status(401).json({
                status: 'fail',
                code: 'err-wrong-email',
                message: 'User not found!'
            });

        user.comparePassword(req.body.password, function (err, isMatch) {
            if (err)
                return res.sendStatus(400);
            if (isMatch) {
                return res.status(200).json({
                    status: 'success',
                    token: jwt.sign({
                        id: user._id
                    }, process.env.jsecret)
                });
            } else {
                return res.status(401).json({
                    status: 'fail',
                    code: 'err-wrong-pass',
                    message: 'Wrong Password!'
                });
            }
        });
    } catch (err) {
        next(err);
    }
});

router.post('/register', async function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    try {
        const user = await User.create(req.body);
        return res.status(200).json({
            status: 'success',
            token: jwt.sign({
                id: user._id
            }, process.env.jsecret)
        });
    } catch (err) {
        if (err.code === 11000)
            res.status(409);
        next(err);
    }
});

router.get('/', authenticated, async function (req, res, next) {
    try {
        let user = await User.findById(req.user.id);

        res.status(200).json({
            uid: user._id,
            name: user.name,
            email: user.email
        });
    } catch (err) {
        next(err);
    }
});

router.put('/', authenticated, async function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    try {
        const user = await User.findById(req.user.id);
        if (req.body.password != null) {
            user.password = req.body.password;
        }
        if (req.body.name != null) {
            user.name = req.body.name;
        }
        if (req.body.email != null){
            user.email = req.body.email;
        }
        await user.save();
        return res.status(200).json({
            status: 'success',
        });
    } catch (err) {
        next(err);
    }
});

export default router;
