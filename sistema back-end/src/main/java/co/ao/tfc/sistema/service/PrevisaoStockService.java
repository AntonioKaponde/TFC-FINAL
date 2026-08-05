package co.ao.tfc.sistema.service;

import co.ao.tfc.sistema.dto.PrevisaoStockResponse;
import co.ao.tfc.sistema.model.Artigo;
import co.ao.tfc.sistema.model.Empresa;
import co.ao.tfc.sistema.repository.ArtigoRepository;
import co.ao.tfc.sistema.repository.FaturaRepository;
import co.ao.tfc.sistema.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Sistema de Previsão de Stock (Inventory Intelligence).
 *
 * Baseia-se no consumo real das faturas dos últimos 90 dias:
 * - Consumo médio mensal = unidades vendidas em 90 dias / 3
 * - Dias restantes = stock atual / (consumo mensal / 30)
 * - Sugestão de reposição = consumo mensal × 1,5 − stock atual (cobertura de ~45 dias)
 * - Produtos parados: sem vendas nos últimos 60 dias
 */
@Service
@RequiredArgsConstructor
public class PrevisaoStockService {

    private static final int JANELA_DIAS = 90;
    private static final int DIAS_SEM_VENDA_PARADO = 60;
    private static final BigDecimal FATOR_REPOSICAO = new BigDecimal("1.5");

    private final ArtigoRepository artigoRepository;
    private final FaturaRepository faturaRepository;
    private final UsuarioRepository usuarioRepository;

    private Empresa getCurrentEmpresa() {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizador não autenticado")).getEmpresa();
    }

    @Transactional(readOnly = true)
    public PrevisaoStockResponse obterPrevisao() {
        Empresa empresa = getCurrentEmpresa();
        List<Artigo> artigos = artigoRepository.findByEmpresa(empresa);

        // Vendas por artigo nos últimos 90 dias: id -> [quantidade, ultimaVenda]
        Map<Long, Object[]> vendas = new HashMap<>();
        LocalDate inicio = LocalDate.now().minusDays(JANELA_DIAS);
        for (Object[] row : faturaRepository.resumoVendasPorArtigo(empresa, inicio)) {
            vendas.put(((Number) row[0]).longValue(), row);
        }

        List<PrevisaoStockResponse.ArtigoPrevisaoDTO> previsoes = artigos.stream()
                .map(artigo -> {
                    Object[] row = vendas.get(artigo.getId());
                    long quantidade90 = row == null ? 0 : ((Number) row[1]).longValue();
                    LocalDate ultimaVenda = row == null ? null : (LocalDate) row[2];

                    BigDecimal consumoMensal = BigDecimal.valueOf(quantidade90)
                            .divide(BigDecimal.valueOf(3), 2, RoundingMode.HALF_UP);

                    int stockAtual = stockSeguro(artigo);

                    Integer diasRestantes = null;
                    if (consumoMensal.compareTo(BigDecimal.ZERO) > 0) {
                        BigDecimal consumoDiario = consumoMensal.divide(BigDecimal.valueOf(30), 4, RoundingMode.HALF_UP);
                        diasRestantes = consumoDiario.compareTo(BigDecimal.ZERO) > 0
                                ? BigDecimal.valueOf(stockAtual)
                                        .divide(consumoDiario, 0, RoundingMode.DOWN).intValue()
                                : null;
                    }

                    boolean parado = ultimaVenda == null || ultimaVenda.isBefore(LocalDate.now().minusDays(DIAS_SEM_VENDA_PARADO));
                    String status = classificarStatus(artigo, consumoMensal, diasRestantes, parado);
                    String velocidade = classificarVelocidade(consumoMensal);

                    int sugestaoReposicao = calcularSugestaoReposicao(artigo, consumoMensal, status);

                    return PrevisaoStockResponse.ArtigoPrevisaoDTO.builder()
                            .id(artigo.getId())
                            .nome(artigo.getNome())
                            .sku(artigo.getSku())
                            .categoria(artigo.getCategoria() != null ? artigo.getCategoria().getNome() : null)
                            .preco(artigo.getPreco())
                            .stockAtual(stockAtual)
                            .stockMinimo(artigo.getStockMinimo() != null ? artigo.getStockMinimo() : 0)
                            .consumoMensal(consumoMensal)
                            .consumoUltimos90Dias((int) quantidade90)
                            .diasRestantes(diasRestantes)
                            .ultimaVenda(ultimaVenda)
                            .velocidade(velocidade)
                            .status(status)
                            .sugestaoReposicao(sugestaoReposicao)
                            .build();
                })
                .sorted(java.util.Comparator.comparing(
                        (PrevisaoStockResponse.ArtigoPrevisaoDTO p) -> p.getStatus().equals("A_ACABAR") ? 0 :
                                p.getStatus().equals("STOCK_BAIXO") ? 1 :
                                p.getStatus().equals("PARADO") ? 2 : 3)
                        .thenComparing(PrevisaoStockResponse.ArtigoPrevisaoDTO::getNome))
                .collect(Collectors.toList());

        long aAcabar = previsoes.stream().filter(p -> "A_ACABAR".equals(p.getStatus())).count();
        long stockBaixo = previsoes.stream().filter(p -> "STOCK_BAIXO".equals(p.getStatus())).count();
        long parados = previsoes.stream().filter(p -> "PARADO".equals(p.getStatus())).count();
        long comSugestao = previsoes.stream().filter(p -> p.getSugestaoReposicao() != null && p.getSugestaoReposicao() > 0).count();

        return PrevisaoStockResponse.builder()
                .resumo(PrevisaoStockResponse.ResumoDTO.builder()
                        .totalArtigos(artigos.size())
                        .aAcabar(aAcabar)
                        .stockBaixo(stockBaixo)
                        .parados(parados)
                        .comSugestaoReposicao(comSugestao)
                        .build())
                .artigos(previsoes)
                .build();
    }

    private String classificarStatus(Artigo artigo, BigDecimal consumoMensal, Integer diasRestantes, boolean parado) {
        int stockAtual = stockSeguro(artigo);
        int stockMinimo = artigo.getStockMinimo() != null ? artigo.getStockMinimo() : 0;
        if (stockAtual <= 0) return "SEM_STOCK";
        if (parado) return "PARADO";
        if (diasRestantes != null && diasRestantes <= 15) return "A_ACABAR";
        if (consumoMensal.compareTo(BigDecimal.ZERO) > 0
                && (diasRestantes != null && diasRestantes <= 30 || stockAtual <= stockMinimo)) {
            return "STOCK_BAIXO";
        }
        return "NORMAL";
    }

    private String classificarVelocidade(BigDecimal consumoMensal) {
        if (consumoMensal.compareTo(BigDecimal.ZERO) <= 0) return "SEM_VENDAS";
        if (consumoMensal.compareTo(BigDecimal.valueOf(30)) >= 0) return "ALTA";
        if (consumoMensal.compareTo(BigDecimal.valueOf(10)) >= 0) return "MEDIA";
        return "BAIXA";
    }

    /**
     * Reposição recomendada: cobertura de ~45 dias (consumo mensal × 1,5) − stock atual.
     * Produtos parados ou sem vendas não recebem sugestão de reposição.
     */
    private int calcularSugestaoReposicao(Artigo artigo, BigDecimal consumoMensal, String status) {
        if ("PARADO".equals(status) || "SEM_STOCK".equals(status)) return 0;
        if (consumoMensal.compareTo(BigDecimal.ZERO) <= 0) return 0;

        BigDecimal coberturaDesejada = consumoMensal.multiply(FATOR_REPOSICAO);
        BigDecimal falta = coberturaDesejada.subtract(BigDecimal.valueOf(stockSeguro(artigo)));
        if (falta.compareTo(BigDecimal.ZERO) <= 0) return 0;
        return falta.setScale(0, RoundingMode.CEILING).intValue();
    }

    /** Garante um valor seguro de stock (serviços podem ter stock nulo). */
    private int stockSeguro(Artigo artigo) {
        return artigo.getStock() != null ? artigo.getStock() : 0;
    }
}
