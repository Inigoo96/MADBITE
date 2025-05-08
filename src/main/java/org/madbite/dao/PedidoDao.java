package org.madbite.dao;

import javax.sql.DataSource;
import java.sql.*;
import java.util.Optional;

public class PedidoDao {
    private final DataSource ds;

    public PedidoDao(DataSource ds) {
        this.ds = ds;
    }

    public Optional<Integer> findActivePedido(String cognitoSub) throws SQLException {
        var sql = """
            SELECT id
              FROM pedido
             WHERE cognito_sub = ?
               AND estado = 'nuevo'
            """;
        try (var c = ds.getConnection();
             var ps = c.prepareStatement(sql)) {
            ps.setString(1, cognitoSub);
            try (var rs = ps.executeQuery()) {
                return rs.next() ? Optional.of(rs.getInt("id")) : Optional.empty();
            }
        }
    }

    public int createPedido(String cognitoSub,
                            String clienteEmail,
                            String clienteNombre,
                            String canal) throws SQLException {
        var sql = """
            INSERT INTO pedido
                (canal, cognito_sub, cliente_email, cliente_nombre)
            VALUES (?, ?, ?, ?)
            RETURNING id
            """;
        try (var c = ds.getConnection();
             var ps = c.prepareStatement(sql)) {
            ps.setString(1, canal);
            ps.setString(2, cognitoSub);
            ps.setString(3, clienteEmail);
            ps.setString(4, clienteNombre);
            try (var rs = ps.executeQuery()) {
                rs.next();
                return rs.getInt(1);
            }
        }
    }
}
