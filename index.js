// Modules import
if (process.env.NODE_ENV !== "procuction") {
    require("dotenv").config();
}
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = require("./db");

// Express Middlewares
const app = express();
app.use(express.json());
app.use(cors());

// Custom Middlewares
function authenticate(req, res, next) {
    const token = req.body.token;
    const authUser = jwt.verify(token, process.env.JWT_SECRET);
    req.body.authUser = authUser;
    next();
}

// Helper functions
function errmsg(msg) {
    return { error: msg };
}

function table(type) {
    if (type == "user") {
        return "users";
    }
    if (type == "company") {
        return "companies";
    }
    return;
}

// Routes
// Login Users
app.post("/login", async (req, res) => {
    try {
        const { email, password, type } = req.body;
        if (!table(type)) {
            res.status(400).send({ error: "Invalid type" });
        }

        var query = `select password from ${table(
            type
        )} where email = '${email}';`;
        var result = await db.query(query);

        if (result.rowCount == 0) {
            res.status(400).send(errmsg("User donot exist"));
        }
        var hashedPassword = result.rows[0].password;

        if (await bcrypt.compare(password, hashedPassword)) {
            const token = jwt.sign(
                {
                    email,
                    type,
                },
                process.env.JWT_SECRET
            );
            res.status(200).send(token);
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

        if (!table(type)) {
            res.status(400).send({ error: "Invalid type" });
        }
        var hashedPassword = await bcrypt.hash(password, 10);

        var query = `insert into ${table(
            type
        )} values('${name}', '${email}', default, default, '${hashedPassword}');`;
        var result = await db.query(query);
        res.status(200).send("ok");
    } catch (err) {
        res.status(500).json(errmsg(err));
    }
});

app.get("/profile", authenticate, async (req, res) => {
    try {
        var { email, type } = req.body.authUser;
        if (!table(type)) {
            res.status(400).send({ error: "Invalid type" });
        }
        var query = `select name, email, available from users where email = '${email}'`;
        var result = await db.query(query);
        var profile = result.rows[0];
        res.status(200).send(profile);
    } catch (err) {
        res.status(500).json(errmsg(err));
    }
});

// Get users
app.get("/", async (req, res) => {
    try {
        var { rowCount, rows } = await db.query(
            "select name, email, available from users"
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
            "select name, email, openings from companies"
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
