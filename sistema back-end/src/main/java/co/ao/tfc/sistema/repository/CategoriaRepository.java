package co.ao.tfc.sistema.repository;

import co.ao.tfc.sistema.model.Categoria;
import co.ao.tfc.sistema.model.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    List<Categoria> findByEmpresa(Empresa empresa);
}
