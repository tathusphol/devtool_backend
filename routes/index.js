const express = require("express");
const pool = require("../config");
const path = require("path");
const multer = require("multer");

router = express.Router();

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./static/uploads");
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

router.post(
  "/activity",
  upload.array("img_activity", 1),
  async function (req, res, next) {
    const file = req.files;
    let topic = req.body.topic;
    let description = req.body.description;
    let start = req.body.start;
    let stop = req.body.stop;
    let position = req.body.position;
    let path;
    file.forEach((file, index) => {
      path = file.path.substring(6);
    });
    console.log(path);

    const [data, field] = await pool.query(
      "INSERT INTO activity(topic, description, start, stop, position, img) VALUES(?, ?, ?, ?, ?, ?)",
      [topic, description, start, stop, position, path]
    );

    return res.json("success");
  }
);

router.post(
  "/update_activity_img",
  upload.array("img_activity", 1),
  async function (req, res, next) {
    const file = req.files;
    let a_id = req.body.a_id;
    let topic = req.body.topic;
    let description = req.body.description;
    let start = req.body.start;
    let stop = req.body.stop;
    let position = req.body.position;
    let path;
    file.forEach((file, index) => {
      path = file.path.substring(6);
    });
    console.log(path);

    const [data, field] = await pool.query(
      "UPDATE activity SET topic = ?, description = ?, start = ?, stop = ?, position = ?, img = ? WHERE a_id = ?",
      [topic, description, start, stop, position, path, a_id]
    );
    return res.json("success");
  }
);

router.post("/update_activity_noimg", async function (req, res, next) {
  let a_id = req.body.a_id;
  console.log(a_id)
  let topic = req.body.topic;
  let description = req.body.description;
  let start = req.body.start;
  let stop = req.body.stop;
  let position = req.body.position;
  const [data, field] = await pool.query(
    "UPDATE activity SET topic = ?, description = ?, start = ?, stop = ?, position = ? WHERE a_id = ?",
    [topic, description, start, stop, position, a_id]
  );

  return res.json("success");
});

router.get("/activity", async function (req, res, next) {
  const [data, field] = await pool.query("SELECT * FROM activity");

  return res.json(data);
});

router.post("/select/activity", async function (req, res, next) {
  let user_id = req.body.user_id;
  let activity_id = req.body.a_id;

  try {
    const [data, field] = await pool.query("INSERT INTO user_activity(u_id, a_id) VALUES(?, ?)", [
      user_id, activity_id
    ]);
  
    return res.json("success");
  } catch (error) {
    res.json(error)
  }
});

exports.router = router;
