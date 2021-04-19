const mongoose = require("mongoose");
const roleSchema = mongoose.Schema({
  name: { type: String, default: "user" },
});

module.exports = mongoose.model("Role", roleSchema);
