package org.madbite.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@WebServlet("/cognito/refresh")
public class CognitoRefreshServlet extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        try {
            // Obtener el refresh_token del body
            ObjectMapper mapper = new ObjectMapper();
            JsonNode node = mapper.readTree(req.getReader());
            String refreshToken = node.get("refresh_token").asText();

            // Enviar solicitud a Cognito para refrescar tokens
            // Implementar aquí tu lógica de refresh con Cognito
            // ...

            // Devolver nuevos tokens
            resp.setContentType("application/json");
            resp.getWriter().write("{\"id_token\":\"...\",\"access_token\":\"...\",\"expires_in\":3600}");
        } catch (Exception e) {
            resp.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Error al refrescar token");
        }
    }
}