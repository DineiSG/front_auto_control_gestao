/*Formata a data para o tipo timestamp para o banco de dados */

export const formatTimestamp = (date) => {
  const pad = (num, size) => ('000' + num).slice(size * -1);
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const offsetHours = pad(Math.floor(Math.abs(offset) / 60), 2);
  const offsetMinutes = pad(Math.abs(offset) % 60, 2);
  const dateString = date.getFullYear() + '-' +
    pad(date.getMonth() + 1, 2) + '-' +
    pad(date.getDate(), 2) + 'T' +
    pad(date.getHours(), 2) + ':' +
    pad(date.getMinutes(), 2) + ':' +
    pad(date.getSeconds(), 2) + '.' +
    pad(date.getMilliseconds(), 5) +
    sign + offsetHours + ':' + offsetMinutes
  return dateString;
};

export function formatDateInfo(timestamp) {
  if (!timestamp) return '';
  const data = new Date(timestamp);
  return data.toLocaleDateString('pt-BR'); // exemplo: 31/07/2025
}

export const formatTimestampWithTime = (timestamp) => {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};