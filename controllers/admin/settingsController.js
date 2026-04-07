const Settings = require("../../models/settings");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");

const brandingUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/svg+xml",
      "image/x-icon",
      "image/vnd.microsoft.icon",
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Unsupported file format for branding asset"), false);
  },
});

exports.brandingUploadMiddleware = brandingUpload.single("file");

// Get or create default settings
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    // Prevent caching so admin changes are reflected immediately
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
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
      "branding",
      "payments",
      "notifications",
      "claimPricing",
      "firstYearDiscount",
      "yearlyDiscounts",
      "productPlans",
      "adPricing",
      "promoPricing",
      "cravingsPricing",
      "priorityDeliveryMonthly",
      "footer",
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

// Get footer settings (public access)
exports.getFooterSettings = async (req, res) => {
  try {
    // Default footer structure
    const defaultFooter = {
      discover: [
        { label: "All Restaurants", href: "/restaurants" },
        { label: "Cuisines", href: "/cuisines" },
        { label: "Tonight's Cravings", href: "/cravings" },
        { label: "Featured Restaurants", href: "/restaurants?featured=true" },
      ],
      forBusiness: [
        { label: "Partner With Us", href: "/partner" },
        { label: "Restaurant Sign Up", href: "/register?type=restaurant" },
        { label: "Delivery Partners", href: "/register?type=delivery" },
        { label: "Advertising", href: "/advertise" },
      ],
      support: [
        { label: "Help Center", href: "/help" },
        { label: "Contact Us", href: "/contact" },
        { label: "FAQ", href: "/faq" },
        { label: "Report an Issue", href: "/report" },
      ],
      legal: [
        { label: "Terms of Service", href: "/terms" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Cookie Policy", href: "/cookies" },
      ],
    };

    let settings = await Settings.findOne();

    // If no settings exist, create with defaults
    if (!settings) {
      settings = await Settings.create({ footer: defaultFooter });
    } else if (!settings.footer) {
      // If footer doesn't exist in settings, add it
      settings.footer = defaultFooter;
      await settings.save();
    }

    // Build complete footer data - ensure all sections exist
    const footerData = {
      discover:
        settings.footer?.discover &&
        Array.isArray(settings.footer.discover) &&
        settings.footer.discover.length > 0
          ? settings.footer.discover
          : defaultFooter.discover,
      forBusiness:
        settings.footer?.forBusiness &&
        Array.isArray(settings.footer.forBusiness) &&
        settings.footer.forBusiness.length > 0
          ? settings.footer.forBusiness
          : defaultFooter.forBusiness,
      support:
        settings.footer?.support &&
        Array.isArray(settings.footer.support) &&
        settings.footer.support.length > 0
          ? settings.footer.support
          : defaultFooter.support,
      legal:
        settings.footer?.legal &&
        Array.isArray(settings.footer.legal) &&
        settings.footer.legal.length > 0
          ? settings.footer.legal
          : defaultFooter.legal,
    };

    console.log("Footer data returned:", footerData);
    res.json({ success: true, data: footerData });
  } catch (error) {
    console.error("Error in getFooterSettings:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update footer settings (admin only)
exports.updateFooterSettings = async (req, res) => {
  try {
    console.log("Received footer update:", req.body.footer);

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    // Ensure we have all four sections when updating
    if (req.body.footer) {
      settings.footer = {
        discover: req.body.footer.discover || [],
        forBusiness: req.body.footer.forBusiness || [],
        support: req.body.footer.support || [],
        legal: req.body.footer.legal || [],
      };
    }

    await settings.save();
    console.log("Footer updated and saved:", settings.footer);

    res.json({ success: true, data: settings.footer });
  } catch (error) {
    console.error("Error updating footer:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upload a branding image (logo or favicon) to Cloudinary
exports.uploadBrandingImage = async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }
  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "cayeats/branding", resource_type: "auto" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        )
        .end(req.file.buffer);
    });
    res.json({ success: true, url: result.secure_url });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
