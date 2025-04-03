const { Schema, model } = require("mongoose");

const cardSchema = new Schema({
    title: { type: String, required: true },
    subtitle: { type: String , required: true},
    description: { type: String, required: true },
    phone: {
      type: String,
      required: true,
      match: [/^05[0-9]-\d{7}$/, 'Please enter a valid Israeli phone number']
    },
    email: {
      type: String,
      required: true

    },
    web: { type: String,  required: true},
    image: {
      url: { type: String,default:"" },
      alt: { type: String,default:"" }
    },
    address: {
      state: { type: String, default: "" },
      country: { type: String, required: true },
      city: { type: String, required: true },
      street: { type: String, required: true },
      houseNumber: { type: Number, required: true },
      zip: { type: String }
    },
    bizNumber: { type: Number,  unique:true },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }], // Array of user IDs who liked the card

    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Owner of the card
    createdAt: { type: Date, default: Date.now, immutable: true }
  });

//   ensur biznumber uniqness for new card
  cardSchema.pre("save", async function (next) {
    if (!this.isNew) return next();
    if (!this.bizNumber) {
      try {
        const lastCard = await this.constructor.findOne().sort({ bizNumber: -1 });
        this.bizNumber = lastCard ? lastCard.bizNumber + 1 : 100; 
        next();
      } catch (error) {
        console.log("pre save error")
        next(error);
      }
    } else {
      next();
    }
  });

const Card = model("cards", cardSchema);
module.exports = Card;
