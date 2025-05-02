package org.madbite.service;

import org.madbite.dao.ProductoDao;
import org.madbite.model.Categoria;

import java.sql.SQLException;
import java.util.List;

public class ProductoService {

    private final ProductoDao dao;

    public ProductoService(ProductoDao dao) { this.dao = dao; }

    public List<Categoria> obtenerMenu(String categoria) throws SQLException {
        return dao.listarMenu(categoria);
    }
}
