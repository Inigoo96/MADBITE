package org.madbite.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;          // <--- Añadido
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import org.madbite.model.LineaPedido;
import org.madbite.service.CarritoService;

import java.io.IOException;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

@WebServlet(name = "CarritoServlet", urlPatterns = "/api/carrito/*")
public class CarritoServlet extends HttpServlet {

    private CarritoService service;
    private ObjectMapper   mapper;
    // Reutilizamos un TypeReference para Map<String,Integer>
    private static final TypeReference<Map<String,Integer>> INT_MAP =
            new TypeReference<>() {};

    @Override
    public void init() throws ServletException {
        var ctx    = getServletContext();
        service    = (CarritoService) ctx.getAttribute("carritoService");
        mapper     = (ObjectMapper)    ctx.getAttribute("jsonMapper");
        if (service == null || mapper == null) {
            throw new ServletException("CarritoService u ObjectMapper no inicializados");
        }
    }

    private String getUserSub(HttpServletRequest req) throws ServletException {
        var sub = req.getAttribute("sub");
        if (sub instanceof String) {
            return (String) sub;
        }
        throw new ServletException("JWT 'sub' inválido o no presente");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            // Ahora leemos un Map<String,Integer>
            Map<String,Integer> body = mapper.readValue(req.getInputStream(), INT_MAP);
            Integer prod          = body.get("productoId");
            Integer cnt           = body.get("cantidad");
            if (prod == null || cnt == null) {
                resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "productoId y cantidad son obligatorios");
                return;
            }

            String sub    = getUserSub(req);
            String email  = (String) req.getAttribute("email");
            String nombre = (String) req.getAttribute("nombre");

            int lineaId = service.addLinea(sub, email, nombre, prod, cnt);
            resp.setStatus(HttpServletResponse.SC_CREATED);
            resp.setContentType("application/json");
            mapper.writeValue(resp.getOutputStream(), Map.of("lineaId", lineaId));

        } catch (JsonProcessingException e) {
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "JSON inválido");
        } catch (SQLException e) {
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error BD");
        } catch (ServletException e) {
            resp.sendError(HttpServletResponse.SC_UNAUTHORIZED, e.getMessage());
        }
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            String sub = getUserSub(req);
            List<LineaPedido> lineas = service.verCarrito(sub);
            double total = lineas.stream()
                    .mapToDouble(l -> l.getCantidad() * l.getPrecioUnitario())
                    .sum();
            resp.setContentType("application/json");
            mapper.writeValue(resp.getOutputStream(), Map.of("lineas", lineas, "total", total));

        } catch (SQLException e) {
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error leyendo carrito");
        } catch (ServletException e) {
            resp.sendError(HttpServletResponse.SC_UNAUTHORIZED, e.getMessage());
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        if (path == null || path.length() < 2) {
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "ID de línea vacío");
            return;
        }
        try {
            int lineaId = Integer.parseInt(path.substring(1));
            service.eliminarLinea(lineaId);
            resp.setStatus(HttpServletResponse.SC_NO_CONTENT);
        } catch (NumberFormatException e) {
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "ID de línea inválido");
        } catch (SQLException e) {
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error eliminando línea");
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        if (path == null || path.length() < 2) {
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "ID de línea vacío");
            return;
        }
        try {
            int lineaId = Integer.parseInt(path.substring(1));
            // De nuevo usamos el TypeReference para leer cantidad
            Map<String,Integer> body = mapper.readValue(req.getInputStream(), INT_MAP);
            Integer cnt = body.get("cantidad");
            if (cnt == null) {
                resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "cantidad es obligatoria");
                return;
            }
            service.actualizarLinea(lineaId, cnt);
            resp.setStatus(HttpServletResponse.SC_NO_CONTENT);

        } catch (NumberFormatException e) {
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "ID de línea inválido");
        } catch (SQLException e) {
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error actualizando línea");
        }
    }
}
