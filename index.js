// Modules import
const express = require("express");
const cors = require("cors");
const db = require("./db");
const { urlencoded } = require("express");

// Express Middlewares
const app = express();
app.use(express.json());
app.use(urlencoded({ extended: false }));
app.use(cors());

// Routes
app.get("/", (req, res) => {
    res.send("Goto /signin");
});

app.post("/register", async (req, res) => {
    try {
        var { name, email, password, type } = req.body;
        var table;
        if (type == "user") {
            table = "users";
        } else if (type == "company") {
            table = "companies";
        } else {
            res.status(400).send({ error: "Invalid type" });
        }

        var query = `insert into ${table} values(default, '${name}', '${email}', default, '${password}');`;
        var result = await db.query(query);
        res.status(200).send(result);
    } catch (err) {
        res.status(500).send(err);
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

app.get("/companies", async (req, res) => {
    try {
        var { rowCount, rows } = await db.query(
            "select id, name, email, openings from companies"
        );
        res.status(200).send({ companyCount: rowCount, companies: rows });
    } catch (e) {
        res.status(500).send(e);
    }
});

// Listening to the server
app.listen(8080, () => {
    console.log("Server running at 8080...");
});
