const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { cadastrarUsuario } = require("./script");
const mysql = require("mysql2");
const https = require ('https');
const url= require('url');

const app = express();
const port = 3000;

// Conexão com o banco
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

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));

// Rota raiz
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "HTML", "index.html"));
});

// Rota GET para /cadastrar (somente mensagem informativa)
app.get("/cadastrar", (req, res) => {
    res.send(`
        <h2>Esta rota deve ser acessada via formulário POST.</h2>
        <p>Volte para a <a href="/">página inicial</a> e use o formulário para cadastrar.</p>
    `);
});

// Rota POST para /cadastrar (cadastro real com BMI via GET)
app.post("/cadastrar", (req, res) => {
    const { nome, idade, peso, altura } = req.body;
    const idadeNum = Number(idade);
    const pesoNum = Number(peso);
    const alturaNum = Number(altura);

    cadastrarUsuario(nome, idadeNum, pesoNum, alturaNum, (err, result) => {
        if (err) {
            return res.send("<h2>Erro ao cadastrar usuário!</h2>");
        }

        // 🔹 Chamada correta da API de BMI via GET
        const bmiOptions = {
            method: 'GET',
            headers: {
                'X-API-Key': '930765a4-ea48-4798-842e-cd30c012d1fc' // sua chave válida
            }
        };

        const bmiUrl = `https://api.apiverve.com/v1/bmicalculator?weight=${pesoNum}&height=${alturaNum}`;

        const bmiReq = https.request(bmiUrl, bmiOptions, (bmiRes) => {
            let data = '';
            bmiRes.on('data', chunk => data += chunk);
            bmiRes.on('end', () => {
                let bmiResult;
                try {
                    bmiResult = JSON.parse(data);
                } catch {
                    bmiResult = { error: "Não foi possível calcular o BMI" };
                }

                // Busca todos os usuários para calcular médias
                db.query("SELECT * FROM usuarios", (err, usuarios) => {
                    if (err) return res.send("<h2>Erro ao buscar usuários!</h2>");

                    const total = usuarios.length;
                    const mediaIdade = usuarios.reduce((acc, u) => acc + Number(u.idade), 0) / total;
                    const mediaPeso = usuarios.reduce((acc, u) => acc + Number(u.peso), 0) / total;
                    const mediaAltura = usuarios.reduce((acc, u) => acc + Number(u.altura), 0) / total;

                    let tabela = `<table border="1" cellpadding="5" cellspacing="0">
                        <tr><th>Nome</th><th>Idade</th><th>Peso</th><th>Altura</th></tr>`;

                    usuarios.forEach(u => {
                        tabela += `<tr><td>${u.nome}</td><td>${u.idade}</td><td>${u.peso}</td><td>${u.altura}</td></tr>`;
                    });

                    tabela += `</table>`;

                    res.send(`
                        <h2>Usuário cadastrado com sucesso!</h2>
                        <p>Média de idade: ${mediaIdade.toFixed(2)}</p>
                        <p>Média de peso: ${mediaPeso.toFixed(2)}</p>
                        <p>Média de altura: ${mediaAltura.toFixed(2)}</p>
                        <h3>Resultado BMI do usuário:</h3>
                        <pre>${JSON.stringify(bmiResult, null, 2)}</pre>
                        ${tabela}
                        <br><a href="/">Voltar</a>
                    `);
                });
            });
        });

        bmiReq.on('error', (err) => {
            console.error("Erro na requisição BMI:", err);
            res.send("<h2>Erro ao calcular BMI!</h2>");
        });

        bmiReq.end();
    });
});



// 🔹 App listen deve ficar fora das rotas
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
