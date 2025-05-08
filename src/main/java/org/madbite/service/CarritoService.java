package org.madbite.service;

import org.madbite.dao.CarritoDao;
import org.madbite.dao.PedidoDao;
import org.madbite.model.LineaPedido;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

public class CarritoService {
    private final CarritoDao carritoDao;
    private final PedidoDao pedidoDao;

    public CarritoService(CarritoDao carritoDao, PedidoDao pedidoDao) {
        this.carritoDao = carritoDao;
        this.pedidoDao  = pedidoDao;
    }

    public int addLinea(String cognitoSub,
                        String email,
                        String nombre,
                        int productoId,
                        int cantidad) throws SQLException {
        Optional<Integer> opt = pedidoDao.findActivePedido(cognitoSub);
        int pedidoId = opt.orElseGet(() -> {
            try {
                return pedidoDao.createPedido(cognitoSub, email, nombre, "online");
            } catch (SQLException e) {
                throw new RuntimeException("Error creando pedido", e);
            }
        });
        return carritoDao.crearLinea(pedidoId, productoId, cantidad);
    }

    public List<LineaPedido> verCarrito(String cognitoSub) throws SQLException {
        return carritoDao.listarLineas(cognitoSub);
    }

    public void actualizarLinea(int lineaId, int cantidad) throws SQLException {
        carritoDao.actualizarLinea(lineaId, cantidad);
    }

    public void eliminarLinea(int lineaId) throws SQLException {
        carritoDao.eliminarLinea(lineaId);
    }
}
