
// server.js (top)
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const app = express();
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});


db.connect(err => {
  if (err) throw err;
  console.log("✅ MySQL Connected!");
});

// ------------------ SIGNUP ------------------
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "All fields required" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, hashedPassword],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.json({ success: false, message: "Email already registered" });
        }
        throw err;
      }
      res.json({ success: true, message: "Signup successful!" });
    }
  );
});

// ------------------ LOGIN ------------------
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) throw err;

    if (results.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid password" });
    }

    // ✅ Send user profile (without password)
    delete user.password;
    res.json({ success: true, message: "Login successful", user });
  });
});

// ------------------ UPDATE PROFILE ------------------
app.post("/update-profile", (req, res) => {
  const { id, name, phone, address, favorite_cake, image } = req.body;

  db.query(
    "UPDATE users SET name=?, phone=?, address=?, favorite_cake=?, image=? WHERE id=?",
    [name, phone, address, favorite_cake, image, id],
    (err, result) => {
      if (err) throw err;
      res.json({ success: true, message: "Profile updated!" });
    }
  );
});

// ✅ Start server
app.listen(5000, () => {
  console.log("🚀 Server running on www.momscake.shop");
});
