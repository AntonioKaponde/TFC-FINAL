package co.ao.tfc.sistema.controller;

import co.ao.tfc.sistema.dto.PrevisaoStockResponse;
import co.ao.tfc.sistema.service.PrevisaoStockService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stock")
@RequiredArgsConstructor
public class PrevisaoStockController {

    private final PrevisaoStockService previsaoStockService;

    /** Previsão de stock: consumo, dias restantes, sugestões de reposição e produtos parados. */
    @GetMapping("/previsao")
    public PrevisaoStockResponse obterPrevisao() {
        return previsaoStockService.obterPrevisao();
    }
}
