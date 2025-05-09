// src/main/java/org/madbite/dao/ProductoDao.java
package org.madbite.dao;

import org.madbite.model.Categoria;
import org.madbite.model.Producto;
import javax.sql.DataSource;
import java.sql.*;
import java.util.*;

/**
 * JDBC puro para listar menú: categorías + productos disponibles.
 */
public class ProductoDao {

    private final DataSource ds;

    public ProductoDao(DataSource ds) {
        this.ds = ds;
    }

    /**
     * Devuelve categorías con sus productos,
     * opcionalmente filtradas por slug (nombre) o id.
     */
    public List<Categoria> listarMenu(String categoriaSlugOrId) throws SQLException {
        String sql =
                "SELECT " +
                        "  c.id   AS cat_id,   " +
                        "  c.nombre AS cat_nombre, " +
                        "  p.id   AS prod_id,  " +
                        "  p.nombre       AS prod_nombre, " +
                        "  p.descripcion,            " +
                        "  p.precio,                 " +
                        "  p.image_key               " +
                        "FROM categoria c           " +
                        "JOIN producto p ON p.categoria_id = c.id " +
                        "WHERE p.disponible = TRUE  " +
                        "  AND ( ? IS NULL          " +
                        "     OR LOWER(c.nombre) = LOWER(?) " +
                        "     OR CAST(c.id AS TEXT) = ? )    " +
                        "ORDER BY c.id, p.id";

        try (Connection cn = ds.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setString(1, categoriaSlugOrId);
            ps.setString(2, categoriaSlugOrId);
            ps.setString(3, categoriaSlugOrId);

            try (ResultSet rs = ps.executeQuery()) {
                return mapearMenu(rs);
            }
        }
    }

    /** Mapea el ResultSet a lista de categorías con sus productos. */
    private List<Categoria> mapearMenu(ResultSet rs) throws SQLException {
        Map<Integer,Categoria> mapa = new LinkedHashMap<>();
        while (rs.next()) {
            int catId = rs.getInt("cat_id");
            Categoria cat = mapa.computeIfAbsent(catId, id -> {
                Categoria c = new Categoria();
                c.setId(id);
                try {
                    c.setNombre(rs.getString("cat_nombre"));
                } catch (SQLException e) {
                    throw new RuntimeException(e);
                }
                c.setProductos(new ArrayList<>());
                return c;
            });

            Producto p = new Producto();
            p.setId(rs.getInt("prod_id"));
            p.setNombre(rs.getString("prod_nombre"));
            p.setDescripcion(rs.getString("descripcion"));
            p.setPrecio(rs.getBigDecimal("precio").doubleValue());
            p.setImageKey(rs.getString("image_key"));

            cat.getProductos().add(p);
        }
        return new ArrayList<>(mapa.values());
    }
}
