package org.madbite.service;

import org.madbite.dao.CarritoDao;
import org.madbite.model.LineaPedido;
import java.sql.SQLException;
import java.util.List;

public class CarritoService {
    private final CarritoDao dao;
    public CarritoService(CarritoDao dao) { this.dao = dao; }

    public int addLinea(int userSub, int productoId, int cantidad) throws SQLException {
        return dao.crearLinea(userSub, productoId, cantidad);
    }
    public List<LineaPedido> verCarrito(int userSub) throws SQLException {
        return dao.listarLineas(userSub);
    }
    public void actualizarLinea(int lineaId, int cantidad) throws SQLException {
        dao.actualizarLinea(lineaId, cantidad);
    }
    public void eliminarLinea(int lineaId) throws SQLException {
        dao.eliminarLinea(lineaId);
    }
}
