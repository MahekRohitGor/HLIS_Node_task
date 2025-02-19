const express = require("express");
const router = express.Router();
const pool = require("../config/database.js");

const isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
      return res.redirect("/login");
    }
    next();
  };


// 1. Load Add User Form
router.get("/adduser", isAuthenticated, (req, res) => {
  res.render("adduser", { user: req.session.user });
});

// 2. Submit Form to Add User
router.post("/adduser", isAuthenticated, async (req, res) => {
  try {
    const {
      user_fname,
      user_lname,
      user_email,
      user_phone,
      user_address,
      user_city,
      user_state,
      user_country,
      user_dob,
      passwords,
    } = req.body;

    await pool.query(
      "INSERT INTO tbl_user (user_fname, user_lname, user_email, user_phone, user_address, user_city, user_state, user_country, user_dob, passwords) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        user_fname,
        user_lname,
        user_email,
        user_phone,
        user_address,
        user_city,
        user_state,
        user_country,
        user_dob,
        passwords,
      ]
    );
    res.redirect("/userlist");
  } catch (err) {
    res.status(500).send("Error adding user. Please try again.");
  }
});

// 3. List Users
router.get("/userlist", async (req, res) => {
  try {
    const [users] = await pool.query("SELECT * FROM tbl_user where is_deleted = 0");
    res.render("userlist", { users, user: req.session.user });
  } catch (err) {
    console.error("Error fetching user list:", err);
    res.status(500).send("Error fetching user list. Please try again.");
  }
});

// 4. Load Edit User Page
router.get("/edituser/:id", isAuthenticated, async (req, res) => {
  try {
    const [user] = await pool.query("SELECT * FROM tbl_user WHERE user_id = ? and is_deleted = 0", [
      req.params.id,
    ]);

    if (user.length === 0) {
      return res.status(404).send("User not found.");
    }

    res.render("edituser", { user: user[0] });
  } catch (err) {
    console.error("Error fetching user for edit:", err);
    res.status(500).send("Error loading user for edit. Please try again.");
  }
});

// 5. Update User
router.post("/edituser/:id", isAuthenticated, async (req, res) => {
  try {
    const {
      user_fname,
      user_lname,
      user_email,
      user_phone,
      user_address,
      user_city,
      user_state,
      user_country,
      user_dob,
    } = req.body;

    const result = await pool.query(
      "UPDATE tbl_user SET user_fname = ?, user_lname = ?, user_email = ?, user_phone = ?, user_address = ?, user_city = ?, user_state = ?, user_country = ?, user_dob = ? WHERE user_id = ? and is_deleted = 0",
      [
        user_fname,
        user_lname,
        user_email,
        user_phone,
        user_address,
        user_city,
        user_state,
        user_country,
        user_dob,
        req.params.id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).send("User not found.");
    }

    res.redirect("/userlist");
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).send("Error updating user. Please try again.");
  }
});

// 6. Delete User
router.get("/deleteuser/:id", isAuthenticated, async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM tbl_user WHERE user_id = ? and is_deleted = 0", [
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).send("User not found.");
    }
    res.redirect("/userlist");
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).send("Error deleting user. Please try again.");
  }
});

// 7. Load Login Page
router.get('/login', (req, res) => {
  res.render('login', { user: req.session.user });
});

// 8. Login
router.post("/login", async (req, res) => {
    try {
      const { user_email, passwords } = req.body;
  
      const [user] = await pool.query(
        "SELECT * FROM tbl_user WHERE user_email = ? AND passwords = ? and is_deleted = 0",
        [user_email, passwords]
      );
  
      if (user.length > 0) {
        req.session.user = user[0];
        res.redirect("/profile");
      } else {
        res.render("error.ejs", { errorMessage: "Invalid credentials. Please try again.", user:req.session.user});
      }
    } catch (err) {
      console.error("Error during login:", err);
      res.status(500).send("Error during login. Please try again.");
    }
  });
  

// 9. User Profile Page
router.get("/profile", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  res.render("profile", { user: req.session.user });
});

// 10. Logout
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error during logout:", err);
      return res.status(500).send("Error logging out. Please try again.");
    }
    res.redirect("/login");
  });
});

module.exports = router;
