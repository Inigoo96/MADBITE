package org.madbite.controller;

import org.madbite.filter.JwtFilter;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

public class TokenDebugServlet extends HttpServlet {
    private final JwtFilter jwtFilter = new JwtFilter();

    @Override
    public void init() throws ServletException {
        super.init();
        jwtFilter.init(null);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        jwtFilter.diagnosticEndpoint(req, resp);
    }
}