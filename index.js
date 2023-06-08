const fs = require('fs');

const items = [
  { peso: 2, valor: 2 },
  { peso: 12, valor: 4 },
  { peso: 1, valor: 2 },
  { peso: 1, valor: 1 },
  { peso: 4, valor: 10 }
];

const capacidadeMaxima = 10;

// Função de avaliação
function calcularValor(solucao) {
  let valorTotal = 0;
  let pesoTotal = 0;

  for (let i = 0; i < items.length; i++) {
    if (solucao[i]) {
      valorTotal += items[i].valor;
      pesoTotal += items[i].peso;
    }
  }

  if (pesoTotal > capacidadeMaxima) {
    valorTotal = 0;
  }

  return valorTotal;
}

// Função para gerar uma nova solução vizinha
function gerarVizinho(solucaoAtual) {
  const vizinho = solucaoAtual.slice();

  const indiceAleatorio = Math.floor(Math.random() * items.length);
  vizinho[indiceAleatorio] = !vizinho[indiceAleatorio];

  return vizinho;
}

// Função para calcular a probabilidade de aceitar uma solução pior
function calcularProbabilidade(deltaValor, temperatura) {
  return Math.exp(deltaValor / temperatura);
}

// Simulated Annealing
function simulatedAnnealing() {
  const temperaturaInicial = 100;
  const temperaturaFinal = 0.1;
  const taxaResfriamento = 0.95;

  // Inicialização
  let solucaoAtual = [];
  for (let i = 0; i < items.length; i++) {
    solucaoAtual.push(Math.random() < 0.5);
  }
  let melhorSolucao = solucaoAtual.slice();
  let melhorValor = calcularValor(melhorSolucao);

  let temperatura = temperaturaInicial;

  let cont = 0;

  const dadosErro = [];
  const dadosTemperatura = [];
  const dadosIteracao = [];

  // Laço principal
  while (temperatura > temperaturaFinal) {
    cont++;
    const vizinho = gerarVizinho(solucaoAtual);
    const valorAtual = calcularValor(solucaoAtual);
    const valorVizinho = calcularValor(vizinho);
    const deltaValor = valorVizinho - valorAtual;

    if (deltaValor > 0 || Math.random() < calcularProbabilidade(deltaValor, temperatura)) {
      solucaoAtual = vizinho.slice();

      if (valorVizinho > melhorValor) {
        melhorSolucao = solucaoAtual.slice();
        melhorValor = valorVizinho;
      }
    }

    dadosErro.push(valorAtual);
    dadosTemperatura.push(temperatura);
    dadosIteracao.push(cont);

    temperatura *= taxaResfriamento;

    if (temperatura < temperaturaFinal) {
      temperatura = temperaturaFinal;
    }
  }

  return {
    melhorSolucao: melhorSolucao,
    melhorValor: melhorValor,
    dadosErro: dadosErro,
    dadosTemperatura: dadosTemperatura,
    dadosIteracao: dadosIteracao
  };
}

// Executar o algoritmo e obter a melhor solução encontrada
const melhorSolucaoEncontrada = simulatedAnnealing().melhorSolucao;
const resultado = simulatedAnnealing();

console.log("Melhor solução encontrada:", melhorSolucaoEncontrada);
console.log("Valor da melhor solução encontrada:", calcularValor(melhorSolucaoEncontrada));

// Gerar CSV's para construção dos gráficos
const dadosExportacaoErro = resultado.dadosIteracao.map((iteracao, index) => {
  return {
    Iteracao: iteracao,
    Erro: resultado.dadosErro[index]
  };
});

const csvContentErro = 'Iteracao,Erro\n' + dadosExportacaoErro.map(dado => Object.values(dado).join(',')).join('\n');
fs.writeFileSync('dados_erro.csv', csvContentErro, 'utf8');

const dadosExportacaoTemperatura = resultado.dadosIteracao.map((iteracao, index) => {
  return {
    Iteracao: iteracao,
    Temperatura: resultado.dadosTemperatura[index].toFixed(4)
  };
});

const csvContentTemperatura = 'Iteracao,Temperatura\n' + dadosExportacaoTemperatura.map(dado => Object.values(dado).join(',')).join('\n');
fs.writeFileSync('dados_temperatura.csv', csvContentTemperatura, 'utf8');
