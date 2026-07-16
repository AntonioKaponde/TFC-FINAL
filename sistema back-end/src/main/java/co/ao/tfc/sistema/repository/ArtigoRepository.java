package co.ao.tfc.sistema.repository;

import co.ao.tfc.sistema.model.Artigo;
import co.ao.tfc.sistema.model.enums.EstadoArtigo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface ArtigoRepository extends JpaRepository<Artigo, Long> {
    List<Artigo> findByEstado(EstadoArtigo estado);

    /**
     * JOIN FETCH para carregar artigos com categoria e fornecedor numa única query.
     * Elimina o N+1 ao listar o inventário.
     */
    @Query("SELECT a FROM Artigo a LEFT JOIN FETCH a.categoria LEFT JOIN FETCH a.fornecedor WHERE a.empresa = :empresa ORDER BY a.nome ASC")
    List<Artigo> findByEmpresa(@Param("empresa") co.ao.tfc.sistema.model.Empresa empresa);

    /**
     * Calcula o IVA dedutível (IVA a Recuperar) da empresa.
     * Baseia-se no preço de custo × taxa IVA de cada artigo registado.
     * Conforme Art. 19.º CIVA Angola — apenas aplicável no Regime Geral.
     */
    @Query("SELECT COALESCE(SUM(a.precoCusto * a.taxaIva / 100), 0) FROM Artigo a WHERE a.empresa = :empresa AND a.precoCusto IS NOT NULL")
    BigDecimal calcularIvaARecuperarPorEmpresa(co.ao.tfc.sistema.model.Empresa empresa);

    boolean existsByNomeIgnoreCaseAndEmpresa(String nome, co.ao.tfc.sistema.model.Empresa empresa);

    /**
     * Encontra artigos de uma empresa com um determinado precoCusto.
     * Usado para corrigir artigos existentes com precoCusto = 0 (bug da versão anterior).
     */
    List<Artigo> findByEmpresaAndPrecoCusto(co.ao.tfc.sistema.model.Empresa empresa, BigDecimal precoCusto);
}
