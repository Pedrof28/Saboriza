
import { useEffect, useState } from 'react';



import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';





import { auth } from './firebase';




function App() {
  const [restaurantes, setRestaurantes] = useState([]);
  const [busca, setBusca] = useState('');



const [usuarioGoogle, setUsuarioGoogle] = useState(null);
const [mensagemLogin, setMensagemLogin] = useState('');





// Monitora as alterações no estado de autenticação do Firebase.
// Atualiza o usuário conectado quando ocorre login ou logout.
// Remove o monitoramento quando o componente é desmontado.
useEffect(() => {
  const cancelarMonitoramento = onAuthStateChanged(
    auth,
    (usuario) => {
      setUsuarioGoogle(usuario);
    }
  );

  return () => cancelarMonitoramento();
}, []);





  // Estados do CRUD de contas
  const [usuarios, setUsuarios] = useState([]);



// Armazena os dados do formulário de cadastro e edição de usuários.
// Os campos começam vazios e são atualizados conforme o usuário digita.
const [novoUsuario, setNovoUsuario] = useState({
  nome: '',
  email: '',
  telefone: ''
});


  const [idUsuarioEmEdicao, setIdUsuarioEmEdicao] = useState(null);

  const [mensagemUsuario, setMensagemUsuario] = useState('');




// Estados do CRUD de restaurantes
const [novoRestaurante, setNovoRestaurante] = useState({
  nome: '',
  cnpj: '',
  telefone: '',
  categoria_restaurante: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: '',
  hora_abertura: '',
  hora_fechamento: ''
});

const [idRestauranteEmEdicao, setIdRestauranteEmEdicao] = useState(null);

const [mensagemRestaurante, setMensagemRestaurante] = useState('');







// Realiza o cadastro ou a atualização de restaurantes no Saboriza.
// Identifica se o formulário está em modo de criação ou edição.
// Envia os dados ao backend utilizando requisições POST ou PUT.
// Atualiza a lista de restaurantes após salvar as informações.
// Limpa o formulário e exibe mensagens de confirmação ou erro.
async function salvarRestaurante(evento) {
  evento.preventDefault();

  const editando = idRestauranteEmEdicao !== null;

  const url = editando
    ? `http://localhost:3001/restaurantes/${idRestauranteEmEdicao}`
    : 'http://localhost:3001/restaurantes';

  try {
    const resposta = await fetch(url, {
      method: editando ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(novoRestaurante)
    });


    const dados = await resposta.json();

    if (!resposta.ok) {
      setMensagemRestaurante(
        dados.mensagem || 'Erro ao salvar restaurante.'
      );
      return;
    }

    const consulta = await fetch(
      'http://localhost:3001/restaurantes'
    );

    if (!consulta.ok) {
      throw new Error('Erro ao atualizar restaurantes.');
    }

    const listaAtualizada = await consulta.json();
    setRestaurantes(listaAtualizada);





    setNovoRestaurante({
      nome: '',
      cnpj: '',
      telefone: '',
      categoria_restaurante: '',
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: '',
      hora_abertura: '',
      hora_fechamento: ''
    });

    setIdRestauranteEmEdicao(null);

    setMensagemRestaurante(
      editando
        ? 'Restaurante atualizado com sucesso!'
        : 'Restaurante cadastrado com sucesso!'
    );

  } catch (erro) {
    console.error('Erro ao salvar restaurante:', erro);
    setMensagemRestaurante(
      'Erro ao conectar com o servidor.'
    );
  }
}




// Prepara o formulário para a edição de um restaurante cadastrado.
// Armazena o ID do estabelecimento selecionado.
// Preenche os campos com os dados existentes no banco de dados.
// Ajusta os horários para o formato utilizado pelos campos do formulário.
// Exibe uma mensagem indicando qual restaurante está sendo editado.
function editarRestaurante(restaurante) {

  
  setIdRestauranteEmEdicao(restaurante.id_restaurante);

  setNovoRestaurante({
    nome: restaurante.nome || '',
    cnpj: restaurante.cnpj || '',
    telefone: restaurante.telefone || '',
    categoria_restaurante: restaurante.categoria_restaurante || '',
    cep: restaurante.cep || '',
    logradouro: restaurante.logradouro || '',
    numero: restaurante.numero || '',
    complemento: restaurante.complemento || '',
    bairro: restaurante.bairro || '',
    cidade: restaurante.cidade || '',
    uf: restaurante.uf || '',
    hora_abertura: restaurante.hora_abertura?.slice(0, 5) || '',
    hora_fechamento: restaurante.hora_fechamento?.slice(0, 5) || ''
  });

  setMensagemRestaurante(
    `Editando restaurante: ${restaurante.nome}`
  );
}




// Solicita confirmação antes de excluir um restaurante.
// Envia uma requisição DELETE ao backend com o ID do estabelecimento.
// Atualiza a lista de restaurantes após uma exclusão bem-sucedida.
// Limpa a seleção do restaurante e seu cardápio, quando necessário.
// Exibe mensagens de confirmação ou erro conforme a resposta da API.
async function excluirRestaurante(restaurante) {
  const confirmou = window.confirm(
    `Deseja realmente excluir o restaurante "${restaurante.nome}"?`
  );

  if (!confirmou) return;

  try {
    const resposta = await fetch(
      `http://localhost:3001/restaurantes/${restaurante.id_restaurante}`,
      {
        method: 'DELETE'
      }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      setMensagemRestaurante(
        dados.mensagem || 'Erro ao excluir restaurante.'
      );
      return;
    }

    const consulta = await fetch(
      'http://localhost:3001/restaurantes'
    );

    if (!consulta.ok) {
      throw new Error('Erro ao atualizar a lista.');
    }

    const listaAtualizada = await consulta.json();
    setRestaurantes(listaAtualizada);

    if (
      restauranteSelecionado?.id_restaurante ===
      restaurante.id_restaurante
    ) {
      setRestauranteSelecionado(null);
      setProdutos([]);
    }

    setMensagemRestaurante(
      'Restaurante excluído com sucesso!'
    );

  } catch (erro) {
    console.error('Erro ao excluir restaurante:', erro);
    setMensagemRestaurante(
      'Erro ao excluir restaurante ou atualizar a lista.'
    );
  }
}



// Armazena o restaurante selecionado pelo cliente.
// Sua seleção determina qual cardápio será exibido na interface.
const [restauranteSelecionado, setRestauranteSelecionado] = useState(null);



// Armazena os produtos disponíveis do restaurante selecionado.
// Esses produtos são apresentados no cardápio para o cliente.
const [produtos, setProdutos] = useState([]);


// Armazena todos os produtos consultados para gerenciamento.
// Inclui produtos disponíveis e indisponíveis para edição e exclusão.
const [produtosGerenciados, setProdutosGerenciados] = useState([]);


// Armazena as categorias de produtos cadastradas no MySQL.
// Os dados são utilizados nas opções do formulário de produtos.
const [categorias, setCategorias] = useState([]);


// Estados do CRUD de produtos
const [novoProduto, setNovoProduto] = useState({
  nome: '',
  descricao: '',
  preco: '',
  imagem_url: '',
  id_restaurante: '',
  id_categoria: '',
  disponivel: true
});

const [idProdutoEmEdicao, setIdProdutoEmEdicao] = useState(null);

const [mensagemProduto, setMensagemProduto] = useState('');






// Realiza o cadastro ou a atualização de produtos do cardápio.
// Identifica se o formulário está em modo de criação ou edição.
// Converte preço e identificadores para os tipos esperados pela API.
// Envia os dados ao backend utilizando requisições POST ou PUT.
// Atualiza o cardápio do cliente e a listagem administrativa.
// Limpa o formulário e exibe mensagens de confirmação ou erro.
async function salvarProduto(evento) {
  evento.preventDefault();

  const editando = idProdutoEmEdicao !== null;

  const idRestaurante = Number(novoProduto.id_restaurante);

  const produto = {
    ...novoProduto,
    preco: Number(novoProduto.preco),
    id_restaurante: idRestaurante,
    id_categoria: Number(novoProduto.id_categoria),
    disponivel: Boolean(novoProduto.disponivel)
  };

  const url = editando
    ? `http://localhost:3001/produtos/${idProdutoEmEdicao}`
    : 'http://localhost:3001/produtos';

  try {
    const resposta = await fetch(url, {
      method: editando ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(produto)
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      setMensagemProduto(
        dados.mensagem || 'Erro ao salvar produto.'
      );
      return;
    }

    // Atualiza o cardápio do cliente
    const consulta = await fetch(
      `http://localhost:3001/restaurantes/${idRestaurante}/produtos`
    );

    if (!consulta.ok) {
      throw new Error('Erro ao atualizar a lista de produtos.');
    }

    const listaAtualizada = await consulta.json();
    setProdutos(listaAtualizada);

    // Atualiza a listagem administrativa
    await buscarProdutosGerenciados(idRestaurante);

    // Limpa os campos e mantém o restaurante selecionado
    setNovoProduto({
      nome: '',
      descricao: '',
      preco: '',
      imagem_url: '',
      id_restaurante: String(idRestaurante),
      id_categoria: '',
      disponivel: true
    });

    setIdProdutoEmEdicao(null);

    setMensagemProduto(
      editando
        ? 'Produto atualizado com sucesso!'
        : 'Produto cadastrado com sucesso!'
    );

  } catch (erro) {
    console.error('Erro ao salvar produto:', erro);

    setMensagemProduto(
      'Erro ao conectar com o servidor.'
    );
  }
}





// Prepara o formulário para editar um produto já cadastrado.
// Armazena o identificador do produto selecionado.
// Preenche os campos com nome, descrição, preço, imagem e categoria.
// Converte os identificadores para o formato utilizado pelo formulário.
// Atualiza a disponibilidade e informa qual produto está em edição.
function editarProduto(produto) {
  setIdProdutoEmEdicao(produto.id_produto);

  setNovoProduto({
    nome: produto.nome || '',
    descricao: produto.descricao || '',
    preco: produto.preco || '',
    imagem_url: produto.imagem_url || '',
    id_restaurante: String(produto.id_restaurante),
    id_categoria: String(produto.id_categoria),
    disponivel: Boolean(produto.disponivel)
  });

  setMensagemProduto(
    `Editando produto: ${produto.nome}`
  );
}






// Solicita confirmação antes de excluir um produto do cardápio.
// Envia uma requisição DELETE ao backend com o ID do produto.
// Atualiza o cardápio do cliente e a lista administrativa após a exclusão.
// Cancela o modo de edição se o produto excluído estava selecionado.
// Exibe mensagens de confirmação ou erro conforme a resposta da API.
async function excluirProduto(produto) {
  const confirmou = window.confirm(
    `Deseja realmente excluir o produto "${produto.nome}"?`
  );

  if (!confirmou) return;

  try {
    const resposta = await fetch(
      `http://localhost:3001/produtos/${produto.id_produto}`,
      {
        method: 'DELETE'
      }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      setMensagemProduto(
        dados.mensagem || 'Erro ao excluir produto.'
      );
      return;
    }

    // Atualiza a lista do cardápio do cliente
    const consulta = await fetch(
      `http://localhost:3001/restaurantes/${produto.id_restaurante}/produtos`
    );

    if (!consulta.ok) {
      throw new Error('Erro ao atualizar o cardápio.');
    }

    const listaAtualizada = await consulta.json();
    setProdutos(listaAtualizada);

    // Atualiza a lista administrativa
    await buscarProdutosGerenciados(produto.id_restaurante);

    // Se o produto excluído estava em edição
    if (idProdutoEmEdicao === produto.id_produto) {
      setIdProdutoEmEdicao(null);

      setNovoProduto({
        nome: '',
        descricao: '',
        preco: '',
        imagem_url: '',
        id_restaurante: String(produto.id_restaurante),
        id_categoria: '',
        disponivel: true
      });
    }

    setMensagemProduto('Produto excluído com sucesso!');

  } catch (erro) {
    console.error('Erro ao excluir produto:', erro);

    setMensagemProduto(
      'Erro ao excluir produto ou atualizar a lista.'
    );
  }
}





// Armazena os produtos adicionados à cesta
const [cesta, setCesta] = useState([]);

const [enderecos, setEnderecos] = useState([]);

const [novoEndereco, setNovoEndereco] = useState({
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: '',
  tipo_endereco: 'Residencial'
});

const [mensagemEndereco, setMensagemEndereco] = useState('');

const [idEnderecoEmEdicao, setIdEnderecoEmEdicao] = useState(null);

const [enderecoSelecionado, setEnderecoSelecionado] = useState('');
const [formaPagamento, setFormaPagamento] = useState('');

// Guarda as informações do último pedido
const [pedidoAtual, setPedidoAtual] = useState(null);

// Armazena o histórico de pedidos do cliente
const [historicoPedidos, setHistoricoPedidos] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/restaurantes')
      .then(resposta => resposta.json())
      .then(dados => setRestaurantes(dados))
      .catch(erro => console.log('Erro:', erro));
  }, []);





// Busca as categorias cadastradas no banco
useEffect(() => {
  async function buscarCategorias() {
    try {
      const resposta = await fetch(
        'http://localhost:3001/categorias'
      );

      if (!resposta.ok) {
        throw new Error('Erro ao consultar categorias.');
      }

      const dados = await resposta.json();

      setCategorias(dados);

    } catch (erro) {
      console.error('Erro ao buscar categorias:', erro);

      setMensagemProduto(
        'Não foi possível carregar as categorias.'
      );
    }
  }

  buscarCategorias();
}, []);




// Seleciona um restaurante e carrega seu cardápio no frontend.
// Armazena o restaurante escolhido e limpa os produtos anteriores.
// Esvazia a cesta para evitar misturar itens de restaurantes diferentes.
// Consulta os produtos disponíveis por meio da API do Saboriza.
  function selecionarRestaurante(restaurante) {
    setRestauranteSelecionado(restaurante);
    setProdutos([]);
    setCesta([]);

    fetch(`http://localhost:3001/restaurantes/${restaurante.id_restaurante}/produtos`)
      .then(resposta => resposta.json())
      .then(dados => setProdutos(dados))
      .catch(erro => console.log('Erro ao buscar produtos:', erro));
  }



// Consulta os produtos de um restaurante para gerenciamento.
// Verifica se um restaurante foi selecionado antes de realizar a consulta.
// Busca produtos disponíveis e indisponíveis por meio da API.
// Atualiza a listagem administrativa com os dados recebidos.
// Trata possíveis erros de comunicação com o backend.
async function buscarProdutosGerenciados(idRestaurante) {
  if (!idRestaurante) {
    setProdutosGerenciados([]);
    return;
  }

  try {
    const resposta = await fetch(
      `http://localhost:3001/restaurantes/${idRestaurante}/produtos/gerenciamento`
    );

    if (!resposta.ok) {
      throw new Error('Erro ao consultar produtos.');
    }

    const dados = await resposta.json();

    setProdutosGerenciados(dados);

  } catch (erro) {
    console.error('Erro ao buscar produtos gerenciados:', erro);

    setMensagemProduto(
      'Erro ao carregar produtos para gerenciamento.'
    );
  }
}




// Adiciona o produto selecionado à cesta de compras.
// Preserva os itens anteriores e acrescenta o novo produto.
// Atualiza o estado do React para refletir a alteração na interface.
  function adicionarNaCesta(produto) {
    setCesta(cestaAtual => [...cestaAtual, produto]);
  }



// Remove um item da cesta utilizando sua posição na lista.
// Mantém os demais produtos e atualiza o estado do React.
// Permite que o cliente ajuste sua seleção antes de finalizar o pedido.
function removerDaCesta(indice) {
  setCesta(cestaAtual =>
    cestaAtual.filter((_, i) => i !== indice)
  );
}




// Consulta os endereços cadastrados quando o componente é montado.
// Envia uma requisição GET ao backend e recebe os dados em JSON.
// Atualiza o estado de endereços para exibição e seleção no checkout.
// Atualmente utiliza o usuário de teste com ID 1.
useEffect(() => {
  async function buscarEnderecos() {
    try {
      const resposta = await fetch(
        'http://localhost:3001/usuarios/1/enderecos'
      );

      if (!resposta.ok) {
        throw new Error('Erro ao consultar endereços');
      }

      const dados = await resposta.json();
      setEnderecos(dados);
    } catch (erro) {
      console.log('Erro ao buscar endereços:', erro);
    }
  }

  buscarEnderecos();
}, []);


useEffect(() => {
  async function recuperarUltimoPedido() {
    const idPedido = localStorage.getItem('ultimoPedidoSaboriza');

    if (!idPedido) return;

    try {
      const resposta = await fetch(
        `http://localhost:3001/pedidos/${idPedido}`
      );

      if (!resposta.ok) {
        throw new Error('Pedido não encontrado');
      }

      const dadosPedido = await resposta.json();
      setPedidoAtual(dadosPedido);

    } catch (erro) {
      console.log('Erro ao recuperar pedido:', erro);
    }
  }

  recuperarUltimoPedido();
}, []);



// Realiza o cadastro ou a atualização de endereços de um usuário.
// Identifica se o formulário está em modo de criação ou edição.
// Envia os dados ao backend utilizando requisições POST ou PUT.
// Limpa o formulário após uma operação bem-sucedida.
// Exibe mensagens de confirmação ou erro conforme a resposta da API.
// Atualmente utiliza o usuário de teste com ID 1.
async function cadastrarEndereco(evento) {
  evento.preventDefault();

  const editando = idEnderecoEmEdicao !== null;

  const url = editando
    ? `http://localhost:3001/usuarios/1/enderecos/${idEnderecoEmEdicao}`
    : 'http://localhost:3001/usuarios/1/enderecos';

  try {
    const resposta = await fetch(url, {
      method: editando ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(novoEndereco)
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      setMensagemEndereco(
        dados.mensagem || 'Erro ao salvar endereço.'
      );
      return;
    }



    setNovoEndereco({
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: '',
      tipo_endereco: 'Residencial'
    });

    setIdEnderecoEmEdicao(null);

    setMensagemEndereco(
      editando
        ? 'Endereço atualizado com sucesso!'
        : 'Endereço cadastrado com sucesso!'
    );

  } catch (erro) {
    console.error('Erro ao salvar endereço:', erro);
    setMensagemEndereco('Erro ao conectar com o servidor.');
  }
}




// Prepara o formulário para editar um endereço já cadastrado.
// Armazena o identificador do endereço selecionado.
// Preenche os campos com os dados existentes, incluindo CEP e localização.
// Exibe uma mensagem informando qual endereço está sendo editado.
function editarEndereco(endereco) {
  setIdEnderecoEmEdicao(endereco.id_endereco);

  setNovoEndereco({
    cep: endereco.cep || '',
    logradouro: endereco.logradouro || '',
    numero: endereco.numero || '',
    complemento: endereco.complemento || '',
    bairro: endereco.bairro || '',
    cidade: endereco.cidade || '',
    uf: endereco.uf || '',
    tipo_endereco: endereco.tipo_endereco || 'Residencial'
  });

  setMensagemEndereco(
    `Editando endereço: ${endereco.logradouro}, ${endereco.numero}`
  );
}





// Solicita confirmação antes de excluir um endereço cadastrado.
// Envia uma requisição DELETE ao backend com o identificador do endereço.
// Atualiza a lista de endereços após uma exclusão bem-sucedida.
// Exibe mensagens de confirmação ou erro conforme a resposta da API.
// Atualmente utiliza o usuário de teste com ID 1.
async function excluirEndereco(endereco) {
  const confirmar = window.confirm(
    `Deseja realmente excluir o endereço ${endereco.logradouro}, ${endereco.numero}?`
  );

  if (!confirmar) return;

  try {
    const resposta = await fetch(
      `http://localhost:3001/usuarios/1/enderecos/${endereco.id_endereco}`,
      {
        method: 'DELETE'
      }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      setMensagemEndereco(
        dados.mensagem || 'Erro ao excluir endereço.'
      );
      return;
    }

    const consulta = await fetch(
      'http://localhost:3001/usuarios/1/enderecos'
    );

    if (!consulta.ok) {
      throw new Error('Erro ao atualizar a lista.');
    }

    const listaAtualizada = await consulta.json();
    setEnderecos(listaAtualizada);

    setMensagemEndereco('Endereço excluído com sucesso!');

  } catch (erro) {
    console.error('Erro ao excluir endereço:', erro);
    setMensagemEndereco('Erro ao conectar com o servidor.');
  }
}



// Finaliza a compra e registra o pedido por meio da API do Saboriza.
// Verifica se há restaurante, produtos, endereço e pagamento selecionados.
// Organiza os itens da cesta e envia os dados ao backend via POST.
// Armazena o ID do último pedido no navegador após o cadastro.
// Limpa a cesta e consulta os dados para exibir o acompanhamento.
async function finalizarPedido() {
  if (!restauranteSelecionado || cesta.length === 0) {
    alert('Selecione um restaurante e adicione produtos à cesta.');
    return;
  }


if (!enderecoSelecionado) {
  alert('Selecione um endereço de entrega antes de finalizar o pedido.');
  return;
}


if (!formaPagamento) {
  alert('Selecione uma forma de pagamento antes de finalizar o pedido.');
  return;
}


  const pedido = {
    id_usuario: 1,
    id_endereco: Number(enderecoSelecionado),
    id_restaurante: restauranteSelecionado.id_restaurante,
    forma_pagamento: formaPagamento,
    produtos: cesta.map(produto => ({
      id_produto: produto.id_produto,
      quantidade: 1
    }))
  };

  try {
    const resposta = await fetch('http://localhost:3001/pedidos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pedido)
    });

    const resultado = await resposta.json();

    if (!resposta.ok) {
      alert(resultado.mensagem || 'Erro ao finalizar pedido.');
      return;
    }

    
alert(`Pedido ${resultado.id_pedido} registrado com sucesso!`);
localStorage.setItem('ultimoPedidoSaboriza', resultado.id_pedido);
setCesta([]);

const respostaPedido = await fetch(
  `http://localhost:3001/pedidos/${resultado.id_pedido}`
);

if (respostaPedido.ok) {
  const dadosPedido = await respostaPedido.json();
  setPedidoAtual(dadosPedido);
}

  } catch (erro) {
    console.log('Erro ao finalizar pedido:', erro);
    alert('Não foi possível conectar ao servidor.');
  }
}





// Consulta novamente as informações do pedido registrado.
// Verifica se existe um pedido selecionado antes da consulta.
// Envia uma requisição GET ao backend utilizando o ID do pedido.
// Atualiza o estado pedidoAtual com os dados recebidos do MySQL.
// Exibe uma mensagem caso ocorra algum erro na consulta.
async function atualizarStatusPedido() {
  if (!pedidoAtual) return;

  try {
    const resposta = await fetch(
      `http://localhost:3001/pedidos/${pedidoAtual.id_pedido}`
    );

    if (!resposta.ok) {
      throw new Error('Erro ao consultar pedido');
    }

    const dadosPedido = await resposta.json();
    setPedidoAtual(dadosPedido);

  } catch (erro) {
    console.log('Erro ao atualizar pedido:', erro);
    alert('Não foi possível atualizar o status do pedido.');
  }
}







// Consulta o histórico de pedidos de um usuário por meio da API.
// Envia uma requisição GET ao backend e recebe os pedidos em JSON.
// Atualiza o estado historicoPedidos para apresentar os registros.
// Trata falhas de comunicação e informa o usuário quando necessário.
// Atualmente consulta os pedidos do usuário de teste com ID 1.
async function buscarHistoricoPedidos() {
  try {
    const resposta = await fetch(
      'http://localhost:3001/usuarios/1/pedidos'
    );

    if (!resposta.ok) {
      throw new Error('Erro ao consultar histórico');
    }

    const dados = await resposta.json();
    setHistoricoPedidos(dados);

  } catch (erro) {
    console.log('Erro ao buscar histórico:', erro);
    alert('Não foi possível consultar o histórico de pedidos.');
  }
}




// Permite selecionar um pedido anterior para acompanhamento.
// Consulta os detalhes do pedido no backend utilizando seu identificador.
// Atualiza o estado pedidoAtual com as informações recebidas.
// Armazena o ID no localStorage para recuperar o pedido ao reabrir a página.
// Exibe uma mensagem caso ocorra uma falha na consulta.
async function selecionarPedidoHistorico(idPedido) {
  try {
    const resposta = await fetch(
      `http://localhost:3001/pedidos/${idPedido}`
    );

    if (!resposta.ok) {
      throw new Error('Erro ao consultar pedido');
    }

    const dadosPedido = await resposta.json();

    setPedidoAtual(dadosPedido);

    localStorage.setItem('ultimoPedidoSaboriza', idPedido);

  } catch (erro) {
    console.log('Erro ao selecionar pedido:', erro);
    alert('Não foi possível consultar este pedido.');
  }
}




// Solicita a confirmação antes de excluir uma conta de usuário.
// Envia uma requisição DELETE ao backend com o ID da conta.
// Atualiza a lista de usuários após uma exclusão bem-sucedida.
// Limpa o estado de edição caso a conta excluída estivesse selecionada.
// Exibe mensagens de confirmação ou erro conforme a resposta da API.
async function excluirUsuario(usuario) {





  // Impede, pela interface, a exclusão da conta de teste com ID 1.
  // Essa restrição não substitui uma validação de autorização no backend.
  if (Number(usuario.id_usuario) === 1) {
    setMensagemUsuario(
      'A conta principal não pode ser excluída.'
    );
    return;
  }

  const confirmou = window.confirm(
    `Deseja realmente excluir a conta de "${usuario.nome}"?`
  );

  if (!confirmou) return;

  try {
    const resposta = await fetch(
      `http://localhost:3001/usuarios/${usuario.id_usuario}`,
      {
        method: 'DELETE'
      }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      setMensagemUsuario(
        dados.mensagem || 'Erro ao excluir conta.'
      );
      return;
    }

    // Se a conta excluída estava em edição
    if (idUsuarioEmEdicao === usuario.id_usuario) {
      setIdUsuarioEmEdicao(null);

      setNovoUsuario({
        nome: '',
        email: '',
        telefone: ''
      });
    }

    await buscarUsuarios();

    setMensagemUsuario(
      'Conta excluída com sucesso!'
    );

  } catch (erro) {
    console.error('Erro ao excluir conta:', erro);

    setMensagemUsuario(
      'Não foi possível excluir a conta.'
    );
  }
}





// Encerra a sessão do usuário autenticado no Firebase.
// Utiliza signOut() para realizar o logout da conta Google.
// Limpa o usuário armazenado no estado do React.
// Exibe uma mensagem de confirmação ou erro na interface.
async function sairDaConta() {
  try {
    await signOut(auth);

    setUsuarioGoogle(null);

    setMensagemLogin(
      'Você saiu da sua conta com sucesso.'
    );

  } catch (erro) {
    console.error('Erro ao sair da conta:', erro);

    setMensagemLogin(
      'Não foi possível sair da conta.'
    );
  }
}






// Realiza a autenticação do usuário utilizando sua conta Google.
// Configura o provedor Google e abre a janela de login do Firebase.
// Armazena os dados do usuário autenticado no estado do React.
// Exibe mensagens de sucesso, cancelamento ou erro no login.
async function entrarComGoogle() {
  try {
    setMensagemLogin('');

    const provedor = new GoogleAuthProvider();

    const resultado = await signInWithPopup(
      auth,
      provedor
    );

    const usuario = resultado.user;

    setUsuarioGoogle(usuario);

    setMensagemLogin(
      `Login realizado com sucesso! Bem-vindo, ${usuario.displayName || 'usuário'}!`
    );

  } catch (erro) {
    console.error('Erro no login Google:', erro);

    if (erro.code === 'auth/popup-closed-by-user') {
      setMensagemLogin('Login cancelado.');
      return;
    }

    setMensagemLogin(
      'Não foi possível entrar com Google.'
    );
  }
}





function editarUsuario(usuario) {
  setIdUsuarioEmEdicao(usuario.id_usuario);

  setNovoUsuario({
    nome: usuario.nome || '',
    email: usuario.email || '',
    telefone: usuario.telefone || ''
  });

  setMensagemUsuario(
    `Editando conta: ${usuario.nome}`
  );
}





// Realiza o cadastro ou a atualização de uma conta de usuário.
// Identifica se o formulário está em modo de criação ou edição.
// Envia os dados ao backend utilizando requisições POST ou PUT.
// Atualiza a lista de usuários e limpa o formulário após o sucesso.
// Exibe mensagens de confirmação ou erro conforme a resposta da API.
async function salvarUsuario(evento) {
  evento.preventDefault();

  const editando = idUsuarioEmEdicao !== null;

  const url = editando
    ? `http://localhost:3001/usuarios/${idUsuarioEmEdicao}`
    : 'http://localhost:3001/usuarios';

  try {
    const resposta = await fetch(url, {
      method: editando ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(novoUsuario)
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      setMensagemUsuario(
        dados.mensagem || 'Erro ao salvar conta.'
      );
      return;
    }

    setNovoUsuario({
      nome: '',
      email: '',
      telefone: ''
    });

    setIdUsuarioEmEdicao(null);

    setMensagemUsuario(
      editando
        ? 'Conta atualizada com sucesso!'
        : 'Conta cadastrada com sucesso!'
    );

    await buscarUsuarios();

  } catch (erro) {
    console.error('Erro ao salvar conta:', erro);

    setMensagemUsuario(
      'Não foi possível conectar ao servidor.'
    );
  }
}





// Consulta os usuários cadastrados por meio da API do Saboriza.
// Envia uma requisição GET ao backend e recebe os registros em JSON.
// Atualiza o estado de usuários para apresentar os dados na interface.
// Trata possíveis falhas de comunicação com o servidor.
async function buscarUsuarios() {
  try {
    const resposta = await fetch(
      'http://localhost:3001/usuarios'
    );

    if (!resposta.ok) {
      throw new Error('Erro ao consultar contas.');
    }

    const dados = await resposta.json();

    setUsuarios(dados);

  } catch (erro) {
    console.error('Erro ao buscar usuários:', erro);

    setMensagemUsuario(
      'Não foi possível carregar as contas cadastradas.'
    );
  }
}



// Carrega a lista de usuários quando o componente é montado.
// O array vazio evita repetir essa consulta a cada renderização.
useEffect(() => {
  buscarUsuarios();
}, []);





  // Filtra os restaurantes pelo nome informado no campo de busca.
  // A comparação ignora diferenças entre letras maiúsculas e minúsculas.
  // O React recalcula os resultados quando os estados são atualizados.
  const restaurantesFiltrados = restaurantes.filter(restaurante =>
    restaurante.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div style={{
      maxWidth: '900px',
      margin: '40px auto',
      padding: '20px',
      fontFamily: 'Arial'
    }}>


<header className="cabecalho-saboriza">
  <h1>Bem-vindo ao Saboriza!</h1>
  <p>Seu delivery favorito, em um só lugar.</p>
</header>


      <h2>Encontre seu próximo pedido</h2>

      

<div className="campo-busca">
  <span className="icone-busca">⌕</span>

  <input
    type="text"
    className="busca-restaurantes"
    placeholder="Qual restaurante você procura?"
    value={busca}
    onChange={evento => setBusca(evento.target.value)}
  />
</div>



      <h2>Restaurantes disponíveis</h2>




      
{/* Renderiza os restaurantes encontrados na pesquisa.
    Cada card permite selecionar, editar ou excluir um restaurante. */}
{restaurantesFiltrados.map(restaurante => (
  <div
    key={restaurante.id_restaurante}
    className="card-restaurante"
    onClick={() => selecionarRestaurante(restaurante)}
  >
    <h3>{restaurante.nome}</h3>

    <p>
      Categoria: {restaurante.categoria_restaurante}
    </p>

    <p>
      Localização: {restaurante.cidade} - {restaurante.uf}
    </p>

    <p>
      Horário: {restaurante.hora_abertura} às {restaurante.hora_fechamento}
    </p>

    <button
      type="button"
      onClick={(evento) => {
        evento.stopPropagation();
        editarRestaurante(restaurante);
      }}
    >
      Editar restaurante
    </button>

    <button
      type="button"
      className="botao-excluir-restaurante"
      onClick={(evento) => {
        evento.stopPropagation();
        excluirRestaurante(restaurante);
      }}
    >
      Excluir restaurante
    </button>
  </div>
))}      


      {restaurantesFiltrados.length === 0 && (
        <p>Nenhum restaurante encontrado.</p>
      )}




{/* Exibe o cardápio do restaurante selecionado pelo cliente.
    Percorre os produtos disponíveis e apresenta nome, descrição e preço.
    Permite adicionar os produtos escolhidos à cesta de compras. */}
{restauranteSelecionado && (
  <div style={{ marginTop: '40px' }}>
    <h2>Cardápio: {restauranteSelecionado.nome}</h2>

    {produtos.map(produto => ( 
    <div
    key={produto.id_produto}
    className="card-produto"
    >

        <h3>{produto.nome}</h3>
        <p>{produto.descricao}</p>
        <p>

<p className="preco-produto">
  Preço: R$ {Number(produto.preco).toFixed(2)}
</p>

        </p>
        <button onClick={() => adicionarNaCesta(produto)}>
  Adicionar à cesta
</button>
      </div>
    ))}

          {produtos.length === 0 && (
            <p>Nenhum produto disponível neste restaurante.</p>
          )}
        </div>
      )}

      
{/* Exibe os produtos adicionados à cesta de compras.
    Permite remover itens e apresenta o valor total da compra.
    Disponibiliza a seleção do endereço e da forma de pagamento
    antes de permitir a finalização do pedido. */}
{cesta.length > 0 && (
  <div className="card-cesta">
    <h2>Minha cesta</h2>




{cesta.map((produto, indice) => (
  <div className="item-cesta" key={indice}>
    <div className="item-cesta-info">
      <strong>{produto.nome}</strong>
      <span>R$ {Number(produto.preco).toFixed(2)}</span>
    </div>

    <button
      className="botao-remover"
      onClick={() => removerDaCesta(indice)}
    >
      Remover
    </button>
  </div>
))}


{/* Organiza os dados necessários para finalizar o pedido.
    Permite selecionar um endereço previamente cadastrado.
    Disponibiliza as formas de pagamento aceitas pelo sistema.
    Armazena as escolhas nos estados do React. */}
<div className="dados-checkout">
  <div className="campo-checkout">
    <label htmlFor="endereco-entrega">
      Endereço de entrega
    </label>

    <select
      id="endereco-entrega"
      value={enderecoSelecionado}
      onChange={(evento) =>
        setEnderecoSelecionado(evento.target.value)
      }
    >
      <option value="">Selecione um endereço</option>

      {enderecos.map((endereco) => (
        <option
          key={endereco.id_endereco}
          value={endereco.id_endereco}
        >
          {endereco.logradouro}, {endereco.numero} - {endereco.bairro}
        </option>
      ))}
    </select>
  </div>

  <div className="campo-checkout">
    <label htmlFor="forma-pagamento">
      Forma de pagamento
    </label>

    <select
      id="forma-pagamento"
      value={formaPagamento}
      onChange={(evento) =>
        setFormaPagamento(evento.target.value)
      }
    >
      <option value="">Selecione uma forma de pagamento</option>
      <option value="Pix">Pix</option>
      <option value="Cartão de crédito">Cartão de crédito</option>
      <option value="Cartão de débito">Cartão de débito</option>
      <option value="Dinheiro">Dinheiro</option>
    </select>
  </div>
</div>





{/* Apresenta o resumo financeiro da cesta de compras.
    Calcula o valor total dos produtos selecionados.
    Disponibiliza o botão que aciona a função finalizarPedido()
    para enviar o pedido ao backend. */}
<div className="resumo-pedido">
  <div className="total-pedido">
    <span>Total do pedido</span>

    <strong>
      R$ {cesta
        .reduce((total, produto) => total + Number(produto.preco), 0)
        .toFixed(2)}
    </strong>
  </div>

  <button
    className="botao-finalizar"
    onClick={finalizarPedido}
  >
    Finalizar pedido
  </button>
</div>

        </div>
      )}




{/* Exibe a área de autenticação com Google utilizando Firebase.
    Mostra o botão de login quando não existe uma sessão ativa.
    Quando o usuário está conectado, apresenta seu nome e e-mail.
    Disponibiliza o botão de logout e as mensagens de autenticação. */}
<section className="card-historico">
  <h2>Entrar no Saboriza</h2>

  {usuarioGoogle ? (
    <div>
      <p>
        Usuário conectado: {usuarioGoogle.displayName}
      </p>

      <p>
        E-mail: {usuarioGoogle.email}
      </p>


<button
  type="button"
  onClick={sairDaConta}
>
  Sair da conta
</button>



    </div>
  ) : (
    <button
      type="button"
      onClick={entrarComGoogle}
    >
      Entrar com Google
    </button>
  )}

  {mensagemLogin && <p>{mensagemLogin}</p>}
</section>





{/* Apresenta o formulário de cadastro e edição de usuários.
    Utiliza os estados do React para controlar os campos preenchidos.
    Permite cadastrar, editar e excluir contas por meio da API.
    Exibe mensagens de retorno e a lista de usuários cadastrados. */}
<section className="card-historico">
  <h2>Gerenciar contas</h2>

  <p>Cadastre e gerencie as contas dos usuários do Saboriza.</p>

<form className="formulario-endereco" onSubmit={salvarUsuario}>
    <label>
      Nome completo
      <input
        type="text"
        maxLength="150"
        required
        placeholder="Nome do usuário"
        value={novoUsuario.nome}
        onChange={(evento) =>
          setNovoUsuario({
            ...novoUsuario,
            nome: evento.target.value
          })
        }
      />
    </label>

    <label>
      E-mail
      <input
        type="email"
        maxLength="150"
        required
        placeholder="usuario@email.com"
        value={novoUsuario.email}
        onChange={(evento) =>
          setNovoUsuario({
            ...novoUsuario,
            email: evento.target.value
          })
        }
      />
    </label>

    <label>
      Telefone
      <input
        type="tel"
        maxLength="20"
        required
        placeholder="11999999999"
        value={novoUsuario.telefone}
        onChange={(evento) =>
          setNovoUsuario({
            ...novoUsuario,
            telefone: evento.target.value
          })
        }
      />
        </label>

<button type="submit">
  {idUsuarioEmEdicao !== null
    ? 'Salvar alterações'
    : 'Cadastrar conta'}
</button>

  </form>

  {mensagemUsuario && (
    <p>{mensagemUsuario}</p>
  )}
</section>



<h3>Contas cadastradas</h3>

{usuarios.length === 0 ? (
  <p>Nenhuma conta encontrada.</p>
) : (
  <div className="lista-enderecos">
    {usuarios.map((usuario) => (
      <div
        key={usuario.id_usuario}
        className="item-endereco"
      >
        <strong>{usuario.nome}</strong>

        <p>ID: {usuario.id_usuario}</p>
        <p>E-mail: {usuario.email}</p>
        <p>Telefone: {usuario.telefone}</p>


<button
  type="button"
  onClick={() => editarUsuario(usuario)}
>
  Editar
</button>





<button
  type="button"
  className="botao-excluir-endereco"
  onClick={() => excluirUsuario(usuario)}
>
  Excluir
</button>



      </div>
    ))}
  </div>
)}




{/* Apresenta o formulário de cadastro e edição de restaurantes.
    Permite informar dados cadastrais, localização e horários.
    Utiliza os estados do React para controlar os campos do formulário.
    Envia as informações ao backend por meio de salvarRestaurante(). */}
<section className="card-historico">
  <h2>Gerenciar restaurantes</h2>
  <p>Cadastre um novo restaurante no Saboriza.</p>

<form className="form-restaurante" onSubmit={salvarRestaurante}>
    <label>
      Nome do restaurante
      <input
        type="text"
        required
        value={novoRestaurante.nome}
        onChange={(e) => setNovoRestaurante({
          ...novoRestaurante,
          nome: e.target.value
        })}
      />
    </label>

    <label>
      CNPJ (14 números)
      <input
        type="text"
        maxLength="14"
        required
        value={novoRestaurante.cnpj}
        onChange={(e) => setNovoRestaurante({
          ...novoRestaurante,
          cnpj: e.target.value
        })}
      />
    </label>

    <label>
      Telefone
      <input
        type="text"
        required
        value={novoRestaurante.telefone}
        onChange={(e) => setNovoRestaurante({
          ...novoRestaurante,
          telefone: e.target.value
        })}
      />
    </label>

    <label>
      Categoria
      <input
        type="text"
        required
        placeholder="Ex.: Pizzaria"
        value={novoRestaurante.categoria_restaurante}
        onChange={(e) => setNovoRestaurante({
          ...novoRestaurante,
          categoria_restaurante: e.target.value
        })}
      />
    </label>

    <label>
      CEP
      <input
        type="text"
        maxLength="8"
        required
        value={novoRestaurante.cep}
        onChange={(e) => setNovoRestaurante({
          ...novoRestaurante,
          cep: e.target.value
        })}
      />
    </label>

    <label>
      Logradouro
      <input
        type="text"
        required
        value={novoRestaurante.logradouro}
        onChange={(e) => setNovoRestaurante({
          ...novoRestaurante,
          logradouro: e.target.value
        })}
      />
    </label>

    <label>
      Número
      <input
        type="text"
        required
        value={novoRestaurante.numero}
        onChange={(e) => setNovoRestaurante({
          ...novoRestaurante,
          numero: e.target.value
        })}
      />
    </label>

    <label>
      Complemento (opcional)
      <input
        type="text"
        value={novoRestaurante.complemento}
        onChange={(e) => setNovoRestaurante({
          ...novoRestaurante,
          complemento: e.target.value
        })}
      />
    </label>

    <label>
      Bairro
      <input
        type="text"
        required
        value={novoRestaurante.bairro}
        onChange={(e) => setNovoRestaurante({
          ...novoRestaurante,
          bairro: e.target.value
        })}
      />
    </label>

    <label>
      Cidade
      <input
        type="text"
        required
        value={novoRestaurante.cidade}
        onChange={(e) => setNovoRestaurante({
          ...novoRestaurante,
          cidade: e.target.value
        })}
      />
    </label>

    <label>
      UF
      <input
        type="text"
        maxLength="2"
        required
        placeholder="SP"
        value={novoRestaurante.uf}
        onChange={(e) => setNovoRestaurante({
          ...novoRestaurante,
          uf: e.target.value
        })}
      />
    </label>

    <label>
      Horário de abertura
      <input
        type="time"
        required
        value={novoRestaurante.hora_abertura}
        onChange={(e) => setNovoRestaurante({
          ...novoRestaurante,
          hora_abertura: e.target.value
        })}
      />
    </label>

    <label>
      Horário de fechamento
      <input
        type="time"
        required
        value={novoRestaurante.hora_fechamento}
        onChange={(e) => setNovoRestaurante({
          ...novoRestaurante,
          hora_fechamento: e.target.value
        })}
      />
    </label>

    <button type="submit">
      {idRestauranteEmEdicao !== null
    ? 'Salvar alterações'
    : 'Cadastrar restaurante'}
    </button>


{idRestauranteEmEdicao !== null && (
  <button
    type="button"
    onClick={() => {
      setIdRestauranteEmEdicao(null);

      setNovoRestaurante({
        nome: '',
        cnpj: '',
        telefone: '',
        categoria_restaurante: '',
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        uf: '',
        hora_abertura: '',
        hora_fechamento: ''
      });

      setMensagemRestaurante('Edição cancelada.');
    }}
  >
    Cancelar edição
  </button>
)}


  </form>

  {mensagemRestaurante && (
    <p>{mensagemRestaurante}</p>
  )}  
</section>




{/* Apresenta o formulário de cadastro e edição de produtos.
    Permite selecionar o restaurante, a categoria e a disponibilidade.
    Exibe os produtos cadastrados com opções de edição e exclusão.
    Utiliza a API para consultar e salvar os registros no MySQL. */}
<section className="card-historico">
  <h2>Gerenciar produtos</h2>

  <p>Cadastre e gerencie os produtos dos restaurantes.</p>

<form className="form-produto" onSubmit={salvarProduto}>

    <label>
      Restaurante
      <select
        value={novoProduto.id_restaurante}
        required
        onChange={(evento) => {
          const id = evento.target.value;

          setNovoProduto({
            ...novoProduto,
            id_restaurante: id
          });

          setIdProdutoEmEdicao(null);
          setMensagemProduto('');

          buscarProdutosGerenciados(id);
        }}
      >
        <option value="">Selecione um restaurante</option>

        {restaurantes.map((restaurante) => (
          <option
            key={restaurante.id_restaurante}
            value={restaurante.id_restaurante}
          >
            {restaurante.nome}
          </option>
        ))}
      </select>
    </label>

    <label>
      Nome do produto
      <input
        type="text"
        maxLength="150"
        required
        value={novoProduto.nome}
        onChange={(evento) =>
          setNovoProduto({
            ...novoProduto,
            nome: evento.target.value
          })
        }
      />
    </label>

    <label>
      Descrição
      <textarea
        maxLength="255"
        value={novoProduto.descricao}
        onChange={(evento) =>
          setNovoProduto({
            ...novoProduto,
            descricao: evento.target.value
          })
        }
      />
    </label>

    <label>
      Preço (R$)
      <input
        type="number"
        min="0.01"
        step="0.01"
        required
        value={novoProduto.preco}
        onChange={(evento) =>
          setNovoProduto({
            ...novoProduto,
            preco: evento.target.value
          })
        }
      />
    </label>

    <label>
      Imagem do produto (URL)
      <input
        type="url"
        maxLength="500"
        placeholder="https://exemplo.com/imagem.jpg"
        value={novoProduto.imagem_url}
        onChange={(evento) =>
          setNovoProduto({
            ...novoProduto,
            imagem_url: evento.target.value
          })
        }
      />
    </label>

    <label>
      Categoria
      <select
        value={novoProduto.id_categoria}
        required
        onChange={(evento) =>
          setNovoProduto({
            ...novoProduto,
            id_categoria: evento.target.value
          })
        }
      >
        <option value="">Selecione uma categoria</option>

        {categorias.map((categoria) => (
          <option
            key={categoria.id_categoria}
            value={categoria.id_categoria}
          >
            {categoria.nome}
          </option>
        ))}
      </select>
    </label>

    <label>
      Disponibilidade
      <select
        value={String(novoProduto.disponivel)}
        onChange={(evento) =>
          setNovoProduto({
            ...novoProduto,
            disponivel: evento.target.value === 'true'
          })
        }
      >
        <option value="true">Disponível</option>
        <option value="false">Indisponível</option>
      </select>
    </label>

    <button type="submit">
      {idProdutoEmEdicao !== null
        ? 'Salvar alterações'
        : 'Cadastrar produto'}
    </button>

    {idProdutoEmEdicao !== null && (
      <button
        type="button"
        onClick={() => {
          setIdProdutoEmEdicao(null);

          setNovoProduto({
            nome: '',
            descricao: '',
            preco: '',
            imagem_url: '',
            id_restaurante: novoProduto.id_restaurante,
            id_categoria: '',
            disponivel: true
          });

          setMensagemProduto('Edição cancelada.');
        }}
      >
        Cancelar edição
      </button>
    )}

  </form>

  {mensagemProduto && (
    <p>{mensagemProduto}</p>
  )}



{/* Lista de produtos cadastrados */}
<div className="lista-produtos-gerenciados">

  <h3>Produtos cadastrados</h3>

  {!novoProduto.id_restaurante ? (
    <p>Selecione um restaurante para visualizar seus produtos.</p>
  ) : produtosGerenciados.length === 0 ? (
    <p>Nenhum produto cadastrado neste restaurante.</p>
  ) : (

    <div className="grade-produtos-gerenciados">

      {produtosGerenciados.map((produto) => {

        const categoria = categorias.find(
          (item) =>
            Number(item.id_categoria) ===
            Number(produto.id_categoria)
        );

        return (
          <article
            key={produto.id_produto}
            className="item-produto-gerenciado"
          >

            <div>
              <h4>{produto.nome}</h4>

              <p>
                {produto.descricao || 'Sem descrição.'}
              </p>

              <p>
                Categoria: {categoria?.nome || 'Não identificada'}
              </p>

              <p>
                Preço: R$ {Number(produto.preco)
                  .toFixed(2)
                  .replace('.', ',')}
              </p>

              <p>
                Status: {
                  Number(produto.disponivel) === 1
                    ? 'Disponível'
                    : 'Indisponível'
                }
              </p>
            </div>

            <div className="acoes-produto-gerenciado">

              <button
                type="button"
                onClick={() => editarProduto(produto)}
              >
                Editar
              </button>

              <button
                type="button"
                onClick={() => excluirProduto(produto)}
              >
                Excluir
              </button>

            </div>

          </article>
        );
      })}

    </div>
  )}

</div>




</section>



{/* Permite cadastrar, editar e excluir endereços de entrega.
    Utiliza os estados do React para controlar os dados do formulário.
    Apresenta os endereços cadastrados e as mensagens da API.
    Atualmente utiliza o usuário de teste com identificador 1. */}
<section className="card-historico">
  <h2>Meus endereços</h2>

  <form onSubmit={cadastrarEndereco}>
    <div className="formulario-endereco">
      {[
        ['cep', 'CEP'],
        ['logradouro', 'Logradouro'],
        ['numero', 'Número'],
        ['complemento', 'Complemento'],
        ['bairro', 'Bairro'],
        ['cidade', 'Cidade'],
        ['uf', 'UF']
      ].map(([campo, titulo]) => (
        <label key={campo}>
          {titulo}
          <input
            value={novoEndereco[campo]}
            onChange={(evento) =>
              setNovoEndereco({
                ...novoEndereco,
                [campo]: evento.target.value
              })
            }
            required={campo !== 'complemento'}
            maxLength={
              campo === 'cep' ? 9 :
              campo === 'uf' ? 2 : undefined
            }
          />
        </label>
      ))}

      <label>
        Tipo de endereço
        <select
          value={novoEndereco.tipo_endereco}
          onChange={(evento) =>
            setNovoEndereco({
              ...novoEndereco,
              tipo_endereco: evento.target.value
            })
          }
        >
          <option value="Residencial">Residencial</option>
          <option value="Comercial">Comercial</option>
          <option value="Outro">Outro</option>
        </select>
      </label>
    </div>


<button type="submit">
  {idEnderecoEmEdicao !== null
    ? 'Salvar alterações'
    : 'Cadastrar endereço'}
</button>

{idEnderecoEmEdicao !== null && (
  <button
    type="button"
    onClick={() => {
      setIdEnderecoEmEdicao(null);
      setNovoEndereco({
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        uf: '',
        tipo_endereco: 'Residencial'
      });
      setMensagemEndereco('Edição cancelada.');
    }}
  >
    Cancelar edição
  </button>
)}

  </form>

  {mensagemEndereco && <p>{mensagemEndereco}</p>}


<h3>Endereços cadastrados</h3>

{enderecos.length === 0 ? (
  <p>Nenhum endereço cadastrado.</p>
) : (
  <div className="lista-enderecos">
    {enderecos.map((endereco) => (
      <div
        key={endereco.id_endereco}
        className="item-endereco"
      >
        <strong>
          {endereco.logradouro}, {endereco.numero}
        </strong>

        <p>
          {endereco.bairro} - {endereco.cidade}/{endereco.uf}
        </p>

        <p>CEP: {endereco.cep}</p>

        {endereco.complemento && (
          <p>Complemento: {endereco.complemento}</p>
        )}

        <button
          type="button"
          onClick={() => editarEndereco(endereco)}
        >
          Editar
        </button>

        <button
          type="button"
          className="botao-excluir-endereco"
          onClick={() => excluirEndereco(endereco)}
        >
          Excluir
        </button>
      </div>
    ))}
  </div>
)}


</section>




{/* Exibe as informações do pedido selecionado pelo cliente.
    Apresenta o identificador, status, valor total e tipo de entrega.
    Permite consultar novamente os dados por meio da API.
    A consulta atualiza a interface, mas não altera o status no banco. */}
{pedidoAtual && (
  <div className="card-acompanhamento">


    <h2>Acompanhe seu pedido</h2>

    <p>Número: {pedidoAtual.id_pedido}</p>
    
<p>
  Status: <span className="status-pedido">
    {pedidoAtual.status}
  </span>
</p>

    <p>
      Total: R$ {Number(pedidoAtual.valor_total).toFixed(2)}
    </p>
    <p>Tipo de entrega: {pedidoAtual.tipo_entrega}</p>

    <button onClick={atualizarStatusPedido}>
      Atualizar status
    </button>
  </div>
)}





{/* Apresenta a área de consulta do histórico de pedidos.
    Permite buscar os pedidos anteriores por meio da API.
    Percorre os resultados armazenados no estado historicoPedidos.
    Disponibiliza a opção de selecionar um pedido para acompanhamento. */}
<div className="card-historico">

  <button onClick={buscarHistoricoPedidos}>
    Consultar histórico
  </button>

  {historicoPedidos.map(pedido => (
    <div
  key={pedido.id_pedido}
  className="item-historico"
>

      <button
        onClick={() => selecionarPedidoHistorico(pedido.id_pedido)}
      >
        Acompanhar pedido
      </button>
    </div>
  ))}
</div>


    </div>
  );
}

export default App;

