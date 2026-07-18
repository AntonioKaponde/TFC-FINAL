package co.ao.tfc.sistema.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JwtAuthResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private String nome;
    private String email;
    private List<String> roles;

    public JwtAuthResponse(String accessToken, String nome, String email, List<String> roles) {
        this.accessToken = accessToken;
        this.nome = nome;
        this.email = email;
        this.roles = roles;
    }
}
