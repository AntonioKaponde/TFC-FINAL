package co.ao.tfc.sistema.repository;

import co.ao.tfc.sistema.model.Artigo;
import co.ao.tfc.sistema.model.Categoria;
import co.ao.tfc.sistema.model.Cliente;
import co.ao.tfc.sistema.model.Empresa;
import co.ao.tfc.sistema.model.Fatura;
import co.ao.tfc.sistema.model.Fornecedor;
import co.ao.tfc.sistema.model.LinhaFatura;
import co.ao.tfc.sistema.model.MovimentoEstoque;
import co.ao.tfc.sistema.model.enums.EstadoArtigo;
import co.ao.tfc.sistema.model.enums.EstadoFatura;
import co.ao.tfc.sistema.model.enums.MetodoPagamento;
import co.ao.tfc.sistema.model.enums.TipoDocumento;
import co.ao.tfc.sistema.model.enums.TipoEmpresa;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Teste de integração com H2 que valida as queries de agregação usadas no
 * Dashboard, na Inteligência Fiscal e na Previsão de Stock.
 *
 * As queries usam EXTRACT(MONTH/YEAR/DAY FROM ...), sintaxe padrão SQL
 * compatível com MySQL e com o PostgreSQL usado em produção no Railway.
 */
@DataJpaTest
@ActiveProfiles("test")
class ResumosFiscaisRepositoryTest {

    @Autowired private FaturaRepository faturaRepository;
    @Autowired private MovimentoEstoqueRepository movimentoEstoqueRepository;
    @Autowired private EmpresaRepository empresaRepository;
    @Autowired private ClienteRepository clienteRepository;
    @Autowired private ArtigoRepository artigoRepository;
    @Autowired private CategoriaRepository categoriaRepository;
    @Autowired private FornecedorRepository fornecedorRepository;

    @Test
    void resumoMensalPorAnoFuncionaComExtract() {
        Empresa empresa = salvarEmpresa();
        Cliente cliente = salvarCliente(empresa);
        Artigo artigo = salvarArtigo(empresa);

        // Fatura de janeiro e fatura de fevereiro
        salvarFatura(empresa, cliente, artigo, LocalDate.of(2025, 1, 10), "FT 2025/0001", 2);
        salvarFatura(empresa, cliente, artigo, LocalDate.of(2025, 2, 20), "FT 2025/0002", 3);

        var resumo = faturaRepository.resumoMensalPorAno(empresa, 2025);

        assertEquals(2, resumo.size());
        // row = [mes, subtotal, iva, count]
        int mes1 = ((Number) resumo.get(0)[0]).intValue();
        int mes2 = ((Number) resumo.get(1)[0]).intValue();
        assertEquals(1, mes1);
        assertEquals(2, mes2);
        assertEquals(1L, ((Number) resumo.get(0)[3]).longValue());
        assertEquals(1L, ((Number) resumo.get(1)[3]).longValue());
    }

    @Test
    void resumoDiarioPorMesFuncionaComExtract() {
        Empresa empresa = salvarEmpresa();
        Cliente cliente = salvarCliente(empresa);
        Artigo artigo = salvarArtigo(empresa);

        salvarFatura(empresa, cliente, artigo, LocalDate.of(2025, 3, 5), "FT 2025/0003", 1);
        salvarFatura(empresa, cliente, artigo, LocalDate.of(2025, 3, 5), "FT 2025/0004", 2);
        salvarFatura(empresa, cliente, artigo, LocalDate.of(2025, 3, 15), "FT 2025/0005", 1);

        var resumo = faturaRepository.resumoDiarioPorMes(empresa, 2025, 3);

        assertEquals(2, resumo.size());
        int dia1 = ((Number) resumo.get(0)[0]).intValue();
        int dia2 = ((Number) resumo.get(1)[0]).intValue();
        assertEquals(5, dia1);
        assertEquals(15, dia2);
    }

    @Test
    void resumoMensalIvaDedutivelFuncionaComExtract() {
        Empresa empresa = salvarEmpresa();
        Artigo artigo = salvarArtigo(empresa);
        Fornecedor fornecedor = salvarFornecedor(empresa);

        salvarMovimento(empresa, artigo, fornecedor, 4, 1); // mês 4
        salvarMovimento(empresa, artigo, fornecedor, 7, 2); // mês 7

        var resumo = movimentoEstoqueRepository.resumoMensalIvaDedutivel(empresa, 2025);

        assertEquals(2, resumo.size());
        assertEquals(4, ((Number) resumo.get(0)[0]).intValue());
        assertEquals(7, ((Number) resumo.get(1)[0]).intValue());
    }

    // ---------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------

    private Empresa salvarEmpresa() {
        return empresaRepository.save(Empresa.builder()
                .nome("Empresa Teste Integração")
                .nif("500000999")
                .empresa(TipoEmpresa.ELECTRONICO)
                .anoFiscal(LocalDate.now())
                .build());
    }

    private Cliente salvarCliente(Empresa empresa) {
        return clienteRepository.save(Cliente.builder()
                .nome("Cliente Integração")
                .nif("500000888")
                .codigoCliente("C-000001")
                .saldo(BigDecimal.ZERO)
                .ativo(true)
                .empresa(empresa)
                .build());
    }

    private Artigo salvarArtigo(Empresa empresa) {
        Categoria categoria = categoriaRepository.save(
                Categoria.builder().nome("Equipamentos").empresa(empresa).build());
        return artigoRepository.save(Artigo.builder()
                .nome("Portátil")
                .sku("SKU-INT")
                .categoria(categoria)
                .preco(BigDecimal.valueOf(1000))
                .taxaIva(BigDecimal.valueOf(14))
                .stock(50)
                .stockMinimo(5)
                .estado(EstadoArtigo.EM_STOCK)
                .empresa(empresa)
                .build());
    }

    private void salvarFatura(Empresa empresa, Cliente cliente, Artigo artigo,
                              LocalDate emissao, String numero, int quantidade) {
        BigDecimal subtotal = artigo.getPreco().multiply(BigDecimal.valueOf(quantidade));
        BigDecimal iva = subtotal.multiply(artigo.getTaxaIva())
                .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);

        Fatura fatura = Fatura.builder()
                .numero(numero)
                .cliente(cliente)
                .dataEmissao(emissao)
                .dataHoraEmissao(emissao.atTime(10, 0))
                .dataVencimento(emissao.plusDays(30))
                .estado(EstadoFatura.PAGO)
                .subtotal(subtotal)
                .totalIva(iva)
                .total(subtotal.add(iva))
                .pagoPronto(true)
                .tipoDocumento(TipoDocumento.FATURA_RECIBO)
                .metodoPagamento(MetodoPagamento.DINHEIRO)
                .empresa(empresa)
                .build();

        LinhaFatura linha = LinhaFatura.builder()
                .artigo(artigo)
                .quantidade(quantidade)
                .precoUnitario(artigo.getPreco())
                .taxaIva(artigo.getTaxaIva())
                .totalLinha(subtotal.add(iva))
                .build();
        fatura.adicionarLinha(linha);
        faturaRepository.save(fatura);
    }

    private Fornecedor salvarFornecedor(Empresa empresa) {
        return fornecedorRepository.save(Fornecedor.builder()
                .nome("Fornecedor Integração")
                .nif("500000777")
                .ativo(true)
                .empresa(empresa)
                .build());
    }

    private void salvarMovimento(Empresa empresa, Artigo artigo, Fornecedor fornecedor,
                                 int mes, int quantidade) {
        movimentoEstoqueRepository.save(MovimentoEstoque.builder()
                .artigo(artigo)
                .quantidade(quantidade)
                .tipoMovimento("ENTRADA")
                .fornecedor(fornecedor)
                .dataHora(LocalDate.of(2025, mes, 10).atTime(9, 0))
                .usuario("admin@empresa.com")
                .empresa(empresa)
                .stockAntes(10)
                .stockDepois(10 + quantidade)
                .precoCustoUnitario(BigDecimal.valueOf(1000))
                .ivaCompra(BigDecimal.valueOf(1000).multiply(BigDecimal.valueOf(quantidade))
                        .multiply(artigo.getTaxaIva())
                        .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP))
                .build());
    }
}
