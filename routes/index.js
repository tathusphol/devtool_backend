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
  upload.single("img_activity"),
  async function (req, res, next) {
    const file = req.file;
    let topic = req.body.topic;
    let description = req.body.description;
    let start = req.body.start;
    let stop = req.body.stop;
    let min = req.body.min;
    let max = req.body.max;
    let goal = req.body.goal;
    let position = req.body.position;
    let path = file.path.substring(6); 
  
    const [data, field] = await pool.query(
      "INSERT INTO activity(topic, description, start, stop, min, max, goal, position, img) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [topic, description, start, stop, min, max, goal, position, path]
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
    let min = req.body.min;
    let max = req.body.max;
    let goal = req.body.goal;
    let position = req.body.position;
    let path;
    file.forEach((file, index) => {
      path = file.path.substring(6);
    });
    console.log(path);

    const [data, field] = await pool.query(
      "UPDATE activity SET topic = ?, description = ?, start = ?, stop = ?, min = ?, max =?, goal = ?, position = ?, img = ? WHERE a_id = ?",
      [topic, description, start, stop, min, max, goal, position, path, a_id]
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
  let min = req.body.min;
  let max = req.body.max;
  let goal = req.body.goal;
  let position = req.body.position;
  const [data, field] = await pool.query(
    "UPDATE activity SET topic = ?, description = ?, start = ?, stop = ?,  min = ?, max =?, goal = ?, position = ? WHERE a_id = ?",
    [topic, description, start, stop, min, max, goal, position, a_id]
  );

  return res.json("success");
});

router.get("/activity", async function (req, res, next) {
  const [data, field] = await pool.query("SELECT * FROM activity WHERE status != ?", ["stop"]);

  return res.json(data);
});

router.get("/activityall", async function (req, res, next) {
  const [data, field] = await pool.query("SELECT * FROM activity ");

  return res.json(data);
});

router.post("/selectactivity", async function (req, res, next) {
  const [data, field] = await pool.query("SELECT * FROM activity WHERE a_id = ?", [
    req.body.a_id
  ]);

  return res.json(data[0]);
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

router.post("/end/activity", async function (req, res, next) {
  let activity_id = req.body.a_id;

  try {
    const [data, field] = await pool.query("UPDATE activity SET status = ? WHERE a_id = ?", [
      "stop", activity_id
    ]);
  
    return res.json("success");
  } catch (error) {
    res.json(error)
  }
});

router.post("/my_activity", async function (req, res, next) {
  try {
    const [data, field] = await pool.query("SELECT a_id FROM user_activity WHERE u_id = ?", [
      req.body.u_id
    ]);
    return res.json(data);
  } catch (error) {
    res.json(error)
  }
});

router.post("/myadmin_activity", async function (req, res, next) {
  try {
    const [data, field] = await pool.query("SELECT * FROM activity WHERE u_id = ? AND status != ?", [
      req.body.u_id, "stop"
    ]);
    console.log(data)
    return res.json(data);
  } catch (error) {
    res.json(error)
  }
});

exports.router = router;
