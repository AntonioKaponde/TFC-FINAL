package co.ao.tfc.sistema.service;

import co.ao.tfc.sistema.dto.DashboardIndicadoresResponse;
import co.ao.tfc.sistema.dto.DashboardMensalResponse;
import co.ao.tfc.sistema.model.ConfiguracaoFiscal;
import co.ao.tfc.sistema.repository.ConfiguracaoFiscalRepository;
import co.ao.tfc.sistema.repository.FaturaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private static final String[] MESES = {
            "", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
            "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    };

    private final FaturaRepository faturaRepository;
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

        BigDecimal faturacaoBruta = faturaRepository.somarTotalPorPeriodo(empresa, inicio, fim);
        BigDecimal ivaAPagar = faturaRepository.somarIvaPorPeriodo(empresa, inicio, fim);
        
        ConfiguracaoFiscal configFiscal = configuracaoFiscalRepository.findByEmpresa(empresa).orElse(new ConfiguracaoFiscal());
        BigDecimal taxaIva = configFiscal.getTaxaIva() != null ? configFiscal.getTaxaIva() : BigDecimal.valueOf(14);

        BigDecimal baseTributavel = faturacaoBruta.subtract(ivaAPagar);

        BigDecimal irtRetido = configFiscal.isAplicarIrt() 
                ? baseTributavel.multiply(BigDecimal.valueOf(0.065)).setScale(2, RoundingMode.HALF_UP) 
                : BigDecimal.ZERO;

        BigDecimal impostoIndustrial = configFiscal.isAplicarImpostoIndustrial() 
                ? baseTributavel.multiply(BigDecimal.valueOf(0.065)).setScale(2, RoundingMode.HALF_UP) 
                : BigDecimal.ZERO;

        BigDecimal totalImpostos = ivaAPagar.add(irtRetido).add(impostoIndustrial);
        BigDecimal lucroRetido = faturacaoBruta.subtract(totalImpostos);

        return DashboardIndicadoresResponse.builder()
                .faturacaoBruta(faturacaoBruta)
                .ivaAPagar(ivaAPagar)
                .irtRetido(irtRetido)
                .outrosImpostos(impostoIndustrial) // Aqui colocamos o imposto industrial nos outros impostos
                .totalImpostos(totalImpostos)
                .lucroRetido(lucroRetido)
                .taxaIvaAplicada(taxaIva)
                .build();
    }

    @Transactional(readOnly = true)
    public List<DashboardMensalResponse> obterComparativoMensal(Integer ano) {
        co.ao.tfc.sistema.model.Empresa empresa = getCurrentEmpresa();
        int anoReferencia = ano != null ? ano : Year.now().getValue();
        
        ConfiguracaoFiscal configFiscal = configuracaoFiscalRepository.findByEmpresa(empresa).orElse(new ConfiguracaoFiscal());

        return faturaRepository.resumoMensalPorAno(empresa, anoReferencia).stream()
                .map(row -> {
                    BigDecimal lucroBrutoRow = (BigDecimal) row[1]; // faturacao_bruta - iva (base tributavel)
                    BigDecimal ivaRow = (BigDecimal) row[2];

                    BigDecimal irtRow = configFiscal.isAplicarIrt() 
                            ? lucroBrutoRow.multiply(BigDecimal.valueOf(0.065)).setScale(2, RoundingMode.HALF_UP) 
                            : BigDecimal.ZERO;
                    
                    BigDecimal iiRow = configFiscal.isAplicarImpostoIndustrial() 
                            ? lucroBrutoRow.multiply(BigDecimal.valueOf(0.065)).setScale(2, RoundingMode.HALF_UP) 
                            : BigDecimal.ZERO;

                    BigDecimal impostosTotais = ivaRow.add(irtRow).add(iiRow);
                    BigDecimal lucroLiquido = lucroBrutoRow.subtract(irtRow).subtract(iiRow);

                    return DashboardMensalResponse.builder()
                            .mes(MESES[(Integer) row[0]])
                            .lucro(lucroLiquido)
                            .imposto(impostosTotais)
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
