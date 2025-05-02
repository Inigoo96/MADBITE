package org.madbite.dao;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

public class MotorSQL {
    private Connection conn;

    // Rellena aquí tu URL completa (incluyendo puerto y BD)
    private static final String URL = "jdbc:postgresql://madbite.clo22mo4q4eb.us-east-1.rds.amazonaws.com:5432/postgres";

    // O bien usa System.getenv("DB_USER") si lo prefieres
    private static final String USER     = "postgres";
    private static final String PASSWORD = "bHS9iLwBzrdtUxCs8GgG";

    public void conectar() {
        try {
            // Opcional hoy en día, el driver se auto-registra
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            System.err.println("No se encontró el driver: " + e.getMessage());
        }

        try {
            Properties props = new Properties();
            props.setProperty("user", USER);
            props.setProperty("password", PASSWORD);
            props.setProperty("ssl", "false");

            conn = DriverManager.getConnection(URL, props);
            System.out.println("¡Conectado a PostgreSQL!");
        } catch (SQLException e) {
            System.err.println("Error al conectar: " + e.getMessage());
        }
    }

    public Connection getConnection() {
        return conn;
    }
}
