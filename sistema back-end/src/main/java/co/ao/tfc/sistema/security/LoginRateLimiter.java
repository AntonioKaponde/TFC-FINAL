package co.ao.tfc.sistema.security;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Proteção contra força bruta no login (OWASP A07 — Identification and
 * Authentication Failures). Regista tentativas falhadas por email e bloqueia
 * temporariamente a conta após várias falhas seguidas.
 *
 * A contagem usa uma janela deslizante: o contador é reposto se o utilizador
 * ficar 15 minutos sem tentar o login, e a conta é bloqueada por 15 minutos
 * ao atingir o máximo de tentativas falhadas.
 *
 * Armazenamento em memória — apropriado para uma única instância. Se a
 * aplicação passar a correr em várias instâncias, deve migrar para Redis/BD.
 */
@Component
public class LoginRateLimiter {

    /** Máximo de tentativas falhadas antes do bloqueio temporário. */
    private static final int MAX_TENTATIVAS = 5;

    /** Janela de contagem e duração do bloqueio. */
    private static final long JANELA_MS = 15 * 60 * 1000; // 15 minutos

    private static final class Registo {
        int falhas;
        long ultimaFalha;
        long bloqueadoAte;
    }

    private final Map<String, Registo> registos = new ConcurrentHashMap<>();

    /** True se a conta está temporariamente bloqueada. */
    public boolean estaBloqueada(String email) {
        Registo r = registos.get(normalizar(email));
        if (r == null) return false;
        if (r.bloqueadoAte > System.currentTimeMillis()) return true;

        // Bloqueio expirado: limpa e permite novas tentativas
        if (r.bloqueadoAte != 0) {
            registos.remove(normalizar(email));
            return false;
        }
        return false;
    }

    /** Regista uma tentativa falhada; bloqueia a conta ao atingir o máximo. */
    public void registarFalha(String email) {
        String chave = normalizar(email);
        Registo r = registos.computeIfAbsent(chave, k -> new Registo());
        long agora = System.currentTimeMillis();

        // Janela expirada (15 min sem falhas): recomeça a contagem
        if (r.bloqueadoAte == 0 && r.falhas > 0 && agora - r.ultimaFalha > JANELA_MS) {
            r.falhas = 0;
        }

        r.falhas++;
        r.ultimaFalha = agora;

        if (r.falhas >= MAX_TENTATIVAS) {
            r.bloqueadoAte = agora + JANELA_MS;
            r.falhas = 0;
        }
    }

    /** Limpa o registo da conta após login bem-sucedido. */
    public void limpar(String email) {
        registos.remove(normalizar(email));
    }

    private String normalizar(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }
}
