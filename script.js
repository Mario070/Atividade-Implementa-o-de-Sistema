const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",       
    password: "mario0705",       
    database: "cadastro2db"
});

db.connect(err => {
    if (err) throw err;
    console.log("Conectado ao MySQL");
});

function cadastrarUsuario(nome, idade, peso, altura, callback) {
    const sql = "INSERT INTO usuarios (nome, idade, peso, altura) VALUES (?, ?, ?, ?)";
    db.query(sql, [nome, idade, peso, altura], (err, result) => {
        if (err) return callback(err, null);
        callback(null, result);
    });
}


module.exports = { cadastrarUsuario };
