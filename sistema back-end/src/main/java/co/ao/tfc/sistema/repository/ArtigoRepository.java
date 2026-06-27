package co.ao.tfc.sistema.repository;

import co.ao.tfc.sistema.model.Artigo;
import co.ao.tfc.sistema.model.enums.EstadoArtigo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ArtigoRepository extends JpaRepository<Artigo, Long> {
    List<Artigo> findByEstado(EstadoArtigo estado);

    List<Artigo> findByEmpresa(co.ao.tfc.sistema.model.Empresa empresa);
}
