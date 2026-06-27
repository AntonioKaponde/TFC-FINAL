package co.ao.tfc.sistema.repository;

import co.ao.tfc.sistema.model.PerfilRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PerfilRoleRepository extends JpaRepository<PerfilRole, Long> {
    Optional<PerfilRole> findByNome(String nome);
    java.util.List<PerfilRole> findByEmpresa(co.ao.tfc.sistema.model.Empresa empresa);
    long countByEmpresa(co.ao.tfc.sistema.model.Empresa empresa);
}
