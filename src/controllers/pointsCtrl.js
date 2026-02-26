const PointsLog = require("../models/pointsLog");

exports.getPointsHistory = async (req, res) => {
  try {
    const logs = await PointsLog.find({ user: req.user.id })
      .populate("pickup", "scheduledDate status estimatedEcoPoints")
      .sort({ createdAt: -1 });

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};