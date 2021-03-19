// Modules import
if (process.env.NODE_ENV !== "procuction") {
    require("dotenv").config();
}
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const session = require("express-session");

const db = require("./db");

// Express Middlewares
const app = express();
app.use(express.json());
app.use(cors());
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);

// Custom Middlewares
function isAuthenticated(req, res, next) {
    return next();
}

function errmsg(msg) {
    return { error: msg };
}

// Routes
app.post("/login", async (req, res) => {
    try {
        const { email, password, type } = req.body;
        var table;
        if (type == "user") {
            table = "users";
        } else if (type == "company") {
            table = "companies";
        } else {
            res.status(400).send({ error: "Invalid type" });
        }

        var query = `select password from ${table} where email = '${email}';`;
        var result = await db.query(query);
        var hashedPassword = result.rows[0].password;

        if (!hashedPassword) {
            res.status(400).send(errmsg("Invalid credentials"));
        }

        if (await bcrypt.compare(password, hashedPassword)) {
            res.status(200).send("Welcome, you are logged in successfully");
        } else {
            res.status(403).send("Invalid Password");
        }
    } catch (err) {
        res.status(500).json(errmsg(err));
    }
});

// Register Users
app.post("/register", async (req, res) => {
    try {
        var { name, email, password, type } = req.body;

        if (password.length < 4) {
            res.status(400).send(errmsg("Password too short"));
        }

        var table;
        if (type == "user") {
            table = "users";
        } else if (type == "company") {
            table = "companies";
        } else {
            res.status(400).send({ error: "Invalid type" });
        }

        var hashedPassword = await bcrypt.hash(password, 10);

        var query = `insert into ${table} values(default, '${name}', '${email}', default, '${hashedPassword}');`;
        var result = await db.query(query);
        res.status(200).send(result);
    } catch (err) {
        res.status(500).json(errmsg(err.detail));
    }
});

// Get users
app.get("/", async (req, res) => {
    try {
        var { rowCount, rows } = await db.query(
            "select id, name, email, available from users"
        );
        res.status(200).send({ userCount: rowCount, users: rows });
    } catch (e) {
        res.status(500).send(e);
    }
});

// Get companies
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
app.listen(process.env.PORT, () => {
    console.log("Server running at 8080...");
});
