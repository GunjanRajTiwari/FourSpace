// Modules import
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db");

// Middlewares
const app = express();
app.use(bodyParser());
app.use(cors());

// Routes
app.post("/signin", async (req, res) => {
    try {
        res.send(req);
        var { name, email, password } = req.body;
        var query = `insert into users values(default, '${name}', '${email}', default, '${password}');`;
        res.send(query);
        var result = await db.query(query);
        res.status(201).send(result);
    } catch (e) {
        res.status(500).send(e);
    }
});
app.get("/users", async (req, res) => {
    try {
        var { rowCount, rows } = await db.query(
            "select id, name, email, available from users"
        );
        res.status(200).send({ userCount: rowCount, users: rows });
    } catch (e) {
        res.status(500).send(e);
    }
});

app.get("/greet", (req, res) => {
    // db.query("select");
    res.send("Hello Sandesh");
});

// Listening to the server
app.listen(8080, () => {
    console.log("Server running at 8080...");
});
