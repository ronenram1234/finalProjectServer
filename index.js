const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const expressListRoutes = require("express-list-routes");
// const employee=require("./routes/employees")
const users = require("./routes/users");
const cards = require("./routes/cards");
const CustomerRequest = require("./routes/customersrequests");
// const products=require("./routes/products")
// const carts=require("./routes/carts")
// const login=require("./routes/login")
// const profile=require("./routes/profile")
const auth = require("./middlewares/auth");
const { logger, requestTimer, errorLogger }  = require("./middlewares/logger");
const port = process.env.PORT || 5000;

const app = express();

mongoose
  .connect(process.env.DB)
  .then(() => console.log("👍connected to mongo db server⭐"))
  .catch((err) => console.log(err));

app.use(cors());
app.use(express.json());

app.use(requestTimer); //start time
app.use(logger);       // Log request details
app.use(errorLogger);  //error log Bonus 2 task

app.use("/api/users", users);
app.use("/api/cards", cards);
app.use("/api/customerrequest", CustomerRequest);
app.use("*", (req, res) => {
  res.status(404).json({ error: "Illegal path - Route not found" });
});



 expressListRoutes(app);

app.listen(port, () => console.log(`👍port started ${port}⭐`));
