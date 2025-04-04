const express = require("express");
const router = express.Router();
const Stock = require("../models/stock");
const Joi = require("joi");
const auth = require("../middlewares/auth");

// Stock schema validation
const StockSchema = Joi.object({
  Brand: Joi.string().allow("").default(""),
  Model: Joi.string().allow("").default(""),
  Quantity: Joi.number().default(0),
  "Price (USD)": Joi.string().allow("").default(""),
  Condition: Joi.string().allow("").default(""),
  Description: Joi.string().allow("").default(""),
  Detail: Joi.string().allow("").default(""),
  "Product Category": Joi.string().allow("").default(""),
  "Part Number": Joi.string().allow("").default(""),
  SKU: Joi.string().allow("").default(""),
  "Serial Number": Joi.string().allow("").default(""),
  Location: Joi.string().allow("").default(""),
  Status: Joi.string().allow("").default(""),
});

// Create new stock
router.post("/", auth, async (req, res) => {
  try {
    if (Object.keys(req.body).length === 0) {
      return res.status(400).send("Stock details are missing");
    }

    // Validate input
    const { error } = await StockSchema.validateAsync(req.body);
    if (error) return res.status(400).send("Invalid stock data");

    // Create stock
    const stock = new Stock(req.body);
    const newStock = await stock.save();

    return res.status(200).send(newStock);
  } catch (err) {
    console.log(err.message);
    res.status(400).send(`Invalid request - ${err.message}`);
  }
});

// Get all stocks
router.get("/", async (req, res) => {
  try {
    const stocks = await Stock.find();
    return res.status(200).send(stocks);
  } catch (err) {
    res.status(400).send(`Invalid request - ${err.message}`);
  }
});

// Get stock by ID
router.get("/:id", async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);
    if (!stock) return res.status(404).send("Stock not found");
    return res.status(200).send(stock);
  } catch (err) {
    res.status(400).send(`Invalid request - ${err.message}`);
  }
});

// Update stock
router.put("/:id", auth, async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);
    if (!stock) return res.status(404).send("Stock not found");

    const { error } = StockSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const updatedStock = await Stock.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );

    return res.status(200).send(updatedStock);
  } catch (err) {
    res.status(400).send(`Invalid request - ${err.message}`);
  }
});

// Delete stock
router.delete("/:id", auth, async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);
    if (!stock) return res.status(404).send("Stock not found");

    await Stock.findByIdAndDelete(req.params.id);
    return res.status(200).send("Stock deleted successfully");
  } catch (err) {
    res.status(400).send(`Invalid request - ${err.message}`);
  }
});

module.exports = router;
