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
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//----Route construction----//
Router.post("/offer/publish", isAuthenticated, async (req, res) => {
  console.log("offers L44");
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
  console.log("Offers L64");
  try {
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

    console.log(`Offers L113 title:  ${title}`);
    console.log(`Offers L114 prix mini:  ${priceMini}`);
    console.log(`Offers L115 prix maxi:  ${priceMaxi}`);
    //----création du filtre----//
    const offers = await Offer.find({
      product_price: { $gte: priceMini, $lte: priceMaxi },
      product_name: new RegExp(title, "i"),
    })
      .select(
        "product_name product_price product_description product_details product_image"
      )
      .sort(sort)
      .limit(limit)
      .skip(skip); //----A Faire gérer la valeur su skip par un calcul plutot que par une boucle puis supprimer la boucle
    res.status(200).json(offers);
    console.log(`Offers L126 ${offers}`);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

Router.get("/offer/:id", async (req, res) => {
  console.log("offers 133");
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
