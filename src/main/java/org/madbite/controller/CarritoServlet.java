// src/main/java/org/madbite/controller/CarritoServlet.java
package org.madbite.controller;

import com.fasterxml.jackson.core.type.TypeReference;
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

@WebServlet(name="CarritoServlet", urlPatterns={"/api/carrito/*"})
public class CarritoServlet extends HttpServlet {

    private CarritoService service;
    private ObjectMapper   mapper;
    private static final TypeReference<Map<String,Integer>> INT_MAP = new TypeReference<>() {};

    @Override
    public void init() throws ServletException {
        var ctx     = getServletContext();
        this.service = (CarritoService) ctx.getAttribute("carritoService");
        this.mapper  = (ObjectMapper)    ctx.getAttribute("jsonMapper");
        if (service == null || mapper == null) {
            throw new ServletException("CarritoService u ObjectMapper no inicializados");
        }
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        enableCors(resp);
        resp.setStatus(HttpServletResponse.SC_OK);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        enableCors(resp);
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        Map<String,Integer> body;
        try {
            body = mapper.readValue(req.getInputStream(), INT_MAP);
        } catch (Exception e) {
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "JSON inválido");
            return;
        }

        Integer prod = body.get("productoId");
        Integer cnt  = body.get("cantidad");
        if (prod == null || cnt == null) {
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "productoId y cantidad son obligatorios");
            return;
        }

        String sub;
        try {
            sub = getUserSub(req);
        } catch (ServletException e) {
            resp.sendError(HttpServletResponse.SC_UNAUTHORIZED, e.getMessage());
            return;
        }
        String email  = (String) req.getAttribute("email");
        String nombre = (String) req.getAttribute("nombre");

        try {
            int lineaId = service.addLinea(sub, email, nombre, prod, cnt);
            resp.setStatus(HttpServletResponse.SC_CREATED);
            mapper.writeValue(resp.getWriter(), Map.of("lineaId", lineaId));
        } catch (SQLException e) {
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error de BD");
        }
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        enableCors(resp);
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        String sub;
        try {
            sub = getUserSub(req);
        } catch (ServletException e) {
            resp.sendError(HttpServletResponse.SC_UNAUTHORIZED, e.getMessage());
            return;
        }

        try {
            List<LineaPedido> lineas = service.verCarrito(sub);
            double total = lineas.stream()
                    .mapToDouble(l -> l.getCantidad() * l.getPrecioUnitario())
                    .sum();
            mapper.writeValue(resp.getWriter(), Map.of("lineas", lineas, "total", total));
        } catch (SQLException e) {
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error leyendo carrito");
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        enableCors(resp);
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        String path = req.getPathInfo();
        if (path == null || path.length() < 2) {
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "ID de línea vacío");
            return;
        }
        int lineaId;
        try {
            lineaId = Integer.parseInt(path.substring(1));
        } catch (NumberFormatException e) {
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "ID de línea inválido");
            return;
        }

        Map<String,Integer> body;
        try {
            body = mapper.readValue(req.getInputStream(), INT_MAP);
        } catch (Exception e) {
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "JSON inválido");
            return;
        }
        Integer cnt = body.get("cantidad");
        if (cnt == null) {
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "cantidad es obligatoria");
            return;
        }

        try {
            service.actualizarLinea(lineaId, cnt);
            resp.setStatus(HttpServletResponse.SC_NO_CONTENT);
        } catch (SQLException e) {
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error actualizando línea");
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        enableCors(resp);

        String path = req.getPathInfo();
        if (path == null || path.length() < 2) {
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "ID de línea vacío");
            return;
        }
        int lineaId;
        try {
            lineaId = Integer.parseInt(path.substring(1));
        } catch (NumberFormatException e) {
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "ID de línea inválido");
            return;
        }

        try {
            service.eliminarLinea(lineaId);
            resp.setStatus(HttpServletResponse.SC_NO_CONTENT);
        } catch (SQLException e) {
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error eliminando línea");
        }
    }

    private String getUserSub(HttpServletRequest req) throws ServletException {
        Object sub = req.getAttribute("sub");
        if (sub instanceof String) return (String) sub;
        throw new ServletException("JWT 'sub' inválido o no presente");
    }

    private void enableCors(HttpServletResponse resp) {
        resp.setHeader("Access-Control-Allow-Origin",  "http://localhost:3007");
        resp.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }
}
