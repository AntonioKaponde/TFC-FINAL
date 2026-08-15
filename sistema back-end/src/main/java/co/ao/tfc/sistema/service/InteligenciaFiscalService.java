package co.ao.tfc.sistema.service;

import co.ao.tfc.sistema.dto.ObrigacaoFiscalDTO;
import co.ao.tfc.sistema.dto.PrevisaoFiscalResponse;
import co.ao.tfc.sistema.model.Empresa;
import co.ao.tfc.sistema.repository.FaturaRepository;
import co.ao.tfc.sistema.repository.MovimentoEstoqueRepository;
import co.ao.tfc.sistema.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Year;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Inteligência Fiscal — previsão de obrigações tributárias e histórico de impostos.
 *
 * Metodologia (simples e transparente):
 * - Previsão do IVA do próximo período = média do IVA liquidado dos últimos 3 meses
 *   com faturação, ajustada pela tendência (crescimento) observada.
 * - Se não existirem dados suficientes, usa a média disponível ou zero.
 */
@Service
@RequiredArgsConstructor
public class InteligenciaFiscalService {

    private final FaturaRepository faturaRepository;
    private final MovimentoEstoqueRepository movimentoEstoqueRepository;
    private final UsuarioRepository usuarioRepository;

    /** Dia do mês (indicativo) para a declaração/pagamento do IVA e envio do SAF-T. */
    private static final int DIA_LIMITE_IVA = 12;

    private Empresa getCurrentEmpresa() {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizador não autenticado")).getEmpresa();
    }

    @Transactional(readOnly = true)
    public PrevisaoFiscalResponse obterPrevisao() {
        Empresa empresa = getCurrentEmpresa();
        int anoAtual = Year.now().getValue();
        int anoAnterior = anoAtual - 1;

        // Histórico mensal do ano corrente (faturação, IVA liquidado)
        List<Object[]> linhasAtual = faturaRepository.resumoMensalPorAno(empresa, anoAtual);
        Map<Integer, BigDecimal> ivaDedAtual = resumoIvaDedutivel(empresa, anoAtual);

        List<PrevisaoFiscalResponse.MesFiscalDTO> historico = linhasAtual.stream()
                .map(row -> toMesFiscal(((Number) row[0]).intValue(), anoAtual, row,
                        ivaDedAtual.getOrDefault(((Number) row[0]).intValue(), BigDecimal.ZERO)))
                .collect(Collectors.toList());

        // IVA dedutível mensal do ano anterior (para comparação anual)
        Map<Integer, BigDecimal> ivaDedAnterior = resumoIvaDedutivel(empresa, anoAnterior);

        // Série mensal dos últimos 2 anos para a previsão
        List<BigDecimal> ivaMensal = new ArrayList<>();
        List<BigDecimal> faturacaoMensal = new ArrayList<>();
        List<Object[]> linhasAnterior = faturaRepository.resumoMensalPorAno(empresa, anoAnterior);
        for (Object[] row : linhasAnterior) {
            int mes = ((Number) row[0]).intValue();
            ivaMensal.add((BigDecimal) row[2]);
            faturacaoMensal.add((BigDecimal) row[1]);
        }
        for (Object[] row : linhasAtual) {
            int mes = ((Number) row[0]).intValue();
            ivaMensal.add((BigDecimal) row[2]);
            faturacaoMensal.add((BigDecimal) row[1]);
        }

        BigDecimal previsaoIva = prever(ivaMensal);
        BigDecimal previsaoFaturacao = prever(faturacaoMensal);

        // Último mês com dados e variação estimada
        BigDecimal ivaUltimoMes = BigDecimal.ZERO;
        BigDecimal ivaMesAnterior = BigDecimal.ZERO;
        if (!ivaMensal.isEmpty()) {
            ivaUltimoMes = ivaMensal.get(ivaMensal.size() - 1);
        }
        if (ivaMensal.size() > 1) {
            ivaMesAnterior = ivaMensal.get(ivaMensal.size() - 2);
        }

        BigDecimal variacao = BigDecimal.ZERO;
        if (ivaMesAnterior.compareTo(BigDecimal.ZERO) > 0) {
            variacao = ivaUltimoMes.subtract(ivaMesAnterior)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(ivaMesAnterior, 1, RoundingMode.HALF_UP);
        }

        // Comparação ano a ano (YTD)
        BigDecimal faturacaoAtual = linhasAtual.stream()
                .map(row -> (BigDecimal) row[1])
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal faturacaoAnoAnterior = linhasAnterior.stream()
                .map(row -> (BigDecimal) row[1])
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal variacaoAnual = BigDecimal.ZERO;
        if (faturacaoAnoAnterior.compareTo(BigDecimal.ZERO) > 0) {
            variacaoAnual = faturacaoAtual.subtract(faturacaoAnoAnterior)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(faturacaoAnoAnterior, 1, RoundingMode.HALF_UP);
        }

        // IRT — aplicável a retenções na fonte sobre serviços; o sistema não regista
        // retenções, pelo que o valor acumulado é zero com indicação.
        PrevisaoFiscalResponse.IrtDTO irt = PrevisaoFiscalResponse.IrtDTO.builder()
                .aplicavel(false)
                .irtAcumulado(BigDecimal.ZERO)
                .observacao("O IRT (retenção na fonte) aplica-se a serviços e pagamentos a terceiros. " +
                        "Não existem dados de retenção registados no sistema.")
                .build();

        // Próximo período (mês seguinte)
        LocalDate proximoMes = LocalDate.now().withDayOfMonth(1).plusMonths(1);

        return PrevisaoFiscalResponse.builder()
                .periodoPrevisao(mesPortugues(proximoMes))
                .previsaoIva(previsaoIva)
                .previsaoFaturacao(previsaoFaturacao)
                .ivaUltimoMes(ivaUltimoMes)
                .variacaoIvaPercentual(variacao)
                .historico(historico)
                .comparacaoAnoAnterior(PrevisaoFiscalResponse.ComparacaoAnualDTO.builder()
                        .faturacaoAtual(faturacaoAtual)
                        .faturacaoAnoAnterior(faturacaoAnoAnterior)
                        .variacaoPercentual(variacaoAnual)
                        .build())
                .irt(irt)
                .obrigacoes(gerarObrigacoes())
                .build();
    }

    // ---------------------------------------------------------------------
    // Obrigações fiscais próximas
    // ---------------------------------------------------------------------

    private List<ObrigacaoFiscalDTO> gerarObrigacoes() {
        List<ObrigacaoFiscalDTO> obrigacoes = new ArrayList<>();
        LocalDate hoje = LocalDate.now();

        /*
         * Projeção da obrigação:
         * - Antes do dia limite do mês corrente → declara o período anterior (ex.: em 05/08 declara julho).
         * - Após o dia limite do mês corrente → a próxima obrigação é a do mês seguinte (ex.: em 20/08 declara agosto).
         */
        LocalDate dataDeclaracao = LocalDate.of(hoje.getYear(), hoje.getMonth(), DIA_LIMITE_IVA);
        String periodo;
        int anoPeriodo;
        if (hoje.isAfter(dataDeclaracao)) {
            dataDeclaracao = dataDeclaracao.plusMonths(1);
            periodo = mesPortugues(hoje);
            anoPeriodo = hoje.getYear();
        } else {
            LocalDate mesAnterior = hoje.minusMonths(1);
            periodo = mesPortugues(mesAnterior);
            anoPeriodo = mesAnterior.getYear();
        }

        // Declaração do IVA
        obrigacoes.add(ObrigacaoFiscalDTO.builder()
                .descricao("Entrega da declaração periódica do IVA")
                .periodoReferencia(periodo + " " + anoPeriodo)
                .dataLimite(dataDeclaracao)
                .diasRestantes(java.time.temporal.ChronoUnit.DAYS.between(hoje, dataDeclaracao))
                .status(classificarPrazo(dataDeclaracao, hoje))
                .detalhe("Referente à faturação do período anterior.")
                .build());

        // Pagamento do IVA liquidado
        obrigacoes.add(ObrigacaoFiscalDTO.builder()
                .descricao("Pagamento do IVA ao Estado")
                .periodoReferencia(periodo + " " + anoPeriodo)
                .dataLimite(dataDeclaracao)
                .diasRestantes(java.time.temporal.ChronoUnit.DAYS.between(hoje, dataDeclaracao))
                .status(classificarPrazo(dataDeclaracao, hoje))
                .detalhe("IVA liquidado menos IVA dedutível do período.")
                .build());

        // Comunicação do SAF-T
        obrigacoes.add(ObrigacaoFiscalDTO.builder()
                .descricao("Comunicação do ficheiro SAF-T")
                .periodoReferencia(periodo + " " + anoPeriodo)
                .dataLimite(dataDeclaracao)
                .diasRestantes(java.time.temporal.ChronoUnit.DAYS.between(hoje, dataDeclaracao))
                .status(classificarPrazo(dataDeclaracao, hoje))
                .detalhe("Enviar o SAF-T relativo ao período de faturação anterior.")
                .build());

        return obrigacoes;
    }

    private String classificarPrazo(LocalDate dataLimite, LocalDate hoje) {
        long dias = java.time.temporal.ChronoUnit.DAYS.between(hoje, dataLimite);
        if (dias < 0) return "VENCIDA";
        if (dias <= 5) return "PRÓXIMA";
        if (dias <= 15) return "EM_DIA";
        return "PROGRAMADA";
    }

    // ---------------------------------------------------------------------
    // Utilitários
    // ---------------------------------------------------------------------

    /**
     * Média simples dos últimos 3 meses com dados não nulos da série.
     */
    private BigDecimal prever(List<BigDecimal> serie) {
        List<BigDecimal> comDados = serie.stream()
                .filter(Objects::nonNull)
                .filter(v -> v.compareTo(BigDecimal.ZERO) > 0)
                .collect(Collectors.toList());

        if (comDados.isEmpty()) return BigDecimal.ZERO.setScale(2);

        int janela = Math.min(3, comDados.size());
        List<BigDecimal> ultimos = comDados.subList(comDados.size() - janela, comDados.size());
        BigDecimal soma = ultimos.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        return soma.divide(BigDecimal.valueOf(ultimos.size()), 2, RoundingMode.HALF_UP);
    }

    private Map<Integer, BigDecimal> resumoIvaDedutivel(Empresa empresa, int ano) {
        Map<Integer, BigDecimal> mapa = new HashMap<>();
        for (Object[] row : movimentoEstoqueRepository.resumoMensalIvaDedutivel(empresa, ano)) {
            mapa.put(((Number) row[0]).intValue(), (BigDecimal) row[1]);
        }
        return mapa;
    }

    private PrevisaoFiscalResponse.MesFiscalDTO toMesFiscal(int mes, int ano, Object[] row, BigDecimal ivaDedutivel) {
        BigDecimal faturacao = (BigDecimal) row[1];
        BigDecimal ivaLiquidado = (BigDecimal) row[2];
        BigDecimal ivaEntregar = ivaLiquidado.subtract(ivaDedutivel);
        if (ivaEntregar.compareTo(BigDecimal.ZERO) < 0) {
            ivaEntregar = BigDecimal.ZERO;
        }
        return PrevisaoFiscalResponse.MesFiscalDTO.builder()
                .mes(mesPortugues(LocalDate.of(ano, mes, 1)))
                .ano(ano)
                .faturacao(faturacao)
                .ivaLiquidado(ivaLiquidado)
                .ivaDedutivel(ivaDedutivel)
                .ivaEntregar(ivaEntregar)
                .build();
    }

    private String mesPortugues(LocalDate data) {
        return data.getMonth().getDisplayName(TextStyle.FULL, new Locale("pt", "PT"));
    }
}
