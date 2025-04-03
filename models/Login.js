const { Schema, model } = require("mongoose");

const loginSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: {
    type: Date, 
    default: Date.now,
    immutable: true,
  },
});

//   ensur number of login save include only 3 records
loginSchema.pre("save", async function (next) {
  try {
    const count = await this.constructor.countDocuments({
      user_id: this.user_id,
    });

    if (count >= 3) {
      const oldestRecord = await Login.findOneAndDelete(
        { user_id: this.user_id },
        { sort: { createdAt: 1 } }
      );
    }
  } catch (error) {
    console.log("pre login table save error", error);
    next(error);
  }

  next();

  // const lastCard = await this.constructor.findOne().sort({ bizNumber: -1 });

  // ensure table will have no more than 3 login per user
  // if (!this.isNew) return next();
  // if (!this.bizNumber) {
  //   try {
  //     const lastCard = await this.constructor.findOne().sort({ bizNumber: -1 });
  //     this.bizNumber = lastCard ? lastCard.bizNumber + 1 : 100;
  //     next();
  //   } catch (error) {
  //     console.log("pre save error")
  //     next(error);
  //   }
  // } else {
  //   next();
  // }
});

const Login = model("login", loginSchema);
module.exports = Login;
