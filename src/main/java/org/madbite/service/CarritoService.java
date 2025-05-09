// src/main/java/org/madbite/service/CarritoService.java
package org.madbite.service;

import org.madbite.dao.CarritoDao;
import org.madbite.dao.PedidoDao;
import org.madbite.model.LineaPedido;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

/**
 * Servicio de negocio para gestionar el carrito de compras.
 */
public class CarritoService {

    private final CarritoDao carritoDao;
    private final PedidoDao  pedidoDao;

    public CarritoService(CarritoDao carritoDao, PedidoDao pedidoDao) {
        this.carritoDao = carritoDao;
        this.pedidoDao  = pedidoDao;
    }

    /**
     * Añade una línea al carrito. Si no existe un pedido "nuevo" para el usuario,
     * lo crea antes de añadir la línea.
     *
     * @param cognitoSub   identificador único del usuario (Cognito sub).
     * @param email        correo del cliente.
     * @param nombre       nombre del cliente.
     * @param productoId   id del producto a añadir.
     * @param cantidad     cantidad solicitada.
     * @return id de la línea creada.
     * @throws SQLException en caso de error en la base de datos.
     */
    public int addLinea(String cognitoSub,
                        String email,
                        String nombre,
                        int productoId,
                        int cantidad) throws SQLException {
        Optional<Integer> pedidoOpt = pedidoDao.findActivePedido(cognitoSub);
        int pedidoId = pedidoOpt.orElseGet(() -> {
            try {
                return pedidoDao.createPedido(cognitoSub, email, nombre, "online");
            } catch (SQLException e) {
                throw new RuntimeException("Error creando pedido en servicio", e);
            }
        });
        return carritoDao.crearLinea(pedidoId, productoId, cantidad);
    }

    /**
     * Recupera las líneas del carrito del usuario.
     *
     * @param cognitoSub identificador único del usuario.
     * @return lista de líneas en el carrito.
     * @throws SQLException en caso de error al consultar la base de datos.
     */
    public List<LineaPedido> verCarrito(String cognitoSub) throws SQLException {
        return carritoDao.listarLineas(cognitoSub);
    }

    /**
     * Actualiza la cantidad de una línea existente.
     *
     * @param lineaId  id de la línea a actualizar.
     * @param cantidad nueva cantidad.
     * @throws SQLException en caso de error al actualizar.
     */
    public void actualizarLinea(int lineaId, int cantidad) throws SQLException {
        carritoDao.actualizarLinea(lineaId, cantidad);
    }

    /**
     * Elimina una línea del carrito.
     *
     * @param lineaId id de la línea a eliminar.
     * @throws SQLException en caso de error al eliminar.
     */
    public void eliminarLinea(int lineaId) throws SQLException {
        carritoDao.eliminarLinea(lineaId);
    }
}
