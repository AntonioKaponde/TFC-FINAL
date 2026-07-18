package co.ao.tfc.sistema.service;

import co.ao.tfc.sistema.dto.DashboardIndicadoresResponse;
import co.ao.tfc.sistema.dto.DashboardMensalResponse;
import co.ao.tfc.sistema.model.ConfiguracaoFiscal;
import co.ao.tfc.sistema.model.enums.RegimeIva;
import co.ao.tfc.sistema.repository.ConfiguracaoFiscalRepository;
import co.ao.tfc.sistema.repository.FaturaRepository;
import co.ao.tfc.sistema.repository.MovimentoEstoqueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private static final String[] MESES = {
            "", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
            "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    };

    private final FaturaRepository faturaRepository;
    private final MovimentoEstoqueRepository movimentoEstoqueRepository;
    private final ConfiguracaoFiscalRepository configuracaoFiscalRepository;
    private final co.ao.tfc.sistema.repository.UsuarioRepository usuarioRepository;

    private co.ao.tfc.sistema.model.Empresa getCurrentEmpresa() {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Utilizador não autenticado")).getEmpresa();
    }

    @Transactional(readOnly = true)
    public DashboardIndicadoresResponse obterIndicadores(Integer ano) {
        co.ao.tfc.sistema.model.Empresa empresa = getCurrentEmpresa();
        int anoReferencia = ano != null ? ano : Year.now().getValue();
        LocalDate inicio = LocalDate.of(anoReferencia, 1, 1);
        LocalDate fim = LocalDate.of(anoReferencia, 12, 31);

        // IVA a Pagar = IVA liquidado nas vendas (Art. 22.º CIVA Angola)
        // Corresponde ao IVA cobrado nas facturas emitidas
        BigDecimal faturacaoBruta = faturaRepository.somarTotalPorPeriodo(empresa, inicio, fim);
        BigDecimal ivaAPagar = faturaRepository.somarIvaPorPeriodo(empresa, inicio, fim);

        ConfiguracaoFiscal configFiscal = configuracaoFiscalRepository.findByEmpresa(empresa).orElse(new ConfiguracaoFiscal());
        BigDecimal taxaIva = configFiscal.getTaxaIva() != null ? configFiscal.getTaxaIva() : BigDecimal.valueOf(14);

        /*
         * IVA a Recuperar (IVA Dedutível) — Art. 19.º CIVA Angola
         * Apenas aplicável a empresas no Regime Geral (Art. 19.º, n.º 1 CIVA).
         * Empresas no Regime Simplificado ou Exclusão NÃO podem deduzir IVA.
         * Calculado com base nos movimentos de estoque (compras a fornecedor):
         *   IVA a Recuperar = Σ ivaCompra dos movimentos ENTRADA com fornecedor
         */
        BigDecimal ivaARecuperar = BigDecimal.ZERO;
        boolean regimeGeralOuNulo = configFiscal.getRegimeIva() == null || configFiscal.getRegimeIva() == RegimeIva.GERAL;

        LocalDateTime inicioLdt = inicio.atStartOfDay();
        LocalDateTime fimLdt = fim.atTime(23, 59, 59);

        BigDecimal volumeCompras = movimentoEstoqueRepository.somarVolumeComprasPorPeriodo(empresa, inicioLdt, fimLdt);
        if (volumeCompras == null) volumeCompras = BigDecimal.ZERO;
        BigDecimal volumeVendas = faturacaoBruta;

        if (regimeGeralOuNulo) {
            ivaARecuperar = movimentoEstoqueRepository.somarIvaDedutiveisPorPeriodo(empresa, inicioLdt, fimLdt);
            if (ivaARecuperar == null) ivaARecuperar = BigDecimal.ZERO;
        }

        // IVA Líquido a Entregar ao Estado = IVA a Pagar - IVA a Recuperar (Art. 22.º CIVA)
        BigDecimal ivaLiquido = ivaAPagar.subtract(ivaARecuperar);

        BigDecimal totalImpostos = ivaAPagar;
        BigDecimal lucroRetido = faturacaoBruta.subtract(totalImpostos);

        return DashboardIndicadoresResponse.builder()
                .faturacaoBruta(faturacaoBruta)
                .ivaAPagar(ivaAPagar)
                .ivaARecuperar(ivaARecuperar)
                .ivaLiquido(ivaLiquido)
                .totalImpostos(totalImpostos)
                .lucroRetido(lucroRetido)
                .taxaIvaAplicada(taxaIva)
                .volumeVendas(volumeVendas)
                .volumeCompras(volumeCompras)
                .build();
    }

    @Transactional(readOnly = true)
    public List<DashboardMensalResponse> obterComparativoMensal(Integer ano) {
        co.ao.tfc.sistema.model.Empresa empresa = getCurrentEmpresa();
        int anoReferencia = ano != null ? ano : Year.now().getValue();

        // Mapa de IVA dedutível por mês (das compras a fornecedor)
        List<Object[]> ivaDedMensal = movimentoEstoqueRepository.resumoMensalIvaDedutivel(empresa, anoReferencia);
        Map<Integer, BigDecimal> mapIvaDed = new HashMap<>();
        for (Object[] row : ivaDedMensal) {
            mapIvaDed.put(((Number) row[0]).intValue(), (BigDecimal) row[1]);
        }

        return faturaRepository.resumoMensalPorAno(empresa, anoReferencia).stream()
                .map(row -> {
                    int mes = (Integer) row[0];
                    BigDecimal lucroBrutoRow = (BigDecimal) row[1];
                    BigDecimal ivaRow = (BigDecimal) row[2];

                    BigDecimal impostosTotais = ivaRow;
                    BigDecimal lucroLiquido = lucroBrutoRow;
                    BigDecimal ivaDed = mapIvaDed.getOrDefault(mes, BigDecimal.ZERO);

                    return DashboardMensalResponse.builder()
                            .mes(MESES[mes])
                            .lucro(lucroLiquido)
                            .imposto(impostosTotais)
                            .ivaDedutivel(ivaDed)
                            .build();
                })
                .toList();
    }

    private BigDecimal obterTaxaIvaConfigurada(co.ao.tfc.sistema.model.Empresa empresa) {
        return configuracaoFiscalRepository.findByEmpresa(empresa)
                .map(ConfiguracaoFiscal::getTaxaIva)
                .orElse(BigDecimal.valueOf(14));
    }
}
