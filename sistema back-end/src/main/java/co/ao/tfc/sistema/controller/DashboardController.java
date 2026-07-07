package co.ao.tfc.sistema.controller;

import co.ao.tfc.sistema.dto.DashboardIndicadoresResponse;
import co.ao.tfc.sistema.dto.DashboardMensalResponse;
import co.ao.tfc.sistema.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import co.ao.tfc.sistema.service.RelatorioImpostosPdfService;
import co.ao.tfc.sistema.model.Empresa;
import co.ao.tfc.sistema.service.EmpresaService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final RelatorioImpostosPdfService relatorioImpostosPdfService;
    private final EmpresaService empresaService;

    @GetMapping("/indicadores")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE', 'CONTABILISTA')")
    public DashboardIndicadoresResponse indicadores(@RequestParam(required = false) Integer ano) {
        return dashboardService.obterIndicadores(ano);
    }

    @GetMapping("/comparativo-mensal")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE', 'CONTABILISTA')")
    public List<DashboardMensalResponse> comparativoMensal(@RequestParam(required = false) Integer ano) {
        return dashboardService.obterComparativoMensal(ano);
    }

    @GetMapping("/relatorio-impostos/pdf")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE', 'CONTABILISTA')")
    public ResponseEntity<byte[]> baixarRelatorioImpostosPdf(@RequestParam(required = false) Integer ano) {
        try {
            if (ano == null) {
                ano = java.time.LocalDate.now().getYear();
            }
            Empresa empresa = empresaService.getEmpresaLogada();
            byte[] pdfBytes = relatorioImpostosPdfService.gerarRelatorioImpostosPdf(empresa, ano);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"Relatorio_Impostos_" + ano + ".pdf\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
