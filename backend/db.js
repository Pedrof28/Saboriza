



const mysql = require('mysql2/promise');

// Cria um pool de conexões com o banco de dados MySQL.
// O pool permite reutilizar conexões nas operações realizadas pela API.
const conexao = mysql.createPool({
  host: 'localhost',
  user: 'root',

  // Obtém a senha por variável de ambiente, sem expô-la no código.
  password: process.env.DB_PASSWORD,

  database: 'ifood_academico'
});

// Exporta o pool para utilização nas rotas do backend.
module.exports = conexao;
