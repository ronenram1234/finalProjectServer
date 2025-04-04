const { Schema, model } = require("mongoose");

const logosSchema = new Schema({
  brand: {
    type: String,
    required: true,
  },
  logoPath: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = model("Logos", logosSchema);
