const Category = require("../../models/category");
const Restaurant = require("../../models/restaurant");
const Product = require("../../models/product");

// GET all categories for the logged-in restaurant
exports.getCategories = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user._id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const categories = await Category.find({ restaurant: restaurant._id }).sort(
      { displayOrder: 1, createdAt: 1 },
    );

    res.json({ success: true, data: categories });
  } catch (err) {
    console.error("❌ Error fetching categories:", err);
    res.status(500).json({ message: err.message });
  }
};

// POST create a new category
exports.createCategory = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user._id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const { name, description, icon } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Category name is required" });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({
      restaurant: restaurant._id,
      name: name.trim(),
    });

    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description || "",
      icon: icon || "📦",
      restaurant: restaurant._id,
    });

    res.status(201).json({ success: true, data: category });
  } catch (err) {
    console.error("❌ Error creating category:", err);
    res.status(500).json({ message: err.message });
  }
};

// PUT update a category
exports.updateCategory = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user._id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const { id } = req.params;
    const { name, description, icon, displayOrder, isActive } = req.body;

    const category = await Category.findOne({
      _id: id,
      restaurant: restaurant._id,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if new name conflicts with another category
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({
        restaurant: restaurant._id,
        name: name.trim(),
        _id: { $ne: id },
      });
      if (existingCategory) {
        return res
          .status(400)
          .json({ message: "Category name already exists" });
      }
      category.name = name.trim();
    }

    if (description !== undefined) category.description = description;
    if (icon !== undefined) category.icon = icon;
    if (displayOrder !== undefined) category.displayOrder = displayOrder;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();
    res.json({ success: true, data: category });
  } catch (err) {
    console.error("❌ Error updating category:", err);
    res.status(500).json({ message: err.message });
  }
};

// DELETE a category
exports.deleteCategory = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user._id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const { id } = req.params;

    const category = await Category.findOne({
      _id: id,
      restaurant: restaurant._id,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if any products use this category
    const productsCount = await Product.countDocuments({
      category: id,
      restaurant: restaurant._id,
    });

    if (productsCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category with ${productsCount} product(s). Please reassign or delete products first.`,
      });
    }

    await Category.findByIdAndDelete(id);
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting category:", err);
    res.status(500).json({ message: err.message });
  }
};

// PUT reorder categories
exports.reorderCategories = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user._id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const { categories } = req.body;

    if (!Array.isArray(categories)) {
      return res.status(400).json({ message: "Categories must be an array" });
    }

    // Update display order for all categories
    const updatePromises = categories.map((item, index) =>
      Category.findOneAndUpdate(
        { _id: item._id, restaurant: restaurant._id },
        { displayOrder: index },
        { new: true },
      ),
    );

    const updatedCategories = await Promise.all(updatePromises);
    res.json({ success: true, data: updatedCategories });
  } catch (err) {
    console.error("❌ Error reordering categories:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET category analytics
exports.getCategoryAnalytics = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user._id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const Product = require("../../models/product");

    // Get all categories with product counts and analytics
    const categories = await Category.find({ restaurant: restaurant._id }).sort(
      { displayOrder: 1, createdAt: 1 },
    );

    const analyticsData = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({
          category: category._id,
          restaurant: restaurant._id,
        });

        return {
          _id: category._id,
          name: category.name,
          icon: category.icon,
          viewCount: category.viewCount || 0,
          clickCount: category.clickCount || 0,
          productCount,
          engagement:
            (((category.viewCount || 0) + (category.clickCount || 0)) / 2) *
            100,
          lastViewedAt: category.lastViewedAt,
          createdAt: category.createdAt,
        };
      }),
    );

    // Sort by engagement
    analyticsData.sort((a, b) => b.engagement - a.engagement);

    res.json({ success: true, data: analyticsData });
  } catch (err) {
    console.error("❌ Error fetching category analytics:", err);
    res.status(500).json({ message: err.message });
  }
};
