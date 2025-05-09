package org.madbite.dao;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;

public class PedidoDao {

    private final DataSource ds;

    public PedidoDao(DataSource ds) {
        this.ds = ds;
    }

    /**
     * Busca un pedido "nuevo" para el usuario dado (cognitoSub).
     * @return Optional con el ID del pedido activo o vacío si no existe.
     */
    public Optional<Integer> findActivePedido(String cognitoSub) throws SQLException {
        String sql = """
            SELECT id
              FROM pedido
             WHERE cognito_sub = ?
               AND estado = 'nuevo'
            """;

        try (Connection c = ds.getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {

            ps.setString(1, cognitoSub);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(rs.getInt("id"));
                }
                return Optional.empty();
            }
        }
    }

    /**
     * Crea un nuevo pedido y devuelve su ID.
     * Utiliza RETURNING id para obtenerlo directamente de la base.
     */
    public int createPedido(String cognitoSub,
                            String clienteEmail,
                            String clienteNombre,
                            String canal) throws SQLException {
        String sql = """
            INSERT INTO pedido
                (canal, cognito_sub, cliente_email, cliente_nombre)
            VALUES (?, ?, ?, ?)
            RETURNING id
            """;

        try (Connection c = ds.getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {

            ps.setString(1, canal);
            ps.setString(2, cognitoSub);
            ps.setString(3, clienteEmail);
            ps.setString(4, clienteNombre);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
                throw new SQLException("No se devolvió ID al crear el pedido");
            }
        }
    }
}
