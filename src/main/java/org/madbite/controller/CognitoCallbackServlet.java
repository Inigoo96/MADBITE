package org.madbite.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
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
 * Servlet para intercambiar el authorization_code de Cognito
 * por tokens (id_token, access_token, refresh_token).
 */
@WebServlet(name = "CognitoCallbackServlet", urlPatterns = "/cognito/callback")
public class CognitoCallbackServlet extends HttpServlet {

    private static final Logger LOGGER = Logger.getLogger(CognitoCallbackServlet.class.getName());

    private static final String CLIENT_ID      = "6omlacb6fjdnimu8dalu81ft0r";
    private static final String CLIENT_SECRET  = "r3a3i2crbscfmbfr01v36s6mtajc036lohr4ibq4c8ui9918qfp";
    private static final String REDIRECT_URI   = "http://localhost:3007/html/callback";
    private static final String TOKEN_ENDPOINT =
            "https://us-east-19ns1g8vpk.auth.us-east-1.amazoncognito.com/oauth2/token";

    private final ObjectMapper mapper  = new ObjectMapper();
    private final TypeReference<Map<String,String>> mapType = new TypeReference<>() {};

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // El CorsFilter ya habrá puesto todos los headers necesarios
        resp.setContentType("application/json;charset=UTF-8");

        // Leer y validar JSON de body
        Map<String,String> body;
        try (InputStream in = req.getInputStream()) {
            body = mapper.readValue(in, mapType);
        } catch (Exception e) {
            LOGGER.warning("JSON inválido en callback: " + e.getMessage());
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "JSON inválido");
            return;
        }

        String code     = body.get("code");
        String verifier = body.get("verifier");
        if (code == null || verifier == null) {
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "Faltan campos 'code' o 'verifier'");
            return;
        }

        // Realizar POST a /oauth2/token de Cognito
        String form = "grant_type=authorization_code"
                + "&client_id="      + URLEncoder.encode(CLIENT_ID, StandardCharsets.UTF_8)
                + "&code="           + URLEncoder.encode(code, StandardCharsets.UTF_8)
                + "&code_verifier="  + URLEncoder.encode(verifier, StandardCharsets.UTF_8)
                + "&redirect_uri="   + URLEncoder.encode(REDIRECT_URI, StandardCharsets.UTF_8);

        HttpURLConnection con = (HttpURLConnection) new URL(TOKEN_ENDPOINT).openConnection();
        con.setRequestMethod("POST");
        con.setDoOutput(true);
        con.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
        // Autenticación Basic
        String creds = CLIENT_ID + ":" + CLIENT_SECRET;
        String basic = java.util.Base64
                .getEncoder()
                .encodeToString(creds.getBytes(StandardCharsets.UTF_8));
        con.setRequestProperty("Authorization", "Basic " + basic);

        try (OutputStream os = con.getOutputStream()) {
            os.write(form.getBytes(StandardCharsets.UTF_8));
        }

        int status = con.getResponseCode();
        try (InputStream is = (status < 400 ? con.getInputStream() : con.getErrorStream())) {
            String raw = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            resp.setStatus(status);
            // Intentar formatear JSON, sino devolver crudo
            try {
                Object json = mapper.readValue(raw, Object.class);
                mapper.writerWithDefaultPrettyPrinter().writeValue(resp.getWriter(), json);
            } catch (Exception e) {
                resp.getWriter().write(raw);
            }
        } finally {
            con.disconnect();
        }
    }

    // GET para debug (opcional)
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        doPost(req, resp);
    }
}
