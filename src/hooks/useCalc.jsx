// Calcula valores financeiros
export function calcValorFinanceiro(valor_1, valor_2) {
  // Remove pontos de milhar e troca vírgula por ponto para conversão correta
  const parsedValor1 = parseFloat(valor_1.replace(/\./g, '').replace(',', '.'));
  const parsedValor2 = parseFloat(valor_2.replace(/\./g, '').replace(',', '.'));

  if (isNaN(parsedValor1) || isNaN(parsedValor2)) {
    return "0,00";
  }

  const resultado = parsedValor1 - parsedValor2;

  // Formata o número final no formato brasileiro
  return resultado.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Função que calcula a quantidade de dias em estoque
export function calculateDaysInStock(dateString) {
  if (!dateString) return 0;
  const data = new Date(dateString);
  const hoje = new Date();

  data.setHours(0, 0, 0, 0);
  hoje.setHours(0, 0, 0, 0);

  const diff = hoje.getTime() - data.getTime();
  const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
  return dias >= 0 ? dias : 0;
}