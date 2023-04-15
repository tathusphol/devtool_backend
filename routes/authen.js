const express = require("express");
const pool = require("../config");
const path = require("path");
const Joi = require("joi");
const multer = require("multer");
const { json } = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();
let alert = require("alert");

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./static/profile");
  },
  filename: function (req, file, callback) {
    callback(
      null,
      file.originalname.split(path.extname(file.originalname))[0] +
        "-" +
        Date.now() +
        path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });

router.post("/signup/account", async function (req, res, next) {
  console.log(req.body.email);
  let firstname = req.body.firstname;
  let lastname = req.body.lastname;
  let email = req.body.email;
  let tel = req.body.tel;
  let location = req.body.location;
  let password1 = req.body.password1;
  let password2 = req.body.password2;
  let img = "/uploads/profile.jpeg";
  let role = "Volunteer";
  if (password1 != password2) {
    alert("Password do not match");
  } else {
    const conn = await pool.getConnection();
    await conn.beginTransaction();
    try {
      const user = await conn.query(
        "INSERT INTO users(firstname, lastname, email, password, tel, location, img, role) VALUES(?, ?, ?, ?, ?, ?, ?, ?)",
        [firstname, lastname, email, password1, tel, location, img, role]
      );
      await conn.commit();
      res.json("success");
    } catch (err) {
      await conn.rollback();
      next(err);
    } finally {
      console.log("finally");
      conn.release();
    }
  }
});

router.post("/login", async function (req, res, next) {
  let email = req.body.email;
  let password = req.body.password;

  const [data, field] = await pool.query(
    "SELECT * FROM users WHERE email = ? AND password = ?",
    [email, password]
  );
  if (data[0] == undefined) {
    return res.json("error");
  } else {
    return res.json(data[0].id);
  }
});

router.post("/user", async function (req, res, next) {
  let id = req.body.user_id;
  const [data, field] = await pool.query(
    "SELECT * FROM users WHERE id = ?",
    [id]
    );

  if (data[0] == undefined) {
    return res.json("error");
  } else {
    return res.json(data[0]);
  }
});


router.post("/editprofile_noimg", async function (req, res, next) {
  let id = req.body.user_id
  let firstname = req.body.firstname;
  let lastname = req.body.lastname;
  let password = req.body.password;
  try {
    const [data, field] = await pool.query(
      "UPDATE users SET firstname = ?, lastname = ?, password = ? WHERE id = ?",
      [firstname, lastname, password, id]
    );
    res.json("success")
  } catch (error) {
    res.json(error)
  }
});

router.post("/addInterest", async function (req, res, next) {
  let id = req.body.user_id
  let interest = req.body.interest;
  try {
    const [data, field] = await pool.query(
      "UPDATE users SET interest = ? WHERE id = ?",
      [JSON.stringify(interest), id]
    );
    res.json("success")
  } catch (error) {
    res.json(error)
  }
});

router.post(
  "/editprofile_img",
  upload.array("img_profile", 1),
  async function (req, res, next) {
    let id = req.body.user_id
    const file = req.files;
    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let password = req.body.password;
    let path;
    file.forEach((file, index) => {
      path = file.path.substring(6);
    });
    try{
      const [data, field] = await pool.query(
        "UPDATE users SET firstname = ?, lastname = ?, password = ?, img = ? WHERE id = ?",
        [firstname, lastname, password, path, id]
      );
      res.json("success");
    }
    catch(err){
      res.json(err)
    }
  }
);

module.exports = router;
