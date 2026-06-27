import html2pdf from 'html2pdf.js';

export const exportarPDF = (elementId, filename) => {
  const element = document.getElementById(elementId);
  if (!element) return;
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
