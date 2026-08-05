package co.ao.tfc.sistema.repository;

import co.ao.tfc.sistema.model.AnexoSuporte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnexoSuporteRepository extends JpaRepository<AnexoSuporte, Long> {
}
