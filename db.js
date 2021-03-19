const { Pool } = require("pg");
if (process.env.NODE_ENV !== "procuction") {
    require("dotenv").config();
}

const pool = new Pool({
    user: "postgres",
    password: process.env.PASSWORD,
    host: "localhost",
    port: "5432",
    database: "fourspace",
});

module.exports = pool;
