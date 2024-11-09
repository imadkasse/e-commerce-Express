const multer = require("multer");

// إعداد التخزين باستخدام multer
const storage = multer.memoryStorage(); // تخزين مؤقت للملفات في الذاكرة
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // الحد الأقصى لحجم الملف هو 2 ميجابايت
  },
});

module.exports = upload;
