// src/main/java/org/madbite/controller/ProductoServlet.java
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
import java.util.Map;

@WebServlet(name="ProductoServlet", urlPatterns={"/api/menu"})
public class ProductoServlet extends HttpServlet {

    private ProductoService service;
    private ObjectMapper    mapper;

    @Override
    public void init() {
        this.service = (ProductoService) getServletContext().getAttribute("productoService");
        this.mapper  = (ObjectMapper)    getServletContext().getAttribute("jsonMapper");
        if (service == null || mapper == null) {
            throw new IllegalStateException("ProductoService u ObjectMapper no inicializados");
        }
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        enableCors(resp);
        resp.setStatus(HttpServletResponse.SC_OK);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        enableCors(resp);
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        String categoriaParam = req.getParameter("categoria");
        try {
            List<Categoria> menu = service.obtenerMenu(categoriaParam);
            Map<String,Object> wrapper = Map.of("categorias", menu);
            mapper.writeValue(resp.getWriter(), wrapper);
        } catch (SQLException e) {
            log("Error de base de datos al cargar menú", e);
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error de base de datos");
        }
    }

    private void enableCors(HttpServletResponse resp) {
        resp.setHeader("Access-Control-Allow-Origin",  "http://localhost:3007");
        resp.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }
}
