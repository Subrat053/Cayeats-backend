const Report = require("../../models/report");

// Get all reports
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error("Failed to fetch reports:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reports",
    });
  }
};

// Get single report by ID
exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("Failed to fetch report:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch report",
    });
  }
};

// Update report status
exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (
      !status ||
      !["open", "in-progress", "resolved", "closed"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid status is required (open, in-progress, resolved, closed)",
      });
    }

    const report = await Report.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true },
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Report status updated successfully",
      data: report,
    });
  } catch (error) {
    console.error("Failed to update report status:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to update report status",
    });
  }
};

// Add admin reply to report
exports.replyToReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminReply, adminNotes } = req.body;

    if (!adminReply) {
      return res.status(400).json({
        success: false,
        message: "Admin reply is required",
      });
    }

    const report = await Report.findByIdAndUpdate(
      id,
      {
        adminReply: String(adminReply).trim(),
        adminNotes: adminNotes ? String(adminNotes).trim() : "",
        repliedAt: new Date(),
        status: "in-progress",
      },
      { new: true, runValidators: true },
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Reply sent successfully",
      data: report,
    });
  } catch (error) {
    console.error("Failed to reply to report:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to send reply",
    });
  }
};

// Delete report
exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findByIdAndDelete(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete report:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to delete report",
    });
  }
};

// Get reports by status
exports.getReportsByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    if (!["open", "in-progress", "resolved", "closed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const reports = await Report.find({ status }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error("Failed to fetch reports:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reports",
    });
  }
};
