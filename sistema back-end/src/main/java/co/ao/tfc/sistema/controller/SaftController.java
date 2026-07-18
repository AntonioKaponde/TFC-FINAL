package co.ao.tfc.sistema.controller;

import co.ao.tfc.sistema.service.SaftService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/saft")
@RequiredArgsConstructor
public class SaftController {

    private final SaftService saftService;

    @GetMapping("/exportar")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE', 'CONTABILISTA')")
    public ResponseEntity<byte[]> exportarSaft(@RequestParam int ano, @RequestParam int mes) {
        byte[] saftXml = saftService.exportarSaft(ano, mes);

        String mesStr = String.format("%02d", mes);
        String filename = "SAF-T_" + ano + "_" + mesStr + ".xml";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_XML)
                .body(saftXml);
    }
}
