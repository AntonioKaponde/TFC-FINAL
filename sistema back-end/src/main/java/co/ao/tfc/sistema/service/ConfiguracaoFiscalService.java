package co.ao.tfc.sistema.service;

import co.ao.tfc.sistema.dto.ConfiguracaoFiscalRequest;
import co.ao.tfc.sistema.dto.ConfiguracaoFiscalResponse;
import co.ao.tfc.sistema.exception.ResourceNotFoundException;
import co.ao.tfc.sistema.model.ConfiguracaoFiscal;
import co.ao.tfc.sistema.repository.ConfiguracaoFiscalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ConfiguracaoFiscalService {

    private final ConfiguracaoFiscalRepository configuracaoFiscalRepository;
    private final co.ao.tfc.sistema.repository.UsuarioRepository usuarioRepository;

    private co.ao.tfc.sistema.model.Empresa getCurrentEmpresa() {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Utilizador não autenticado")).getEmpresa();
    }

    @Transactional(readOnly = true)
    public ConfiguracaoFiscalResponse obter() {
        co.ao.tfc.sistema.model.Empresa empresa = getCurrentEmpresa();
        return configuracaoFiscalRepository.findByEmpresa(empresa)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Configuração fiscal não encontrada"));
    }

    @Transactional
    public ConfiguracaoFiscalResponse salvar(ConfiguracaoFiscalRequest request) {
        co.ao.tfc.sistema.model.Empresa empresa = getCurrentEmpresa();
        java.util.Optional<ConfiguracaoFiscal> existente = configuracaoFiscalRepository.findByEmpresa(empresa);

        ConfiguracaoFiscal configuracao;

        if (existente.isPresent()) {
            // Atualiza configuração existente
            configuracao = existente.get();
            configuracao.setRegimeIva(request.getRegimeIva());
            configuracao.setTaxaIva(request.getTaxaIva());
            configuracao.setMotivoIsencaoPadrao(request.getMotivoIsencaoPadrao());
        } else {
            // Cria nova configuração
            configuracao = ConfiguracaoFiscal.builder()
                    .regimeIva(request.getRegimeIva())
                    .taxaIva(request.getTaxaIva())
                    .motivoIsencaoPadrao(request.getMotivoIsencaoPadrao())
                    .empresa(empresa)
                    .build();
        }

        return toResponse(configuracaoFiscalRepository.save(configuracao));
    }

    private ConfiguracaoFiscalResponse toResponse(ConfiguracaoFiscal configuracao) {
        return ConfiguracaoFiscalResponse.builder()
                .id(configuracao.getId())
                .regimeIva(configuracao.getRegimeIva())
                .taxaIva(configuracao.getTaxaIva())
                .motivoIsencaoPadrao(configuracao.getMotivoIsencaoPadrao())
                .build();
    }
}
