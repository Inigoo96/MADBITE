package org.madbite.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet(name="ApiTest", urlPatterns="/api/test")
public class ApiTestServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException
    {
        resp.setContentType("application/json; charset=UTF-8");
        resp.getWriter()
                .println("{ \"status\": \"ok\", \"msg\": \"API funciona en 8090\" }");
    }
}
