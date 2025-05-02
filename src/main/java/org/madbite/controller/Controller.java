package org.madbite.controller;

import org.madbite.dao.MotorSQL;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;

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
        MotorSQL motor = new MotorSQL();
        motor.conectar();

        String action = req.getParameter("ACTION");
        String user   = req.getParameter("USER");

        resp.setContentType("text/html; charset=UTF-8");
        try (PrintWriter out = resp.getWriter()) {
            out.println("<h2>Estoy en web con Java</h2>");
            out.println("<p>Voy a: " + action + "</p>");
            out.println("<p>Soy el usuario: " + user + "</p>");
        }
    }
}
