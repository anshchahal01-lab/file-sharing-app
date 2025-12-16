const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  password: {
    type: String, // bcrypt hash
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model("File", fileSchema);
