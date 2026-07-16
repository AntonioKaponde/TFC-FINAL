package co.ao.tfc.sistema.repository;

import co.ao.tfc.sistema.model.ConfiguracaoFiscal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ConfiguracaoFiscalRepository extends JpaRepository<ConfiguracaoFiscal, Long> {
    Optional<ConfiguracaoFiscal> findByEmpresa(co.ao.tfc.sistema.model.Empresa empresa);
}
