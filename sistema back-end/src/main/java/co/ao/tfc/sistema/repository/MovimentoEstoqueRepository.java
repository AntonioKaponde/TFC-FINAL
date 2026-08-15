package co.ao.tfc.sistema.repository;

import co.ao.tfc.sistema.model.Empresa;
import co.ao.tfc.sistema.model.MovimentoEstoque;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface MovimentoEstoqueRepository extends JpaRepository<MovimentoEstoque, Long> {
    List<MovimentoEstoque> findByEmpresaOrderByDataHoraDesc(Empresa empresa);

    List<MovimentoEstoque> findByArtigoIdAndEmpresaOrderByDataHoraDesc(Long artigoId, Empresa empresa);

    /**
     * Soma o IVA Dedutível de todas as entradas com fornecedor no período informado.
     * Apenas movimentos do tipo ENTRADA com fornecedor associado e ivaCompra preenchido.
     */
    @Query("""
        SELECT COALESCE(SUM(m.ivaCompra), 0)
        FROM MovimentoEstoque m
        WHERE m.empresa = :empresa
          AND m.tipoMovimento = 'ENTRADA'
          AND m.fornecedor IS NOT NULL
          AND m.ivaCompra IS NOT NULL
          AND m.dataHora BETWEEN :inicio AND :fim
    """)
    BigDecimal somarIvaDedutiveisPorPeriodo(
            @Param("empresa") Empresa empresa,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim);

    /**
     * Encontra movimentos ENTRADA com fornecedor que ainda não têm IVA dedutível calculado.
     */
    @Query("""
        SELECT m
        FROM MovimentoEstoque m
        WHERE m.empresa = :empresa
          AND m.tipoMovimento = 'ENTRADA'
          AND m.fornecedor IS NOT NULL
          AND m.ivaCompra IS NULL
    """)
    List<MovimentoEstoque> findByEmpresaAndTipoMovimentoAndFornecedorIsNotNullAndIvaCompraIsNull(
            @Param("empresa") Empresa empresa);

    /**
     * Resumo mensal de IVA dedutível (compras a fornecedor) para um dado ano.
     * Usa EXTRACT(...) — compatível com MySQL e PostgreSQL (Railway).
     */
    @Query("""
        SELECT EXTRACT(MONTH FROM m.dataHora), COALESCE(SUM(m.ivaCompra), 0)
        FROM MovimentoEstoque m
        WHERE m.empresa = :empresa
          AND m.tipoMovimento = 'ENTRADA'
          AND m.fornecedor IS NOT NULL
          AND m.ivaCompra IS NOT NULL
          AND EXTRACT(YEAR FROM m.dataHora) = :ano
        GROUP BY EXTRACT(MONTH FROM m.dataHora)
        ORDER BY EXTRACT(MONTH FROM m.dataHora)
    """)
    List<Object[]> resumoMensalIvaDedutivel(
            @Param("empresa") Empresa empresa,
            @Param("ano") int ano);

    @Query("""
        SELECT COALESCE(SUM((COALESCE(m.precoCustoUnitario, 0) * m.quantidade) + COALESCE(m.ivaCompra, 0)), 0)
        FROM MovimentoEstoque m
        WHERE m.empresa = :empresa
          AND m.tipoMovimento = 'ENTRADA'
          AND m.fornecedor IS NOT NULL
          AND m.dataHora BETWEEN :inicio AND :fim
    """)
    BigDecimal somarVolumeComprasPorPeriodo(
            @Param("empresa") Empresa empresa,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim);
}

