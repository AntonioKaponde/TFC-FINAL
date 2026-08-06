/**
 * html2pdf.js (≈935 kB) só é descarregado quando o utilizador clica em exportar,
 * graças ao import dinâmico. Isto evita que o browser descarregue esta
 * biblioteca pesada ao abrir páginas como Facturação, Clientes ou Inventário.
 */
export const exportarPDF = async (elementId, filename) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  const html2pdf = (await import('html2pdf.js')).default;
  const opt = {
    margin:       10,
    filename:     `${filename}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
  };
  html2pdf().set(opt).from(element).save();
};

export const imprimirPagina = () => {
  window.print();
};
