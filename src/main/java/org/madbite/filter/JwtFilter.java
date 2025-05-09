package org.madbite.filter;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.proc.BadJOSEException;
import com.nimbusds.jose.proc.JWSKeySelector;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jwt.JWT;
import com.nimbusds.jwt.JWTParser;
import com.nimbusds.jwt.proc.*;
import com.nimbusds.jwt.JWTClaimsSet;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.net.URL;
import java.text.ParseException;
import java.util.Date;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

public class JwtFilter implements Filter {
    private static final Logger LOGGER = Logger.getLogger(JwtFilter.class.getName());

    // JWKS endpoint de tu User Pool
    private static final String JWKS_URL =
            "https://us-east-19ns1g8vpk.auth.us-east-1.amazoncognito.com/.well-known/jwks.json";

    // Valores esperados para la validación
    private static final String EXPECTED_ISSUER =
            "https://cognito-idp.us-east-1.amazonaws.com/us-east-19ns1g8vpk";
    private static final String EXPECTED_AUDIENCE = "6omlacb6fjdnimu8dalu81ft0r"; // client_id de Cognito

    private ConfigurableJWTProcessor<SecurityContext> jwtProcessor;

    @Override
    public void init(FilterConfig filterConfig) {
        // Configura el processor con Remote JWK set
        jwtProcessor = new DefaultJWTProcessor<>();
        try {
            JWKSource<SecurityContext> keySource =
                    new RemoteJWKSet<>(new URL(JWKS_URL));
            JWSKeySelector<SecurityContext> keySelector =
                    new JWSVerificationKeySelector<>(JWSAlgorithm.RS256, keySource);
            jwtProcessor.setJWSKeySelector(keySelector);

            // Añadir verificador de claims personalizado
            jwtProcessor.setJWTClaimsSetVerifier((claims, context) -> {
                // Verificar issuer
                String issuer = claims.getIssuer();
                if (issuer == null || !issuer.equals(EXPECTED_ISSUER)) {
                    LOGGER.warning("[JwtFilter] Issuer inválido: " + issuer);
                    throw new BadJWTException("Issuer inválido");
                }

                // Verificar audience (puede ser una lista en algunos tokens)
                List<String> audiences = claims.getAudience();
                if (audiences == null || !audiences.contains(EXPECTED_AUDIENCE)) {
                    LOGGER.warning("[JwtFilter] Audience inválido: " + audiences);
                    throw new BadJWTException("Audience inválido");
                }

                // Verificar token_use (para Cognito, debería ser 'access')
                String tokenUse = null;
                try {
                    tokenUse = claims.getStringClaim("token_use");
                } catch (ParseException e) {
                    LOGGER.warning("[JwtFilter] Error al obtener token_use: " + e.getMessage());
                }

                if (!"access".equals(tokenUse)) {
                    LOGGER.warning("[JwtFilter] token_use inválido: " + tokenUse);
                    throw new BadJWTException("token_use inválido, se esperaba 'access'");
                }

                // Verificar expiración (aunque el JWT processor ya lo hace por defecto)
                Date now = new Date();
                Date exp = claims.getExpirationTime();
                if (exp == null || exp.before(now)) {
                    LOGGER.warning("[JwtFilter] Token expirado");
                    throw new BadJWTException("Token expirado");
                }
            });

            // Permitir un desfase de reloj de 60 segundos
            DefaultJWTClaimsVerifier<SecurityContext> defaultVerifier =
                    new DefaultJWTClaimsVerifier<>();
            defaultVerifier.setMaxClockSkew(60); // 60 segundos de margen

            LOGGER.info("[JwtFilter] Inicializado correctamente");
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error inicializando JwtFilter", e);
            throw new RuntimeException("Error inicializando JwtFilter", e);
        }
    }

    // Método auxiliar para debug
    private void logTokenInfo(String token) {
        try {
            JWT jwt = JWTParser.parse(token);
            JWTClaimsSet claims = jwt.getJWTClaimsSet();

            LOGGER.info("[JwtFilter] Token parsing:");
            LOGGER.info("  - Sub: " + claims.getSubject());
            LOGGER.info("  - Issuer: " + claims.getIssuer());
            LOGGER.info("  - Audience: " + claims.getAudience());
            LOGGER.info("  - Expiration: " + claims.getExpirationTime());
            LOGGER.info("  - token_use: " + claims.getStringClaim("token_use"));

            // Verificar si estamos usando el token correcto
            String tokenUse = claims.getStringClaim("token_use");
            if (!"access".equals(tokenUse)) {
                LOGGER.warning("[JwtFilter] ⚠️ Se está usando un token que no es de tipo 'access'");
            }

            // Verificar expiración
            Date now = new Date();
            Date exp = claims.getExpirationTime();
            if (exp != null && exp.before(now)) {
                LOGGER.warning("[JwtFilter] Token expirado desde: " + exp);
            }
        } catch (Exception e) {
            LOGGER.log(Level.WARNING, "Error al parsear token para debug", e);
        }
    }

    @Override
    public void doFilter(
            ServletRequest req,
            ServletResponse res,
            FilterChain chain
    ) throws IOException, ServletException {
        HttpServletRequest  request  = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        // Log para depuración
        LOGGER.info("[JwtFilter] Procesando petición: " + request.getMethod() + " " + request.getRequestURI());

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            LOGGER.warning("[JwtFilter] Falta o mal formato de token");
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Falta token");
            return;
        }

        String token = authHeader.substring(7);
        // Log para depuración
        LOGGER.info("[JwtFilter] Token recibido: " + token.substring(0, Math.min(20, token.length())) + "...");
        logTokenInfo(token);

        try {
            // Procesa y valida firma + expiración + claims
            JWTClaimsSet claims = jwtProcessor.process(token, null);
            LOGGER.info("[JwtFilter] Token válido, sub=" + claims.getSubject());

            // Inyecta atributos para tus servlets
            request.setAttribute("sub", claims.getSubject());

            // Manejo seguro de claims opcionales
            try {
                request.setAttribute("email", claims.getStringClaim("email"));
            } catch (ParseException e) {
                LOGGER.fine("[JwtFilter] Email no encontrado en token");
                request.setAttribute("email", null);
            }

            try {
                request.setAttribute("nombre", claims.getStringClaim("name"));
            } catch (ParseException e) {
                LOGGER.fine("[JwtFilter] Nombre no encontrado en token");
                request.setAttribute("nombre", null);
            }

            chain.doFilter(request, response);
        } catch (ParseException e) {
            LOGGER.log(Level.WARNING, "[JwtFilter] Error parseando token", e);
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token malformado");
        } catch (BadJOSEException e) {
            LOGGER.log(Level.WARNING, "[JwtFilter] Error validando token", e);
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token inválido: " + e.getMessage());
        } catch (Exception e) {
            LOGGER.log(Level.WARNING, "[JwtFilter] Error inesperado", e);
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Error validando token");
        }
    }

    @Override
    public void destroy() {
        // Liberar recursos del jwtProcessor si es necesario
        try {
            // En este caso, no hay recursos que necesiten ser liberados explícitamente
            // ya que RemoteJWKSet gestiona internamente sus conexiones
            LOGGER.info("[JwtFilter] Destruyendo filtro JWT");
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "[JwtFilter] Error durante la destrucción del filtro", e);
        }
    }

    /**
     * Método auxiliar para refrescar la caché de claves JWK
     * Útil para llamar periódicamente o cuando se detecten problemas de validación
     */
    public void refreshJwkCache() {
        try {
            // Recrear el JWK Source para forzar una actualización de claves
            JWKSource<SecurityContext> keySource = new RemoteJWKSet<>(new URL(JWKS_URL));
            JWSKeySelector<SecurityContext> keySelector =
                    new JWSVerificationKeySelector<>(JWSAlgorithm.RS256, keySource);
            jwtProcessor.setJWSKeySelector(keySelector);
            LOGGER.info("[JwtFilter] Caché de claves JWK actualizada correctamente");
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "[JwtFilter] Error al refrescar caché de claves JWK", e);
        }
    }

    /**
     * Método para validar y extraer información de un token sin verificar la firma
     * Útil solo para debugging, NO usar para autenticación real
     * @param token El token JWT a decodificar
     * @return Las claims del token, sin verificar firma
     */
    public static JWTClaimsSet parseTokenUnsafe(String token) {
        try {
            JWT jwt = JWTParser.parse(token);
            return jwt.getJWTClaimsSet();
        } catch (Exception e) {
            LOGGER.log(Level.WARNING, "[JwtFilter] Error parseando token", e);
            return null;
        }
    }

    /**
     * Método para crear un endpoint de diagnóstico de token
     * Puede ser útil exponer en desarrollo para verificar la validación de tokens
     * @param request La solicitud HTTP
     * @param response La respuesta HTTP donde escribir el resultado
     * @throws IOException Si hay error al escribir la respuesta
     */
    public void diagnosticEndpoint(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        String authHeader = request.getHeader("Authorization");
        response.setContentType("application/json");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.getWriter().write("{\"error\":\"No se proporcionó token\"}");
            return;
        }

        String token = authHeader.substring(7);
        try {
            // Primero parsear sin verificar para diagnóstico
            JWTClaimsSet unsafeInfo = parseTokenUnsafe(token);

            StringBuilder result = new StringBuilder();
            result.append("{");
            result.append("\"token_info\":{");
            if (unsafeInfo != null) {
                try {
                    result.append("\"sub\":\"").append(unsafeInfo.getSubject() != null ? unsafeInfo.getSubject() : "").append("\",");
                    result.append("\"iss\":\"").append(unsafeInfo.getIssuer() != null ? unsafeInfo.getIssuer() : "").append("\",");
                    result.append("\"exp\":\"").append(unsafeInfo.getExpirationTime() != null ? unsafeInfo.getExpirationTime() : "").append("\",");

                    // Para token_use, manejar la posible ParseException
                    String tokenUse = "";
                    try {
                        tokenUse = unsafeInfo.getStringClaim("token_use");
                        tokenUse = (tokenUse != null) ? tokenUse : "";
                    } catch (ParseException e) {
                        // Si hay error, dejarlo vacío
                    }
                    result.append("\"token_use\":\"").append(tokenUse).append("\",");

                    // Para email, manejar la posible ParseException
                    String email = "N/A";
                    try {
                        String tempEmail = unsafeInfo.getStringClaim("email");
                        email = (tempEmail != null) ? tempEmail : "N/A";
                    } catch (ParseException e) {
                        // Mantener el valor por defecto
                    }
                    result.append("\"email\":\"").append(email).append("\"");
                } catch (Exception e) {
                    result.append("\"error\":\"Error al extraer datos del token: ").append(e.getMessage()).append("\"");
                }
            } else {
                result.append("\"error\":\"No se pudo parsear el token\"");
            }
            result.append("},");

            // Ahora intentar la validación completa
            try {
                JWTClaimsSet validClaims = jwtProcessor.process(token, null);
                result.append("\"validation\":{\"valid\":true,\"sub\":\"").append(validClaims.getSubject()).append("\"}");
            } catch (Exception e) {
                result.append("\"validation\":{\"valid\":false,\"error\":\"")
                        .append(e.getMessage().replace("\"", "\\\""))
                        .append("\"}");
            }

            result.append("}");
            response.getWriter().write(result.toString());
        } catch (Exception e) {
            response.getWriter().write("{\"error\":\"" + e.getMessage().replace("\"", "\\\"") + "\"}");
        }
    }
}