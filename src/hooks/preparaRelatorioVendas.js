export function prepararRelatorio({
  dados,
  colunas,
  transformarDados,
  linhaTotal,
  totalGeral
}) {
  if (!Array.isArray(dados)) {
    throw new Error("Os dados devem ser um array.");
  }

  if (!Array.isArray(colunas) || colunas.length === 0) {
    throw new Error("Informe as colunas do relatório.");
  }

  // Transforma os dados para que correspondam às chaves
  // utilizadas na configuração das colunas.
  const dadosPreparados = transformarDados
    ? transformarDados(dados)
    : dados;

  if (!Array.isArray(dadosPreparados)) {
    throw new Error("A transformação deve retornar um array.");
  }

  const dadosFinais = linhaTotal
    ? [...dadosPreparados, linhaTotal(dadosPreparados), totalGeral(dadosPreparados)]
    : dadosPreparados;

  return {
    colunas,
    dados: dadosFinais,
  };

  
}