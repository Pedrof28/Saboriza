
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const conexao = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

// Rota de diagnóstico que confirma se a API está respondendo.
app.get('/', (req, res) => {
  res.send('Servidor Saboriza funcionando!');
});



// Verifica a conexão com o MySQL durante a inicialização do servidor.
async function testarBanco() {
  try {
    const [resultado] = await conexao.query('SELECT 1 AS teste');
    console.log('Saboriza conectado ao MySQL com sucesso!');
  } catch (erro) {
    console.log('Erro ao conectar com o MySQL:', erro.message);
  }
}

testarBanco();


// Consulta todos os restaurantes cadastrados no MySQL
// e retorna os resultados em formato JSON para o frontend.
app.get('/restaurantes', async (req, res) => {
  try {
    const [restaurantes] = await conexao.query(
      'SELECT * FROM Restaurante'
    );

    res.json(restaurantes);
  } catch (erro) {
    res.status(500).json({
      mensagem: 'Erro ao buscar restaurantes'
    });
  }
});




// Consulta as categorias de produtos cadastradas no MySQL.
// Retorna o identificador, o nome e a descrição de cada categoria.
// Organiza os resultados em ordem alfabética pelo nome.
// Disponibiliza os dados em formato JSON para utilização no frontend.
app.get('/categorias', async (req, res) => {
  try {
    const [categorias] = await conexao.query(
      `SELECT id_categoria, nome, descricao
       FROM Categoria
       ORDER BY nome`
    );

    res.json(categorias);

  } catch (erro) {
    console.error('Erro ao buscar categorias:', erro);

    res.status(500).json({
      mensagem: 'Erro ao buscar categorias.'
    });
  }
});





// Cadastra um novo restaurante no MySQL.
// Valida os campos obrigatórios, CNPJ, CEP, UF e horários de funcionamento.
// Retorna o identificador do restaurante cadastrado ou uma mensagem de erro.
app.post('/restaurantes', async (req, res) => {
  try {
    const {
      nome,
      cnpj,
      telefone,
      categoria_restaurante,
      cep,
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      uf,
      hora_abertura,
      hora_fechamento
    } = req.body;

    if (
      !nome || !cnpj || !telefone ||
      !categoria_restaurante || !cep ||
      !logradouro || !numero || !bairro ||
      !cidade || !uf ||
      !hora_abertura || !hora_fechamento
    ) {
      return res.status(400).json({
        mensagem: 'Preencha todos os campos obrigatórios.'
      });
    }

    if (!/^\d{14}$/.test(String(cnpj))) {
      return res.status(400).json({
        mensagem: 'O CNPJ deve conter 14 números.'
      });
    }

    if (!/^\d{8}$/.test(String(cep))) {
      return res.status(400).json({
        mensagem: 'O CEP deve conter 8 números.'
      });
    }

    if (!/^[A-Za-z]{2}$/.test(String(uf))) {
      return res.status(400).json({
        mensagem: 'A UF deve conter 2 letras.'
      });
    }

    const formatoHorario = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

    if (
      !formatoHorario.test(hora_abertura) ||
      !formatoHorario.test(hora_fechamento)
    ) {
      return res.status(400).json({
        mensagem: 'Informe horários válidos no formato HH:MM.'
      });
    }

    const [resultado] = await conexao.query(
      `INSERT INTO Restaurante (
        nome, cnpj, telefone, categoria_restaurante,
        cep, logradouro, numero, complemento,
        bairro, cidade, uf,
        hora_abertura, hora_fechamento, ativo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        nome,
        cnpj,
        telefone,
        categoria_restaurante,
        cep,
        logradouro,
        numero,
        complemento || null,
        bairro,
        cidade,
        uf.toUpperCase(),
        hora_abertura,
        hora_fechamento
      ]
    );

    res.status(201).json({
      mensagem: 'Restaurante cadastrado com sucesso!',
      id_restaurante: resultado.insertId
    });

  } catch (erro) {
    console.error('Erro ao cadastrar restaurante:', erro);

    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        mensagem: 'Já existe um restaurante com esse CNPJ.'
      });
    }

    res.status(500).json({
      mensagem: 'Erro ao cadastrar restaurante.'
    });
  }
});



// Atualiza os dados de um restaurante já cadastrado no MySQL.
// Valida o identificador, os campos obrigatórios e os dados informados.
// Retorna erro caso o restaurante não exista ou o CNPJ já esteja cadastrado.
app.put('/restaurantes/:id', async (req, res) => {
  try {
    const idRestaurante = Number(req.params.id);

    if (!Number.isInteger(idRestaurante) || idRestaurante <= 0) {
      return res.status(400).json({
        mensagem: 'ID do restaurante inválido.'
      });
    }

    const {
      nome,
      cnpj,
      telefone,
      categoria_restaurante,
      cep,
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      uf,
      hora_abertura,
      hora_fechamento
    } = req.body;

    if (
      !nome || !cnpj || !telefone ||
      !categoria_restaurante || !cep ||
      !logradouro || !numero || !bairro ||
      !cidade || !uf ||
      !hora_abertura || !hora_fechamento
    ) {
      return res.status(400).json({
        mensagem: 'Preencha todos os campos obrigatórios.'
      });
    }

    if (!/^\d{14}$/.test(String(cnpj))) {
      return res.status(400).json({
        mensagem: 'O CNPJ deve conter 14 números.'
      });
    }

    if (!/^\d{8}$/.test(String(cep))) {
      return res.status(400).json({
        mensagem: 'O CEP deve conter 8 números.'
      });
    }

    if (!/^[A-Za-z]{2}$/.test(String(uf))) {
      return res.status(400).json({
        mensagem: 'A UF deve conter 2 letras.'
      });
    }

    const formatoHorario = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

    if (
      !formatoHorario.test(hora_abertura) ||
      !formatoHorario.test(hora_fechamento)
    ) {
      return res.status(400).json({
        mensagem: 'Informe horários válidos no formato HH:MM.'
      });
    }

    const [resultado] = await conexao.query(
      `UPDATE Restaurante
       SET nome = ?,
           cnpj = ?,
           telefone = ?,
           categoria_restaurante = ?,
           cep = ?,
           logradouro = ?,
           numero = ?,
           complemento = ?,
           bairro = ?,
           cidade = ?,
           uf = ?,
           hora_abertura = ?,
           hora_fechamento = ?
       WHERE id_restaurante = ?`,
      [
        nome,
        cnpj,
        telefone,
        categoria_restaurante,
        cep,
        logradouro,
        numero,
        complemento || null,
        bairro,
        cidade,
        uf.toUpperCase(),
        hora_abertura,
        hora_fechamento,
        idRestaurante
      ]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensagem: 'Restaurante não encontrado.'
      });
    }

    res.json({
      mensagem: 'Restaurante atualizado com sucesso!'
    });

  } catch (erro) {
    console.error('Erro ao atualizar restaurante:', erro);

    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        mensagem: 'Já existe um restaurante com esse CNPJ.'
      });
    }

    res.status(500).json({
      mensagem: 'Erro ao atualizar restaurante.'
    });
  }
});



// Exclui um restaurante cadastrado no MySQL.
// Valida o identificador e verifica se o restaurante existe.
// Impede a exclusão quando há registros vinculados a ele,
// preservando a integridade referencial do banco de dados.
app.delete('/restaurantes/:id', async (req, res) => {
  try {
    const idRestaurante = Number(req.params.id);

    if (!Number.isInteger(idRestaurante) || idRestaurante <= 0) {
      return res.status(400).json({
        mensagem: 'ID do restaurante inválido.'
      });
    }

    const [resultado] = await conexao.query(
      'DELETE FROM Restaurante WHERE id_restaurante = ?',
      [idRestaurante]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensagem: 'Restaurante não encontrado.'
      });
    }

    res.json({
      mensagem: 'Restaurante excluído com sucesso!'
    });

  } catch (erro) {
    console.error('Erro ao excluir restaurante:', erro);

    if (erro.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        mensagem: 'Não é possível excluir este restaurante porque existem registros vinculados a ele.'
      });
    }

    res.status(500).json({
      mensagem: 'Erro ao excluir restaurante.'
    });
  }
});



// Cadastra um novo produto no cardápio de um restaurante.
// Valida os campos obrigatórios, o preço e os identificadores recebidos.
// Verifica se o restaurante e a categoria existem no MySQL.
// Registra o produto com sua disponibilidade e retorna o ID gerado.
app.post('/produtos', async (req, res) => {
  try {
    const {
      nome,
      descricao,
      preco,
      imagem_url,
      id_restaurante,
      id_categoria,
      disponivel
    } = req.body;

    if (
      !nome || preco === undefined || preco === null ||
      !id_restaurante || !id_categoria
    ) {
      return res.status(400).json({
        mensagem: 'Preencha os campos obrigatórios do produto.'
      });
    }

    const precoNumero = Number(preco);
    const idRestaurante = Number(id_restaurante);
    const idCategoria = Number(id_categoria);

    if (
      !Number.isFinite(precoNumero) ||
      precoNumero <= 0 ||
      precoNumero > 99999999.99
    ) {
      return res.status(400).json({
        mensagem: 'Informe um preço válido e maior que zero.'
      });
    }

    if (
      !Number.isInteger(idRestaurante) || idRestaurante <= 0 ||
      !Number.isInteger(idCategoria) || idCategoria <= 0
    ) {
      return res.status(400).json({
        mensagem: 'Restaurante ou categoria inválidos.'
      });
    }

    const [restaurantes] = await conexao.query(
      'SELECT id_restaurante FROM Restaurante WHERE id_restaurante = ?',
      [idRestaurante]
    );

    if (restaurantes.length === 0) {
      return res.status(404).json({
        mensagem: 'Restaurante não encontrado.'
      });
    }

    const [categorias] = await conexao.query(
      'SELECT id_categoria FROM Categoria WHERE id_categoria = ?',
      [idCategoria]
    );

    if (categorias.length === 0) {
      return res.status(404).json({
        mensagem: 'Categoria não encontrada.'
      });
    }

    const [resultado] = await conexao.query(
      `INSERT INTO Produto (
        nome, descricao, preco, imagem_url,
        id_restaurante, id_categoria, disponivel
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        nome,
        descricao || null,
        precoNumero,
        imagem_url || null,
        idRestaurante,
        idCategoria,
        disponivel === undefined ? 1 : (disponivel ? 1 : 0)
      ]
    );



    res.status(201).json({
      mensagem: 'Produto cadastrado com sucesso!',
      id_produto: resultado.insertId
    });

  } catch (erro) {
    console.error('Erro ao cadastrar produto:', erro);

    res.status(500).json({
      mensagem: 'Erro ao cadastrar produto.'
    });
  }
});




// Atualiza as informações de um produto cadastrado no MySQL.
// Valida o identificador, o preço e os campos obrigatórios.
// Permite alterar a descrição, a imagem, a categoria e a disponibilidade.
// Retorna erro quando o produto não existe ou os dados são inválidos.
app.put('/produtos/:id', async (req, res) => {
  try {
    const idProduto = Number(req.params.id);

    if (!Number.isInteger(idProduto) || idProduto <= 0) {
      return res.status(400).json({
        mensagem: 'ID do produto inválido.'
      });
    }

    const {
      nome,
      descricao,
      preco,
      imagem_url,
      id_restaurante,
      id_categoria,
      disponivel
    } = req.body;

    if (
      !nome || preco === undefined || preco === null ||
      !id_restaurante || !id_categoria ||
      disponivel === undefined
    ) {
      return res.status(400).json({
        mensagem: 'Preencha os campos obrigatórios.'
      });
    }

    const precoNumero = Number(preco);
    const idRestaurante = Number(id_restaurante);
    const idCategoria = Number(id_categoria);

    if (
      !Number.isFinite(precoNumero) ||
      precoNumero <= 0 ||
      precoNumero > 99999999.99
    ) {
      return res.status(400).json({
        mensagem: 'Preço inválido.'
      });
    }

    if (
      !Number.isInteger(idRestaurante) || idRestaurante <= 0 ||
      !Number.isInteger(idCategoria) || idCategoria <= 0
    ) {
      return res.status(400).json({
        mensagem: 'Restaurante ou categoria inválidos.'
      });
    }

    if (
      disponivel !== true && disponivel !== false &&
      disponivel !== 1 && disponivel !== 0
    ) {
      return res.status(400).json({
        mensagem: 'Disponibilidade inválida.'
      });
    }

    const [resultado] = await conexao.query(
      `UPDATE Produto
       SET nome = ?,
           descricao = ?,
           preco = ?,
           imagem_url = ?,
           id_restaurante = ?,
           id_categoria = ?,
           disponivel = ?
       WHERE id_produto = ?`,
      [
        nome,
        descricao || null,
        precoNumero,
        imagem_url || null,
        idRestaurante,
        idCategoria,
        disponivel ? 1 : 0,
        idProduto
      ]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensagem: 'Produto não encontrado.'
      });
    }

    res.json({
      mensagem: 'Produto atualizado com sucesso!'
    });

  } catch (erro) {
    console.error('Erro ao atualizar produto:', erro);

    if (erro.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        mensagem: 'Restaurante ou categoria não existem.'
      });
    }

    res.status(500).json({
      mensagem: 'Erro ao atualizar produto.'
    });
  }
});





// Exclui um produto cadastrado no MySQL.
// Valida o identificador e verifica se o produto existe.
// Trata restrições de chave estrangeira, impedindo a exclusão
// quando o produto está vinculado a outros registros.
app.delete('/produtos/:id', async (req, res) => {
  try {
    const idProduto = Number(req.params.id);

    if (!Number.isInteger(idProduto) || idProduto <= 0) {
      return res.status(400).json({
        mensagem: 'ID do produto inválido.'
      });
    }

    const [resultado] = await conexao.query(
      'DELETE FROM Produto WHERE id_produto = ?',
      [idProduto]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensagem: 'Produto não encontrado.'
      });
    }

    res.json({
      mensagem: 'Produto excluído com sucesso!'
    });

  } catch (erro) {
    console.error('Erro ao excluir produto:', erro);

    if (erro.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        mensagem: 'Não é possível excluir este produto porque existem registros vinculados.'
      });
    }

    res.status(500).json({
      mensagem: 'Erro ao excluir produto.'
    });
  }
});




// Consulta os produtos disponíveis de um restaurante.
// Filtra os registros pelo ID do restaurante e pela disponibilidade.
// Retorna ao frontend os dados dos produtos encontrados.
app.get('/restaurantes/:id/produtos', async (req, res) => {
  try {
    const idRestaurante = req.params.id;

    const [produtos] = await conexao.query(
      `SELECT id_produto, nome, descricao, preco, disponivel
       FROM Produto
       WHERE id_restaurante = ? AND disponivel = 1`,
      [idRestaurante]
    );

    res.json(produtos);
  } catch (erro) {
    console.log('Erro ao buscar produtos:', erro.message);

    res.status(500).json({
      mensagem: 'Erro ao buscar produtos'
    });
  }
});




// Consulta todos os produtos cadastrados de um restaurante para gerenciamento.
// Retorna produtos disponíveis e indisponíveis, incluindo categoria e imagem.
// Permite que o frontend apresente os dados necessários à manutenção do cardápio.
app.get('/restaurantes/:id/produtos/gerenciamento', async (req, res) => {
  try {
    const idRestaurante = Number(req.params.id);

    if (!Number.isInteger(idRestaurante) || idRestaurante <= 0) {
      return res.status(400).json({
        mensagem: 'ID do restaurante inválido.'
      });
    }

    const [produtos] = await conexao.query(
      `SELECT
         id_produto,
         nome,
         descricao,
         preco,
         imagem_url,
         id_restaurante,
         id_categoria,
         disponivel
       FROM Produto
       WHERE id_restaurante = ?
       ORDER BY nome`,
      [idRestaurante]
    );

    res.json(produtos);

  } catch (erro) {
    console.error('Erro ao buscar produtos para gerenciamento:', erro);

    res.status(500).json({
      mensagem: 'Erro ao buscar produtos.'
    });
  }
});




// Registra um novo pedido no MySQL, incluindo itens e pagamento pendente.
// Valida o cliente, o endereço, o restaurante e os produtos selecionados.
// Consulta os preços diretamente no banco para calcular o valor total.
// Utiliza uma transação para manter a consistência dos registros.
app.post('/pedidos', async (req, res) => {
  const {
    id_usuario,
    id_endereco,
    id_restaurante,
    produtos,
    forma_pagamento
  } = req.body;

  // Verifica os dados recebidos
  if (
    !Number.isInteger(id_usuario) ||
    !Number.isInteger(id_endereco) ||
    !Number.isInteger(id_restaurante) ||
    !Array.isArray(produtos) ||
    produtos.length === 0 ||
    typeof forma_pagamento !== 'string' ||
    !forma_pagamento.trim()
  ) {
    return res.status(400).json({
      mensagem: 'Dados do pedido inválidos'
    });
  }

  let banco;

  try { 
// Inicia uma transação no MySQL para registrar pedido, itens e pagamento.
// As operações são confirmadas em conjunto com commit().
// Em caso de falha, rollback() permite desfazer as alterações.
    banco = await conexao.getConnection();
    await banco.beginTransaction();


    // Confere se o cliente existe
    const [usuarios] = await banco.query(
      'SELECT id_usuario FROM Usuario WHERE id_usuario = ?',
      [id_usuario]
    );

    // Confere se o endereço pertence ao cliente
    const [enderecos] = await banco.query(
      `SELECT id_endereco FROM Endereco
       WHERE id_endereco = ? AND id_usuario = ?`,
      [id_endereco, id_usuario]
    );

    // Confere se o restaurante existe e está ativo
    const [restaurantes] = await banco.query(
      `SELECT id_restaurante FROM Restaurante
       WHERE id_restaurante = ? AND ativo = 1`,
      [id_restaurante]
    );

    if (
      usuarios.length === 0 ||
      enderecos.length === 0 ||
      restaurantes.length === 0
    ) {
      await banco.rollback();
      return res.status(400).json({
        mensagem: 'Cliente, endereço ou restaurante inválido'
      });
    }

    let valorTotalCentavos = 0;
    const itens = [];




    // Consulta os preços reais dos produtos no banco
    // Obtém os preços diretamente do MySQL para evitar que
    // valores enviados pelo frontend sejam usados no cálculo.
    for (const produto of produtos) {
      if (
        !Number.isInteger(produto.id_produto) ||
        !Number.isInteger(produto.quantidade) ||
        produto.quantidade <= 0
      ) {
        await banco.rollback();
        return res.status(400).json({
          mensagem: 'Produto ou quantidade inválida'
        });
      }

      const [resultado] = await banco.query(
        `SELECT id_produto, preco
         FROM Produto
         WHERE id_produto = ?
           AND id_restaurante = ?
           AND disponivel = 1`,
        [produto.id_produto, id_restaurante]
      );

      if (resultado.length === 0) {
        await banco.rollback();
        return res.status(400).json({
          mensagem: 'Produto indisponível neste restaurante'
        });
      }

      const preco = Number(resultado[0].preco);
      
      // Converte o preço para centavos e acumula o valor de cada item.
      //Isso reduz problemas de precisão em cálculos com números decimais.
      const precoCentavos = Math.round(preco * 100);

      valorTotalCentavos += precoCentavos * produto.quantidade;

      itens.push({
        id_produto: produto.id_produto,
        quantidade: produto.quantidade,
        preco
      });
    }

    const valorTotal = valorTotalCentavos / 100;

    // Registra o pedido
    const [pedido] = await banco.query(
      `INSERT INTO Pedido
       (id_usuario, id_endereco, id_restaurante,
        status, valor_total, tipo_entrega)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id_usuario,
        id_endereco,
        id_restaurante,
        'Pendente',
        valorTotal,
        'Delivery'
      ]
    );

    // Registra os produtos do pedido
    for (const item of itens) {
      await banco.query(
        `INSERT INTO Item_Pedido
         (id_pedido, id_produto, quantidade, preco_unitario)
         VALUES (?, ?, ?, ?)`,
        [
          pedido.insertId,
          item.id_produto,
          item.quantidade,
          item.preco
        ]
      );
    }

    // Registra o pagamento como pendente
    await banco.query(
      `INSERT INTO Pagamento
       (id_pedido, forma_pagamento, valor, status_pagamento)
       VALUES (?, ?, ?, ?)`,
      [
        pedido.insertId,
        forma_pagamento.trim(),
        valorTotal,
        'Pendente'
      ]
    );

    // Confirma a transação após registrar o pedido, seus itens e o pagamento.
    // As alterações passam a ser persistidas no banco de dados.
    await banco.commit();

    res.status(201).json({
      mensagem: 'Pedido registrado com sucesso!',
      id_pedido: pedido.insertId,
      valor_total: valorTotal,
      status: 'Pendente'
    });

  } catch (erro) {

    // Desfaz as alterações não confirmadas caso ocorra uma falha
    // durante o processamento do pedido.
    if (banco) {
      await banco.rollback();
    }

    console.log('Erro ao registrar pedido:', erro.message);

    res.status(500).json({
      mensagem: 'Erro ao registrar pedido'
    });

  } finally {
    // Devolve a conexão ao pool do MySQL, mesmo em caso de erro.
    if (banco) {
      banco.release();
    }
  }

});



  // Cadastra um novo endereço vinculado a um usuário no MySQL.
  // Valida os campos obrigatórios e normaliza o CEP e a UF.
  // Verifica se o usuário existe antes de registrar o endereço.
  // Retorna o identificador do endereço cadastrado
  app.post('/usuarios/:id/enderecos', async (req, res) => {
  try {
    const idUsuario = Number(req.params.id);

    const {
      cep,
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      uf,
      tipo_endereco
    } = req.body;

    if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
      return res.status(400).json({
        mensagem: 'Usuário inválido'
      });
    }

    if (
      !cep || !logradouro || !numero ||
      !bairro || !cidade || !uf || !tipo_endereco
    ) {
      return res.status(400).json({
        mensagem: 'Preencha todos os campos obrigatórios'
      });
    }

    const cepLimpo = String(cep).replace(/\D/g, '');
    const ufLimpa = String(uf).trim().toUpperCase();

    if (!/^\d{8}$/.test(cepLimpo)) {
      return res.status(400).json({
        mensagem: 'CEP deve conter 8 números'
      });
    }

    if (!/^[A-Z]{2}$/.test(ufLimpa)) {
      return res.status(400).json({
        mensagem: 'UF deve conter 2 letras'
      });
    }

    const [usuarios] = await conexao.query(
      'SELECT id_usuario FROM Usuario WHERE id_usuario = ?',
      [idUsuario]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        mensagem: 'Usuário não encontrado'
      });
    }

    const [resultado] = await conexao.query(
      `INSERT INTO Endereco
       (id_usuario, cep, logradouro, numero,
        complemento, bairro, cidade, uf, tipo_endereco)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        idUsuario,
        cepLimpo,
        String(logradouro).trim(),
        String(numero).trim(),
        complemento ? String(complemento).trim() : null,
        String(bairro).trim(),
        String(cidade).trim(),
        ufLimpa,
        String(tipo_endereco).trim()
      ]
    );

    res.status(201).json({
      mensagem: 'Endereço cadastrado com sucesso!',
      id_endereco: resultado.insertId
    });

  } catch (erro) {
    console.log('Erro ao cadastrar endereço:', erro.message);

    res.status(500).json({
      mensagem: 'Erro ao cadastrar endereço'
    });
  }
});



// Atualiza um endereço cadastrado e vinculado a um usuário.
// Valida os identificadores e os campos obrigatórios do endereço.
// Padroniza o CEP e a UF antes de atualizar os dados no MySQL.
// Garante que apenas o endereço associado ao usuário informado seja alterado.
app.put('/usuarios/:id/enderecos/:idEndereco', async (req, res) => {
  try {
    const idUsuario = Number(req.params.id);
    const idEndereco = Number(req.params.idEndereco);

    const {
      cep,
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      uf,
      tipo_endereco
    } = req.body;

    if (
      !Number.isInteger(idUsuario) || idUsuario <= 0 ||
      !Number.isInteger(idEndereco) || idEndereco <= 0
    ) {
      return res.status(400).json({
        mensagem: 'Identificadores inválidos'
      });
    }

    if (
      typeof cep !== 'string' ||
      typeof logradouro !== 'string' ||
      typeof numero !== 'string' ||
      typeof bairro !== 'string' ||
      typeof cidade !== 'string' ||
      typeof uf !== 'string' ||
      typeof tipo_endereco !== 'string' ||
      !logradouro.trim() || !numero.trim() ||
      !bairro.trim() || !cidade.trim() ||
      !tipo_endereco.trim()
    ) {
      return res.status(400).json({
        mensagem: 'Preencha os campos obrigatórios'
      });
    }

    const cepLimpo = cep.replace(/\D/g, '');
    const ufLimpa = uf.trim().toUpperCase();

    if (!/^\d{8}$/.test(cepLimpo)) {
      return res.status(400).json({
        mensagem: 'CEP deve conter 8 números'
      });
    }

    if (!/^[A-Z]{2}$/.test(ufLimpa)) {
      return res.status(400).json({
        mensagem: 'UF deve conter 2 letras'
      });
    }

    const [resultado] = await conexao.query(
      `UPDATE Endereco
       SET cep = ?,
           logradouro = ?,
           numero = ?,
           complemento = ?,
           bairro = ?,
           cidade = ?,
           uf = ?,
           tipo_endereco = ?
       WHERE id_endereco = ? AND id_usuario = ?`,
      [
        cepLimpo,
        logradouro.trim(),
        numero.trim(),
        complemento ? String(complemento).trim() : null,
        bairro.trim(),
        cidade.trim(),
        ufLimpa,
        tipo_endereco.trim(),
        idEndereco,
        idUsuario
      ]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensagem: 'Endereço não encontrado para este usuário'
      });
    }

    res.json({
      mensagem: 'Endereço atualizado com sucesso!',
      id_endereco: idEndereco
    });

  } catch (erro) {
    console.log('Erro ao atualizar endereço:', erro.message);

    res.status(500).json({
      mensagem: 'Erro ao atualizar endereço'
    });
  }
});


// Exclui um endereço cadastrado e vinculado a um usuário.
// Valida os identificadores e limita a exclusão ao vínculo informado.
// Trata restrições de chave estrangeira quando o endereço
// está associado a pedidos já registrados no MySQL.
app.delete('/usuarios/:id/enderecos/:idEndereco', async (req, res) => {
  try {
    const idUsuario = Number(req.params.id);
    const idEndereco = Number(req.params.idEndereco);

    if (
      !Number.isInteger(idUsuario) || idUsuario <= 0 ||
      !Number.isInteger(idEndereco) || idEndereco <= 0
    ) {
      return res.status(400).json({
        mensagem: 'Identificadores inválidos'
      });
    }

    const [resultado] = await conexao.query(
      `DELETE FROM Endereco
       WHERE id_endereco = ? AND id_usuario = ?`,
      [idEndereco, idUsuario]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensagem: 'Endereço não encontrado para este usuário'
      });
    }

    res.json({
      mensagem: 'Endereço excluído com sucesso!',
      id_endereco: idEndereco
    });

  } catch (erro) {
    console.log('Erro ao excluir endereço:', erro.message);

    if (erro.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        mensagem: 'Este endereço está associado a pedidos e não pode ser excluído'
      });
    }

    res.status(500).json({
      mensagem: 'Erro ao excluir endereço'
    });
  }
});


// Consulta os endereços cadastrados e vinculados a um usuário.
// Filtra os registros pelo identificador informado na URL.
// Retorna os dados dos endereços em formato JSON para o frontend.
app.get('/usuarios/:id/enderecos', async (req, res) => {
  try {
    const idUsuario = req.params.id;

    const [enderecos] = await conexao.query(

    `SELECT id_endereco, logradouro, numero,
        complemento, bairro, cidade, uf, cep,
        tipo_endereco
    FROM Endereco
    WHERE id_usuario = ?`,
      [idUsuario]
    );

    res.json(enderecos);

  } catch (erro) {
    console.log('Erro ao buscar endereços:', erro.message);

    res.status(500).json({
      mensagem: 'Erro ao buscar endereços'
    });
  }
});


// Consulta as informações de um pedido pelo identificador.
// Valida o ID recebido e busca os dados do pedido no MySQL.
// Retorna o status, o valor total e as informações de entrega.
// Informa quando o pedido solicitado não existe.
app.get('/pedidos/:id', async (req, res) => {
  try {
    const idPedido = Number(req.params.id);

    if (!Number.isInteger(idPedido) || idPedido <= 0) {
      return res.status(400).json({
        mensagem: 'Número do pedido inválido'
      });
    }

    const [pedidos] = await conexao.query(
      `SELECT
         id_pedido,
         id_usuario,
         id_restaurante,
         data_pedido,
         status,
         valor_total,
         tipo_entrega,
         previsao_entrega
       FROM Pedido
       WHERE id_pedido = ?`,
      [idPedido]
    );

    if (pedidos.length === 0) {
      return res.status(404).json({
        mensagem: 'Pedido não encontrado'
      });
    }

    res.json(pedidos[0]);

  } catch (erro) {
    console.log('Erro ao consultar pedido:', erro.message);

    res.status(500).json({
      mensagem: 'Erro ao consultar pedido'
    });
  }
});



// Consulta o histórico de pedidos vinculados a um usuário.
// Valida o identificador recebido e busca os registros no MySQL.
// Relaciona os pedidos aos restaurantes para apresentar seus nomes.
// Retorna os pedidos ordenados do mais recente para o mais antigo.
app.get('/usuarios/:id/pedidos', async (req, res) => {
  try {
    const idUsuario = Number(req.params.id);

    if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
      return res.status(400).json({
        mensagem: 'Usuário inválido'
      });
    }    

    const [pedidos] = await conexao.query(
      `SELECT
         p.id_pedido,
         p.data_pedido,
         p.status,
         p.valor_total,
         p.tipo_entrega,
         r.nome AS nome_restaurante
       FROM Pedido p
       INNER JOIN Restaurante r
         ON p.id_restaurante = r.id_restaurante
       WHERE p.id_usuario = ?
       ORDER BY p.data_pedido DESC, p.id_pedido DESC`,
      [idUsuario]
    );

    res.json(pedidos);

  } catch (erro) {
    console.log('Erro ao buscar histórico:', erro.message);

    res.status(500).json({
      mensagem: 'Erro ao buscar histórico de pedidos'
    });
  }
});



// Cadastra uma nova conta de usuário no MySQL.
// Valida nome, e-mail e telefone, além dos limites dos campos.
// Padroniza os dados antes de armazená-los no banco.
// Permite registrar o identificador Firebase associado à conta.
// Retorna o ID do usuário ou informa possíveis conflitos de cadastro.
app.post('/usuarios', async (req, res) => {
  try {
    const {
      nome,
      email,
      telefone,
      firebase_uid
    } = req.body || {};

    // Validar campos obrigatórios
    if (
      typeof nome !== 'string' ||
      typeof email !== 'string' ||
      typeof telefone !== 'string' ||
      !nome.trim() ||
      !email.trim() ||
      !telefone.trim()
    ) {
      return res.status(400).json({
        mensagem: 'Nome, e-mail e telefone são obrigatórios.'
      });
    }

    // Preparar os dados
    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim().toLowerCase();
    const telefoneLimpo = telefone.trim();

    const firebaseUidLimpo =
      typeof firebase_uid === 'string' && firebase_uid.trim()
        ? firebase_uid.trim()
        : null;

    // Validar tamanho dos campos
    if (
      nomeLimpo.length > 150 ||
      emailLimpo.length > 150 ||
      telefoneLimpo.length > 20 ||
      (firebaseUidLimpo && firebaseUidLimpo.length > 128)
    ) {
      return res.status(400).json({
        mensagem: 'Um ou mais campos ultrapassaram o limite permitido.'
      });
    }

    // Validar formato do e-mail
    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoEmail.test(emailLimpo)) {
      return res.status(400).json({
        mensagem: 'Informe um e-mail válido.'
      });
    }

    // Inserir usuário no MySQL
    const [resultado] = await conexao.query(
      `INSERT INTO Usuario
        (nome, email, telefone, firebase_uid)
       VALUES (?, ?, ?, ?)`,
      [
        nomeLimpo,
        emailLimpo,
        telefoneLimpo,
        firebaseUidLimpo
      ]
    );

    return res.status(201).json({
      mensagem: 'Conta cadastrada com sucesso!',
      id_usuario: resultado.insertId
    });

  } catch (erro) {
    console.error('Erro ao cadastrar usuário:', erro);

    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        mensagem: 'Este e-mail ou identificador Firebase já está cadastrado.'
      });
    }

    return res.status(500).json({
      mensagem: 'Erro ao cadastrar conta.'
    });
  }
});



// Consulta as contas de usuários cadastradas no MySQL.
// Retorna identificador, nome, e-mail, telefone e data de cadastro.
// Organiza os resultados pelo ID, do mais recente para o mais antigo.
// Disponibiliza os registros em formato JSON para o frontend.
app.get('/usuarios', async (req, res) => {
  try {
    const [usuarios] = await conexao.query(
      `SELECT
         id_usuario,
         nome,
         email,
         telefone,
         data_cadastro
       FROM Usuario
       ORDER BY id_usuario DESC`
    );

    res.json(usuarios);

  } catch (erro) {
    console.error('Erro ao consultar usuários:', erro);

    res.status(500).json({
      mensagem: 'Erro ao consultar contas cadastradas.'
    });
  }
});




// Consulta uma conta de usuário pelo identificador informado na URL.
// Valida o ID e busca os dados correspondentes no MySQL.
// Retorna nome, e-mail, telefone e data de cadastro.
// Informa quando o usuário solicitado não existe.
app.get('/usuarios/:id', async (req, res) => {
  try {
    const idUsuario = Number(req.params.id);

    if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
      return res.status(400).json({
        mensagem: 'ID do usuário inválido.'
      });
    }

    const [usuarios] = await conexao.query(
      `SELECT
         id_usuario,
         nome,
         email,
         telefone,
         data_cadastro
       FROM Usuario
       WHERE id_usuario = ?`,
      [idUsuario]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        mensagem: 'Usuário não encontrado.'
      });
    }

    res.json(usuarios[0]);

  } catch (erro) {
    console.error('Erro ao consultar usuário:', erro);

    res.status(500).json({
      mensagem: 'Erro ao consultar usuário.'
    });
  }
});






 // Atualizar os dados de uma conta
app.put('/usuarios/:id', async (req, res) => {
  try {
    const idUsuario = Number(req.params.id);

    if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
      return res.status(400).json({
        mensagem: 'ID do usuário inválido.'
      });
    }

    const { nome, email, telefone } = req.body || {};

    // Validar campos obrigatórios
    if (
      typeof nome !== 'string' ||
      typeof email !== 'string' ||
      typeof telefone !== 'string' ||
      !nome.trim() ||
      !email.trim() ||
      !telefone.trim()
    ) {
      return res.status(400).json({
        mensagem: 'Nome, e-mail e telefone são obrigatórios.'
      });
    }

    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim().toLowerCase();
    const telefoneLimpo = telefone.trim();

    // Validar tamanho dos campos
    if (
      nomeLimpo.length > 150 ||
      emailLimpo.length > 150 ||
      telefoneLimpo.length > 20
    ) {
      return res.status(400).json({
        mensagem: 'Um ou mais campos ultrapassaram o limite permitido.'
      });
    }

    // Validar formato do e-mail
    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoEmail.test(emailLimpo)) {
      return res.status(400).json({
        mensagem: 'Informe um e-mail válido.'
      });
    }

    // Verificar se o usuário existe
    const [usuarios] = await conexao.query(
      'SELECT id_usuario FROM Usuario WHERE id_usuario = ?',
      [idUsuario]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        mensagem: 'Usuário não encontrado.'
      });
    }

    // Atualizar os dados no MySQL
    await conexao.query(
      `UPDATE Usuario
       SET nome = ?, email = ?, telefone = ?
       WHERE id_usuario = ?`,
      [nomeLimpo, emailLimpo, telefoneLimpo, idUsuario]
    );

    return res.json({
      mensagem: 'Conta atualizada com sucesso!',
      id_usuario: idUsuario
    });

  } catch (erro) {
    console.error('Erro ao atualizar usuário:', erro);

    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        mensagem: 'Este e-mail já está cadastrado.'
      });
    }

    return res.status(500).json({
      mensagem: 'Erro ao atualizar conta.'
    });
  }
});





// Exclui uma conta de usuário cadastrada no MySQL.
// Valida o identificador e verifica se o usuário existe.
// Executa a exclusão e retorna uma confirmação ao frontend.
// Trata restrições de chave estrangeira quando existem registros vinculados.
app.delete('/usuarios/:id', async (req, res) => {
  try {
    const idUsuario = Number(req.params.id);

    // Validar ID
    if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
      return res.status(400).json({
        mensagem: 'ID do usuário inválido.'
      });
    }

    // Verificar se o usuário existe
    const [usuarios] = await conexao.query(
      'SELECT id_usuario FROM Usuario WHERE id_usuario = ?',
      [idUsuario]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        mensagem: 'Usuário não encontrado.'
      });
    }

    // Excluir usuário do banco de dados
    await conexao.query(
      'DELETE FROM Usuario WHERE id_usuario = ?',
      [idUsuario]
    );

    return res.json({
      mensagem: 'Conta excluída com sucesso!',
      id_usuario: idUsuario
    });

  } catch (erro) {
    console.error('Erro ao excluir usuário:', erro);

    if (
      erro.code === 'ER_ROW_IS_REFERENCED_2' ||
      erro.code === 'ER_ROW_IS_REFERENCED'
    ) {
      return res.status(409).json({
        mensagem: 'Não é possível excluir esta conta porque existem registros vinculados.'
      });
    }

    return res.status(500).json({
      mensagem: 'Erro ao excluir conta.'
    });
  }
});









// Inicializa a API HTTP na porta 3001 após registrar todas as rotas.
// Exibe uma mensagem no terminal confirmando que o servidor foi iniciado.
app.listen(3001, () => {
  console.log('Servidor funcionando na porta 3001');
});





