const User = require("../models/user");

const MINIMUMS = {
  airtime: 1000,
  data: 1000,
  electricity: 5000,
  wallet: 100,
};

const POINTS_TO_NAIRA = 5;

exports.redeemPoints = async (req, res) => {
  try {
    const { points, redeemType, provider, phoneNumber, bundle } = req.body;

    const minimum = MINIMUMS[redeemType] || MINIMUMS.wallet;

    if (!points || points < minimum)
      return res.status(400).json({
        message: `Minimum ${minimum} EcoPoints required for ${redeemType || "redemption"}`,
      });

    const user = await User.findById(req.user.id);

    if (user.points < points)
      return res.status(400).json({ message: "Insufficient points" });

    const nairaValue = points * POINTS_TO_NAIRA;

    user.points -= points;
    user.wallet += nairaValue;
    await user.save();

    const messages = {
      airtime: "Airtime of N" + nairaValue + " sent to " + (phoneNumber || "your number"),
      data: "Data bundle of N" + nairaValue + " sent to " + (phoneNumber || "your number"),
      electricity: "Electricity units worth N" + nairaValue + " added to your meter",
      wallet: "N" + nairaValue + " added to your NextUse wallet",
    };

    const message = messages[redeemType] || messages.wallet;

    res.status(200).json({
      message,
      redeemType: redeemType || "wallet",
      provider: provider || null,
      bundle: bundle || null,
      phoneNumber: phoneNumber || null,
      pointsRedeemed: points,
      valueAdded: "N" + nairaValue,
      remainingPoints: user.points,
      walletBalance: user.wallet,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getWalletBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      points: user.points,
      walletBalance: user.wallet,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};