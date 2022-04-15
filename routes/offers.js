//----Loading server module----//
const express = require("express");
const formidableMiddleware = require("express-formidable");
const mongoose = require("mongoose");
//----Router initialize---//
const Router = express.Router();
Router.use(formidableMiddleware());
//----Loading model----//
const Offer = require("../models/Offer");
const User = require("../models/User");
//import du middleware
const isAuthenticated = require("../middlewares/isAuthenticated");
//----Cloudinary----//
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
//----Middleware isAuthenticate----//
//----A mettre dans un dossier middleWare pour pouvoir le réutiliser sur d'autre route
//----Ajouter dans le req un req.user que j'ai réalisé dans la route /offer/publish
// const isAuthenticated = async (req, res, next) => {
//   if (req.headers.authorization) {
//     //----Find User----//
//     const tokenToFind = req.headers.authorization.replace("Bearer ", ""); // Supprime le "Bearer " de la chaîne de caractère pour trouver la clef.
//     const user = await User.findOne({ token: tokenToFind });
//     if (user) {
//       req.user = user;
//     } else {
//       res.status(401).json({
//         error: "authentification failed...Redirection vers page de login",
//       });
//     }
//     next();
//   } else {
//     return res.status(401).json({
//       error: "authentification failed...Redirection vers page de login",
//     });
//   }
// };
//----Route construction----//
Router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    //----Create newOffer----//
    const newOffer = new Offer({
      product_name: req.fields.title,
      product_description: req.fields.description,
      product_price: req.fields.price,
      product_details: [
        { marque: req.fields.brand },
        { taille: req.fields.size },
        { état: req.fields.condition },
        { couleur: req.fields.color },
        { emplacement: req.fields.city },
      ],

      owner: req.user,
    });
    //----Save picture on coudinaary & Find picture secure_url on cloudinary----//

    // Utilisation de la facultée de cloudinary pour créer la photo dans un dossier dédié sur le cloud
    //et récupérer les caractéristiques de l'image
    const resultCloudinary = await cloudinary.uploader.upload(
      req.files.picture.path,
      {
        folder: "vinted/offers",
        public_id: newOffer._id,
      }
    );
    newOffer.product_image = resultCloudinary;

    //----Save newOffer----//
    await newOffer.save();
    //----Return Offer & User---//

    res.status(200).json(newOffer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

Router.get("/offers", isAuthenticated, async (req, res) => {
  //----A Faire ajouter un try Catch----//
  const pageNumber = req.query.page;
  const title = req.query.title;
  let priceMini = 0;
  let priceMaxi = 0;
  if (req.query.priceMin) {
    priceMini = Number(req.query.priceMin);
  }
  if (req.query.priceMax) {
    priceMaxi = Number(req.query.priceMax);
  }
  const sort = req.query.sort;

  //----Gestion de la pagination----//
  let skip = 0;
  let limit = 5;
  const offersCount = await Offer.find({
    product_price: { $gte: priceMini, $lte: priceMaxi },
    product_name: new RegExp(title, "i"),
  }).countDocuments();

  if (offersCount > limit) {
    for (i = 1; i < pageNumber; i++) {
      skip += limit;
    }
  }

  // console.log(`title  ${title}`);
  // console.log(`prix mini  ${priceMini}`);
  // console.log(`prix maxi  ${priceMaxi}`);
  //----création du filtre----//
  const offers = await Offer.find({
    product_price: { $gte: priceMini, $lte: priceMaxi },
    product_name: new RegExp(title, "i"),
  })
    .select("product_name product_price product_description")
    .sort(sort)
    .limit(limit)
    .skip(skip); //----A Faire gérer la valeur su skip par un calcul plutot que par une boucle puis supprimer la boucle
  res.status(200).json(offers);
  console.log(`${offers}`);
});

Router.get("/offer/:id", async (req, res) => {
  try {
    const idLength = req.params.id;
    //----Check id----//
    if (Number(idLength.length) === 24) {
      //----Find offer filter by product_detail & product_image----//
      const offer = await Offer.find({ _id: req.params.id }).select(
        "product_details product_image"
      ); //Ajouter un polpulate pour afficher le username et l'email du user en limitant la transmission du hash et du salt.
      res.status(200).json(offer);
    } else {
      res.status(400).json({ message: "params invalid" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
//---Export du router----//
module.exports = Router;
