package org.madbite.dao;

import org.madbite.model.LineaPedido;
import javax.sql.DataSource;
import java.sql.*;
import java.util.*;

public class CarritoDao {
    private final DataSource ds;
    public CarritoDao(DataSource ds) { this.ds = ds; }

    public int crearLinea(int userSub, int productoId, int cantidad) throws SQLException {
        String sql = "" +
                "INSERT INTO pedido_linea (pedido_id, producto_id, cantidad, precio_unitario) " +
                "VALUES ( " +
                "  (SELECT id FROM pedido WHERE usuario_id = ? AND estado = 'nuevo'), " +
                "  ?, ?, " +
                "  (SELECT precio FROM producto WHERE id = ?)" +
                ") RETURNING id";
        try (Connection c = ds.getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, userSub);
            ps.setInt(2, productoId);
            ps.setInt(3, cantidad);
            ps.setInt(4, productoId);
            ResultSet rs = ps.executeQuery();
            rs.next();
            return rs.getInt(1);
        }
    }

    public List<LineaPedido> listarLineas(int userSub) throws SQLException {
        String sql = "" +
                "SELECT l.id, p.id AS prod_id, p.nombre, l.cantidad, l.precio_unitario " +
                "FROM pedido_linea l " +
                "JOIN pedido pe ON pe.id = l.pedido_id " +
                "JOIN producto p ON p.id = l.producto_id " +
                "WHERE pe.usuario_id = ? AND pe.estado = 'nuevo'";
        List<LineaPedido> out = new ArrayList<>();
        try (Connection c = ds.getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, userSub);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                LineaPedido l = new LineaPedido();
                l.setId(rs.getInt("id"));
                l.setProductoId(rs.getInt("prod_id"));
                l.setNombreProducto(rs.getString("nombre"));
                l.setCantidad(rs.getInt("cantidad"));
                l.setPrecioUnitario(rs.getBigDecimal("precio_unitario").doubleValue());
                out.add(l);
            }
        }
        return out;
    }

    public void actualizarLinea(int lineaId, int cantidad) throws SQLException {
        String sql = "UPDATE pedido_linea SET cantidad = ? WHERE id = ?";
        try (Connection c = ds.getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, cantidad);
            ps.setInt(2, lineaId);
            ps.executeUpdate();
        }
    }

    public void eliminarLinea(int lineaId) throws SQLException {
        String sql = "DELETE FROM pedido_linea WHERE id = ?";
        try (Connection c = ds.getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, lineaId);
            ps.executeUpdate();
        }
    }
}
