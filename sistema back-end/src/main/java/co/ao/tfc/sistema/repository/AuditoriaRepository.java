package co.ao.tfc.sistema.repository;

import co.ao.tfc.sistema.model.Auditoria;
import co.ao.tfc.sistema.model.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditoriaRepository extends JpaRepository<Auditoria, Long> {
    List<Auditoria> findByEmpresaOrderByDataHoraDesc(Empresa empresa);

    List<Auditoria> findByEmpresaAndUsuarioContainingIgnoreCaseOrderByDataHoraDesc(Empresa empresa, String usuario);

    List<Auditoria> findByEmpresaAndOperacaoOrderByDataHoraDesc(Empresa empresa, String operacao);

    List<Auditoria> findByEmpresaAndOperacaoInOrderByDataHoraDesc(Empresa empresa, java.util.Set<String> operacoes);
}
