package co.ao.tfc.sistema.repository;

import co.ao.tfc.sistema.model.Auditoria;
import co.ao.tfc.sistema.model.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditoriaRepository extends JpaRepository<Auditoria, Long> {
    List<Auditoria> findByEmpresaOrderByDataHoraDesc(Empresa empresa);
}
