package org.madbite.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

/**
 *  /back/cognito/callback  (la ruta real será   http://localhost:8090/back/cognito/callback)
 *
 *  Recibe:
 *     {
 *       "code"    : "AAA.BBB.CCC",
 *       "verifier": "pkce-verifier-base64url"
 *     }
 *
 *  Intercambia el authorization-code por tokens en el endpoint  /oauth2/token
 *  y devuelve el JSON de Cognito al front-end.
 */
@WebServlet(name = "CognitoCallbackServlet",
        urlPatterns = "/cognito/callback")           // → /back + /cognito/callback
public class CognitoCallbackServlet extends HttpServlet {

    /*  💡  Configura aquí tus datos  ─────────────────────────── */
    private static final String CLIENT_ID     = "6omlacb6fjdnimu8dalu81ft0r";
    private static final String CLIENT_SECRET = "r3a3i2crbscfmbfr01v36s6mtajc036lohr4ibq4c8ui9918qfp";   // ← si tu app client NO lleva secret, déjalo vacío
    private static final String REDIRECT_URI  = "http://localhost:3007/html/menu";
    private static final String TOKEN_ENDPOINT = "https://us-east-19ns1g8vpk.auth.us-east-1.amazoncognito.com/oauth2/token";
    /* ─────────────────────────────────────────────────────────── */

    private final ObjectMapper mapper  = new ObjectMapper();
    private final ObjectWriter pretty = mapper.writerWithDefaultPrettyPrinter();

    /* ::::::::::::::::::::::::::::::::  POST (recomendado)  ::::::::::::::::::::::::::::::: */
    @Override protected void doPost(HttpServletRequest req,
                                    HttpServletResponse resp) throws IOException {

        Map<String,String> body = readJsonBody(req);           // {code, verifier}

        String code     = body.get("code");
        String verifier = body.get("verifier");

        if (isBlank(code) || isBlank(verifier)) {
            sendError(resp, 400, "Missing 'code' or 'verifier' field");
            return;
        }

        exchangeCodeForTokens(code, verifier, resp);
    }

    /* ::::::::::::::::::::::::::::::::  GET (solo para debug)  ::::::::::::::::::::::::::::: */
    @Override protected void doGet(HttpServletRequest req,
                                   HttpServletResponse resp) throws IOException {

        String code     = req.getParameter("code");
        String verifier = req.getParameter("verifier");

        if (isBlank(code) || isBlank(verifier)) {
            sendError(resp, 400, "Missing code or verifier query parameter");
            return;
        }
        exchangeCodeForTokens(code, verifier, resp);
    }

    /* =======================  Lógica principal  ======================= */
    private void exchangeCodeForTokens(String code,
                                       String verifier,
                                       HttpServletResponse resp) throws IOException {

        /* Construimos el cuerpo x-www-form-urlencoded */
        String postData =
                "grant_type=authorization_code" +
                        "&client_id="      + url(CLIENT_ID) +
                        "&code="           + url(code) +
                        "&code_verifier="  + url(verifier) +
                        "&redirect_uri="   + url(REDIRECT_URI);

        /* Conexión HTTP → Cognito -------------------------------------------------------- */
        HttpURLConnection con = (HttpURLConnection) new URL(TOKEN_ENDPOINT).openConnection();
        con.setRequestMethod("POST");
        con.setDoOutput(true);
        con.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");

        /* Auth header sólo si existe client_secret (app confidencial)      */
        if (!CLIENT_SECRET.isBlank()) {
            String basic = java.util.Base64.getEncoder()
                    .encodeToString((CLIENT_ID + ':' + CLIENT_SECRET).getBytes(StandardCharsets.UTF_8));
            con.setRequestProperty("Authorization", "Basic " + basic);
        }

        try (OutputStream os = con.getOutputStream()) {
            os.write(postData.getBytes(StandardCharsets.UTF_8));
        }

        /* Leemos respuesta de Cognito ---------------------------------------------------- */
        int status = con.getResponseCode();
        InputStream is = status < 400 ? con.getInputStream() : con.getErrorStream();
        String raw = new String(is.readAllBytes(), StandardCharsets.UTF_8);

        resp.setContentType("application/json;charset=UTF-8");
        resp.setStatus(status);

        /* Si es JSON bien formado lo “pretty-print”, si no se envía tal cual */
        try {
            Object json = mapper.readValue(raw, Object.class);
            pretty.writeValue(resp.getWriter(), json);
        } catch (Exception notJson) {
            resp.getWriter().write(raw);
        }
    }

    /* =======================  Utils  ======================= */
    private Map<String,String> readJsonBody(HttpServletRequest req) throws IOException {
        try (InputStream in = req.getInputStream()) {
            return mapper.readValue(in, Map.class);
        }
    }
    private static void sendError(HttpServletResponse r, int code, String msg) throws IOException {
        r.setStatus(code);
        r.setContentType("application/json");
        r.getWriter().write("{\"error\":\"" + msg + "\"}");
    }
    private static boolean isBlank(String s) { return s == null || s.isBlank(); }
    private static String url(String s)      throws UnsupportedEncodingException {
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }
}
