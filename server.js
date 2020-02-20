const express = require("express");
const server = express();
const Pool = require('pg').Pool;
require('dotenv').config();

server.use(express.static('assets'));
server.use(express.urlencoded({extended: true}));

const db = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

const nunjucks = require("nunjucks");
nunjucks.configure("./", {
    express: server,
    noCache: true,
});

server.get("/", function(req, res) {
    db.query("SELECT * FROM donors", function(err, result) {
        if (err) return res.send("Erro de banco de dados.");
        const donors = result.rows;
        return res.render("index.html", {donors});
    })

});

server.post("/", function(req, res) {
    const name = req.body.name;
    const email = req.body.email;
    const blood = req.body.blood;

    if (!name || !email || !blood) {
        return res.send("Todos os campos são obrigatórios.");
    };

    const query = `INSERT INTO donors ("name", "email", "blood") VALUES ($1, $2, $3)`;
    const values = [name, email, blood];
    db.query(query, values, function(err) {
        if (err) return res.send("erro no banco de dados.");
        return res.redirect("/");
    });
});

server.listen(3000);