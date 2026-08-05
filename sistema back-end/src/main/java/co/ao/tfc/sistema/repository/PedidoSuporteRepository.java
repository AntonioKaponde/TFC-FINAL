package co.ao.tfc.sistema.repository;

import co.ao.tfc.sistema.model.Empresa;
import co.ao.tfc.sistema.model.PedidoSuporte;
import co.ao.tfc.sistema.model.enums.EstadoSuporte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PedidoSuporteRepository extends JpaRepository<PedidoSuporte, Long> {

    List<PedidoSuporte> findByEmpresaOrderByDataCriacaoDesc(Empresa empresa);

    List<PedidoSuporte> findByEmpresaAndEstadoOrderByDataCriacaoDesc(Empresa empresa, EstadoSuporte estado);

    /** Número de pedidos ainda não visualizados pelo administrador (badge de notificação). */
    long countByEmpresaAndVistoFalse(Empresa empresa);

    /** Pedidos não visualizados, mais recentes primeiro (usado na campainha). */
    List<PedidoSuporte> findTop10ByEmpresaAndVistoFalseOrderByDataCriacaoDesc(Empresa empresa);

    /** Marca todos os pedidos da empresa como visualizados. */
    @Modifying
    @Query("UPDATE PedidoSuporte p SET p.visto = true WHERE p.empresa = :empresa AND p.visto = false")
    int marcarTodosComoVistos(@Param("empresa") Empresa empresa);

    List<PedidoSuporte> findByEmailUtilizadorOrderByDataCriacaoDesc(String email);

    /**
     * Carrega pedido com anexos (JOIN FETCH) e valida a empresa via parâmetro.
     */
    @Query("""
            SELECT DISTINCT p FROM PedidoSuporte p
            LEFT JOIN FETCH p.anexos
            WHERE p.id = :id AND p.empresa = :empresa
            """)
    Optional<PedidoSuporte> findByIdAndEmpresa(@Param("id") Long id, @Param("empresa") Empresa empresa);

    @Query("""
            SELECT DISTINCT p FROM PedidoSuporte p
            LEFT JOIN FETCH p.anexos
            WHERE p.empresa = :empresa AND p.emailUtilizador = :email
            ORDER BY p.dataCriacao DESC
            """)
    List<PedidoSuporte> findComAnexosPorEmpresaEUtilizador(@Param("empresa") Empresa empresa, @Param("email") String email);

    @Query("""
            SELECT DISTINCT p FROM PedidoSuporte p
            LEFT JOIN FETCH p.anexos
            WHERE p.empresa = :empresa
            ORDER BY p.dataCriacao DESC
            """)
    List<PedidoSuporte> findComAnexosPorEmpresa(@Param("empresa") Empresa empresa);
}
