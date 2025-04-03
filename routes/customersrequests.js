const express = require("express");
const router = express.Router();

const CustomerRequest = require("../models/CustomerRequest");

const Joi = require("joi");

// verify data
const CustomerRequestSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  message: Joi.string(),
  createdAt: Joi.date().default(Date.now),
});

router.post("/", async (req, res) => {
  try {
    console.log(req.body);

    // check input validation
    const { error } = await CustomerRequestSchema.validateAsync(req.body);
    if (error) return res.status(400).send("error schema");

    // create document
    const customerRequest = new CustomerRequest(req.body);

    await customerRequest.save();

    return res
      .status(200)
      .send(
        "Thank you for your request. Tinkertech representative will contact you soon"
      );
  } catch (err) {
    console.log(err.message);
    res.status(400).send(`Invalide request - ${err.message}`);
  }
});

module.exports = router;
