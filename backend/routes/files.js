const express = require("express");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const File = require("../models/File");

const router = express.Router();

// Multer config
const upload = multer({
  dest: "uploads/"
});

// Upload file
router.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const file = new File({
    filename: req.file.originalname,
    path: req.file.path,
    size: req.file.size,
    uuid: uuidv4()
  });

  await file.save();

  res.json({
    link: `http://localhost:5000/api/files/${file.uuid}`
  });
});

// Download file
router.get("/:uuid", async (req, res) => {
  const file = await File.findOne({ uuid: req.params.uuid });

  if (!file) {
    return res.status(404).json({ error: "File not found" });
  }

  res.download(file.path);
});

module.exports = router;
