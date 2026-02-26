require("dotenv").config();
const connectDB = require("./src/config/db");
const app = require("./app");

connectDB();

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
