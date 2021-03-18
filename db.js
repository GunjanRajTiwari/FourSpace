const { Pool } = require("pg");

const pool = new Pool({
    user: "postgres",
    password: "gunjan",
    host: "localhost",
    port: "5432",
    database: "fourspace",
});

module.exports = pool;
