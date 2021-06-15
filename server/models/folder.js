import mongoose from 'mongoose';

const partnerSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'users'
        },
        /**
         * 0 - View only
         * 1 - View, Upload & Delete
         */
        access: {
            type: Number,
            required: true,
            default: 0
        }
    }
);

const folderSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        owner: {
            type: mongoose.Types.ObjectId,
            ref: 'users',
            required: true
        },
        partners: [partnerSchema]
    },
    { collection: 'folders', timestamps: true },
);


const Folder = mongoose.model('folders', folderSchema);

export default Folder;
