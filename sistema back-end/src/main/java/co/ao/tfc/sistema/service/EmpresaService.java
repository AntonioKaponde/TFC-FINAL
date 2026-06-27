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
import jakarta.transaction.Transactional;
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

            if (request.getEndereco() != null && !request.getEndereco().isEmpty()) {
                newEmprea.setEndereco(request.getEndereco());
            }
            if (request.getTelefone() != null && !request.getTelefone().isEmpty()) {
                newEmprea.setTelefone(request.getTelefone());
            }
            if (request.getCapitalSocial() != null) {
                newEmprea.setCapitalSocial(request.getCapitalSocial());
            }
            if (request.getEmail() != null && !request.getEmail().isEmpty()) {
                newEmprea.setEmail(request.getEmail());
            }
            if (request.getIndustrial() != null) {
                newEmprea.setIndustrial(request.getIndustrial());
            }
            if (request.getRetencaoNaFonte() != null) {
                newEmprea.setRetencaoNaFonte(request.getRetencaoNaFonte());
            }
            if (request.getIva() != null) {
                newEmprea.setIva(request.getIva());
            }
            if (request.getPrefixoFatura() != null && !request.getPrefixoFatura().isEmpty()) {
                newEmprea.setPrefixoFatura(request.getPrefixoFatura());
            }
            if (request.getRegimeIva() != null) {
                newEmprea.setRegimeIva(request.getRegimeIva());
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
