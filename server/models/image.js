import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
    {
        path: {
            type: String,
            required: true,
            unique: true
        },
        thumb: {
            type: String,
            required: true,
            unique: true
        },
        width: {
            type: Number,
            required: true
        },
        height: {
            type: Number,
            required: true
        },
        folder: {
            type: mongoose.Types.ObjectId,
            ref: 'folder',
            required: true
        },
    },
    {collection: 'images', timestamps: true},
);


const Image = mongoose.model('images', imageSchema);

export default Image;
