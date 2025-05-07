package org.madbite.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.madbite.model.Categoria;
import org.madbite.service.ProductoService;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.sql.SQLException;
import java.util.List;

@WebServlet(name="ProductoServlet", urlPatterns={"/api/menu"})
public class ProductoServlet extends HttpServlet {
    private ProductoService service;
    private ObjectMapper mapper;

    @Override
    public void init() {
        // Los inyectaste desde AppBootstrap en el ServletContext
        this.service = (ProductoService) getServletContext().getAttribute("productoService");
        this.mapper  = (ObjectMapper) getServletContext().getAttribute("jsonMapper");
    }

    /**
     * Permitimos CORS para peticiones desde el front (p.ej http://localhost:3007)
     */
    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) {
        enableCors(resp);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        enableCors(resp);
        resp.setContentType("application/json;charset=UTF-8");

        String categoriaParam = req.getParameter("categoria");
        try {
            List<Categoria> menu = service.obtenerMenu(categoriaParam);
            // Envío directo de la lista; el front esperará { categorias: [...] }
            var wrapper = java.util.Map.of("categorias", menu);
            mapper.writeValue(resp.getOutputStream(), wrapper);

        } catch (SQLException e) {
            resp.sendError(500, "Error de base de datos");
            e.printStackTrace();
        }
    }

    private void enableCors(HttpServletResponse resp) {
        resp.setHeader("Access-Control-Allow-Origin",  "http://localhost:3007");
        resp.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }
}
