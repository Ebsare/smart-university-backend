require("dotenv").config(); // ⬅️ MUST be first line

const mongoose = require("mongoose");
const app = require("./app");

console.log("MONGO_URI =", process.env.MONGO_URI); // 👈 TEMP DEBUG

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
