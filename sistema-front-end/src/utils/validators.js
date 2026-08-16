// Validação genérica de email: aceita qualquer provedor de serviço de email
// (Gmail, Outlook, Yahoo, domínios empresariais como empresa.co.ao, etc.).
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validarEmail(email) {
  if (!email) return false;
  return REGEX_EMAIL.test(email.trim());
}
