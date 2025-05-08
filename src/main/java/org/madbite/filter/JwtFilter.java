package org.madbite.filter;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.proc.JWSKeySelector;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.proc.ConfigurableJWTProcessor;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.net.URL;
import java.util.List;

public class JwtFilter implements Filter {

    // URL de jwks.json de tu User Pool de Cognito
    private static final String JWKS_URL =
            "https://cognito-idp.us-east-1.amazonaws.com/19ns1g8vpk/.well-known/jwks.json";

    private ConfigurableJWTProcessor<SecurityContext> jwtProcessor;

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        try {
            // Configuración del processor con JWK Set remoto
            JWKSource<SecurityContext> keySource = new RemoteJWKSet<>(
                    new URL(JWKS_URL));
            JWSKeySelector<SecurityContext> keySelector =
                    new JWSVerificationKeySelector<>(JWSAlgorithm.RS256, keySource);

            jwtProcessor = new DefaultJWTProcessor<>();
            jwtProcessor.setJWSKeySelector(keySelector);
        } catch (Exception e) {
            throw new ServletException("Error inicializando JwtFilter", e);
        }
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res,
                         FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest  request  = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;
        String path = request.getRequestURI();

        // EXCLUSIONES: deja pasar login, callback y GET público de catálogo
        List<String> publicPaths = List.of(
                "/cognito/callback",
                "/api/menu"
        );
        if (publicPaths.stream().anyMatch(path::startsWith) ||
                ("GET".equals(request.getMethod()) && path.startsWith("/api/menu"))) {
            chain.doFilter(req, res);
            return;
        }

        // Obtener token del header Authorization
        String auth = request.getHeader("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Falta token JWT");
            return;
        }
        String token = auth.substring(7);

        try {
            // Procesa y valida firma y claims
            JWTClaimsSet claims = jwtProcessor.process(token, null);
            // (Opcional) adjunta claims a la request para servlets posteriores
            request.setAttribute("jwtClaims", claims);
            chain.doFilter(req, res);
        } catch (Exception e) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token inválido: " + e.getMessage());
        }
    }

    @Override
    public void destroy() { }
}
