package org.madbite.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.madbite.service.ProductoService;
import org.madbite.model.Categoria;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.sql.SQLException;
import java.util.*;

@WebServlet(name="ProductoServlet", urlPatterns={"/api/menu"})
public class ProductoServlet extends HttpServlet {

    private ProductoService service;
    private ObjectMapper mapper;

    @Override
    public void init() {
        // Simple ServiceLocator sin frameworks
        this.service = (ProductoService) getServletContext()
                .getAttribute("productoService");
        this.mapper  = (ObjectMapper) getServletContext()
                .getAttribute("jsonMapper");
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        String categoria = req.getParameter("categoria");
        try {
            List<Categoria> data = service.obtenerMenu(categoria);
            Map<String,Object> wrapper = Map.of("categorias", data);

            resp.setContentType("application/json");
            mapper.writeValue(resp.getOutputStream(), wrapper);
        } catch (SQLException e) {
            resp.sendError(500, "DB error");
            e.printStackTrace();
        }
    }
}
