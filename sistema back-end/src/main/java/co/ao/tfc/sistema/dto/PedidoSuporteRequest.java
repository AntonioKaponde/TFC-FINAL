package co.ao.tfc.sistema.dto;

import co.ao.tfc.sistema.model.enums.CategoriaSuporte;
import co.ao.tfc.sistema.model.enums.PrioridadeSuporte;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Data
public class PedidoSuporteRequest {

    @NotBlank(message = "O assunto é obrigatório")
    @Size(max = 150, message = "O assunto deve ter no máximo 150 caracteres")
    private String assunto;

    @NotBlank(message = "A descrição é obrigatória")
    @Size(max = 2000, message = "A descrição deve ter no máximo 2000 caracteres")
    private String descricao;

    @NotNull(message = "A categoria é obrigatória")
    private CategoriaSuporte categoria;

    @NotNull(message = "A prioridade é obrigatória")
    private PrioridadeSuporte prioridade;

    /** Imagens ou documentos anexados (prints de erros). Opcional. */
    private List<MultipartFile> anexos = new ArrayList<>();
}
