const FooterPage = require("../../models/footerPage");

// ─── Get all footer pages ──────────────────────────────────
exports.getAllFooterPages = async (req, res) => {
  try {
    const pages = await FooterPage.find().populate(
      "updatedBy",
      "fullName email",
    );
    res.json({ success: true, data: pages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get single footer page by slug ───────────────────────
exports.getFooterPageBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const page = await FooterPage.findOne({ slug }).populate(
      "updatedBy",
      "fullName email",
    );

    if (!page) {
      return res
        .status(404)
        .json({ success: false, message: "Page not found" });
    }

    res.json({ success: true, data: page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Create or update footer page ──────────────────────────
exports.createOrUpdateFooterPage = async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, description, content, faqs, contactInfo, sections } =
      req.body;

    // Validate slug
    const validSlugs = [
      "faq",
      "contact",
      "help",
      "about",
      "privacy",
      "terms",
      "cookies",
      "report-guidelines",
    ];
    if (!validSlugs.includes(slug)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid page slug" });
    }

    let page = await FooterPage.findOne({ slug });

    if (!page) {
      // Create new page
      page = new FooterPage({
        slug,
        title,
        description,
        content,
        faqs,
        contactInfo,
        sections,
        updatedBy: req.user.id,
      });
    } else {
      // Update existing page
      page.title = title || page.title;
      page.description = description || page.description;
      page.content = content || page.content;
      if (faqs) page.faqs = faqs;
      if (contactInfo) page.contactInfo = contactInfo;
      if (sections) page.sections = sections;
      page.updatedBy = req.user.id;
    }

    await page.save();
    await page.populate("updatedBy", "fullName email");

    res.json({
      success: true,
      message: "Page saved successfully",
      data: page,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Add FAQ to a page ─────────────────────────────────────
exports.addFAQ = async (req, res) => {
  try {
    const { slug } = req.params;
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: "Question and answer are required",
      });
    }

    const page = await FooterPage.findOne({ slug });
    if (!page) {
      return res
        .status(404)
        .json({ success: false, message: "Page not found" });
    }

    page.faqs.push({ question, answer });
    page.updatedBy = req.user.id;
    await page.save();
    await page.populate("updatedBy", "fullName email");

    res.json({
      success: true,
      message: "FAQ added successfully",
      data: page,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update specific FAQ ───────────────────────────────────
exports.updateFAQ = async (req, res) => {
  try {
    const { slug, faqId } = req.params;
    const { question, answer } = req.body;

    const page = await FooterPage.findOne({ slug });
    if (!page) {
      return res
        .status(404)
        .json({ success: false, message: "Page not found" });
    }

    const faq = page.faqs.id(faqId);
    if (!faq) {
      return res.status(404).json({ success: false, message: "FAQ not found" });
    }

    if (question) faq.question = question;
    if (answer) faq.answer = answer;
    page.updatedBy = req.user.id;
    await page.save();
    await page.populate("updatedBy", "fullName email");

    res.json({
      success: true,
      message: "FAQ updated successfully",
      data: page,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delete specific FAQ ───────────────────────────────────
exports.deleteFAQ = async (req, res) => {
  try {
    const { slug, faqId } = req.params;

    const page = await FooterPage.findOne({ slug });
    if (!page) {
      return res
        .status(404)
        .json({ success: false, message: "Page not found" });
    }

    page.faqs.id(faqId).deleteOne();
    page.updatedBy = req.user.id;
    await page.save();
    await page.populate("updatedBy", "fullName email");

    res.json({
      success: true,
      message: "FAQ deleted successfully",
      data: page,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update contact info ───────────────────────────────────
exports.updateContactInfo = async (req, res) => {
  try {
    const { slug } = req.params;
    const { email, phone, address, hours } = req.body;

    let page = await FooterPage.findOne({ slug });
    if (!page) {
      return res
        .status(404)
        .json({ success: false, message: "Page not found" });
    }

    page.contactInfo = {
      email: email || page.contactInfo?.email,
      phone: phone || page.contactInfo?.phone,
      address: address || page.contactInfo?.address,
      hours: hours || page.contactInfo?.hours,
    };
    page.updatedBy = req.user.id;
    await page.save();
    await page.populate("updatedBy", "fullName email");

    res.json({
      success: true,
      message: "Contact info updated successfully",
      data: page,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Toggle page active status ─────────────────────────────
exports.togglePageStatus = async (req, res) => {
  try {
    const { slug } = req.params;

    const page = await FooterPage.findOne({ slug });
    if (!page) {
      return res
        .status(404)
        .json({ success: false, message: "Page not found" });
    }

    page.isActive = !page.isActive;
    page.updatedBy = req.user.id;
    await page.save();
    await page.populate("updatedBy", "fullName email");

    res.json({
      success: true,
      message: `Page ${page.isActive ? "activated" : "deactivated"}`,
      data: page,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Initialize default pages ──────────────────────────────
exports.initializeDefaultPages = async (req, res) => {
  try {
    const defaultPages = [
      {
        slug: "faq",
        title: "Frequently Asked Questions",
        description: "Find answers to common questions",
        faqs: [
          {
            question: "How do I search for restaurants on CayEats?",
            answer:
              "You can search for restaurants by using our search bar on the homepage. You can filter by cuisine type, location, or search for specific restaurant names.",
          },
          {
            question: "What payment methods do you accept?",
            answer:
              "We accept credit cards, debit cards, PayPal, and other digital payment methods as configured by your local payment provider.",
          },
        ],
      },
      {
        slug: "contact",
        title: "Contact Us",
        description: "Get in touch with our team",
        contactInfo: {
          email: "info@cayeats.com",
          phone: "+1-345-555-0123",
          address: "123 Main Street, George Town, Cayman Islands",
          hours: "Mon-Fri: 9AM-6PM, Sat: 10AM-4PM, Sun: Closed",
        },
      },
      {
        slug: "help",
        title: "Help Center",
        description: "Help and support resources",
        content:
          "Welcome to our help center. Here you can find articles and guides to help you get the most out of CayEats.",
      },
      {
        slug: "about",
        title: "About Us",
        description: "Learn more about CayEats",
        content:
          "CayEats is Cayman Islands' premier food delivery and restaurant guide platform.",
      },
      {
        slug: "privacy",
        title: "Privacy Policy",
        description: "Our privacy practices",
        content:
          "At CayEats, we are committed to protecting your privacy. This policy outlines how we collect and use your information.",
      },
      {
        slug: "terms",
        title: "Terms of Service",
        description: "Terms and conditions",
        content:
          "By using CayEats, you agree to these terms of service. Please read them carefully.",
      },
      {
        slug: "cookies",
        title: "Cookie Policy",
        description: "How we use cookies",
        content:
          "We use cookies to enhance your experience on CayEats. Learn more about how we use them.",
      },
      {
        slug: "report-guidelines",
        title: "Report Guidelines",
        description: "Guidelines for reporting issues",
        content:
          "When reporting an issue, please provide detailed information to help us resolve it quickly.",
      },
    ];

    for (const page of defaultPages) {
      const exists = await FooterPage.findOne({ slug: page.slug });
      if (!exists) {
        await FooterPage.create(page);
      }
    }

    res.json({
      success: true,
      message: "Default pages initialized successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
