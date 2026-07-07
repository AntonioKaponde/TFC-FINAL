package co.ao.tfc.sistema.repository;

import co.ao.tfc.sistema.model.Empresa;
import co.ao.tfc.sistema.model.Fatura;
import co.ao.tfc.sistema.model.enums.EstadoFatura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface FaturaRepository extends JpaRepository<Fatura, Long> {
    List<Fatura> findByEstado(EstadoFatura estado);

    List<Fatura> findByEmpresa(Empresa empresa);

    List<Fatura> findByEmpresaAndDataEmissaoBetween(Empresa empresa, LocalDate inicio, LocalDate fim);

    @Query("SELECT COALESCE(SUM(f.total), 0) FROM Fatura f WHERE f.empresa = :empresa AND f.dataEmissao BETWEEN :inicio AND :fim")
    BigDecimal somarTotalPorPeriodo(Empresa empresa, LocalDate inicio, LocalDate fim);

    @Query("SELECT COALESCE(SUM(f.totalIva), 0) FROM Fatura f WHERE f.empresa = :empresa AND f.dataEmissao BETWEEN :inicio AND :fim")
    BigDecimal somarIvaPorPeriodo(Empresa empresa, LocalDate inicio, LocalDate fim);

    /**
     * Resumo mensal: mês, faturação base (sem IVA), IVA liquidado e quantidade de documentos emitidos.
     */
    @Query("""
            SELECT FUNCTION('MONTH', f.dataEmissao),
                   COALESCE(SUM(f.subtotal), 0),
                   COALESCE(SUM(f.totalIva), 0),
                   COUNT(f.id)
            FROM Fatura f
            WHERE f.empresa = :empresa AND FUNCTION('YEAR', f.dataEmissao) = :ano
            GROUP BY FUNCTION('MONTH', f.dataEmissao)
            ORDER BY FUNCTION('MONTH', f.dataEmissao)
            """)
    List<Object[]> resumoMensalPorAno(@Param("empresa") Empresa empresa, @Param("ano") int ano);

    /**
     * Resumo diário de documentos emitidos num mês específico.
     * Retorna: dia, quantidade de documentos, valor total faturado, total IVA do dia.
     */
    @Query("""
            SELECT FUNCTION('DAY', f.dataEmissao),
                   COUNT(f.id),
                   COALESCE(SUM(f.total), 0),
                   COALESCE(SUM(f.totalIva), 0),
                   COALESCE(SUM(f.subtotal), 0)
            FROM Fatura f
            WHERE f.empresa = :empresa
              AND FUNCTION('YEAR', f.dataEmissao) = :ano
              AND FUNCTION('MONTH', f.dataEmissao) = :mes
            GROUP BY FUNCTION('DAY', f.dataEmissao)
            ORDER BY FUNCTION('DAY', f.dataEmissao)
            """)
    List<Object[]> resumoDiarioPorMes(
            @Param("empresa") Empresa empresa,
            @Param("ano") int ano,
            @Param("mes") int mes);

    /**
     * Resumo de faturação por método de pagamento no período.
     * Retorna: método de pagamento, total, quantidade.
     */
    @Query("""
            SELECT f.metodoPagamento,
                   COALESCE(SUM(f.total), 0),
                   COUNT(f.id)
            FROM Fatura f
            WHERE f.empresa = :empresa
              AND FUNCTION('YEAR', f.dataEmissao) = :ano
              AND f.metodoPagamento IS NOT NULL
            GROUP BY f.metodoPagamento
            ORDER BY COUNT(f.id) DESC
            """)
    List<Object[]> resumoPorMetodoPagamento(
            @Param("empresa") Empresa empresa,
            @Param("ano") int ano);

    /**
     * Resumo de faturação por tipo de documento.
     * Retorna: tipo de documento, total, quantidade.
     */
    @Query("""
            SELECT f.tipoDocumento,
                   COALESCE(SUM(f.total), 0),
                   COUNT(f.id)
            FROM Fatura f
            WHERE f.empresa = :empresa
              AND FUNCTION('YEAR', f.dataEmissao) = :ano
            GROUP BY f.tipoDocumento
            ORDER BY COUNT(f.id) DESC
            """)
    List<Object[]> resumoPorTipoDocumento(
            @Param("empresa") Empresa empresa,
            @Param("ano") int ano);

    /**
     * Resumo de faturação por estado (Pago/Pendente/Vencido).
     * Retorna: estado, total, quantidade.
     */
    @Query("""
            SELECT f.estado,
                   COALESCE(SUM(f.total), 0),
                   COUNT(f.id)
            FROM Fatura f
            WHERE f.empresa = :empresa
              AND FUNCTION('YEAR', f.dataEmissao) = :ano
            GROUP BY f.estado
            ORDER BY COUNT(f.id) DESC
            """)
    List<Object[]> resumoPorEstado(
            @Param("empresa") Empresa empresa,
            @Param("ano") int ano);

    /**
     * Top 5 clientes por faturação no ano.
     * Retorna: nome do cliente, total, quantidade de documentos.
     */
    @Query("""
            SELECT c.nome,
                   COALESCE(SUM(f.total), 0),
                   COUNT(f.id)
            FROM Fatura f
            JOIN f.cliente c
            WHERE f.empresa = :empresa
              AND FUNCTION('YEAR', f.dataEmissao) = :ano
            GROUP BY c.id, c.nome
            ORDER BY COALESCE(SUM(f.total), 0) DESC
            """)
    List<Object[]> topClientesPorAno(
            @Param("empresa") Empresa empresa,
            @Param("ano") int ano);

    /**
     * Conta total de documentos num período (ano).
     */
    @Query("SELECT COUNT(f) FROM Fatura f WHERE f.empresa = :empresa AND FUNCTION('YEAR', f.dataEmissao) = :ano")
    Long contarDocumentosPorAno(@Param("empresa") Empresa empresa, @Param("ano") int ano);

    /**
     * Soma total IVA subtotal (base tributável) por período.
     */
    @Query("SELECT COALESCE(SUM(f.subtotal), 0) FROM Fatura f WHERE f.empresa = :empresa AND f.dataEmissao BETWEEN :inicio AND :fim")
    BigDecimal somarSubtotalPorPeriodo(@Param("empresa") Empresa empresa, @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);
}

