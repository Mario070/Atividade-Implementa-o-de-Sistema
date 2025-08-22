const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { cadastrarUsuario } = require("./script");
const mysql = require("mysql2");

const app = express();
const port = 3000;

// Conexão com o banco
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

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));

// Rota raiz
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "HTML", "index.html"));
});

// Rota de cadastro
app.post("/cadastrar", (req, res) => {
    const { nome, idade, peso } = req.body;
    const idadeNum = Number(idade);
    const pesoNum = Number(peso);

    cadastrarUsuario(nome, idadeNum, pesoNum, (err, result) => {
        if (err) {
            return res.send("<h2>Erro ao cadastrar usuário!</h2>");
        }

        // Buscar todos os usuários para calcular médias e mostrar tabela
        db.query("SELECT * FROM usuarios", (err, usuarios) => {
            if (err) return res.send("<h2>Erro ao buscar usuários!</h2>");

            const total = usuarios.length;
            const mediaIdade = usuarios.reduce((acc, u) => acc + Number(u.idade), 0) / total;
            const mediaPeso = usuarios.reduce((acc, u) => acc + Number(u.peso), 0) / total;


            let tabela = `<table border="1" cellpadding="5" cellspacing="0">
                <tr><th>Nome</th><th>Idade</th><th>Peso</th></tr>`;

            usuarios.forEach(u => {
                tabela += `<tr><td>${u.nome}</td><td>${u.idade}</td><td>${u.peso}</td></tr>`;
            });

            tabela += `</table>`;

            res.send(`
                <h2>Usuário cadastrado com sucesso!</h2>
                <p>Média de idade: ${mediaIdade.toFixed(2)}</p>
                <p>Média de peso: ${mediaPeso.toFixed(2)}</p>
                ${tabela}
                <br><a href="/">Voltar</a>
            `);
        });
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
