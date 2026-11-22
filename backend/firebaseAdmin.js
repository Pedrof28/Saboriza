
const admin = require('firebase-admin');

// Importa o Firebase Admin SDK para utilização no backend.

// Inicializa o Firebase Admin com o identificador do projeto Saboriza.
// A verificação evita inicializar o aplicativo mais de uma vez.
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'saboriza-delivery'
  });
}

// Obtém o serviço de autenticação do Firebase Admin.
// Esse serviço poderá ser utilizado para verificar tokens de usuários
// e integrar a autenticação do Firebase às rotas da API.
const authAdmin = admin.auth();

// Exporta o serviço de autenticação para outros arquivos do backend.
module.exports = authAdmin;
