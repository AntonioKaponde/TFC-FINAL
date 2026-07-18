package co.ao.tfc.sistema.repository;

import co.ao.tfc.sistema.model.NotaCredito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

public interface NotaCreditoRepository extends JpaRepository<NotaCredito, Long> {
    List<NotaCredito> findByEmpresa(co.ao.tfc.sistema.model.Empresa empresa);

    @Query("SELECT COALESCE(SUM(n.total), 0) FROM NotaCredito n WHERE n.empresa = :empresa")
    BigDecimal sumTotalByEmpresa(co.ao.tfc.sistema.model.Empresa empresa);
}
