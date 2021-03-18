// Modules import
const express = require("express");
const cors = require("cors");
const db = require("./db");

// Middlewares
const app = express();
app.use(cors());

// Routes
app.get("/", (req, res) => {
    // db.query("select");
    res.sendFile(__dirname + "/index.html");
});

app.get("/greet", (req, res) => {
    // db.query("select");
    res.send("Hello Sandesh");
});

// Listening to the server
app.listen(8080, () => {
    console.log("Server running at 8080...");
});
