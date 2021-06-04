import uuid from 'uuid-v4';
import path from 'path';

function uploadImage(req, folderid) {
    return new Promise((resolve, reject) => {
        var extname = path.extname(req.file.originalname);

        var bucket = req.app.locals.bucket;
        var fileUpload = bucket.file(`images/${folderid}/${uuid()}${extname}`);

        var blobStream = fileUpload.createWriteStream({
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

        blobStream.end(req.file.buffer);
    });
}

async function getImageDownloadUrl(req, loc) {
    var bucket = req.app.locals.bucket;
    var response = await bucket.file(loc).getSignedUrl({
        version: 'v2',
        action: 'read',
        expires: new Date(Date.now() + 1000 * 60 * 60),
    });
    return response[0];
}

async function deleteImage(req, loc) {
    var bucket = req.app.locals.bucket;
    await bucket.file(loc).delete();
}

async function deleteFolder(req, folderid) {
    var bucket = req.app.locals.bucket;
    await bucket.deleteFiles({
        prefix: `images/${folderid}/`
    });
}

export { uploadImage, getImageDownloadUrl, deleteImage, deleteFolder }
