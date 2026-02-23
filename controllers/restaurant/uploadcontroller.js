const Restaurant = require("../../models/restaurant");
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

    // ✅ Save image URL to restaurant document
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }

    restaurant.image = result.secure_url;
    await restaurant.save();

    res.json({ success: true, data: restaurant });
  } catch (error) {
    console.error("Upload controller error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
