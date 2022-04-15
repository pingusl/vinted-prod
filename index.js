//----Module loading----//
const express = require("express");
require("dotenv").config(); //Permet d'activer les variables d'environnement du fichier .env
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const morgan = require("morgan");
//----Server initialisation----//
const app = express();
app.use(formidable());
app.use(morgan("dev"));
//----Mongoose connection----//
mongoose.connect(process.env.MONGODB_URL);
//----Models loading----//
const user = require("./models/User");
const offer = require("./models/Offer");
//----Routes loading----//
const userRoutes = require("./routes/users");
app.use(userRoutes);
const offerRoutes = require("./routes/offers");
app.use(offerRoutes);
//----Security route----//
app.all("*", (req, res) => {
  res.status(400).json({ message: "Requête invalide" });
});
//----Running server----//
app.listen(process.env.PORT, () => {
  console.log("Server has started 🚀 ");
});
