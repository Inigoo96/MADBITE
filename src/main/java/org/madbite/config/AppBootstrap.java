package org.madbite.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import org.madbite.dao.CarritoDao;
import org.madbite.dao.PedidoDao;
import org.madbite.dao.ProductoDao;
import org.madbite.service.CarritoService;
import org.madbite.service.ProductoService;

public class AppBootstrap implements ServletContextListener {

    private HikariDataSource dataSource;

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        // 1) Cargar driver
        try {
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("No se pudo cargar driver PostgreSQL", e);
        }

        // 2) Configurar HikariCP
        HikariConfig cfg = new HikariConfig();
        cfg.setJdbcUrl("jdbc:postgresql://madbite.clo22mo4q4eb.us-east-1.rds.amazonaws.com:5432/postgres");
        cfg.setUsername("postgres");
        cfg.setPassword("bHS9iLwBzrdtUxCs8GgG");
        cfg.setMaximumPoolSize(10);
        cfg.setMinimumIdle(1);
        cfg.setPoolName("hamburgueseria-pool");
        dataSource = new HikariDataSource(cfg);

        // 3) Instanciar DAOs y Servicios
        ProductoDao productoDao       = new ProductoDao(dataSource);
        ProductoService productoSvc   = new ProductoService(productoDao);
        PedidoDao    pedidoDao        = new PedidoDao(dataSource);
        CarritoDao   carritoDao       = new CarritoDao(dataSource);
        CarritoService carritoService = new CarritoService(carritoDao, pedidoDao);

        // 4) ObjectMapper para JSON
        ObjectMapper mapper = new ObjectMapper();

        // 5) Registrar en ServletContext
        ServletContext ctx = sce.getServletContext();
        ctx.setAttribute("ds",               dataSource);
        ctx.setAttribute("productoService",  productoSvc);
        ctx.setAttribute("carritoService",   carritoService);
        ctx.setAttribute("jsonMapper",       mapper);
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        if (dataSource != null) {
            dataSource.close();
        }
    }
}
