package co.ao.tfc.sistema.controller;

import co.ao.tfc.sistema.dto.PrevisaoFiscalResponse;
import co.ao.tfc.sistema.service.InteligenciaFiscalService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/fiscal")
@RequiredArgsConstructor
public class InteligenciaFiscalController {

    private final InteligenciaFiscalService inteligenciaFiscalService;

    /** Previsão de IVA, histórico e obrigações fiscais próximas. */
    @GetMapping("/previsao")
    public PrevisaoFiscalResponse obterPrevisao() {
        return inteligenciaFiscalService.obterPrevisao();
    }
}
