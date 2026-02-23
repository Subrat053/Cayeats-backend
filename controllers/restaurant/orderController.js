const Restaurant = require("../../models/restaurant");
const Order = require("../../models/order");

// GET all orders for this restaurant
exports.getOrders = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant)
      return res.status(404).json({ message: "Restaurant not found" });

    const { status, timeframe } = req.query;

    const filter = { restaurant: restaurant._id };

    // Filter by status
    if (status && status !== "all") {
      filter.status = status.charAt(0).toUpperCase() + status.slice(1);
    }

    // Filter by timeframe
    if (timeframe) {
      const now = new Date();
      if (timeframe === "today") {
        filter.createdAt = {
          $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        };
      } else if (timeframe === "yesterday") {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        filter.createdAt = {
          $gte: new Date(
            yesterday.getFullYear(),
            yesterday.getMonth(),
            yesterday.getDate(),
          ),
          $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        };
      } else if (timeframe === "week") {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filter.createdAt = { $gte: weekAgo };
      } else if (timeframe === "month") {
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filter.createdAt = { $gte: monthAgo };
      }
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    // Stats
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const allOrders = await Order.find({ restaurant: restaurant._id });

    const stats = {
      today: allOrders.filter((o) => new Date(o.createdAt) >= todayStart)
        .length,
      preparing: allOrders.filter((o) => o.status === "Preparing").length,
      ready: allOrders.filter((o) => o.status === "Ready").length,
      totalRevenue: allOrders
        .filter((o) => o.status === "Delivered")
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    };

    res.json({ success: true, data: { orders, stats } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, restaurant: restaurant._id },
      { status: req.body.status },
      { new: true },
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST create order (called by customer side later)
exports.createOrder = async (req, res) => {
  try {
    const {
      restaurantId,
      items,
      customerName,
      customerPhone,
      deliveryAddress,
      deliveryProvider,
      customerNotes,
    } = req.body;

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await Order.create({
      restaurant: restaurantId,
      user: req.user?._id,
      customerName: customerName || "Guest",
      customerPhone,
      customerNotes,
      deliveryAddress,
      deliveryProvider,
      items,
      totalAmount: total,
      estimatedDelivery: new Date(Date.now() + 45 * 60 * 1000), // 45 min from now
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
