package org.madbite.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

public class Producto {
    private int id;
    private String nombre;
    private String descripcion;
    private double precio;
    @JsonIgnore
    private String imageKey;

    public Producto() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public double getPrecio() { return precio; }
    public void setPrecio(double precio) { this.precio = precio; }

    public String getImageKey() { return imageKey; }
    public void setImageKey(String imageKey) { this.imageKey = imageKey; }

    /**
     * Jackson serializará este campo como "imageUrl".
     * Sustituye <TU_DOMINIO> por tu CloudFront real.
     */
    @JsonProperty("imageUrl")
    public String getImageUrl() {
        return "https://d16iuaiirhkan9.cloudfront.net/" + imageKey;
    }
}
