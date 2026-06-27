package co.ao.tfc.sistema.repository;

import co.ao.tfc.sistema.model.Fatura;
import co.ao.tfc.sistema.model.enums.EstadoFatura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface FaturaRepository extends JpaRepository<Fatura, Long> {
    List<Fatura> findByEstado(EstadoFatura estado);

    List<Fatura> findByEmpresa(co.ao.tfc.sistema.model.Empresa empresa);

    List<Fatura> findByEmpresaAndDataEmissaoBetween(co.ao.tfc.sistema.model.Empresa empresa, LocalDate inicio, LocalDate fim);

    @Query("SELECT COALESCE(SUM(f.total), 0) FROM Fatura f WHERE f.empresa = :empresa AND f.dataEmissao BETWEEN :inicio AND :fim")
    BigDecimal somarTotalPorPeriodo(co.ao.tfc.sistema.model.Empresa empresa, LocalDate inicio, LocalDate fim);

    @Query("SELECT COALESCE(SUM(f.totalIva), 0) FROM Fatura f WHERE f.empresa = :empresa AND f.dataEmissao BETWEEN :inicio AND :fim")
    BigDecimal somarIvaPorPeriodo(co.ao.tfc.sistema.model.Empresa empresa, LocalDate inicio, LocalDate fim);

    @Query("""
            SELECT MONTH(f.dataEmissao), COALESCE(SUM(f.total - f.totalIva), 0), COALESCE(SUM(f.totalIva), 0)
            FROM Fatura f
            WHERE f.empresa = :empresa AND YEAR(f.dataEmissao) = :ano
            GROUP BY MONTH(f.dataEmissao)
            ORDER BY MONTH(f.dataEmissao)
            """)
    List<Object[]> resumoMensalPorAno(co.ao.tfc.sistema.model.Empresa empresa, int ano);
}
