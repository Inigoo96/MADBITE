// src/main/java/org/madbite/service/ProductoService.java
package org.madbite.service;

import org.madbite.dao.ProductoDao;
import org.madbite.model.Categoria;

import java.sql.SQLException;
import java.util.List;

/**
 * Servicio de negocio para obtener el menú de productos.
 */
public class ProductoService {

    private final ProductoDao dao;

    public ProductoService(ProductoDao dao) {
        this.dao = dao;
    }

    /**
     * Recupera la lista de categorías y productos disponibles,
     * opcionalmente filtrando por slug o id de categoría.
     *
     * @param categoriaSlugOrId slug (nombre) o id de la categoría, o null para todas.
     * @return lista de categorías con sus productos.
     * @throws SQLException en caso de error al acceder a la base de datos.
     */
    public List<Categoria> obtenerMenu(String categoriaSlugOrId) throws SQLException {
        return dao.listarMenu(categoriaSlugOrId);
    }
}
