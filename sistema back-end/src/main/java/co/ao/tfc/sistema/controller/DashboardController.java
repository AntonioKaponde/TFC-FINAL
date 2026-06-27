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

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

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
}
