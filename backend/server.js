require("dotenv").config();
const bcrypt = require("bcrypt");
const File = require("./models/File");
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const path = require("path");



const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.static(path.join(__dirname, "public")));

// 🔥 FILE ROUTES (THIS WAS MISSING)
const filesRoute = require("./routes/files");
app.use("/api/files", filesRoute);

// 🔥 MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected 🔥"))
  .catch(err => console.log(err));


// 📦 Multer setup
const fs = require("fs");

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});


const upload = multer({ storage });

// 🚀 Upload API
app.post("/upload", upload.single("file"), async (req, res) => {
  console.log("🔥 UPLOAD ROUTE HIT");

  console.log("📦 req.body =", req.body);
  console.log("🔐 PASSWORD RECEIVED 👉", req.body.password);

  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  const password = req.body.password;

  let hashedPassword = null;
  if (password !== undefined && password !== "") {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  const file = new File({
    originalName: req.file.originalname,
    fileName: req.file.filename,
    path: req.file.path,
    size: req.file.size,
    password: hashedPassword,
  });

  await file.save();

  res.json({
    message: "Uploaded!",
    downloadLink: `http://localhost:5000/files/${file._id}`
  });
});


app.get("/files/:id", async (req, res) => {
  const file = await File.findById(req.params.id);

  if (!file) return res.status(404).send("File not found");

  if (file.password) {
   return res.send(`
  <h2>Password Required</h2>
  <form method="POST" action="/files/${req.params.id}">
    <input type="password" name="password" required />
    <button type="submit">Download</button>
  </form>
`);

  }

  res.download(path.resolve(file.path), file.originalName);

});
 

app.post("/files/:id", async (req, res) => {
  const file = await File.findById(req.params.id);
  if (!file) return res.status(404).send("File not found");

  if (file.password) {
    const isValid = await bcrypt.compare(
      req.body.password,
      file.password
    );

    if (!isValid) {
      return res.status(401).send("Wrong password");
    }
  }

  res.download(path.resolve(file.path), file.originalName);

});


// ▶ Server Start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🔥`);
});
