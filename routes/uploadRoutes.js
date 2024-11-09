const express = require("express");
const upload = require("../controllers/upload");
const cloudinary = require("../controllers/cloudinary");
const router = express.Router();

// Route لرفع الصور
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("upload before");

    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({ error: error.message });
        }

        console.log("upload after");
        // هنا يمكنك حفظ رابط الصورة في قاعدة البيانات
        return res.status(200).json({ url: result.secure_url });
      }
    );

    stream.end(req.file.buffer);
  } catch (error) {
    console.error("Error in upload route:", error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
