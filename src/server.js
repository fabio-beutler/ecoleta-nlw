const express = require("express");
const server = express();

// Pegar o banco de dados
const db = require("./database/db");

// Configurar pasta pública
server.use(express.static("public"));

// Habilitar o uso do req.body na nossa aplicação
server.use(express.urlencoded({ extended: true }));

// Utilizando o template engine
const nunjucks = require("nunjucks");
nunjucks.configure("src/views", {
  express: server,
  noCache: true
});

// Configurar caminhos da minha aplicação
// página inicial
// REQ: Requisição
// RES: Resposta
server.get("/", (req, res) => {
  return res.render("index.html");
});

server.get("/create-point", (req, res) => {
  //req.query: Query string da nossa url
  // console.log(req.query);

  return res.render("create-point.html");
});

server.post("/savepoint", (req, res) => {
  // req.body: corpo do formulário
  // Inserir dados do DB
  const query = `
    INSERT INTO places (
      image,
      name,
      address,
      address2,
      state,
      city,
      items
    ) VALUES (?,?,?,?,?,?,?);
  `;

  const values = [
    req.body.image,
    req.body.name,
    req.body.address,
    req.body.address2,
    req.body.state,
    req.body.city,
    req.body.items
  ];

  function afterInsertData(err) {
    if (err) {
      console.log(err);
      return res.send("Erro no Cadastro!");
    }

    console.log("Cadastrado com sucesso");
    console.log(this);

    return res.render("create-point.html", { saved: true });
  }

  db.run(query, values, afterInsertData);
});

server.get("/search", (req, res) => {
  const search = req.query.search;

  if (search == "") {
    // Pesquisa vazia
    return res.render("search-results.html", { total: 0 });
  }
  // Pegar os dados do banco de dados
  db.all(`SELECT * FROM places WHERE city LIKE '%${search}%'`, function (
    err,
    rows
  ) {
    if (err) {
      console.log(err);
    }

    const total = rows.length;

    // Mostrar a página html com os dados do banco de dados
    return res.render("search-results.html", { places: rows, total });

    console.log("Aqui estão seus registros");
    console.log(rows);
  });
});

// Ligar o servidor
// server.listen(3000);
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
server.listen(port);
