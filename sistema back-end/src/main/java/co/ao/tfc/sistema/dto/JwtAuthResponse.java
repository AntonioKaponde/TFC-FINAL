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

    /** true se o utilizador ainda não trocou a palavra-passe inicial (criado pelo admin) */
    private boolean primeiroAcesso;

    public JwtAuthResponse(String accessToken, String nome, String email, List<String> roles) {
        this.accessToken = accessToken;
        this.nome = nome;
        this.email = email;
        this.roles = roles;
    }

    public JwtAuthResponse(String accessToken, String nome, String email, List<String> roles, boolean primeiroAcesso) {
        this.accessToken = accessToken;
        this.nome = nome;
        this.email = email;
        this.roles = roles;
        this.primeiroAcesso = primeiroAcesso;
    }
}
