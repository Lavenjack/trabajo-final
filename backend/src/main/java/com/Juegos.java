package com;

//Propiedades de la clase Juegos

public class Juegos {
    private Integer id;
    private String nombre;
    private String genero;
    private String perspectiva;
    private String descripcion;
    private String urlImagen;
 
 
   // Constructor

    public Juegos(Integer id, String nombre, String genero, String perspectiva, String descripcion, String urlImagen) {
        this.id = id;
        this.nombre = nombre;
        this.genero = genero;
        this.perspectiva = perspectiva;
        this.descripcion = descripcion;
        this.urlImagen = urlImagen;
    }

    

    // Getters 

    public Integer getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public String getGenero() {
        return genero;
    }

    public String getPerspectiva() {
    
        return perspectiva;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public String getUrlImagen() {
        return urlImagen;
    }
        

    // Setters

    public void setId(Integer id) {
        this.id = id;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public void setGenero(String genero) {
        this.genero = genero;
    }
    public void setPerspectiva(String perspectiva) {
        this.perspectiva = perspectiva;
    }
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public void setUrlImagen(String urlImagen) {
        this.urlImagen = urlImagen;
    }
    
}
