package org.madbite.dao;

import org.madbite.model.Categoria;
import org.madbite.model.Producto;

// Cambiamos a usar javax.sql que es compatible con java.sql
import javax.sql.DataSource;
import java.sql.*;
import java.util.*;

/**
 * Acceso JDBC (sin frameworks) a la tabla PRODUCTO
 * y vista del menú agrupada por categorías.
 */
public class ProductoDao {

    private final DataSource ds;

    /** Inyecta el pool de conexiones (HikariDataSource, etc.) */
    public ProductoDao(DataSource ds) {
        this.ds = ds;
    }

    /**
     * Devuelve una lista de categorías y sus productos (sólo los productos disponibles).
     *
     * @param categoriaSlugOrId  puede ser null (todas las categorías),
     *                           el nombre case-insensitive ("hamburguesas")
     *                           o el id numérico ("3").
     */
    public List<Categoria> listarMenu(String categoriaSlugOrId) throws SQLException {

        final String sql =
                "SELECT " +
                        "   c.id      AS cat_id, " +
                        "   c.nombre  AS cat_nombre, " +
                        "   p.id      AS prod_id, " +
                        "   p.nombre  AS prod_nombre, " +
                        "   p.descripcion, " +
                        "   p.precio, " +
                        "   p.image_key " +
                        "FROM categoria c " +
                        "JOIN producto  p ON p.categoria_id = c.id " +
                        "WHERE p.disponible = TRUE " +
                        // 3 placeholders → uno para IS NULL y dos para comparaciones
                        "  AND ( ? IS NULL " +
                        "        OR LOWER(c.nombre) = LOWER(?) " +
                        "        OR CAST(c.id AS TEXT) = ? ) " +
                        "ORDER BY c.id, p.id";

        try (Connection cn = ds.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            // colocamos siempre los tres parámetros (pueden ser null)
            ps.setString(1, categoriaSlugOrId);
            ps.setString(2, categoriaSlugOrId);
            ps.setString(3, categoriaSlugOrId);

            try (ResultSet rs = ps.executeQuery()) {
                return mapearMenu(rs);
            }
        }
    }

    /* =======================================================
        Métodos privados auxiliares
       ======================================================= */

    /** Convierte el ResultSet en la lista de categorías agrupadas. */
    private List<Categoria> mapearMenu(ResultSet rs) throws SQLException {

        Map<Integer, Categoria> mapa = new LinkedHashMap<>(); // respetar orden de inserción

        while (rs.next()) {

            int catId = rs.getInt("cat_id");

            // Si la categoría no existe en el mapa la creamos
            Categoria cat = mapa.computeIfAbsent(catId, id -> {
                Categoria c = new Categoria();
                c.setId(id);
                try {
                    c.setNombre(rs.getString("cat_nombre"));
                } catch (SQLException e) {
                    throw new RuntimeException(e); // no debería ocurrir
                }
                c.setProductos(new ArrayList<>());
                return c;
            });

            // Construimos el producto y lo añadimos a la lista de la categoría
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