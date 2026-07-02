package co.ao.tfc.sistema.repository;

import co.ao.tfc.sistema.model.Empresa;
import co.ao.tfc.sistema.model.MovimentoEstoque;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovimentoEstoqueRepository extends JpaRepository<MovimentoEstoque, Long> {
    List<MovimentoEstoque> findByEmpresaOrderByDataHoraDesc(Empresa empresa);

    List<MovimentoEstoque> findByArtigoIdAndEmpresaOrderByDataHoraDesc(Long artigoId, Empresa empresa);
}
