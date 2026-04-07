const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Restaurant = require("../../models/restaurant");
const Transaction = require("../../models/transaction");
const Settings = require("../../models/settings");

const PLAN_CONFIG = {
  Silver: { duration: 180, label: "Semi-Annual" },
  Gold: { duration: 365, label: "Annual" },
  Platinum: { duration: 730, label: "2-Year" },
};

// ─── Create Checkout Session ──────────────────────────────
exports.createCheckoutSession = async (req, res) => {
  try {
    console.log("Stripe key loaded:", !!process.env.STRIPE_SECRET_KEY);
    console.log("Plan received:", req.body.plan);
    const { plan } = req.body;

    if (!PLAN_CONFIG[plan]) {
      return res.status(400).json({ success: false, message: "Invalid plan" });
    }

    const settings = await Settings.findOne();
    console.log("Settings loaded:", !!settings);

    const restaurant = await Restaurant.findById(req.user._id);
    console.log("Restaurant loaded:", !!restaurant);

    const basePrice = settings?.claimPricing || {
      semiAnnual: 160,
      annual: 240,
    };
    const discount = settings?.firstYearDiscount || 0;
    const isFirstYear = !restaurant?.subscription?.plan;

    const planPriceMap = {
      Silver: basePrice.semiAnnual,
      Gold: basePrice.annual,
      Platinum: basePrice.annual * 2,
    };

    const rawPrice = planPriceMap[plan];
    const finalPrice = isFirstYear
      ? Math.round(rawPrice * (1 - discount / 100))
      : rawPrice;

    console.log("Final price:", finalPrice);
    console.log("FRONTEND_URL:", process.env.FRONTEND_URL);

    console.log("Creating Stripe session...");
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: req.user.email,
      metadata: {
        restaurantId: restaurant._id.toString(),
        userId: req.user._id.toString(),
        plan,
        isFirstYear: isFirstYear.toString(),
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: finalPrice * 100,
            product_data: {
              name: `CayEats ${plan} Plan`,
              description: `${PLAN_CONFIG[plan].label} subscription`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/dashboard/billing?success=true&plan=${plan}`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard/billing?cancelled=true`,
    });

    console.log("Session created:", session.id);
    res.json({ success: true, url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("STRIPE ERROR FULL:", error); // ← full error object
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Stripe Webhook ───────────────────────────────────────
exports.handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return res.status(400).json({ message: `Webhook error: ${err.message}` });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { restaurantId, plan, isFirstYear } = session.metadata;

    const PLAN_CONFIG_DURATION = { Silver: 180, Gold: 365, Platinum: 730 };
    const duration = PLAN_CONFIG_DURATION[plan];
    const startDate = new Date();
    const expiresAt = new Date(
      startDate.getTime() + duration * 24 * 60 * 60 * 1000,
    );
    const amount = session.amount_total / 100;

    await Restaurant.findByIdAndUpdate(restaurantId, {
      subscription: { plan, startDate, expiresAt, autoRenew: true },
      isVerified: true,
    });

    await Transaction.create({
      restaurant: restaurantId,
      type: "restaurant_claim",
      description: `${plan} Plan — ${duration / 30} Month Subscription${isFirstYear === "true" ? " (First Year Discount)" : ""}`,
      amount,
      status: "completed",
      paymentMethod: "stripe",
      stripeSessionId: session.id,
      autoRenew: true,
      renewDate: expiresAt,
    });
  }

  res.json({ received: true });
};

// ─── Get Subscription Status ──────────────────────────────
exports.getSubscriptionPricing = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    // Ensure settings exist with defaults
    if (!settings) {
      settings = await Settings.create({});
    }

    // Migrate from old firstYearDiscount to new yearlyDiscounts if needed
    if (!settings.yearlyDiscounts && settings.firstYearDiscount) {
      settings.yearlyDiscounts = {
        year1: settings.firstYearDiscount,
        year2: 25,
        year3: 25,
      };
      await settings.save();
    }

    const restaurant = await Restaurant.findById(req.user._id);
    const isFirstYear = !restaurant?.subscription?.plan;

    // Get yearly discounts with proper defaults
    const yearlyDiscounts = settings?.yearlyDiscounts || {
      year1: 50,
      year2: 25,
      year3: 25,
    };

    // Get claim pricing with defaults
    const base = settings?.claimPricing || { semiAnnual: 160, annual: 240 };

    // Determine which year the restaurant is in for proper discount
    let currentYear = "year1";
    let currentDiscount = yearlyDiscounts.year1;
    if (restaurant?.subscription?.plan) {
      const createdDate = new Date(restaurant.createdAt);
      const now = new Date();
      const yearsElapsed = Math.floor(
        (now - createdDate) / (365.25 * 24 * 60 * 60 * 1000),
      );
      if (yearsElapsed === 0) {
        currentYear = "year1";
        currentDiscount = yearlyDiscounts.year1;
      } else if (yearsElapsed === 1) {
        currentYear = "year2";
        currentDiscount = yearlyDiscounts.year2;
      } else {
        currentYear = "year3";
        currentDiscount = yearlyDiscounts.year3;
      }
    }

    const plans = [
      {
        id: "Silver",
        name: "Silver",
        duration: "6 Months",
        price: base.semiAnnual,
        finalPrice: isFirstYear
          ? Math.round(base.semiAnnual * (1 - yearlyDiscounts.year1 / 100))
          : Math.round(base.semiAnnual * (1 - currentDiscount / 100)),
        isFirstYear,
        discount: isFirstYear ? yearlyDiscounts.year1 : currentDiscount,
        year: currentYear,
        features: ["Restaurant listing", "Basic analytics", "Customer reviews"],
      },
      {
        id: "Gold",
        name: "Gold",
        duration: "1 Year",
        price: base.annual,
        finalPrice: isFirstYear
          ? Math.round(base.annual * (1 - yearlyDiscounts.year1 / 100))
          : Math.round(base.annual * (1 - currentDiscount / 100)),
        isFirstYear,
        discount: isFirstYear ? yearlyDiscounts.year1 : currentDiscount,
        year: currentYear,
        features: [
          "Everything in Silver",
          "Featured placement",
          "Priority support",
          "Advanced analytics",
        ],
        popular: true,
      },
      {
        id: "Platinum",
        name: "Platinum",
        duration: "3 Years",
        price: base.annual * 3,
        finalPrice: isFirstYear
          ? Math.round(base.annual * 3 * (1 - yearlyDiscounts.year1 / 100))
          : Math.round(base.annual * 3 * (1 - currentDiscount / 100)),
        isFirstYear,
        discount: isFirstYear ? yearlyDiscounts.year1 : currentDiscount,
        year: currentYear,
        features: [
          "Everything in Gold",
          "Top of search results",
          "Dedicated account manager",
          "Custom promotions",
        ],
      },
    ];

    // Prevent caching so pricing updates are reflected immediately
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    res.json({
      success: true,
      data: {
        plans,
        isFirstYear,
        discount: isFirstYear ? yearlyDiscounts.year1 : currentDiscount,
        yearlyDiscounts,
        currentYear,
        basePricing: base,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
