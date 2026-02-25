const productSchema = new mongoose.Schema({
  name: String, // "1L PET Bottle"
  category: {
    type: String,
    enum: ["plastic", "glass", "paper", "metal"]
  },
  ecoPoints: Number, // per unit
  image: String
});

module.exports = mongoose.model("Product", productSchema);