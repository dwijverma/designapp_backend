const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const fs = require("fs");

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

// Upload an image
// const uploadResult = await cloudinary.uploader
//   .upload(process.env.CLOUDINARY_URL, {
//     public_id: "design",
//   })
//   .catch((error) => {
//     console.log(error);
//   });

// console.log(uploadResult);

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload the file on cloudinary
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    //file uploaded
    //remove from the temp
    fs.unlinkSync(localFilePath);
    console.log("file is uploaded on cloudinary ", uploadResult.url);
    return uploadResult;
  } catch (error) {
    console.log("uplaod on clodinary failed", error)
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};

// Optimize delivery by resizing and applying auto-format and auto-quality
// const optimizeUrl = cloudinary.url('shoes', {
//     fetch_format: 'auto',
//     quality: 'auto'
// });

// console.log(optimizeUrl);

// Transform the image: auto-crop to square aspect_ratio
// const autoCropUrl = cloudinary.url('shoes', {
//     crop: 'auto',
//     gravity: 'auto',
//     width: 500,
//     height: 500,
// });

// console.log(autoCropUrl);

module.exports = uploadOnCloudinary;
