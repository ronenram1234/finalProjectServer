const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Card = require("../models/Card");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const auth = require("../middlewares/auth");

// create new card
const CardSchema = Joi.object({
  title: Joi.string().min(2).max(255).required(),
  subtitle: Joi.string().min(2).max(255).required(),
  description: Joi.string().min(2).max(1024).required(),

  phone: Joi.string()
    .pattern(/^[0-9\- ]{10,15}$/) // Allows numbers, spaces, and hyphens
    .required(),

  email: Joi.string().email().required(),

  web: Joi.string().uri().optional(),

  image: Joi.object({
    url: Joi.string().uri().required().allow(""),
    alt: Joi.string().min(2).max(255).required().allow(""),
  }).required(),

  address: Joi.object({
    state: Joi.string().allow("").optional(),
    country: Joi.string().min(2).max(255).required(),
    city: Joi.string().min(2).max(255).required(),
    street: Joi.string().min(2).max(255).required(),
    houseNumber: Joi.number().required(),
    zip: Joi.number().optional(),
  }).required(),

  likes: Joi.array().items(Joi.string()).optional(),
  bizNumber: { type: Number, unique: true },

  user_id: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required(),
  createdAt: Joi.date().default(() => new Date()),
});

router.post("/", auth, async (req, res) => {
  try {
    if (Object.keys(req.body).length === 0) {
      return res.status(400).send("Card details are missing");
    }

    // Check for business user
    if (!req.payload.isRegisterUser)
      return res.status(400).send("only Business user can create new card");
    req.body.user_id = req.payload._id;

    // check input validation
    const { error } = await CardSchema.validateAsync(req.body);
    if (error) return res.status(400).send("error schema");

    // create Card
    card = new Card(req.body);
    const newCard = await card.save();

    return res.status(200).send(newCard);
  } catch (err) {
    console.log(err.message);
    res.status(400).send(`Invalide request - ${err.message}`);
  }
});

// get all cards
router.get("/", async (req, res) => {
  try {
    const cards = await Card.find();
    return res.status(200).send(cards);
  } catch (err) {
    res.status(400).send(`Invalide request - ${err.message}`);
  }
});

// get all my cards
router.get("/my-cards", auth, async (req, res) => {
  try {
    let cards;
    try {
      cards = await Card.find({ user_id: req.payload._id });
    } catch (err) {
      return res.status(400).send("No cards found for requested user");
    }

    if (!cards) return res.status(400).send("No cards found");
    return res.status(200).send(cards);
  } catch (err) {
    res.status(400).send(`Invalide request - ${err.message}`);
  }
});

router.get("/:id", async (req, res) => {
  try {
    let cards;
    try {
      cards = await Card.findById(req.params.id);
    } catch (err) {
      return res.status(400).send("No card found for requested params Id");
    }

    if (!cards) return res.status(400).send("No cards found");
    return res.status(200).send(cards);
  } catch (err) {
    res.status(400).send(`Invalide request - ${err.message}`);
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    let card;
    try {
      card = await Card.findById(req.params.id);
    } catch (err) {
      return res.status(400).send("No card found for requested params Id");
    }
    if (!card) return res.status(400).send("No cards found");

    // The user who created the card
    if (req.payload._id.toString() !== card.user_id.toString())
      return res.status(400).send("Only card owner can change card data");

    const { error } = CardSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const updateCard = await Card.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    return res.status(200).send(updateCard);
  } catch (err) {
    res.status(400).send(`Invalide request - ${err.message}`);
  }
});

router.patch("/:id", auth, async (req, res) => {
  try {
    let card;
    try {
      card = await Card.findById(req.params.id);
    } catch (err) {
      return res.status(400).send("No card found for requested params Id");
    }

    if (!card) return res.status(400).send("No cards found");

    // check if this is dislike request
    const result = card.likes.find(
      (rec) => rec.toString() === req.payload._id.toString()
    );
    if (result) {
      card.likes = card.likes.filter(
        (rec) => rec.toString() !== req.payload._id.toString()
      );
    } else {
      card.likes.push(req.payload._id);
    }

    // add new like

    console.log(card);

    const updateCard = await Card.findByIdAndUpdate(req.params.id, card, {
      new: true,
    });

    return res.status(200).send(updateCard);
  } catch (err) {
    console.log(err.message);
    console.log(err);

    res.status(400).send(`Invalide request - ${err.message}`);
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    // The user who created the card or admin
    let card = {};
    try {
      card = await Card.findById(req.params.id);
    } catch (err) {
      return res.status(400).send("No card found - check params Id");
    }

    if (!card) return res.status(400).send("No card found");

    if (
      !(
        req.payload.isAdmin ||
        req.payload._id.toString() === card.user_id.toString()
      )
    ) {
      return res
        .status(403)
        .send(
          "Unauthorized request - only a user can delete their own account, or an admin can delete any account"
        );
    }

    const updateCard = await Card.findByIdAndDelete(req.params.id, {
      new: true,
    });

    return res.status(200).send(updateCard);
  } catch (err) {
    res.status(400).send(`Invalide request - ${err.message}`);
  }
});

// Bonus 1 - update bizNumber
router.patch("/bizNumber/:id", auth, async (req, res) => {
  try {
    let card;
    if (!req.payload.isAdmin)
      return res.status(400).send("only admin can update bizNumber");
    try {
      card = await Card.findById(req.params.id);
    } catch (err) {
      return res.status(400).send("No card found for requested params Id");
    }

    if (!card) return res.status(400).send("No cards found");

    if (!req.body.bizNumber)
      return res.status(400).send("Missing new bizNumber");
    // check if bizNumber alreay occupied
    const cardRecords = await Card.findOne({ bizNumber: req.body.bizNumber });
    // console.log(cardRecords,cardRecords._id, cardRecords.bizNumber  )
    if (cardRecords)
      return res.status(400).send("bizNumber already being used");

    card.bizNumber = req.body.bizNumber;

    const updateCard = await Card.findByIdAndUpdate(req.params.id, card, {
      new: true,
    });

    return res.status(200).send(updateCard);
  } catch (err) {
    res.status(400).send(`Invalide request - ${err.message}`);
  }
});

module.exports = router;
