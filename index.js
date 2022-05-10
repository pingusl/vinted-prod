//----Module loading----//
const express = require("express");
require("dotenv").config(); //Permet d'activer les variables d'environnement du fichier .env
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors"); //a vérifier si a placer ici ou simplement dans la route ou dans les deux.
//----Server initialisation----//
const app = express();
app.use(formidable());
app.use(cors()); //a vérifier si a placer ici ou simplement dans la route ou dans les deux.
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
const payRoutes = require("./routes/pay");
app.use(payRoutes);
//----Security route----//
app.all("*", (req, res) => {
  res.status(400).json({ message: "Requête invalide" });
});
//----Running server----//
app.listen(process.env.PORT, () => {
  console.log("Server has started 🚀 ");
});
