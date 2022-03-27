const router = require("express").Router();
const petfinder = require("@petfinder/petfinder-js");
const { SearchedPets } = require("../../models");

router.get("/", async (req, res) => {
  try {
    res.render("searchpage");
  } catch (err) {
    res.status(500).json(err);
  }
});

async function GetPetsFromAPI(req, type, limit) {
  const pf = new petfinder.Client({
    apiKey: process.env.API_KEY,
    secret: process.env.SECRET,
  });
  const pets = req.session.pets;
  if (!pets?.length) {
    await pf.animal
      .search({
        type,
        limit,
      })
      .then(function (response) {
        req.session.pets = response.data.animals;

        return response.data.animals;
      })
      .catch((err) => console.log(err));
  } else {
    return req.session.pets;
  }
}

router.post("/", async (req, res) => {
  // try {
  let type = req.body.keyCheck;
  let limit = req.body.limitCheck;
  const petSearchCall = await GetPetsFromAPI(req, type, limit);
  // console.log("look ma we got some data ---", petSearchCall[0]);
  // res.status(200).json({ data: petSearchCall });
  console.log("before the catch");
  console.log(petSearchCall.length);
  for (var i = 0; i < petSearchCall.length; i++) {
    const data = await SearchedPets.create({
      type: petSearchCall[i].type,
      breeds: petSearchCall[i].breeds.primary,
      age: petSearchCall[i].age,
      gender: petSearchCall[i].gender,
      size: petSearchCall[i].size,
      name: petSearchCall[i].name,
      description: petSearchCall[i].description,
      photo: petSearchCall[i].primary_photo_cropped,
      status: petSearchCall[i].status,
      published_at: petSearchCall[i].published_at,
      contact: petSearchCall[i].contact.email,
    });

    console.log(data);
  }

  // return res.json(petSearchCall);
  // res.status(200).json(petSearchCall);

  // return res.render("searchpage", { petSearchCall });
  // } catch (err) {
  //   console.log(err);
  //   console.log("something went wrong server side");
  //   res.status(500).json(err);
  // }
});

// router.get("/", async (req, res) => {
//   let sessionIndex = req.session.pets;
//   // console.log("this is on the search route", req.session.pets[0]);
//   try {
//     const newSearch = await SearchedPets.findall({
//       type: sessionIndex.type,
//       breeds: sessionIndex.breeds[0],
//       age: sessionIndex.age,
//       gender: sessionIndex.gender,
//       size: sessionIndex.size,
//       name: sessionIndex.name,
//       description: sessionIndex.description,
//       photo: sessionIndex.primary_photo_cropped.full,
//       status: sessionIndex.status,
//       published_at: sessionIndex.published_at,
//       contact: sessionIndex.contact,
//     });
//     res.json(newSearch);
//     res.render("searchpage");
//   } catch (err) {
//     console.log(err);
//     res.status(500).json(err);
//   }
// });
module.exports = router;
