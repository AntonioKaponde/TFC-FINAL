package co.ao.tfc.sistema.controller;

import co.ao.tfc.sistema.dto.ConfiguracaoFiscalRequest;
import co.ao.tfc.sistema.dto.ConfiguracaoFiscalResponse;
import co.ao.tfc.sistema.service.ConfiguracaoFiscalService;
import co.ao.tfc.sistema.service.AuditoriaService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/configuracao-fiscal")
public class ConfiguracaoFiscalController {

    private final ConfiguracaoFiscalService configuracaoFiscalService;
    private final AuditoriaService auditoriaService;

    public ConfiguracaoFiscalController(ConfiguracaoFiscalService configuracaoFiscalService, AuditoriaService auditoriaService) {
        this.configuracaoFiscalService = configuracaoFiscalService;
        this.auditoriaService = auditoriaService;
    }

    @GetMapping
    public ConfiguracaoFiscalResponse obter() {
        return configuracaoFiscalService.obter();
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ConfiguracaoFiscalResponse salvar(@Valid @RequestBody ConfiguracaoFiscalRequest request) {
        ConfiguracaoFiscalResponse response = configuracaoFiscalService.salvar(request);
        auditoriaService.registrarAuditoria("ATUALIZOU", "Configuração Fiscal", "Atualizou as configurações fiscais da empresa");
        return response;
    }
}
