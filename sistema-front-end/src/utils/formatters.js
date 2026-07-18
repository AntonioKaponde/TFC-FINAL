const MESES_PT = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

export const MESES_COMPLETOS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export const ANO_REFERENCIA = new Date().getFullYear();

export function formatKz(valor) {
  if (valor == null) return 'Kz 0';
  const numero = typeof valor === 'number' ? valor : Number(valor);
  return `Kz ${numero.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatKzSemPrefixo(valor) {
  if (valor == null) return '0,00';
  const numero = typeof valor === 'number' ? valor : Number(valor);
  return numero.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatData(isoDate) {
  if (!isoDate) return '-';
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return '-';
  const dia = d.getDate();
  const mes = d.getMonth();
  const ano = d.getFullYear();
  return `${dia} ${MESES_PT[mes]} ${ano}`;
}

export function labelEstadoArtigo(estado) {
  const map = {
    EM_STOCK: 'Em Stock',
    STOCK_BAIXO: 'Stock Baixo',
    SEM_STOCK: 'Sem Stock',
  };
  return map[estado] ?? estado;
}

export function labelEstadoFatura(estado) {
  const map = {
    PAGO: 'Pago',
    PENDENTE: 'Pendente',
    VENCIDO: 'Vencido',
  };
  return map[estado] ?? estado;
}

export function labelEstadoCliente(ativo) {
  return ativo ? 'Activo' : 'Inativo';
}

export function taxaIvaFromSelect(valor) {
  if (valor?.includes('7%')) return 7;
  if (valor?.includes('5%')) return 5;
  if (valor?.includes('0%')) return 0;
  return 14;
}

export function regimeIvaFromSelect(valor) {
  const map = {
    geral: 'GERAL',
    simplificado: 'SIMPLIFICADO',
    M10: 'EXCLUSAO',
  };
  return map[valor] ?? 'GERAL';
}

export function taxaFromRegime(regime) {
  const map = { GERAL: 14, SIMPLIFICADO: 7, EXCLUSAO: 0 };
  return map[regime] ?? 14;
}

export function formatPeriodo(anoMes) {
  const [ano, mes] = anoMes.split('-').map(Number);
  return `${MESES_COMPLETOS[mes - 1]} ${ano}`;
}

export function hojeIso() {
  return new Date().toISOString().split('T')[0];
}

export function daquiDiasIso(dias) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d.toISOString().split('T')[0];
}

export function calcularTotaisLinhas(linhas, artigos) {
  let subtotal = 0;
  let totalIva = 0;

  for (const linha of linhas) {
    const artigo = artigos.find((a) => a.id === Number(linha.artigoId));
    if (!artigo || !linha.quantidade) continue;

    const qty = Number(linha.quantidade);
    const linhaSubtotal = Number(artigo.preco) * qty;
    const linhaIva = linhaSubtotal * Number(artigo.taxaIva) / 100;
    subtotal += linhaSubtotal;
    totalIva += linhaIva;
  }

  return { subtotal, totalIva, total: subtotal + totalIva };
}

export function agruparFaturasPorMes(faturas) {
  const grupos = {};

  for (const fatura of faturas) {
    const chave = fatura.dataEmissao.substring(0, 7);
    if (!grupos[chave]) {
      grupos[chave] = { chave, docs: 0, total: 0, ultimaEmissao: fatura.dataEmissao };
    }
    grupos[chave].docs += 1;
    grupos[chave].total += Number(fatura.total);
    if (fatura.dataEmissao > grupos[chave].ultimaEmissao) {
      grupos[chave].ultimaEmissao = fatura.dataEmissao;
    }
  }

  return Object.values(grupos).sort((a, b) => b.chave.localeCompare(a.chave));
}

export function resumoMensalImpostos(comparativo) {
  return comparativo.map((item, index) => {
    const imposto = Number(item.imposto);
    const ivaDedutivel = Number(item.ivaDedutivel ?? 0);
    // O 'imposto' do backend = IVA Liquidado
    // O 'ivaDedutivel' do backend = IVA Dedutível das compras
    // IVA a Entregar = IVA Liquidado - IVA Dedutível
    const ivaEntregar = imposto - ivaDedutivel;
    return {
      id: index + 1,
      periodo: item.mes,
      ivaLiquidado: imposto,
      ivaDedutivel: ivaDedutivel,
      ivaEntregar: ivaEntregar,
      estado: 'Calculado',
    };
  });
}
