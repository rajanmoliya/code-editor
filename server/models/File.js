const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  content: { type: String, default: "" },
  language: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  lastModified: { type: Date, default: Date.now },
});

const File = mongoose.model("File", fileSchema);

module.exports = File;
