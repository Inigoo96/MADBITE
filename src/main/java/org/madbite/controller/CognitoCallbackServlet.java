package org.madbite.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Servlet para intercambiar el authorization-code de Cognito
 * por tokens (id_token, access_token, refresh_token).
 *
 * Endpoint: POST /back/cognito/callback
 */
@WebServlet(name = "CognitoCallbackServlet", urlPatterns = "/cognito/callback")
public class CognitoCallbackServlet extends HttpServlet {
    private static final Logger     LOGGER          = Logger.getLogger(CognitoCallbackServlet.class.getName());
    private static final String     CLIENT_ID       = "6omlacb6fjdnimu8dalu81ft0r";
    private static final String     CLIENT_SECRET   = "r3a3i2crbscfmbfr01v36s6mtajc036lohr4ibq4c8ui9918qfp";
    private static final String     REDIRECT_URI    = "http://localhost:3007/html/callback";
    private static final String     TOKEN_ENDPOINT  =
            "https://us-east-19ns1g8vpk.auth.us-east-1.amazoncognito.com/oauth2/token";
    private static final String     ORIGIN_ALLOWED  = "http://localhost:3007";

    private final ObjectMapper      mapper          = new ObjectMapper();
    private final ObjectWriter      prettyPrinter   = mapper.writerWithDefaultPrettyPrinter();
    private final TypeReference<Map<String,String>> mapType =
            new TypeReference<>() {};

    // -----------------------------------
    // CORS
    // -----------------------------------
    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) {
        handleCors(resp);
        // No body needed for OPTIONS
    }

    private void handleCors(HttpServletResponse resp) {
        resp.setHeader("Access-Control-Allow-Origin",  ORIGIN_ALLOWED);
        resp.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }

    // -----------------------------------
    // GET (debug) & POST (producción)
    // -----------------------------------
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        handleCors(resp);
        String code     = req.getParameter("code");
        String verifier = req.getParameter("verifier");
        if (isBlank(code) || isBlank(verifier)) {
            sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Faltan parámetros 'code' o 'verifier'");
            return;
        }
        exchangeCodeForTokens(code, verifier, resp);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        handleCors(resp);
        resp.setStatus(HttpServletResponse.SC_OK);

        Map<String,String> body;
        try {
            body = mapper.readValue(req.getInputStream(), mapType);
        } catch (Exception e) {
            LOGGER.log(Level.WARNING, "Error parsing JSON body", e);
            sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "JSON inválido");
            return;
        }

        String code     = body.get("code");
        String verifier = body.get("verifier");
        if (isBlank(code) || isBlank(verifier)) {
            sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Faltan campos 'code' o 'verifier'");
            return;
        }
        exchangeCodeForTokens(code, verifier, resp);
    }

    // -----------------------------------
    // Lógica principal de intercambio
    // -----------------------------------
    private void exchangeCodeForTokens(String code,
                                       String verifier,
                                       HttpServletResponse resp) throws IOException {
        String form = buildFormData(code, verifier);

        HttpURLConnection con = (HttpURLConnection) new URL(TOKEN_ENDPOINT).openConnection();
        con.setRequestMethod("POST");
        con.setDoOutput(true);
        con.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
        if (!CLIENT_SECRET.isBlank()) {
            String creds = CLIENT_ID + ":" + CLIENT_SECRET;
            String basic = java.util.Base64.getEncoder()
                    .encodeToString(creds.getBytes(StandardCharsets.UTF_8));
            con.setRequestProperty("Authorization", "Basic " + basic);
        }

        // Enviar cuerpo
        try (OutputStream os = con.getOutputStream()) {
            os.write(form.getBytes(StandardCharsets.UTF_8));
        }

        // Leer respuesta (stream de error si status >= 400)
        int status = con.getResponseCode();
        try (InputStream is = (status < 400 ? con.getInputStream() : con.getErrorStream())) {
            String raw = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            resp.setContentType("application/json;charset=UTF-8");
            resp.setStatus(status);

            // Pretty-print JSON valid, si no devolver crudo
            try {
                Object json = mapper.readValue(raw, Object.class);
                prettyPrinter.writeValue(resp.getWriter(), json);
            } catch (Exception e) {
                resp.getWriter().write(raw);
            }
        } catch (IOException ioe) {
            LOGGER.log(Level.SEVERE, "Error al leer respuesta de Cognito", ioe);
            sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    "Error interno leyendo respuesta de Cognito");
        } finally {
            con.disconnect();
        }
    }

    // -----------------------------------
    // Utilitarios
    // -----------------------------------
    private String buildFormData(String code, String verifier) {
        return "grant_type=authorization_code" +
                "&client_id="      + encode(CLIENT_ID) +
                "&code="           + encode(code) +
                "&code_verifier="  + encode(verifier) +
                "&redirect_uri="   + encode(REDIRECT_URI);
    }

    private static String encode(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }


    private static void sendError(HttpServletResponse resp, int status, String message) throws IOException {
        resp.setStatus(status);
        resp.setContentType("application/json");
        resp.getWriter().write("{\"error\":\"" + message + "\"}");
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
