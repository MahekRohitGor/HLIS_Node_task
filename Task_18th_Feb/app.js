const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const ejsLayouts = require("express-ejs-layouts");

require('dotenv').config();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, 'public')));

app.use(ejsLayouts);
app.set('layout', 'main');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: true
}));

const userRoutes = require("./routes/user");
app.use("/", userRoutes);

app.listen(process.env.PORT | 3000, () => {
    console.log("Server running on http://localhost:3000");
});
