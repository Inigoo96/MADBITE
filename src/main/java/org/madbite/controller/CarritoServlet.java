package org.madbite.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletContext;
import org.madbite.model.LineaPedido;
import org.madbite.service.CarritoService;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

/**
 * Servlet que gestiona el carrito de compras:
 * POST  /api/carrito        → añade línea
 * GET    /api/carrito        → muestra carrito
 * PUT    /api/carrito/{id}   → actualiza cantidad
 * DELETE /api/carrito/{id}   → elimina línea
 */
@WebServlet(name = "CarritoServlet", urlPatterns = "/api/carrito/*")
public class CarritoServlet extends HttpServlet {

    private CarritoService service;
    private ObjectMapper mapper;

    @Override
    public void init() throws ServletException {
        ServletContext ctx = getServletContext();
        service = (CarritoService) ctx.getAttribute("carritoService");
        mapper  = (ObjectMapper)   ctx.getAttribute("jsonMapper");
        if (service == null || mapper == null) {
            throw new ServletException("CarritoService o ObjectMapper no inicializados");
        }
    }

    /**
     * Extrae el 'sub' del JWT (previamente validado por JwtFilter).
     * En modo desarrollo, si no existe atributo 'sub', devolverá 1.
     */
    private int getUserSub(HttpServletRequest req) throws ServletException {
        Object sub = req.getAttribute("sub");
        if (sub instanceof Integer) {
            return (Integer) sub;
        }
        if (sub instanceof String) {
            try {
                return Integer.parseInt((String) sub);
            } catch (NumberFormatException e) {
                throw new ServletException("JWT 'sub' inválido", e);
            }
        }
        // Fallback DEV: asumimos usuario with ID = 1
        return 1;
    }


    /** Responde a los preflight CORS. */
    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) {
        resp.setHeader("Access-Control-Allow-Origin", "*");
        resp.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        resp.setStatus(HttpServletResponse.SC_NO_CONTENT);
    }

    /** Añade una línea al carrito. */
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            Map<String, Integer> body = mapper.readValue(req.getInputStream(), Map.class);
            Integer prodId = body.get("productoId");
            Integer cantidad = body.get("cantidad");
            if (prodId == null || cantidad == null) {
                resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "productoId y cantidad son obligatorios");
                return;
            }
            int userSub = getUserSub(req);
            int lineaId = service.addLinea(userSub, prodId, cantidad);
            resp.setStatus(HttpServletResponse.SC_CREATED);
            resp.setContentType("application/json");
            mapper.writeValue(resp.getOutputStream(), Map.of("lineaId", lineaId));
        } catch (JsonProcessingException e) {
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "JSON inválido");
        } catch (SQLException e) {
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error al acceder a la base de datos");
        } catch (ServletException e) {
            resp.sendError(HttpServletResponse.SC_UNAUTHORIZED, e.getMessage());
        }
    }

    /** Devuelve las líneas y el total del carrito. */
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            int userSub = getUserSub(req);
            List<LineaPedido> lineas = service.verCarrito(userSub);
            double total = lineas.stream()
                    .mapToDouble(l -> l.getCantidad() * l.getPrecioUnitario())
                    .sum();
            resp.setContentType("application/json");
            mapper.writeValue(resp.getOutputStream(), Map.of("lineas", lineas, "total", total));
        } catch (SQLException e) {
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error al leer el carrito");
        } catch (ServletException e) {
            resp.sendError(HttpServletResponse.SC_UNAUTHORIZED, e.getMessage());
        }
    }

    /** Actualiza la cantidad de una línea existente. */
    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        if (path == null || path.length() < 2) {
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "ID de línea vacío");
            return;
        }
        try {
            int lineaId = Integer.parseInt(path.substring(1));
            Map<String, Integer> body = mapper.readValue(req.getInputStream(), Map.class);
            Integer cantidad = body.get("cantidad");
            if (cantidad == null) {
                resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "cantidad es obligatoria");
                return;
            }
            service.actualizarLinea(lineaId, cantidad);
            resp.setStatus(HttpServletResponse.SC_NO_CONTENT);
        } catch (NumberFormatException e) {
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "ID de línea inválido");
        } catch (JsonProcessingException e) {
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "JSON inválido");
        } catch (SQLException e) {
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error al actualizar línea");
        }
    }

    /** Elimina una línea del carrito. */
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
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error al eliminar línea");
        }
    }
}
