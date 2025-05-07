package org.madbite.controller;

import com.zaxxer.hikari.HikariDataSource;

import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;

@WebServlet(name = "Controller", urlPatterns = {"/Controller"})
public class Controller extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        procesar(req, resp);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        procesar(req, resp);
    }

    private void procesar(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        // Obtener el DataSource del contexto de la aplicación
        ServletContext ctx = getServletContext();
        HikariDataSource dataSource = (HikariDataSource) ctx.getAttribute("ds");

        // Obtener una conexión del pool (solo si es necesario usarla)
        try (Connection conn = dataSource.getConnection()) {
            // La conexión se cierra automáticamente al salir del bloque try-with-resources

            String action = req.getParameter("ACTION");
            String user   = req.getParameter("USER");

            resp.setContentType("text/html; charset=UTF-8");
            try (PrintWriter out = resp.getWriter()) {
                out.println("<h2>Estoy en web con Java</h2>");
                out.println("<p>Voy a: " + action + "</p>");
                out.println("<p>Soy el usuario: " + user + "</p>");
            }
        } catch (Exception e) {
            // Manejar errores de conexión
            resp.setContentType("text/html; charset=UTF-8");
            try (PrintWriter out = resp.getWriter()) {
                out.println("<h2>Error de conexión a la base de datos</h2>");
                out.println("<p>Error: " + e.getMessage() + "</p>");
            }
        }
    }
}