package co.ao.tfc.sistema.service;

import co.ao.tfc.sistema.dto.NotaCreditoRequest;
import co.ao.tfc.sistema.dto.NotaCreditoResponse;
import co.ao.tfc.sistema.exception.ResourceNotFoundException;
import co.ao.tfc.sistema.model.Fatura;
import co.ao.tfc.sistema.model.NotaCredito;
import co.ao.tfc.sistema.repository.FaturaRepository;
import co.ao.tfc.sistema.repository.NotaCreditoRepository;
import co.ao.tfc.sistema.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotaCreditoService {

    private final NotaCreditoRepository notaCreditoRepository;
    private final FaturaRepository faturaRepository;
    private final UsuarioRepository usuarioRepository;

    private co.ao.tfc.sistema.model.Empresa getCurrentEmpresa() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Utilizador não autenticado")).getEmpresa();
    }

    @Transactional(readOnly = true)
    public List<NotaCreditoResponse> listar() {
        co.ao.tfc.sistema.model.Empresa empresa = getCurrentEmpresa();
        return notaCreditoRepository.findByEmpresa(empresa).stream().map(this::toResponse).toList();
    }

    @Transactional
    public NotaCreditoResponse criar(NotaCreditoRequest request) {
        co.ao.tfc.sistema.model.Empresa empresa = getCurrentEmpresa();
        
        Fatura fatura = faturaRepository.findById(request.getFaturaId())
                .orElseThrow(() -> new ResourceNotFoundException("Fatura não encontrada: " + request.getFaturaId()));

        if (!fatura.getEmpresa().getId().equals(empresa.getId())) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Acesso negado: Esta fatura pertence a outra empresa.");
        }

        if (request.getValor().compareTo(fatura.getTotal()) > 0) {
            throw new IllegalArgumentException("O valor da nota de crédito não pode ser superior ao total da fatura.");
        }

        NotaCredito nc = NotaCredito.builder()
                .numero(gerarNumero())
                .fatura(fatura)
                .motivo(request.getMotivo())
                .total(request.getValor())
                .dataEmissao(LocalDateTime.now())
                .empresa(empresa)
                .build();

        return toResponse(notaCreditoRepository.save(nc));
    }

    private String gerarNumero() {
        long total = notaCreditoRepository.count() + 1;
        return "NC " + Year.now().getValue() + "/" + String.format("%04d", total);
    }

    private NotaCreditoResponse toResponse(NotaCredito nc) {
        return NotaCreditoResponse.builder()
                .id(nc.getId())
                .numero(nc.getNumero())
                .faturaId(nc.getFatura().getId())
                .faturaNumero(nc.getFatura().getNumero())
                .clienteNome(nc.getFatura().getCliente().getNome())
                .motivo(nc.getMotivo())
                .valor(nc.getTotal())
                .dataEmissao(nc.getDataEmissao() != null ? nc.getDataEmissao().toLocalDate() : null)
                .build();
    }
}
