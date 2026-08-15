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

    /**
     * JOIN FETCH elimina o problema N+1: carrega as faturas e os seus clientes numa única query.
     * Sem isso, para N faturas o Hibernate faria N+1 SELECTs (1 para lista + 1 por cada cliente).
     */
    @Query("SELECT DISTINCT f FROM Fatura f JOIN FETCH f.cliente WHERE f.empresa = :empresa ORDER BY f.dataEmissao ASC, f.numero ASC")
    List<Fatura> findByEmpresa(@Param("empresa") Empresa empresa);

    List<Fatura> findByEmpresaAndDataEmissaoBetween(Empresa empresa, LocalDate inicio, LocalDate fim);

    @Query("SELECT COALESCE(SUM(f.total), 0) FROM Fatura f WHERE f.empresa = :empresa AND f.dataEmissao BETWEEN :inicio AND :fim")
    BigDecimal somarTotalPorPeriodo(@Param("empresa") Empresa empresa, @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("SELECT COALESCE(SUM(f.totalIva), 0) FROM Fatura f WHERE f.empresa = :empresa AND f.dataEmissao BETWEEN :inicio AND :fim")
    BigDecimal somarIvaPorPeriodo(@Param("empresa") Empresa empresa, @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    /**
     * Resumo mensal: mês, faturação base (sem IVA), IVA liquidado e quantidade de documentos emitidos.
     * Usa EXTRACT(...) — compatível com MySQL e PostgreSQL (Railway).
     */
    @Query("""
            SELECT EXTRACT(MONTH FROM f.dataEmissao),
                   COALESCE(SUM(f.subtotal), 0),
                   COALESCE(SUM(f.totalIva), 0),
                   COUNT(f.id)
            FROM Fatura f
            WHERE f.empresa = :empresa AND EXTRACT(YEAR FROM f.dataEmissao) = :ano
            GROUP BY EXTRACT(MONTH FROM f.dataEmissao)
            ORDER BY EXTRACT(MONTH FROM f.dataEmissao)
            """)
    List<Object[]> resumoMensalPorAno(@Param("empresa") Empresa empresa, @Param("ano") int ano);

    /**
     * Resumo diário de documentos emitidos num mês específico.
     * Retorna: dia, quantidade de documentos, valor total faturado, total IVA do dia.
     * Usa EXTRACT(...) — compatível com MySQL e PostgreSQL (Railway).
     */
    @Query("""
            SELECT EXTRACT(DAY FROM f.dataEmissao),
                   COUNT(f.id),
                   COALESCE(SUM(f.total), 0),
                   COALESCE(SUM(f.totalIva), 0),
                   COALESCE(SUM(f.subtotal), 0)
            FROM Fatura f
            WHERE f.empresa = :empresa
              AND EXTRACT(YEAR FROM f.dataEmissao) = :ano
              AND EXTRACT(MONTH FROM f.dataEmissao) = :mes
            GROUP BY EXTRACT(DAY FROM f.dataEmissao)
            ORDER BY EXTRACT(DAY FROM f.dataEmissao)
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
              AND EXTRACT(YEAR FROM f.dataEmissao) = :ano
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
              AND EXTRACT(YEAR FROM f.dataEmissao) = :ano
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
              AND EXTRACT(YEAR FROM f.dataEmissao) = :ano
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
              AND EXTRACT(YEAR FROM f.dataEmissao) = :ano
            GROUP BY c.id, c.nome
            ORDER BY COALESCE(SUM(f.total), 0) DESC
            """)
    List<Object[]> topClientesPorAno(
            @Param("empresa") Empresa empresa,
            @Param("ano") int ano);

    /**
     * Conta total de documentos num período (ano).
     */
    @Query("SELECT COUNT(f) FROM Fatura f WHERE f.empresa = :empresa AND EXTRACT(YEAR FROM f.dataEmissao) = :ano")
    Long contarDocumentosPorAno(@Param("empresa") Empresa empresa, @Param("ano") int ano);

    /**
     * Soma total IVA subtotal (base tributável) por período.
     */
    @Query("SELECT COALESCE(SUM(f.subtotal), 0) FROM Fatura f WHERE f.empresa = :empresa AND f.dataEmissao BETWEEN :inicio AND :fim")
    BigDecimal somarSubtotalPorPeriodo(@Param("empresa") Empresa empresa, @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    /**
     * Consumo/vendas por artigo a partir das linhas de fatura.
     * Retorna: artigo.id, soma das quantidades, data da última venda, nº de faturas distintas.
     * Usado na previsão de stock (velocidade de venda e dias restantes).
     */
    @Query("""
            SELECT l.artigo.id,
                   COALESCE(SUM(l.quantidade), 0),
                   MAX(f.dataEmissao),
                   COUNT(DISTINCT f.id)
            FROM Fatura f JOIN f.linhas l
            WHERE f.empresa = :empresa AND f.dataEmissao >= :inicio
            GROUP BY l.artigo.id
            """)
    List<Object[]> resumoVendasPorArtigo(
            @Param("empresa") Empresa empresa,
            @Param("inicio") LocalDate inicio);
}

