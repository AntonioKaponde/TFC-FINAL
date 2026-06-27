package co.ao.tfc.sistema.repository;

import co.ao.tfc.sistema.model.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;

import javax.swing.text.html.Option;
import java.util.Optional;

public interface EmpresaRepository extends JpaRepository<Empresa, Long> {
    Optional<Empresa> findByNif(String nif);
}
