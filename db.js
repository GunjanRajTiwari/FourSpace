const { Pool, Client } = require("pg");
if (process.env.NODE_ENV !== "procuction") {
    require("dotenv").config();
}

// const client = new Pool({
//     user: "postgres",
//     password: process.env.PASSWORD,
//     host: "localhost",
//     port: "5432",
//     database: "fourspace",
// });

var client = new Client(process.env.DBURL);
client.connect(function (err) {
    if (err) {
        return console.error("Could not connect to postgres", err);
    }
    console.log("DB Connected...");
});

module.exports = client;
