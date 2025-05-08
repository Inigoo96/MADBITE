package org.madbite.dao;

import org.madbite.model.LineaPedido;
import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class CarritoDao {
    private final DataSource ds;

    public CarritoDao(DataSource ds) {
        this.ds = ds;
    }

    public int crearLinea(int pedidoId, int productoId, int cantidad) throws SQLException {
        var sql = """
            INSERT INTO pedido_linea
                (pedido_id, producto_id, cantidad, precio_unitario)
            VALUES (?, ?, ?, (SELECT precio FROM producto WHERE id = ?))
            RETURNING id
            """;
        try (var c = ds.getConnection();
             var ps = c.prepareStatement(sql)) {
            ps.setInt(1, pedidoId);
            ps.setInt(2, productoId);
            ps.setInt(3, cantidad);
            ps.setInt(4, productoId);
            try (var rs = ps.executeQuery()) {
                rs.next();
                return rs.getInt(1);
            }
        }
    }

    public List<LineaPedido> listarLineas(String cognitoSub) throws SQLException {
        var sql = """
            SELECT l.id,
                   p.id   AS prod_id,
                   p.nombre,
                   l.cantidad,
                   l.precio_unitario
              FROM pedido_linea l
              JOIN pedido pe ON pe.id = l.pedido_id
              JOIN producto p ON p.id = l.producto_id
             WHERE pe.cognito_sub = ?
               AND pe.estado = 'nuevo'
            """;
        var out = new ArrayList<LineaPedido>();
        try (var c = ds.getConnection();
             var ps = c.prepareStatement(sql)) {
            ps.setString(1, cognitoSub);
            try (var rs = ps.executeQuery()) {
                while (rs.next()) {
                    var linea = new LineaPedido();
                    linea.setId(rs.getInt("id"));
                    linea.setProductoId(rs.getInt("prod_id"));
                    linea.setNombreProducto(rs.getString("nombre"));
                    linea.setCantidad(rs.getInt("cantidad"));
                    linea.setPrecioUnitario(rs.getDouble("precio_unitario"));
                    out.add(linea);
                }
            }
        }
        return out;
    }

    public void actualizarLinea(int lineaId, int cantidad) throws SQLException {
        var sql = "UPDATE pedido_linea SET cantidad = ? WHERE id = ?";
        try (var c = ds.getConnection();
             var ps = c.prepareStatement(sql)) {
            ps.setInt(1, cantidad);
            ps.setInt(2, lineaId);
            ps.executeUpdate();
        }
    }

    public void eliminarLinea(int lineaId) throws SQLException {
        var sql = "DELETE FROM pedido_linea WHERE id = ?";
        try (var c = ds.getConnection();
             var ps = c.prepareStatement(sql)) {
            ps.setInt(1, lineaId);
            ps.executeUpdate();
        }
    }
}
