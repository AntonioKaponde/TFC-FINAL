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

import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EmpresaService {
    private final EmpresaRepository empresaRepository;
    private final UsuarioRepository usuarioRepository;

    private Usuario getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Utilizador não autenticado"));
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
                .industrial(empresa.getIndustrial() != null ? empresa.getIndustrial().name() : null)
                .retencaoNaFonte(empresa.getRetencaoNaFonte() != null ? empresa.getRetencaoNaFonte().name() : null)
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
            empresaRepository.save(newEmpresa);
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
            if ((newEmprea.getEndereco() == null || newEmprea.getEndereco().isEmpty()) && request.getEndereco() != null && !request.getEndereco().isEmpty()) {
                newEmprea.setEndereco(request.getEndereco());
            } else if (request.getEndereco() != null && !request.getEndereco().isEmpty()) {
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "O endereço já foi configurado e não pode ser alterado novamente. Apenas o telefone pode ser atualizado.");
            }
            if ((newEmprea.getCapitalSocial() == null) && request.getCapitalSocial() != null) {
                newEmprea.setCapitalSocial(request.getCapitalSocial());
            } else if (request.getCapitalSocial() != null && newEmprea.getCapitalSocial() != null) {
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "O capital social já foi configurado e não pode ser alterado novamente. Apenas o telefone pode ser atualizado.");
            }
            if ((newEmprea.getEmail() == null || newEmprea.getEmail().isEmpty()) && request.getEmail() != null && !request.getEmail().isEmpty()) {
                newEmprea.setEmail(request.getEmail());
            } else if (request.getEmail() != null && !request.getEmail().isEmpty() && newEmprea.getEmail() != null && !newEmprea.getEmail().isEmpty()) {
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "O email já foi configurado e não pode ser alterado novamente. Apenas o telefone pode ser atualizado.");
            }
            if (newEmprea.getIndustrial() == null && request.getIndustrial() != null) {
                newEmprea.setIndustrial(request.getIndustrial());
            } else if (request.getIndustrial() != null && newEmprea.getIndustrial() != null) {
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "O imposto industrial já foi configurado e não pode ser alterado novamente. Apenas o telefone pode ser atualizado.");
            }
            if (newEmprea.getRetencaoNaFonte() == null && request.getRetencaoNaFonte() != null) {
                newEmprea.setRetencaoNaFonte(request.getRetencaoNaFonte());
            } else if (request.getRetencaoNaFonte() != null && newEmprea.getRetencaoNaFonte() != null) {
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "A retenção na fonte já foi configurada e não pode ser alterada novamente. Apenas o telefone pode ser atualizado.");
            }
            if (newEmprea.getIva() == null && request.getIva() != null) {
                newEmprea.setIva(request.getIva());
            } else if (request.getIva() != null && newEmprea.getIva() != null) {
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "A isenção de IVA já foi configurada e não pode ser alterada novamente. Apenas o telefone pode ser atualizado.");
            }
            if ((newEmprea.getPrefixoFatura() == null || newEmprea.getPrefixoFatura().isEmpty()) && request.getPrefixoFatura() != null && !request.getPrefixoFatura().isEmpty()) {
                newEmprea.setPrefixoFatura(request.getPrefixoFatura());
            } else if (request.getPrefixoFatura() != null && !request.getPrefixoFatura().isEmpty() && newEmprea.getPrefixoFatura() != null && !newEmprea.getPrefixoFatura().isEmpty()) {
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "O prefixo da fatura já foi configurado e não pode ser alterado novamente. Apenas o telefone pode ser atualizado.");
            }
            if (newEmprea.getRegimeIva() == null && request.getRegimeIva() != null) {
                newEmprea.setRegimeIva(request.getRegimeIva());
            } else if (request.getRegimeIva() != null && newEmprea.getRegimeIva() != null) {
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "O regime de IVA já foi configurado e não pode ser alterado novamente. Apenas o telefone pode ser atualizado.");
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
                request.getIndustrial(),
                request.getRetencaoNaFonte(),
                request.getIva(),
                request.getPrefixoFatura()
        );
    }

}
