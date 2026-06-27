package co.ao.tfc.sistema.service;

import co.ao.tfc.sistema.dto.*;
import co.ao.tfc.sistema.exception.ResourceNotFoundException;
import co.ao.tfc.sistema.model.Artigo;
import co.ao.tfc.sistema.model.Cliente;
import co.ao.tfc.sistema.model.Fatura;
import co.ao.tfc.sistema.model.LinhaFatura;
import co.ao.tfc.sistema.model.enums.EstadoFatura;
import co.ao.tfc.sistema.repository.ArtigoRepository;
import co.ao.tfc.sistema.repository.FaturaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class FaturaService {

    private final FaturaRepository faturaRepository;
    private final ArtigoRepository artigoRepository;
    private final ClienteService clienteService;
    private final ArtigoService artigoService;
    private final EmpresaService empresaService;

    /*@Transactional(readOnly = true)
    public List<FaturaResponse> listar() {
        return faturaRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public FaturaResponse buscar(Long id) {
        return toResponse(buscarEntidade(id));
    }

    @Transactional
    public FaturaResponse criar(FaturaRequest request) {
        Cliente cliente = clienteService.buscarEntidade(request.getClienteId());

        Fatura fatura = Fatura.builder()
                .numero(gerarNumero())
                .cliente(cliente)
                .dataEmissao(request.getDataEmissao())
                .dataVencimento(request.getDataVencimento())
                .estado(EstadoFatura.PAGO)
                .subtotal(BigDecimal.ZERO)
                .totalIva(BigDecimal.ZERO)
                .total(BigDecimal.ZERO)
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalIva = BigDecimal.ZERO;

        for (LinhaFaturaRequest linhaRequest : request.getLinhas()) {
            Artigo artigo = artigoService.buscarEntidade(linhaRequest.getArtigoId());
            if (artigo.getStock() < linhaRequest.getQuantidade()) {
                throw new IllegalArgumentException("Stock insuficiente para o artigo: " + artigo.getNome());
            }

            BigDecimal totalLinha = artigo.getPreco()
                    .multiply(BigDecimal.valueOf(linhaRequest.getQuantidade()));
            BigDecimal ivaLinha = totalLinha
                    .multiply(artigo.getTaxaIva())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            LinhaFatura linha = LinhaFatura.builder()
                    .artigo(artigo)
                    .quantidade(linhaRequest.getQuantidade())
                    .precoUnitario(artigo.getPreco())
                    .taxaIva(artigo.getTaxaIva())
                    .totalLinha(totalLinha.add(ivaLinha))
                    .build();

            fatura.adicionarLinha(linha);
            subtotal = subtotal.add(totalLinha);
            totalIva = totalIva.add(ivaLinha);

            artigo.setStock(artigo.getStock() - linhaRequest.getQuantidade());
            artigo.atualizarEstado();
            artigoRepository.save(artigo);
        }

        fatura.setSubtotal(subtotal);
        fatura.setTotalIva(totalIva);
        fatura.setTotal(subtotal.add(totalIva));
        fatura.setEstado(calcularEstado(fatura.getDataVencimento()));

        return toResponse(faturaRepository.save(fatura));
    }

    @Transactional
    public FaturaResponse marcarComoPaga(Long id) {
        Fatura fatura = buscarEntidade(id);
        fatura.setEstado(EstadoFatura.PAGO);
        return toResponse(faturaRepository.save(fatura));
    }

    @Transactional
    public void atualizarEstadosVencidas() {
        faturaRepository.findByEstado(EstadoFatura.VENCIDO).forEach(fatura -> {
            if (fatura.getDataVencimento().isBefore(LocalDate.now())) {
                fatura.setEstado(EstadoFatura.VENCIDO);
            }
        });
    }

    private String gerarNumero() {
        long total = faturaRepository.count() + 1;
        return "FT " + Year.now().getValue() + "/" + String.format("%04d", total);
    }

    private EstadoFatura calcularEstado(LocalDate vencimento) {
        return vencimento.isBefore(LocalDate.now()) ? EstadoFatura.VENCIDO : EstadoFatura.PAGO;
    }

    public Fatura buscarEntidade(Long id) {
        return faturaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fatura não encontrada: " + id));
    }

    private FaturaResponse toResponse(Fatura fatura) {
        return FaturaResponse.builder()
                .id(fatura.getId())
                .numero(fatura.getNumero())
                .cliente(fatura.getCliente().getNome())
                .nif(fatura.getCliente().getNif())
                .dataEmissao(fatura.getDataEmissao())
                .dataVencimento(fatura.getDataVencimento())
                .estado(fatura.getEstado())
                .subtotal(fatura.getSubtotal())
                .totalIva(fatura.getTotalIva())
                .total(fatura.getTotal())
                .linhas(fatura.getLinhas().stream()
                        .map(linha -> LinhaFaturaResponse.builder()
                                .id(linha.getId())
                                .artigo(linha.getArtigo().getNome())
                                .quantidade(linha.getQuantidade())
                                .precoUnitario(linha.getPrecoUnitario())
                                .taxaIva(linha.getTaxaIva())
                                .totalLinha(linha.getTotalLinha())
                                .build())
                        .toList())
                .build();
    }*/


    private final co.ao.tfc.sistema.repository.UsuarioRepository usuarioRepository;

    private co.ao.tfc.sistema.model.Empresa getCurrentEmpresa() {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Utilizador não autenticado")).getEmpresa();
    }

    @Transactional(readOnly = true)
    public List<FaturaResponse> listar() {
        co.ao.tfc.sistema.model.Empresa empresa = getCurrentEmpresa();
        return faturaRepository.findByEmpresa(empresa).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public FaturaResponse buscar(Long id) {
        return toResponse(buscarEntidade(id));
    }

    @Transactional
    public FaturaResponse criar(FaturaRequest request) {
        co.ao.tfc.sistema.model.Empresa empresa = getCurrentEmpresa();
        Cliente cliente = clienteService.buscarEntidade(request.getClienteId());

        Fatura fatura = Fatura.builder()
                .numero(gerarNumero())
                .cliente(cliente)
                .dataEmissao(request.getDataEmissao())
                .dataVencimento(request.getDataVencimento())
                .estado(EstadoFatura.PAGO)
                .subtotal(BigDecimal.ZERO)
                .totalIva(BigDecimal.ZERO)
                .total(BigDecimal.ZERO)
                .empresa(empresa)
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalIva = BigDecimal.ZERO;

        for (LinhaFaturaRequest linhaRequest : request.getLinhas()) {
            Artigo artigo = artigoService.buscarEntidade(linhaRequest.getArtigoId());
            if (artigo.getStock() < linhaRequest.getQuantidade()) {
                throw new IllegalArgumentException("Stock insuficiente para o artigo: " + artigo.getNome());
            }

            BigDecimal totalLinha = artigo.getPreco()
                    .multiply(BigDecimal.valueOf(linhaRequest.getQuantidade()));
            BigDecimal ivaLinha = totalLinha
                    .multiply(artigo.getTaxaIva())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            LinhaFatura linha = LinhaFatura.builder()
                    .artigo(artigo)
                    .quantidade(linhaRequest.getQuantidade())
                    .precoUnitario(artigo.getPreco())
                    .taxaIva(artigo.getTaxaIva())
                    .totalLinha(totalLinha.add(ivaLinha))
                    .build();

            fatura.adicionarLinha(linha);
            subtotal = subtotal.add(totalLinha);
            totalIva = totalIva.add(ivaLinha);

            artigo.setStock(artigo.getStock() - linhaRequest.getQuantidade());
            artigo.atualizarEstado();
            artigoRepository.save(artigo);
        }

        fatura.setSubtotal(subtotal);
        fatura.setTotalIva(totalIva);
        fatura.setTotal(subtotal.add(totalIva));
        fatura.setEstado(calcularEstado(fatura.getDataVencimento()));

        return toResponse(faturaRepository.save(fatura));
    }

    @Transactional
    public FaturaResponse marcarComoPaga(Long id) {
        Fatura fatura = buscarEntidade(id);
        fatura.setEstado(EstadoFatura.PAGO);
        return toResponse(faturaRepository.save(fatura));
    }

    @Transactional
    public void atualizarEstadosVencidas() {
        // Atenção: Esta rotina num cron job não terá SecurityContext ativo.
        // Se for chamada via API, usamos empresa, se for via cron job global, é preciso outra abordagem.
        // Assumindo que isto é chamado por cada tenant via UI ou API:
        co.ao.tfc.sistema.model.Empresa empresa = getCurrentEmpresa();
        faturaRepository.findByEmpresa(empresa).forEach(fatura -> {
            if (fatura.getEstado() != EstadoFatura.PAGO && fatura.getDataVencimento().isBefore(LocalDate.now())) {
                fatura.setEstado(EstadoFatura.VENCIDO);
            }
        });
    }

    // -------------------------------------------------------------------------
    // Faturas mensais (Jan–Jun 2024)
    // -------------------------------------------------------------------------

    /**
     * Cria seis faturas mensais (Jan–Jun 2024) com base nos dados enviados pelo frontend.
     * Cada mês gera uma fatura com uma linha contendo o artigo e a respectiva quantidade.
     * Passa pelo fluxo normal: validação de stock, geração de número e cálculo de IVA.
     *
     * Payload esperado do frontend (FaturasMensaisRequest):
     * {
     *   "clienteId": 1,
     *   "artigoId": 5,
     *   "quantidades": [3, 2, 1, 2, 3, 2]   // exactamente 6 valores, um por mês
     * }
     */
    @Transactional
    public List<FaturaResponse> criarFaturasMensais2024(FaturaMensalRequest request) {
        if (request.getQuantidades() == null || request.getQuantidades().size() != 6) {
            throw new IllegalArgumentException("É necessário fornecer exactamente 6 quantidades (Jan–Jun).");
        }

        return IntStream.rangeClosed(1, 6)
                .mapToObj(mes -> {
                    LocalDate emissao  = LocalDate.now();
                    LocalDate vencimento = emissao.withDayOfMonth(emissao.lengthOfMonth());

                    LinhaFaturaRequest linha = new LinhaFaturaRequest();
                    linha.setArtigoId(request.getArtigoId());
                    linha.setQuantidade(request.getQuantidades().get(mes - 1));

                    FaturaRequest faturaRequest = new FaturaRequest();
                    faturaRequest.setClienteId(request.getClienteId());
                    faturaRequest.setDataEmissao(emissao);
                    faturaRequest.setDataVencimento(vencimento);
                    faturaRequest.setLinhas(List.of(linha));

                    return criar(faturaRequest);
                })
                .toList();
    }

    // -------------------------------------------------------------------------
    // Utilitários privados
    // -------------------------------------------------------------------------

    private String gerarNumero() {
        long total = faturaRepository.count() + 1;
        return "FT " + Year.now().getValue() + "/" + String.format("%04d", total);
    }

    private EstadoFatura calcularEstado(LocalDate vencimento) {
        return vencimento.isBefore(LocalDate.now()) ? EstadoFatura.VENCIDO : EstadoFatura.PAGO;
    }

    public Fatura buscarEntidade(Long id) {
        Fatura fatura = faturaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fatura não encontrada: " + id));
        if (!fatura.getEmpresa().getId().equals(getCurrentEmpresa().getId())) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Acesso negado: Esta fatura pertence a outra empresa.");
        }
        return fatura;
    }

    private FaturaResponse toResponse(Fatura fatura) {
        return FaturaResponse.builder()
                .id(fatura.getId())
                .numero(fatura.getNumero())
                .cliente(fatura.getCliente().getNome())
                .nif(fatura.getCliente().getNif())
                .dataEmissao(fatura.getDataEmissao())
                .dataVencimento(fatura.getDataVencimento())
                .estado(fatura.getEstado())
                .subtotal(fatura.getSubtotal())
                .totalIva(fatura.getTotalIva())
                .total(fatura.getTotal())
                .linhas(fatura.getLinhas().stream()
                        .map(linha -> LinhaFaturaResponse.builder()
                                .id(linha.getId())
                                .artigo(linha.getArtigo().getNome())
                                .quantidade(linha.getQuantidade())
                                .precoUnitario(linha.getPrecoUnitario())
                                .taxaIva(linha.getTaxaIva())
                                .totalLinha(linha.getTotalLinha())
                                .build())
                        .toList())
                .build();
    }
}
