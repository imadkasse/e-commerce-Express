const cloudinary = require("cloudinary").v2;

// إعداد Cloudinary باستخدام بيانات الاعتماد الخاصة بك
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME, // اسم السحابة
  api_key: process.env.API_KEY, // مفتاح API
  api_secret: process.env.API_SECRET, // سر API
});

module.exports = cloudinary;
