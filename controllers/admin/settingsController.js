const Settings = require("../../models/settings");

// Get or create default settings
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update settings
exports.updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();

    // Deep merge all incoming fields
    const allowed = [
      "claimPricing",
      "firstYearDiscount",
      "productPlans",
      "adPricing",
      "promoPricing",
      "cravingsPricing",
      "priorityDeliveryMonthly",
    ];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });

    await settings.save();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
