package com;

import static spark.Spark.*;
import com.google.gson.Gson;
import java.util.*;
import spark.Request;
import spark.Response;
import spark.Route;

import java.sql.Statement;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class JuegosApi {

    private static  Gson gson = new Gson();
    private static String jdbcUrl = "jdbc:mysql://146.190.118.241:3306/tp2025";
    private static String username = "oficios2025";
    private static String password = "Oficios2025!";


    private static void enableCORS() {
        options("/*", (req, res) -> {

            String headers = req.headers("Access-Control-Request-Headers");
            if (headers != null) res.header("Access-Control-Allow-Headers", headers);

            String method = req.headers("Access-Control-Request-Method");
            if (method != null) res.header("Access-Control-Allow-Methods", method);
           
            return "OK";

        });

        before((req, res) -> {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
            res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
        });
    }

    public static void main(String[] args) {

        port(4567);
        enableCORS();
       
        // ✅ ENDPOINT: Obtener todos los juegos
        get("/juegos", new Route() {
            @Override
            public Object handle(Request req, Response res) throws Exception {
                res.type("application/json");

                Connection connection = DriverManager.getConnection(jdbcUrl, username, password);
                System.out.println("Conexión exitosa a la base de datos.");

                Statement statement = connection.createStatement();
                ResultSet resultSet = statement.executeQuery("SELECT * FROM juegos");

                ArrayList<Juegos> juegos = new ArrayList<>();
                while (resultSet.next()) {
                    Integer id = resultSet.getInt("id");
                    String nombre = resultSet.getString("nombre");
                    String genero = resultSet.getString("genero");
                    String perspectiva = resultSet.getString("perspectiva");
                    String descripcion = resultSet.getString("descripcion");
                    String urlImagen = resultSet.getString("urlImagen");

                    Juegos juego = new Juegos(id, nombre, genero, perspectiva, descripcion, urlImagen);
                    juegos.add(juego);
                }
                
                if (juegos.isEmpty()) {
                    res.status(200);
                    return gson.toJson(Map.of("message", "Juegos no encontrados"));
                }

                return gson.toJson(juegos);
            }
        });

        // ✅ ENDPOINT: Obtener juego por ID (SEGURO - Sin SQL Injection)
        get("/juegos/:id", new Route() {
            @Override
            public Object handle(Request req, Response res) throws Exception {
                int id = Integer.parseInt(req.params(":id"));
                res.type("application/json");

                Connection connection = DriverManager.getConnection(jdbcUrl, username, password);

                // ✅ CORREGIDO: Usar PreparedStatement para evitar SQL Injection
                PreparedStatement statement = connection.prepareStatement("SELECT * FROM juegos WHERE id = ?");
                statement.setInt(1, id);
                ResultSet resultSet = statement.executeQuery();
               
                if (resultSet.next()) {
                    String nombre = resultSet.getString("nombre");
                    String genero = resultSet.getString("genero");
                    String perspectiva = resultSet.getString("perspectiva");
                    String descripcion = resultSet.getString("descripcion");
                    String urlImagen = resultSet.getString("urlImagen");

                    Juegos juego = new Juegos(id, nombre, genero, perspectiva, descripcion, urlImagen);
                    return gson.toJson(juego);
                } else {
                    res.status(404);
                    return gson.toJson(Map.of("error", "Juego no encontrado"));
                }
            }
        });
        
        // ✅ ENDPOINT: Crear nuevo juego
        post("/juegos", new Route() {
            @Override
            public Object handle(Request req, Response res) throws Exception {
                res.type("application/json");
                Juegos nuevoJuego = gson.fromJson(req.body(), Juegos.class);

                // Validaciones de campos vacíos
                if (nuevoJuego == null) {
                    res.status(400);
                    return gson.toJson(Map.of("Error", "Los campos estan vacios o mal escritos"));
                }

                if (nuevoJuego.getNombre() == null || nuevoJuego.getNombre().trim().isEmpty()) {
                    res.status(422);
                    return gson.toJson(Map.of("error", "El nombre del juego es obligatorio"));
                }

                if (nuevoJuego.getDescripcion() == null || nuevoJuego.getDescripcion().trim().isEmpty()) {
                    res.status(422);
                    return gson.toJson(Map.of("error", "La descripcion del juego es obligatoria"));
                }

                if (nuevoJuego.getGenero() == null || nuevoJuego.getGenero().trim().isEmpty()) {
                    res.status(422);
                    return gson.toJson(Map.of("error", "El genero del juego es obligatorio"));
                }
                
                if (nuevoJuego.getPerspectiva() == null || nuevoJuego.getPerspectiva().trim().isEmpty()) {
                    res.status(422);
                    return gson.toJson(Map.of("error", "La perspectiva del juego es obligatoria"));
                }

                // Validación para URL válida
                if (nuevoJuego.getUrlImagen() == null || !nuevoJuego.getUrlImagen().startsWith("http")) {
                    res.status(422);
                    return gson.toJson(Map.of("error", "La url del juego es incorrecta"));
                }

                // Validación para caracteres máximos en Descripción
                if (nuevoJuego.getDescripcion().length() > 300) {
                    res.status(422);
                    return gson.toJson(Map.of("error", "La descripcion no puede superar los 300 caracteres"));
                }

                Connection connection = DriverManager.getConnection(jdbcUrl, username, password);

                // Validación para evitar juegos duplicados (por nombre)
                PreparedStatement checkStmt = connection.prepareStatement("SELECT COUNT(*) FROM juegos WHERE nombre = ?");
                checkStmt.setString(1, nuevoJuego.getNombre());
                ResultSet rs = checkStmt.executeQuery();
                rs.next();
                int count = rs.getInt(1);

                if (count > 0) {
                    res.status(409); // 409 = conflicto (registro duplicado)
                    return gson.toJson(Map.of("error", "Ya existe un juego con ese nombre"));
                }

                // Ejecutar INSERT del nuevo juego
                PreparedStatement preparedStatement = connection.prepareStatement(
                    "INSERT INTO juegos (nombre, genero, perspectiva, descripcion, urlImagen) VALUES (?, ?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS
                );

                preparedStatement.setString(1, nuevoJuego.getNombre());
                preparedStatement.setString(2, nuevoJuego.getGenero());
                preparedStatement.setString(3, nuevoJuego.getPerspectiva());
                preparedStatement.setString(4, nuevoJuego.getDescripcion());
                preparedStatement.setString(5, nuevoJuego.getUrlImagen());

                preparedStatement.executeUpdate();

                // Obtener el ID generado
                ResultSet generatedKeys = preparedStatement.getGeneratedKeys();
                if (generatedKeys.next()) {
                    int lastInsertId = generatedKeys.getInt(1);
                    nuevoJuego.setId(lastInsertId);
                    System.out.println("Juego creado con ID: " + lastInsertId);
                } else {
                    System.out.println("Error ejecutando el INSERT");
                }

                return gson.toJson(nuevoJuego);
            }
        });

        // ✅ ENDPOINT: Eliminar juego
        delete("/juegos/:id", new Route() {
            @Override
            public Object handle(Request req, Response res) throws Exception {
                int id = Integer.parseInt(req.params(":id"));
                res.type("application/json");

                Connection connection = DriverManager.getConnection(jdbcUrl, username, password);
                PreparedStatement preparedStatement = connection.prepareStatement("DELETE FROM juegos WHERE id = ?");
                preparedStatement.setInt(1, id);
                
                int rowsAffected = preparedStatement.executeUpdate();
                //System.out.println(rowsAffected + " row(s) eliminada(s).");

                if (rowsAffected > 0) {
                    System.out.println("🎯🎯🎯 VERSIÓN NUEVA - ELIMINACIÓN EXITOSA 🎯🎯🎯");
                    res.status(200);
                    return gson.toJson(Map.of("message", "✅✅✅ ELIMINADO CORRECTAMENTE ✅✅✅"));
                } else {
                    res.status(404);
                    return gson.toJson(Map.of("error", "Juego no encontrado"));
                }
            }
        });

        // ✅ ENDPOINT: Actualizar juego
        put ("/juegos/:id", new Route() {
            @Override
            public Object handle(Request req, Response res) throws Exception {
                int id = Integer.parseInt(req.params(":id"));
                res.type("application/json");
                Juegos juegoActualizado = gson.fromJson(req.body(), Juegos.class);

                // Validaciones para el PUT/EDITAR (mismas que el POST)
                if (juegoActualizado == null) {
                    res.status(400);
                    return gson.toJson(Map.of("Error", "Los campos estan vacios o mal escritos"));
                }

                if (juegoActualizado.getNombre() == null || juegoActualizado.getNombre().trim().isEmpty()) {
                    res.status(422);
                    return gson.toJson(Map.of("error", "El nombre del juego es obligatorio"));
                }

                if (juegoActualizado.getDescripcion() == null || juegoActualizado.getDescripcion().trim().isEmpty()) {
                    res.status(422);
                    return gson.toJson(Map.of("error", "La descripcion del juego es obligatoria"));
                }

                if (juegoActualizado.getGenero() == null || juegoActualizado.getGenero().trim().isEmpty()) {
                    res.status(422);
                    return gson.toJson(Map.of("error", "El genero del juego es obligatorio"));
                }
                
                if (juegoActualizado.getPerspectiva() == null || juegoActualizado.getPerspectiva().trim().isEmpty()) {
                    res.status(422);
                    return gson.toJson(Map.of("error", "La perspectiva del juego es obligatoria"));
                }

                // Validación para URL válida
                if (juegoActualizado.getUrlImagen() == null || !juegoActualizado.getUrlImagen().startsWith("http")) {
                    res.status(422);
                    return gson.toJson(Map.of("error", "La url del juego es incorrecta"));
                }

                // Validación para caracteres máximos en Descripción
                if (juegoActualizado.getDescripcion().length() > 300) {
                    res.status(422);
                    return gson.toJson(Map.of("error", "La descripcion no puede superar los 300 caracteres"));
                }

                Connection connection = DriverManager.getConnection(jdbcUrl, username, password);
                PreparedStatement preparedStatement = connection.prepareStatement(
                    "UPDATE juegos SET nombre = ?, genero = ?, perspectiva = ?, descripcion = ?, urlImagen = ? WHERE id = ?"
                );

                preparedStatement.setString(1, juegoActualizado.getNombre());
                preparedStatement.setString(2, juegoActualizado.getGenero());
                preparedStatement.setString(3, juegoActualizado.getPerspectiva());
                preparedStatement.setString(4, juegoActualizado.getDescripcion());
                preparedStatement.setString(5, juegoActualizado.getUrlImagen());
                preparedStatement.setInt(6, id);

                int rowsAffected = preparedStatement.executeUpdate();
                System.out.println(rowsAffected + " row(s) actualizada(s).");

                if (rowsAffected > 0) {
                    juegoActualizado.setId(id);
                    // ✅ Devolver mensaje de éxito junto con el juego actualizado
                    return gson.toJson(Map.of(
                        "message", "Juego editado con éxito",
                        "juego", juegoActualizado
                    ));
                } else {
                    res.status(404);
                    return gson.toJson(Map.of("error", "Juego no encontrado"));
                }
            }
        });
    }
}