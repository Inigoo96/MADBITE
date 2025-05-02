package org.madbite.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.madbite.dao.CarritoDao;
import org.madbite.dao.ProductoDao;
import org.madbite.service.CarritoService;
import org.madbite.service.ProductoService;

import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;

/**
 * Arranca los recursos compartidos de la aplicación y los deja
 * accesibles en el ServletContext para que los servlets/filtros
 * los reutilicen sin frameworks.
 */
public class AppBootstrap implements ServletContextListener {

    private HikariDataSource dataSource;   // para cerrarlo en shutdown

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        // Añade esto antes de crear el HikariConfig
        try {
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("No se pudo cargar el driver de PostgreSQL", e);
        }

        /* 1 · DataSource (HikariCP)  ------------------------------ */
        HikariConfig cfg = new HikariConfig();
        cfg.setJdbcUrl("jdbc:postgresql://madbite.clo22mo4q4eb.us-east-1.rds.amazonaws.com:5432/postgres");
        cfg.setUsername("postgres");
        cfg.setPassword("bHS9iLwBzrdtUxCs8GgG");
        cfg.setMaximumPoolSize(10);
        cfg.setMinimumIdle(1);
        cfg.setPoolName("hamburgueseria-pool");

        dataSource = new HikariDataSource(cfg);

        /* 2 · DAO + Service  ------------------------------------- */
        ProductoDao productoDao = new ProductoDao(dataSource);
        ProductoService productoService = new ProductoService(productoDao);

        CarritoDao cDao = new CarritoDao(dataSource);
        CarritoService cService = new CarritoService(cDao);

        /* 3 · ObjectMapper  -------------------------------------- */
        ObjectMapper mapper = new ObjectMapper();

        /* 4 · Registrar en el contexto --------------------------- */
        ServletContext ctx = sce.getServletContext();
        ctx.setAttribute("ds", dataSource);             // por si otros DAO los necesitan
        ctx.setAttribute("productoService", productoService);
        ctx.setAttribute("jsonMapper", mapper);

        ctx.setAttribute("carritoService", cService);
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        if (dataSource != null) {
            dataSource.close();          // libera conexiones
        }
    }
}
