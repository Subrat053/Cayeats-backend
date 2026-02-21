const cloudinary = require("cloudinary").v2;

exports.uploadImage = async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }

  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "cayeats", resource_type: "image" },
          (error, result) => {
            if (error) {
              console.error("Cloudinary error:", error);
              reject(error);
            } else resolve(result);
          },
        )
        .end(req.file.buffer);
    });

    res.json({ success: true, url: result.secure_url });
  } catch (error) {
    console.error("Upload controller error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
