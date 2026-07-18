/*
package co.ao.tfc.sistema.config;

import co.ao.tfc.sistema.model.*;
import co.ao.tfc.sistema.model.enums.EstadoArtigo;
import co.ao.tfc.sistema.model.enums.EstadoFatura;
import co.ao.tfc.sistema.model.enums.RegimeIva;
import co.ao.tfc.sistema.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final ArtigoRepository artigoRepository;
    private final ClienteRepository clienteRepository;
    private final FornecedorRepository fornecedorRepository;
    private final FaturaRepository faturaRepository;
    private final ConfiguracaoFiscalRepository configuracaoFiscalRepository;

    @Override
    public void run(String... args) {
        if (artigoRepository.count() > 0) {
            return;
        }

        configuracaoFiscalRepository.save(ConfiguracaoFiscal.builder()
                .regimeIva(RegimeIva.GERAL)
                .taxaIva(BigDecimal.valueOf(14))
                .motivoIsencaoPadrao("M00")
                .build());

        Artigo laptop = artigoRepository.save(Artigo.builder()
                .nome("Computador Portátil Pro 14")
                .categoria("Equipamentos")
                .preco(new BigDecimal("650000"))
                .taxaIva(BigDecimal.valueOf(14))
                .stock(45)
                .stockMinimo(10)
                .estado(EstadoArtigo.EM_STOCK)
                .build());

        Artigo impressora = artigoRepository.save(Artigo.builder()
                .nome("Impressora Laser Multifunções")
                .categoria("Equipamento")
                .preco(new BigDecimal("125000"))
                .taxaIva(BigDecimal.valueOf(14))
                .stock(0)
                .stockMinimo(5)
                .estado(EstadoArtigo.SEM_STOCK)
                .build());

        Artigo auriculares = artigoRepository.save(Artigo.builder()
                .nome("Auriculares Wireless c/ Noise Cancelling")
                .categoria("Acessório")
                .preco(new BigDecimal("45500"))
                .taxaIva(BigDecimal.valueOf(14))
                .stock(5)
                .stockMinimo(10)
                .estado(EstadoArtigo.STOCK_BAIXO)
                .build());

        Cliente angolaTelecom = clienteRepository.save(Cliente.builder()
                .nome("Angola Telecom S.A.")
                .nif("5000345678")
                .telefone("222000000")
                .email("faturacao@angolatelecom.ao")
                .saldo(BigDecimal.ZERO)
                .ativo(true)
                .build());

        Cliente construtora = clienteRepository.save(Cliente.builder()
                .nome("Construtora Nacional, Lda")
                .nif("5412345679")
                .telefone("9418648914")
                .email("contabilidade@construtora.co.ao")
                .saldo(new BigDecimal("400000"))
                .ativo(false)
                .build());

        fornecedorRepository.save(Fornecedor.builder()
                .nome("TechSupply Angola")
                .nif("5000123456")
                .telefone("923456789")
                .email("vendas@techsupply.ao")
                .endereco("Luanda, Talatona")
                .ativo(true)
                .build());

        criarFatura("FT 2024/1042", angolaTelecom, laptop, 2,
                LocalDate.of(2024, 11, 28), LocalDate.of(2024, 12, 28), EstadoFatura.PAGO);
        criarFatura("FT 2024/1041", construtora, auriculares, 15,
                LocalDate.of(2024, 11, 27), LocalDate.of(2024, 12, 27), EstadoFatura.PENDENTE);
        criarFatura("FT 2024/1025", construtora, impressora, 3,
                LocalDate.of(2024, 10, 15), LocalDate.of(2024, 11, 15), EstadoFatura.VENCIDO);

        criarFaturasMensais2024(angolaTelecom, laptop);
    }

    private void criarFatura(String numero, Cliente cliente, Artigo artigo, int quantidade,
                             LocalDate emissao, LocalDate vencimento, EstadoFatura estado) {
        BigDecimal subtotal = artigo.getPreco().multiply(BigDecimal.valueOf(quantidade));
        BigDecimal iva = subtotal.multiply(artigo.getTaxaIva())
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        Fatura fatura = Fatura.builder()
                .numero(numero)
                .cliente(cliente)
                .dataEmissao(emissao)
                .dataVencimento(vencimento)
                .estado(estado)
                .subtotal(subtotal)
                .totalIva(iva)
                .total(subtotal.add(iva))
                .build();

        LinhaFatura linha = LinhaFatura.builder()
                .fatura(fatura)
                .artigo(artigo)
                .quantidade(quantidade)
                .precoUnitario(artigo.getPreco())
                .taxaIva(artigo.getTaxaIva())
                .totalLinha(subtotal.add(iva))
                .build();

        fatura.adicionarLinha(linha);
        faturaRepository.save(fatura);
    }

    private void criarFaturasMensais2024(Cliente cliente, Artigo artigo) {
        int[] quantidades = {3, 2, 1, 2, 3, 2};
        for (int mes = 1; mes <= 6; mes++) {
            LocalDate emissao = LocalDate.of(2024, mes, 15);
            LocalDate vencimento = emissao.withDayOfMonth(emissao.lengthOfMonth());
            criarFatura(
                    "FT 2024/" + String.format("%04d", 2000 + mes),
                    cliente,
                    artigo,
                    quantidades[mes - 1],
                    emissao,
                    vencimento,
                    EstadoFatura.PAGO
            );
        }
    }
}
*/
