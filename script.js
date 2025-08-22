const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",       
    password: "mario0705",       
    database: "cadastrodb"
});

db.connect(err => {
    if (err) throw err;
    console.log("Conectado ao MySQL");
});

function cadastrarUsuario(nome, idade, peso, callback) {
    const sql = "INSERT INTO usuarios (nome, idade, peso) VALUES (?, ?, ?)";
    db.query(sql, [nome, idade, peso], (err, result) => {
        if (err) return callback(err, null);
        callback(null, result);
    });
}

module.exports = { cadastrarUsuario };
