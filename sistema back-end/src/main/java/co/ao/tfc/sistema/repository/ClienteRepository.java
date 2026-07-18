package co.ao.tfc.sistema.repository;

import co.ao.tfc.sistema.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    Optional<Cliente> findByNif(String nif);
    List<Cliente> findByNomeContainingIgnoreCase(String nome);
    List<Cliente> findByEmpresa(co.ao.tfc.sistema.model.Empresa empresa);
    List<Cliente> findByEmpresaOrderByCodigoClienteDesc(co.ao.tfc.sistema.model.Empresa empresa);
    Optional<Cliente> findTopByEmpresaOrderByCodigoClienteDesc(co.ao.tfc.sistema.model.Empresa empresa);
}
