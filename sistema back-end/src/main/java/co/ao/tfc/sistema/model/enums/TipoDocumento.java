package co.ao.tfc.sistema.model.enums;

/**
 * Tipos de documentos fiscais conforme o Regime Jurídico das Facturas
 * e Documentos Equivalentes — República de Angola (Decreto nº 34/09).
 *
 * Art. 5.º — Fatura (pagamento diferido)
 * Art. 7.º — Fatura-Recibo (pagamento imediato)
 * Art. 8.º — Fatura Simplificada (pequeno valor / consumidor final)
 */
public enum TipoDocumento {

    /**
     * FATURA — Art. 5.º Decreto 34/09
     * Emitida quando a venda ou prestação de serviço ocorre,
     * mas o pagamento será feito posteriormente (a crédito).
     * Documento base para registo contabilístico.
     * Obriga a identificação completa do cliente (NIF).
     */
    FATURA,

    /**
     * FATURA-RECIBO — Art. 7.º Decreto 34/09
     * Emissão obrigatória quando a compra ou serviço é pago no momento.
     * Comprova simultaneamente a venda e o recebimento do pagamento.
     */
    FATURA_RECIBO,

    /**
     * FATURA SIMPLIFICADA — Art. 8.º Decreto 34/09
     * Utilizada em operações de pequeno valor, geralmente ao consumidor final.
     * Pode ser emitida sem identificação do cliente (consumidor final).
     * Limite de valor e condições definidos pela AGT.
     */
    FATURA_SIMPLIFICADA
}
