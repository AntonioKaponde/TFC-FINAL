package co.ao.tfc.sistema.repository;

import co.ao.tfc.sistema.model.Fornecedor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FornecedorRepository extends JpaRepository<Fornecedor, Long> {
    List<Fornecedor> findByNomeContainingIgnoreCase(String nome);
    List<Fornecedor> findByEmpresa(co.ao.tfc.sistema.model.Empresa empresa);
}
