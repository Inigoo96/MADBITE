package org.madbite.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.logging.Logger;

/**
 * Endpoint único para el flujo OAuth2-PKCE con Amazon Cognito.
 * <ul>
 *   <li><b>GET</b>  – recibe el redireccionamiento de Cognito con<code>?code=…</code>
 *                    y reenruta al SPA (<code>callback.html</code>) conservando
 *                    la query string.</li>
 *   <li><b>POST</b> – servicio interno: intercambia el <i>authorization_code</i>
 *                    + <i>code_verifier</i> por <i>tokens</i>.</li>
 * </ul>
 */
@WebServlet(name = "CognitoCallbackServlet", urlPatterns = "/cognito/callback")
public class CognitoCallbackServlet extends HttpServlet {

    private static final Logger LOGGER = Logger.getLogger(CognitoCallbackServlet.class.getName());

    // === Configuración — manténgalo sincronizado con auth.js ==================
    private static final String CLIENT_ID      = "6omlacb6fjdnimu8dalu81ft0r";
    private static final String CLIENT_SECRET  = "r3a3i2crbscfmbfr01v36s6mtajc036lohr4ibq4c8ui9918qfp";
    private static final String REDIRECT_URI   = "http://localhost:8090/back/cognito/callback";
    private static final String TOKEN_ENDPOINT = "https://us-east-19ns1g8vpk.auth.us-east-1.amazoncognito.com/oauth2/token";

    private static final ObjectMapper MAPPER          = new ObjectMapper();
    private static final TypeReference<Map<String,String>> MAP_TYPE = new TypeReference<>(){};

    /* -------------------------------------------------------------------- */
    /* 1 · GET → reenviar al SPA                                            */
    /* -------------------------------------------------------------------- */
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // Mantener la query (code, state…) y enviar al recurso estático
        String qs = req.getQueryString();
        String target = req.getContextPath() + "/html/callback.html" + (qs != null ? "?" + qs : "");
        LOGGER.info(() -> "Redirigiendo GET /cognito/callback → " + target);
        resp.sendRedirect(target);
    }

    /* -------------------------------------------------------------------- */
    /* 2 · POST → intercambio de tokens                                     */
    /* -------------------------------------------------------------------- */
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // CORS para el fetch del front
        resp.setHeader("Access-Control-Allow-Origin", "http://localhost:8090");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type");
        // Preflight
        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) return;

        resp.setContentType("application/json;charset=UTF-8");

        // Leer body JSON
        Map<String,String> body;
        try (InputStream in = req.getInputStream()) {
            body = MAPPER.readValue(in, MAP_TYPE);
        } catch (Exception e) {
            LOGGER.warning("JSON inválido: " + e.getMessage());
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "JSON inválido");
            return;
        }

        String code     = body.get("code");
        String verifier = body.get("verifier");
        if (code == null || verifier == null) {
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "Faltan 'code' o 'verifier'");
            return;
        }

        LOGGER.info(() -> "Intercambiando code=" + code + " (verifier=" + verifier.substring(0,8) + "…)");

        // Construir formulario x-www-form-urlencoded
        String form = "grant_type=authorization_code" +
                "&client_id="     + URLEncoder.encode(CLIENT_ID,     StandardCharsets.UTF_8) +
                "&code="          + URLEncoder.encode(code,          StandardCharsets.UTF_8) +
                "&code_verifier=" + URLEncoder.encode(verifier,       StandardCharsets.UTF_8) +
                "&redirect_uri="  + URLEncoder.encode(REDIRECT_URI,   StandardCharsets.UTF_8);

        HttpURLConnection con = (HttpURLConnection) new URL(TOKEN_ENDPOINT).openConnection();
        con.setRequestMethod("POST");
        con.setDoOutput(true);
        con.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
        String basic = java.util.Base64.getEncoder().encodeToString((CLIENT_ID + ':' + CLIENT_SECRET).getBytes(StandardCharsets.UTF_8));
        con.setRequestProperty("Authorization", "Basic " + basic);

        try (OutputStream os = con.getOutputStream()) {
            os.write(form.getBytes(StandardCharsets.UTF_8));
        }

        int status = con.getResponseCode();
        try (InputStream is = status < 400 ? con.getInputStream() : con.getErrorStream()) {
            String raw = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            resp.setStatus(status);
            try { // Formatear JSON si procede
                Object json = MAPPER.readValue(raw, Object.class);
                MAPPER.writerWithDefaultPrettyPrinter().writeValue(resp.getWriter(), json);
            } catch (Exception e) {
                resp.getWriter().write(raw);
            }
        } finally {
            con.disconnect();
        }
    }
}