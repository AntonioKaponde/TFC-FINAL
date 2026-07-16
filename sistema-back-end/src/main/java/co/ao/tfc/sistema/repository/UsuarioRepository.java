package co.ao.tfc.sistema.repository;

import co.ao.tfc.sistema.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
    boolean existsByEmail(String email);
    java.util.List<Usuario> findByEmpresa(co.ao.tfc.sistema.model.Empresa empresa);
}
