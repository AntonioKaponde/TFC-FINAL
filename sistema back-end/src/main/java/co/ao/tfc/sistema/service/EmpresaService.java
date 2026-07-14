package co.ao.tfc.sistema.service;

import co.ao.tfc.sistema.dto.EmpresaRegisterRequest;
import co.ao.tfc.sistema.dto.EmpresaResponse;
import co.ao.tfc.sistema.dto.EmpresaUpdate;
import co.ao.tfc.sistema.dto.EmpresaUpdateRequest;
import co.ao.tfc.sistema.model.Empresa;
import co.ao.tfc.sistema.repository.EmpresaRepository;
import co.ao.tfc.sistema.repository.UsuarioRepository;
import co.ao.tfc.sistema.model.Usuario;
import co.ao.tfc.sistema.dto.EmpresaDetalheResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import co.ao.tfc.sistema.model.ConfiguracaoFiscal;
import co.ao.tfc.sistema.repository.ConfiguracaoFiscalRepository;
import co.ao.tfc.sistema.model.enums.RegimeIva;

import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EmpresaService {
    private final EmpresaRepository empresaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ConfiguracaoFiscalRepository configuracaoFiscalRepository;

    private Usuario getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Utilizador não autenticado"));
    }

    /**
     * Retorna a entidade Empresa do utilizador logado.
     * Usado internamente por outros serviços que precisam da entidade (não do DTO).
     */
    public Empresa getEmpresaLogada() {
        Usuario currentUser = getCurrentUser();
        Empresa empresa = currentUser.getEmpresa();
        if (empresa == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhuma empresa associada ao utilizador logado.");
        }
        return empresa;
    }

    public EmpresaDetalheResponse obterEmpresaAtual() {
        Usuario currentUser = getCurrentUser();
        Empresa empresa = currentUser.getEmpresa();
        
        if (empresa == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhuma empresa associada ao utilizador logado.");
        }

        return EmpresaDetalheResponse.builder()
                .id(empresa.getId())
                .nome(empresa.getNome())
                .nif(empresa.getNif())
                .telefone(empresa.getTelefone())
                .email(empresa.getEmail())
                .endereco(empresa.getEndereco())
                .empresa(empresa.getEmpresa() != null ? empresa.getEmpresa().name() : null)
                .capitalSocial(empresa.getCapitalSocial())
                .regimeIva(empresa.getRegimeIva() != null ? empresa.getRegimeIva().name() : null)
                .iva(empresa.getIva() != null ? empresa.getIva().name() : null)
                .prefixoFatura(empresa.getPrefixoFatura())
                .anoFiscal(empresa.getAnoFiscal())
                .build();
    }

    @Transactional
    public EmpresaResponse registerEmpresa(EmpresaRegisterRequest register) {
        if (!empresaRepository.findByNif(register.getNif()).isPresent()) {
            Empresa newEmpresa = Empresa.builder()
                    .nome(register.getNome())
                    .nif(register.getNif())
                    .telefone(register.getTelefone())
                    .endereco(register.getEndereco())
                    .empresa(register.getTipoEmpresa())
                    .regimeIva(register.getRegimeIva())
                    .anoFiscal(LocalDate.now())
                    .build();
            newEmpresa = empresaRepository.save(newEmpresa);
            
            ConfiguracaoFiscal configFiscal = ConfiguracaoFiscal.builder()
                    .regimeIva(register.getRegimeIva() != null ? register.getRegimeIva() : RegimeIva.GERAL)
                    .taxaIva(java.math.BigDecimal.valueOf(14))
                    .empresa(newEmpresa)
                    .build();
            configuracaoFiscalRepository.save(configFiscal);
        }else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Empresa já existe com este nif");
        }


        return new EmpresaResponse(
                register.getNome(),
                register.getNif(),
                register.getEndereco(),
                register.getTelefone(),
                register.getTipoEmpresa(),
                register.getRegimeIva()
        );

    }

    @Transactional
    public EmpresaUpdate updateEmpresa(EmpresaUpdateRequest request, Long id) {
       Usuario currentUser = getCurrentUser();
       Empresa empresaLogada = currentUser.getEmpresa();

       if (!empresaLogada.getId().equals(id)) {
           throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado: Você não pode modificar dados de outra empresa.");
       }

       Optional<Empresa> empresaId = empresaRepository.findById(id);

        if (empresaId.isPresent()) {
            Empresa newEmprea = empresaId.get();

            // Telefone pode ser atualizado sempre que necessário
            if (request.getTelefone() != null && !request.getTelefone().isEmpty()) {
                newEmprea.setTelefone(request.getTelefone());
            }

            // Os restantes campos só podem ser atualizados uma vez (se ainda estiverem vazios/nulos)
            if (request.getEndereco() != null && !request.getEndereco().isEmpty()) {
                if (newEmprea.getEndereco() == null || newEmprea.getEndereco().isEmpty()) {
                    newEmprea.setEndereco(request.getEndereco());
                } else if (!newEmprea.getEndereco().equals(request.getEndereco())) {
                    throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "O endereço já foi configurado e não pode ser alterado novamente. Apenas o telefone pode ser atualizado.");
                }
            }
            if (request.getCapitalSocial() != null) {
                if (newEmprea.getCapitalSocial() == null) {
                    newEmprea.setCapitalSocial(request.getCapitalSocial());
                } else if (newEmprea.getCapitalSocial().compareTo(request.getCapitalSocial()) != 0) {
                    throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "O capital social já foi configurado e não pode ser alterado novamente. Apenas o telefone pode ser atualizado.");
                }
            }
            if (request.getEmail() != null && !request.getEmail().isEmpty()) {
                if (newEmprea.getEmail() == null || newEmprea.getEmail().isEmpty()) {
                    newEmprea.setEmail(request.getEmail());
                } else if (!newEmprea.getEmail().equals(request.getEmail())) {
                    throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "O email já foi configurado e não pode ser alterado novamente. Apenas o telefone pode ser atualizado.");
                }
            }

            if (request.getIva() != null) {
                if (newEmprea.getIva() == null) {
                    newEmprea.setIva(request.getIva());
                } else if (!newEmprea.getIva().equals(request.getIva())) {
                    throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "A isenção de IVA já foi configurada e não pode ser alterada novamente. Apenas o telefone pode ser atualizado.");
                }
            }
            if (request.getPrefixoFatura() != null && !request.getPrefixoFatura().isEmpty()) {
                if (newEmprea.getPrefixoFatura() == null || newEmprea.getPrefixoFatura().isEmpty()) {
                    newEmprea.setPrefixoFatura(request.getPrefixoFatura());
                } else if (!newEmprea.getPrefixoFatura().equals(request.getPrefixoFatura())) {
                    throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "O prefixo da fatura já foi configurado e não pode ser alterado novamente. Apenas o telefone pode ser atualizado.");
                }
            }
            if (request.getRegimeIva() != null) {
                if (newEmprea.getRegimeIva() == null) {
                    newEmprea.setRegimeIva(request.getRegimeIva());
                } else if (!newEmprea.getRegimeIva().equals(request.getRegimeIva())) {
                    throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "O regime de IVA já foi configurado e não pode ser alterado novamente. Apenas o telefone pode ser atualizado.");
                }
            }

            empresaRepository.save(newEmprea);
        }else {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Empresa não  encontrada");
        }

        return new EmpresaUpdate(
                request.getEndereco(),
                request.getTelefone(),
                request.getEmail(),
                request.getCapitalSocial(),
                request.getRegimeIva(),
                request.getIva(),
                request.getPrefixoFatura()
        );
    }

}
