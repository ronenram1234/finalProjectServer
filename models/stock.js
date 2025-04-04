const { Schema, model } = require("mongoose");

const stockSchema = new Schema(
  {
    Brand: {
      type: String,
      required: false,
      default: "",
    },
    Model: {
      type: String,
      required: false,
      default: "",
    },
    Quantity: {
      type: Number,
      required: false,
      default: 0,
    },
    "Price (USD)": {
      type: String,
      required: false,
      default: "",
    },
    Condition: {
      type: String,
      required: false,
      default: "",
    },
    Description: {
      type: String,
      required: false,
      default: "",
    },
    Detail: {
      type: String,
      required: false,
      default: "",
    },
    "Product Category": {
      type: String,
      required: false,
      default: "",
    },
    "Part Number": {
      type: String,
      required: false,
      default: "",
    },
    SKU: {
      type: String,
      required: false,
      default: "",
    },
    "Serial Number": {
      type: String,
      required: false,
      default: "",
    },
    Location: {
      type: String,
      required: false,
      default: "",
    },
    Status: {
      type: String,
      required: false,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Stock = model("stock", stockSchema, "stock");
module.exports = Stock;
// module.exports = mongoose.model("Stock", stockSchema);
