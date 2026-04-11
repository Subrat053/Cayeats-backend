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

    // ✅ Only return the image URL - do NOT update restaurant profile
    // The caller (product form, profile form, etc.) will decide what to do with the URL
    res.json({
      success: true,
      url: result.secure_url,
      image: result.secure_url,
      publicId: result.public_id, // ✅ Also return public_id for deletion purposes
    });
  } catch (error) {
    console.error("Upload controller error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delete Image from Cloudinary ─────────────────────────
exports.deleteImage = async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: "Public ID is required",
      });
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      res.json({
        success: true,
        message: "Image deleted successfully",
      });
    } else {
      res.json({
        success: true,
        message: "Image record removed",
        // Still return success even if Cloudinary deletion had issues
      });
    }
  } catch (error) {
    console.error("Delete image error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
