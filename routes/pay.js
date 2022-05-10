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
Router.post("/pay", async (req, res) => {
  try {
    //Réception du token donné par l'API stripe et transmis du front
    const stripeToken = req.fields.stripToken;
    //créer la transaction
    const response = await stripe.charges.create({
      amount: 2000,
      currency: "eur",
      description: "Description de l'objet acheté",
      source: stripeToken,
    });
    console.log(response.status);
    res.json(response);
  } catch (error) {
    console.log(error.message);
  }
});
//---Export du router----//
module.exports = Router;
