const { raw } = require('body-parser');

const cloud = require('cloudinary').v2

//Cloudinary Configuration
cloud.config({
    cloud_name: process.env.FUNDSTRTR_CLOUD_NAME,
    api_key: process.env.FUNDSTRTR_CLOUD_API,
    api_secret: process.env.FUNDSTRTR_CLOUD_SECRET,
});

const uploadPhoto = async(req, res, mediaType, sImage, size) => {
    //if theres no files object in the request object
    if (!req.files) {
        return res.status(400).json({
            status: 'error',
            message: 'No files selected'
        })

    }

    const imageFile = req.files.photo;

    if (!(imageFile.mimetype === mediaType || imageFile.mimetype === sImage))
        return res.status(400).json({
            status: 'error',
            message: 'Invalid file format'
        })

    if (imageFile.size > size) {
        return res.status(400).json({
            status: 'error',
            message: 'Upload file equivalent or lower than file size specified'
        })
    }

    try {
        const userLogoUpload = await cloud.uploader.upload(imageFile.tempFilePath);
        const { url } = userLogoUpload;

        // console.log(url)
        return url;

    } catch (err) {
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        })

    }
}

module.exports = uploadPhoto;