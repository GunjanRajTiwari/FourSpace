const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/", (req, res) => {
    res.send("Hello");
});

app.listen(8080, () => {
    console.log("Server running at 8080...");
});
