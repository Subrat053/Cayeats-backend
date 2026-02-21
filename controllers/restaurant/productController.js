const Product = require("../../models/product");
const Restaurant = require("../../models/restaurant");

// GET all products for the logged-in restaurant
exports.getProducts = async (req, res) => {
  try {
    console.log("🔍 User ID:", req.user._id);

    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    console.log("🔍 Restaurant:", restaurant?._id || "NOT FOUND");

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const products = await Product.find({ restaurant: restaurant._id });
    console.log("🔍 Found products:", products.length);

    res.json({ success: true, data: products });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// POST add a new product
exports.addProduct = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant)
      return res.status(404).json({ message: "Restaurant not found" });

    const { name, description, price, category, image, stock } = req.body;
    const product = await Product.create({
      name,
      description,
      price,
      category,
      image,
      stock,
      restaurant: restaurant._id,
    });
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT update a product
exports.updateProduct = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, restaurant: restaurant._id },
      req.body,
      { new: true },
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE a product
exports.deleteProduct = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      restaurant: restaurant._id,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
