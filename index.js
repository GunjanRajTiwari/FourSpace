// Modules import
if (process.env.NODE_ENV !== "procuction") {
    require("dotenv").config();
}
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const db = require("./db");

// Express Middlewares
const app = express();
app.use(express.json());
app.use(cors());

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

// Custom Middlewares
const authenticate = (req, res, next) => {
    try {
        const token = req.body.token;
        const authUser = jwt.verify(token, process.env.JWT_SECRET);
        var type = authUser.type;
        var email = authUser.email;
        var query = `select * from ${table(type)} where email='${email}'`
        var result = await db.query(query);
        if(result.rowCount == 0){
            throw new Error();
        }
        req.body.authUser=result.rows[0];
        res.send({authUser: result.rows[0]});
        next();
    } catch (e) {
        res.status(400).send(errmsg("Authentication failed!"));
    }
};

// Routes
// Login Users
app.post("/login", async (req, res) => {
    try {
        const { email, password, type } = req.body;
        if (!table(type)) {
            res.status(400).send({ error: "Invalid type" });
        }

        var query = `select password from ${table(type)} where email = '${email}';`;
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
            res.status(200).send({ token });
        } else {
            res.status(403).send(errmsg("Invalid Password"));
        }
    } catch (err) {
        res.status(500).send(errmsg(err));
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
            res.status(400).send(errmsg("Invalid type"));
        }
        var hashedPassword = await bcrypt.hash(password, 10);

        var query = `insert into ${table(type)} values(
            '${name}', '${email}', default, ${type == "user" ? "default," : ""} '${hashedPassword}'
            );`;
        await db.query(query);
        res.status(200).send("ok");
    } catch (err) {
        res.status(500).json(errmsg(err));
    }
});

// View User Profile
app.post("/profile", authenticate, async (req, res) => {
    try {
        var { email, type } = req.body.authUser;
        if (!table(type)) {
            res.status(400).send({ error: "Invalid type" });
        }
        var query = `select * from ${table(type)} where email = '${email}'`;
        var result = await db.query(query);
        var profile = result.rows[0];
        delete profile.password;
        profile.type = type;
        res.status(200).send(profile);
    } catch (err) {
        res.status(500).send(errmsg(err));
    }
});

// Create Contests
app.post("/contests", authenticate, async (req, res) => {
    try {
        if (req.body.authUser.type != "company") {
            res.status(403).send(errmsg("User don't have access to this task."));
        }
        var { name, info } = req.body;
        var query = `insert into contests values(
            default, '${name}', '${info}', default, '${req.body.authUser.email}'
            );`;

        await db.query(query);
        res.status(200).send("ok");
    } catch (err) {
        res.status(500).send(errmsg(err));
    }
});

// Get contests
app.get("/contests", authenticate, async (req, res) => {
    try {
        var query = "select * from contests;";

        var result = await db.query(query);

        res.send({ contestCount: result.rowCount, contests: result.rows });
    } catch (err) {
        res.status(500).send(errmsg(err));
    }
});

// Get questions of a contest
app.get("/questions", authenticate, async(req, res) => {
    const { cid } = req.body;
    try {
        var query = `select * from questions where contest_id = ${cid}`;

        var result = await db.query(query);

        res.send({
            questionCount: result.rowCount,
            questions: result.rows,
        });
    } catch(err) {
        res.status(500).send(errmsg(err));
    }
});

// Get single question
app.get("/question", authenticate, async(req, res) => {
    const { qid } = req.body;
    try {
        var query = `select * from questions where id = ${qid}`;

        var result = await db.query(query);

        res.send({ question: rows[0] });
    } catch(err) {
        res.status(500).send(errmsg(err));
    }
});

// Check Submissions
app.post("/run", authenticate, async (req, res) => {
    try {
        var { code, language, input } = req.body;

        var apiOutput = await axios({
            method: "post",
            url: "https://codexweb.netlify.app/.netlify/functions/enforceCode",
            data: {
                code,
                language,
                input,
            },
        });
        if (apiOutput.data.output.indexOf("Execution Timed Out!") !== -1) {
            res.send({
                status: 0,
                output: "Time Limit Exceeded!",
            });
        } else {
            res.send({
                status: 1,
                output: apiOutput.data.output,
            });
        }
    } catch (e) {
        res.status(500).send(errmsg(e));
    }
});

// Submit code
app.post("/submit", authenticate, async (req, res) => {
    try {
        var { question, code, language } = req.body;
        var query = `select points, testcase, output from questions where id=${question};`;
        var result = await db.query(query);
        var { points, testcase, output } = result.rows[0];

        var apiOutput = await axios({
            method: "post",
            url: "https://codexweb.netlify.app/.netlify/functions/enforceCode",
            data: {
                code,
                language,
                input: testcase,
            },
        });
        if (apiOutput.data.output.indexOf("Execution Timed Out!") !== -1) {
            res.send({
                status: 0,
                message: "Time Limit Exceeded!",
            });
        } else if (apiOutput.data.output.trim() == output) {
            res.send({
                status: 1,
                message: "Success! Testcases Passed!",
            });
        } else {
            res.send({
                status: 0,
                message: "Wrong Answer!",
            });
        }
    } catch (e) {
        res.status(500).send(errmsg(e));
    }
});

// Get users
app.get("/", async (req, res) => {
    try {
        var { rowCount, rows } = await db.query("select name, email, available, rating from users");
        res.status(200).send({ userCount: rowCount, users: rows });
    } catch (e) {
        res.status(500).send(e);
    }
});

// Get companies
app.get("/companies", async (req, res) => {
    try {
        var { rowCount, rows } = await db.query("select name, email, openings from companies");
        res.status(200).send({ companyCount: rowCount, companies: rows });
    } catch (e) {
        res.status(500).send(e);
    }
});

// Listening to the server
var port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log("Server running at " + port + "...");
});
