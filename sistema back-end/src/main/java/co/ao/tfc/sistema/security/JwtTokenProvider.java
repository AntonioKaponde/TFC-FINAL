package co.ao.tfc.sistema.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private static final Logger log = LoggerFactory.getLogger(JwtTokenProvider.class);

    /** Chave predefinida (apenas para desenvolvimento local). */
    private static final String SECRETO_PREDEFINIDO = "413F4428472B4B6250655368566D5970337336763979244226452948404D6351";

    @Value("${JWT_SECRET:413F4428472B4B6250655368566D5970337336763979244226452948404D6351}")
    private String jwtSecret;
    private final int jwtExpirationInMs = 604800000; // 7 dias

    /**
     * Avisa em produção se o JWT_SECRET predefinido (público/forjável) estiver
     * a ser usado. A variável JWT_SECRET deve estar sempre definida em produção.
     */
    @PostConstruct
    public void avisarChavePredefinida() {
        if (SECRETO_PREDEFINIDO.equals(jwtSecret)) {
            log.warn("[SEGURANÇA] JWT_SECRET não definido no ambiente — a usar a chave predefinida. "
                    + "Defina a variável JWT_SECRET (mín. 32 bytes) em produção.");
        }
    }

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateToken(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String getUsernameFromJWT(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            // Em produção, deve-se usar um logger em vez de printStackTrace
            System.err.println("Invalid JWT token: " + ex.getMessage());
        }
        return false;
    }
}
