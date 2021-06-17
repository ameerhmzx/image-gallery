import uuid from 'uuid-v4';
import path from 'path';

function uploadImage(req, folder_id, image_Buffer) {
    return new Promise((resolve, reject) => {
        let extname = path.extname(req.file.originalname);

        let bucket = req.app.locals.bucket;
        let fileUpload = bucket.file(`images/${folder_id}/${uuid()}${extname}`);

        let blobStream = fileUpload.createWriteStream({
            metadata: {
                contentType: req.file.mimetype
            }
        });

        blobStream.on('error', (error) => {
            reject(error);
        });

        blobStream.on('finish', () => {
            resolve(`${fileUpload.name}`);
        });

        blobStream.end(image_Buffer);
    });
}

async function getImageDownloadUrl(req, loc) {
    let bucket = req.app.locals.bucket;
    let response = await bucket.file(loc).getSignedUrl({
        version: 'v2',
        action: 'read',
        expires: new Date(Date.now() + 1000 * 60 * 60),
    });
    return response[0];
}

async function deleteImage(req, loc) {
    let bucket = req.app.locals.bucket;
    await bucket.file(loc).delete();
}

async function deleteFolder(req, folder_id) {
    let bucket = req.app.locals.bucket;
    await bucket.deleteFiles({
        prefix: `images/${folder_id}/`
    });
}

export { uploadImage, getImageDownloadUrl, deleteImage, deleteFolder }
