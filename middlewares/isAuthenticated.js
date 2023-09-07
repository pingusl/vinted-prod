const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  console.log("Hello from isAuthenticated");
  //Sans le next, la requête va rester "bloquée" dans la fonction isAuthenticated
  //console.log(req.headers.authorization);
  // console.log(req.headers);
  if (req.headers.authorization) {
    //je continue la suite de mes vérifications
    const user = await User.findOne({
      token: req.headers.authorization.replace("Bearer ", ""), //trouve l'utilisateur dans la base a partir de la clef d'authorisation possible gràce à la suppression du bearer dans header.authorization
    });

    if (user) {
      //Mon token est valide et je peux continuer
      //j'envoie les infos sur mon user à ma route /offer/publish
      req.user = user;
      console.log("isAuthenticated L18 :", user);
      next();
    } else {
      res
        .status(401)
        .json({ error: "Unauthorized 1 / Token présent mais non valide !" });
      console.log("Unauthorized 1 / Token présent mais non valide !");
    }
  } else {
    res.status(401).json({ error: "Unauthorized 1 / Token non envoyé !" });
    console.log("Unauthorized 1 / Token non envoyé !");
  }
};

module.exports = isAuthenticated;
