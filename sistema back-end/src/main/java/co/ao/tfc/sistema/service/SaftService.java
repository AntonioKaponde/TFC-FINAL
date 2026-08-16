package co.ao.tfc.sistema.service;

import co.ao.tfc.sistema.model.*;
import co.ao.tfc.sistema.repository.FaturaRepository;
import co.ao.tfc.sistema.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import javax.xml.stream.XMLOutputFactory;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamWriter;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class SaftService {

    private final FaturaRepository faturaRepository;
    private final UsuarioRepository usuarioRepository;

    private Empresa getEmpresaLogada() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario user = usuarioRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Utilizador não autenticado"));
        if (user.getEmpresa() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhuma empresa associada ao utilizador logado.");
        }
        return user.getEmpresa();
    }

    @Transactional(readOnly = true)
    public byte[] exportarSaft(int ano, int mes) {
        Empresa empresa = getEmpresaLogada();
        LocalDate dataInicio = LocalDate.of(ano, mes, 1);
        LocalDate dataFim = dataInicio.withDayOfMonth(dataInicio.lengthOfMonth());

        List<Fatura> faturas = faturaRepository.findByEmpresaAndDataEmissaoBetween(empresa, dataInicio, dataFim);

        // Extrair Clientes, Artigos e Impostos únicos do período
        Set<Cliente> clientes = new HashSet<>();
        Set<Artigo> artigos = new HashSet<>();
        Set<String> impostos = new HashSet<>();

        for (Fatura f : faturas) {
            if (f.getCliente() != null) clientes.add(f.getCliente());
            for (LinhaFatura linha : f.getLinhas()) {
                if (linha.getArtigo() != null) {
                    artigos.add(linha.getArtigo());
                    impostos.add(linha.getArtigo().getTaxaIva() != null ? linha.getArtigo().getTaxaIva().toString() : "0");
                }
            }
        }

        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            XMLOutputFactory xmlOutputFactory = XMLOutputFactory.newInstance();
            XMLStreamWriter writer = xmlOutputFactory.createXMLStreamWriter(baos, "UTF-8");

            writer.writeStartDocument("UTF-8", "1.0");
            writer.writeStartElement("AuditFile");
            writer.writeAttribute("xmlns", "urn:OECD:StandardAuditFile-Tax:AO_1.01_01");

            // --- HEADER ---
            writer.writeStartElement("Header");
            writeElement(writer, "AuditFileVersion", "1.01_01");
            writeElement(writer, "CompanyID", empresa.getNif() != null ? empresa.getNif() : "Desconhecido");
            writeElement(writer, "TaxRegistrationNumber", empresa.getNif() != null ? empresa.getNif() : "Desconhecido");
            writeElement(writer, "TaxAccountingBasis", "F"); // Faturação
            writeElement(writer, "CompanyName", empresa.getNome() != null ? empresa.getNome() : "Desconhecido");

            writer.writeStartElement("CompanyAddress");
            writeElement(writer, "AddressDetail", empresa.getEndereco() != null ? empresa.getEndereco() : "Desconhecido");
            writeElement(writer, "City", "Desconhecido");
            writeElement(writer, "Country", "AO");
            writer.writeEndElement(); // CompanyAddress

            writeElement(writer, "FiscalYear", String.valueOf(ano));
            writeElement(writer, "StartDate", dataInicio.toString());
            writeElement(writer, "EndDate", dataFim.toString());
            writeElement(writer, "CurrencyCode", "AOA");
            writeElement(writer, "DateCreated", LocalDate.now().toString());
            writeElement(writer, "TaxEntity", "Global");
            writeElement(writer, "ProductCompanyTaxID", "500000000"); // Exemplo fictício do software
            writeElement(writer, "SoftwareCertificateNumber", "0");
            writeElement(writer, "ProductID", "Kamba Gestão Software/Gestao");
            writeElement(writer, "ProductVersion", "1.0.0");
            writer.writeEndElement(); // Header

            // --- MASTER FILES ---
            writer.writeStartElement("MasterFiles");

            // Customers
            for (Cliente c : clientes) {
                writer.writeStartElement("Customer");
                writeElement(writer, "CustomerID", c.getId().toString());
                writeElement(writer, "AccountID", "Desconhecido");
                writeElement(writer, "CustomerTaxID", c.getNif() != null ? c.getNif() : "Consumidor Final");
                writeElement(writer, "CompanyName", c.getNome() != null ? c.getNome() : "Desconhecido");
                writer.writeStartElement("BillingAddress");
                writeElement(writer, "AddressDetail", "Desconhecido");
                writeElement(writer, "City", "Desconhecido");
                writeElement(writer, "Country", "AO");
                writer.writeEndElement(); // BillingAddress
                writeElement(writer, "SelfBillingIndicator", "0");
                writer.writeEndElement(); // Customer
            }

            // Products
            for (Artigo a : artigos) {
                writer.writeStartElement("Product");
                writeElement(writer, "ProductType", "P");
                writeElement(writer, "ProductCode", a.getId().toString());
                writeElement(writer, "ProductGroup", a.getCategoria() != null ? a.getCategoria().getNome() : "Geral");
                writeElement(writer, "ProductDescription", a.getNome());
                writeElement(writer, "ProductNumberCode", a.getId().toString());
                writer.writeEndElement(); // Product
            }

            // TaxTable
            writer.writeStartElement("TaxTable");
            for (String taxa : impostos) {
                writer.writeStartElement("TaxTableEntry");
                writeElement(writer, "TaxType", "IVA");
                writeElement(writer, "TaxCountryRegion", "AO");
                writeElement(writer, "TaxCode", taxa.equals("0") ? "ISE" : "NOR");
                writeElement(writer, "Description", taxa.equals("0") ? "Isento" : "Taxa Normal");
                writeElement(writer, "TaxPercentage", taxa);
                writer.writeEndElement(); // TaxTableEntry
            }
            writer.writeEndElement(); // TaxTable

            writer.writeEndElement(); // MasterFiles

            // --- SOURCE DOCUMENTS ---
            writer.writeStartElement("SourceDocuments");
            writer.writeStartElement("SalesInvoices");
            writeElement(writer, "NumberOfEntries", String.valueOf(faturas.size()));
            writeElement(writer, "TotalDebit", "0.00"); // Simplified
            writeElement(writer, "TotalCredit", faturas.stream().map(Fatura::getTotal).reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add).toString());

            for (Fatura f : faturas) {
                writer.writeStartElement("Invoice");
                writeElement(writer, "InvoiceNo", f.getNumero());
                writeElement(writer, "ATCUD", "0");
                writeElement(writer, "DocumentStatus", "N");
                writeElement(writer, "Hash", "0"); // Precisa ser assinado em producao RSA
                writeElement(writer, "HashControl", "1");
                writeElement(writer, "Period", String.valueOf(mes));
                writeElement(writer, "InvoiceDate", f.getDataEmissao().toString());
                writeElement(writer, "InvoiceType", "FT");
                writer.writeStartElement("SpecialStatuses");
                writeElement(writer, "SelfBillingIndicator", "0");
                writeElement(writer, "CashVATSchemeIndicator", "0");
                writeElement(writer, "ThirdPartiesBillingIndicator", "0");
                writer.writeEndElement(); // SpecialStatuses
                writeElement(writer, "SourceID", "Admin");
                writeElement(writer, "SystemEntryDate", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
                writeElement(writer, "CustomerID", f.getCliente() != null ? f.getCliente().getId().toString() : "0");

                int lineNumber = 1;
                for (LinhaFatura linha : f.getLinhas()) {
                    writer.writeStartElement("Line");
                    writeElement(writer, "LineNumber", String.valueOf(lineNumber++));
                    writeElement(writer, "ProductCode", linha.getArtigo() != null ? linha.getArtigo().getId().toString() : "0");
                    writeElement(writer, "ProductDescription", linha.getArtigo() != null ? linha.getArtigo().getNome() : "Desconhecido");
                    writeElement(writer, "Quantity", linha.getQuantidade().toString());
                    writeElement(writer, "UnitOfMeasure", "UN");
                    writeElement(writer, "UnitPrice", linha.getPrecoUnitario().toString());
                    writeElement(writer, "TaxPointDate", f.getDataEmissao().toString());
                    writeElement(writer, "Description", "Linha Venda");
                    writeElement(writer, "CreditAmount", linha.getTotalLinha().toString());
                    
                    writer.writeStartElement("Tax");
                    writeElement(writer, "TaxType", "IVA");
                    writeElement(writer, "TaxCountryRegion", "AO");
                    String taxa = linha.getArtigo() != null && linha.getArtigo().getTaxaIva() != null ? linha.getArtigo().getTaxaIva().toString() : "0";
                    writeElement(writer, "TaxCode", taxa.equals("0") ? "ISE" : "NOR");
                    writeElement(writer, "TaxPercentage", taxa);
                    writer.writeEndElement(); // Tax
                    
                    if (taxa.equals("0")) {
                        writeElement(writer, "TaxExemptionReason", "Isento Artigo 14 CIVA");
                        writeElement(writer, "TaxExemptionCode", "M14");
                    }
                    writeElement(writer, "SettlementAmount", "0.00");
                    writer.writeEndElement(); // Line
                }

                writer.writeStartElement("DocumentTotals");
                writeElement(writer, "TaxPayable", f.getTotalIva().toString());
                writeElement(writer, "NetTotal", f.getSubtotal().toString());
                writeElement(writer, "GrossTotal", f.getTotal().toString());
                writer.writeEndElement(); // DocumentTotals
                writer.writeEndElement(); // Invoice
            }

            writer.writeEndElement(); // SalesInvoices
            writer.writeEndElement(); // SourceDocuments

            writer.writeEndElement(); // AuditFile
            writer.writeEndDocument();
            writer.flush();
            writer.close();

            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar ficheiro SAF-T", e);
        }
    }

    private void writeElement(XMLStreamWriter writer, String name, String value) throws XMLStreamException {
        writer.writeStartElement(name);
        writer.writeCharacters(value);
        writer.writeEndElement();
    }
}
