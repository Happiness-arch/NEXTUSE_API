const Product = require("../models/products");

exports.listProducts = async (req, res) => {
  try {
    const { search, category } = req.query;
    const query = {};

    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: "i" };

    const products = await Product.find(query).sort({ name: 1 });
    res.status(200).json(products);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};