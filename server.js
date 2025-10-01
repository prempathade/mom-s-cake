const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// ✅ MySQL connection (XAMPP)
const db = mysql.createConnection({
  host: "localhost",
  user: "root",      
  password: "",      
  database: "moms_cake"
});

// ✅ Test MySQL connection
db.connect(err => {
  if (err) {
    console.error("❌ MySQL connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL (XAMPP)");
  }
});

// ✅ SIGNUP
app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: "All fields are required" });
  }

  // check if email already exists
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.json({ success: false, message: "Database error" });

    if (results.length > 0) {
      return res.json({ success: false, message: "Email already registered" });
    }

    // insert new user
    db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, password],
      (err2) => {
        if (err2) {
          console.error("MySQL error:", err2);
          return res.json({ success: false, message: "Database error" });
        }
        res.json({ success: true, message: "User registered successfully!" });
      }
    );
  });
});

// ✅ LOGIN
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: "All fields are required" });
  }

  db.query(
    "SELECT * FROM users WHERE email = ? AND password = ?",
    [email, password],
    (err, results) => {
      if (err) return res.json({ success: false, message: "Database error" });

      if (results.length === 0) {
        return res.json({ success: false, message: "Invalid email or password" });
      }

      // ✅ user found
      res.json({ success: true, user: results[0] });
    }
  );
});
// ✅ Update Profile
app.post("/update-profile", (req, res) => {
  const { id, name, phone, address, favorite_cake } = req.body;

  if (!id || !name) {
    return res.json({ success: false, message: "Missing fields" });
  }

  db.query(
    "UPDATE users SET name=?, phone=?, address=?, favorite_cake=? WHERE id=?",
    [name, phone, address, favorite_cake, id],
    (err) => {
      if (err) return res.json({ success: false, message: "Database error" });

      // fetch updated user
      db.query("SELECT * FROM users WHERE id=?", [id], (err2, result) => {
        if (err2) return res.json({ success: false, message: "Database error" });
        res.json({ success: true, user: result[0] });
      });
    }
  );
});

// ✅ Create New Order
app.post("/create-order", (req, res) => {
  const { user_id, cake_name, quantity, price } = req.body;

  if (!user_id || !cake_name || !quantity || !price) {
    return res.json({ success: false, message: "All fields required" });
  }

  db.query(
    "INSERT INTO orders (user_id, cake_name, quantity, price) VALUES (?, ?, ?, ?)",
    [user_id, cake_name, quantity, price],
    (err) => {
      if (err) return res.json({ success: false, message: "Database error" });
      res.json({ success: true, message: "Order placed successfully!" });
    }
  );
});

// ✅ Get User Orders
app.get("/my-orders/:user_id", (req, res) => {
  const user_id = req.params.user_id;

  db.query("SELECT * FROM orders WHERE user_id = ? ORDER BY order_date DESC", [user_id], (err, results) => {
    if (err) return res.json({ success: false, message: "Database error" });

    res.json({ success: true, orders: results });
  });
});

// 🚀 Start server
app.listen(5000, () => console.log("✅ Server running on port 5000"));
