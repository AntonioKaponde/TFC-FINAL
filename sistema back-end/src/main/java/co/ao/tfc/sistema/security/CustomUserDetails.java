package co.ao.tfc.sistema.security;

import co.ao.tfc.sistema.model.Usuario;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@AllArgsConstructor
public class CustomUserDetails implements UserDetails {

    @Getter
    private final Usuario usuario;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return usuario.getPerfilRoles().stream()
                .flatMap(role -> {
                    Stream<SimpleGrantedAuthority> permissoes = role.getPermissoes().stream()
                            .map(permissao -> new SimpleGrantedAuthority(permissao.name()));
                    Stream<SimpleGrantedAuthority> roleName = Stream.of(
                            new SimpleGrantedAuthority("ROLE_" + role.getNome().toUpperCase())
                    );
                    return Stream.concat(permissoes, roleName);
                })
                .collect(Collectors.toList());
    }

    @Override
    public String getPassword() {
        return usuario.getPassword();
    }

    @Override
    public String getUsername() {
        return usuario.getEmail(); // Usando email como username
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return usuario.isAtivo();
    }
}
