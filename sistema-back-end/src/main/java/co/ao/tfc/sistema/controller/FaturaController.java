package co.ao.tfc.sistema.controller;

import co.ao.tfc.sistema.dto.FaturaMensalRequest;
import co.ao.tfc.sistema.dto.FaturaRequest;
import co.ao.tfc.sistema.dto.FaturaResponse;
import co.ao.tfc.sistema.service.FaturaService;
import co.ao.tfc.sistema.service.AuditoriaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import co.ao.tfc.sistema.service.FaturaPdfService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/faturas")
@RequiredArgsConstructor
public class FaturaController {

    private final FaturaService faturaService;
    private final FaturaPdfService faturaPdfService;
    private final AuditoriaService auditoriaService;

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> baixarPdf(@PathVariable Long id) {
        try {
            co.ao.tfc.sistema.model.Fatura fatura = faturaService.buscarEntidade(id);
            byte[] pdfBytes = faturaPdfService.gerarFaturaPdf(fatura);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "Fatura-" + fatura.getNumero() + ".pdf");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping
    public List<FaturaResponse> listar() {
        faturaService.atualizarEstadosVencidas();
        return faturaService.listar();
    }

    @GetMapping("/{id}")
    public FaturaResponse buscar(@PathVariable Long id) {
        return faturaService.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE', 'OPERADOR')")
    public FaturaResponse criar(@Valid @RequestBody FaturaRequest request) {
        FaturaResponse response = faturaService.criar(request);
        auditoriaService.registrarAuditoria("CRIOU", "Fatura", "Emitiu a fatura " + response.getNumero());
        return response;
    }


    @PostMapping("/faturas")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE', 'OPERADOR')")
    public ResponseEntity<List<FaturaResponse>> criarMensais(
            @RequestBody FaturaMensalRequest request) {
        List<FaturaResponse> faturas = faturaService.criarFaturasMensais2024(request);
        auditoriaService.registrarAuditoria("CRIOU", "Fatura", "Emitiu lote de faturas mensais");
        return ResponseEntity.ok(faturas);
    }

    @PatchMapping("/{id}/pagar")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE', 'OPERADOR')")
    public FaturaResponse marcarComoPaga(@PathVariable Long id) {
        FaturaResponse response = faturaService.marcarComoPaga(id);
        auditoriaService.registrarAuditoria("ATUALIZOU", "Fatura", "Marcou a fatura " + response.getNumero() + " como Paga");
        return response;
    }
}
