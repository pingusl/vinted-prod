//----Loading modules----//
const express = require("express");
const formidableMiddleware = require("express-formidable");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_API_SECRET); //private key to replace
//---router initialize----//
const Router = express.Router();
Router.use(formidableMiddleware());
Router.use(cors());
//----Route definition----//
Router.post("/payment", async (req, res) => {
  console.log("/payment L12:");
  try {
    //Réception du token donné par l'API stripe et transmis du front
    const { token, amount, title } = req.fields;
    console.log("stripeToken:", token);
    //créer la transaction
    const response = await stripe.charges.create({
      amount: amount * 100,
      currency: "eur",
      description: title,
      source: token,
    });
    console.log(response.status);
    res.json(response);
  } catch (error) {
    console.log(error.message);
  }
});
//---Export du router----//
module.exports = Router;
