const express = require("express");
const router = express.Router();
const Logo = require("../models/Logo");
const Joi = require("joi");
const auth = require("../middlewares/auth");

// Logo schema validation
const LogoSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  url: Joi.string().uri().required(),
  alt: Joi.string().min(2).max(255).required(),
  user_id: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required(),
  createdAt: Joi.date().default(() => new Date()),
});

// Create new logo
router.post("/", auth, async (req, res) => {
  try {
    if (Object.keys(req.body).length === 0) {
      return res.status(400).send("Logo details are missing");
    }

    req.body.user_id = req.payload._id;

    // Validate input
    const { error } = await LogoSchema.validateAsync(req.body);
    if (error) return res.status(400).send("Invalid logo data");

    // Create logo
    const logo = new Logo(req.body);
    const newLogo = await logo.save();

    return res.status(200).send(newLogo);
  } catch (err) {
    console.log(err.message);
    res.status(400).send(`Invalid request - ${err.message}`);
  }
});

// Get all logos
router.get("/", async (req, res) => {
  try {
    const logos = await Logo.find();
    return res.status(200).send(logos);
  } catch (err) {
    res.status(400).send(`Invalid request - ${err.message}`);
  }
});

// Get logo by ID
router.get("/:id", async (req, res) => {
  try {
    const logo = await Logo.findById(req.params.id);
    if (!logo) return res.status(404).send("Logo not found");
    return res.status(200).send(logo);
  } catch (err) {
    res.status(400).send(`Invalid request - ${err.message}`);
  }
});

// Update logo
router.put("/:id", auth, async (req, res) => {
  try {
    const logo = await Logo.findById(req.params.id);
    if (!logo) return res.status(404).send("Logo not found");

    // Check if user owns the logo
    if (req.payload._id.toString() !== logo.user_id.toString()) {
      return res.status(403).send("Only logo owner can update the logo");
    }

    const { error } = LogoSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const updatedLogo = await Logo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    return res.status(200).send(updatedLogo);
  } catch (err) {
    res.status(400).send(`Invalid request - ${err.message}`);
  }
});

// Delete logo
router.delete("/:id", auth, async (req, res) => {
  try {
    const logo = await Logo.findById(req.params.id);
    if (!logo) return res.status(404).send("Logo not found");

    // Check if user owns the logo or is admin
    if (
      !(
        req.payload.isAdmin ||
        req.payload._id.toString() === logo.user_id.toString()
      )
    ) {
      return res.status(403).send("Unauthorized to delete this logo");
    }

    await Logo.findByIdAndDelete(req.params.id);
    return res.status(200).send("Logo deleted successfully");
  } catch (err) {
    res.status(400).send(`Invalid request - ${err.message}`);
  }
});

module.exports = router;
