
/**
 * Formata um CPF: 12345678901 => 123.456.789-01
 */
export const formatCPF = (value) => {
  return value
    .replace(/\D/g, "")                            // Remove tudo que não é número
    .replace(/(\d{3})(\d)/, "$1.$2")               // Insere ponto após os 3 primeiros dígitos
    .replace(/(\d{3})(\d)/, "$1.$2")               // Insere ponto após os 6 primeiros dígitos
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");        // Insere traço nos 2 últimos dígitos
};

export const formatCNPJ = (value) => {
  return value
    .replace(/\D/g, "")                 // Remove tudo que não é número
    .replace(/(\d{2})(\d)/, "$1.$2")    // 00.000
    .replace(/(\d{3})(\d)/, "$1.$2")    // 00.000.000
    .replace(/(\d{3})(\d)/, "$1/$2")    // 00.000.000/0000
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2"); // 00.000.000/0000-00
};

export const formatTel = (value) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{0})(\d)/, "$1($2")              //Insere ( logo no inicio do numero para o DDD
    .replace(/(\d{2})(\d)/, "$1)$2")              //Insere ) para fechar o DDD
    .replace(/(\d{5})(\d)/, "$1-$2")              //Insere traço apos o quinto dígito do celular
}

/**
 * Formata um CEP: 12345678 => 12345-678
 */
export const formatCEP = (value) => {
  return value
    .replace(/\D/g, "")                            // Remove tudo que não é número
    .replace(/^(\d{5})(\d)/, "$1-$2");             // Insere traço após os 5 primeiros dígitos
};

/**
 * Formata uma data: 01012025 => 01/01/2025
 */
export const formatDate = (value) => {
  return value
    .replace(/\D/g, "")                            // Remove tudo que não é número
    .replace(/(\d{2})(\d)/, "$1/$2")               // Insere barra após dia
    .replace(/(\d{2})(\d)/, "$1/$2")               // Insere barra após mês
    .replace(/(\d{4})(\d+)/, "$1");                // Garante que não haja mais que 4 dígitos no ano
};

export const formatValue = (value) => {
  // Remove tudo que não for número
  value = value.replace(/\D/g, "");

  // Divide em parte inteira e centavos
  const cents = value.slice(-2);
  let integer = value.slice(0, -2);

  // Insere os pontos a cada 3 dígitos da direita para a esquerda
  integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${integer},${cents}`;
};

export const formatMillionUnit = (value) => {
  return value
    .replace(/\D/g, "")
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Permite apenas números (sem formatação)
 */
export const onlyNumbers = (value) => {
  return value.replace(/\D/g, "");                 // Remove tudo que não é número
};