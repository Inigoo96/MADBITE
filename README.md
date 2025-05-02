# MADBITE Backend ☕🍔

Backend del sistema web para la hamburguesería **MADBITE**, desarrollado en **Java J2EE** como parte de un proyecto completo que incluye frontend responsive, API REST, y base de datos alojada en AWS RDS (PostgreSQL).

---

## 🧱 Arquitectura

El backend sigue una arquitectura MVC adaptada a J2EE:

```
[FrontEnd]
   ↓ (fetch, JSON)
[Servlet Frontal] ➝ [Action] ➝ [DAO] ➝ [MotorSQL] ➝ [PostgreSQL on AWS]
```

* **Servlet frontal**: punto de entrada único que distribuye las peticiones
* **Clases Action**: intermedios para cada entidad (usuario, producto, pedido, etc.)
* **DAO (Data Access Object)**: encapsulan la lógica de acceso a datos
* **MotorSQL**: clase base que gestiona la conexión JDBC

---

## 🌐 Entorno de Ejecución

* **Servidor**: Apache Tomcat (>= 9.0)
* **Java**: JDK 11 o superior
* **Base de datos**: PostgreSQL en AWS RDS
* **IDE sugerido**: IntelliJ IDEA / Eclipse

---

## 🛠️ Tecnologías y Librerías

* Java EE (Servlets)
* JDBC
* PostgreSQL Driver
* AWS RDS
* MVC Pattern
* JSON (Jackson o manual desde Java)
* Postman para pruebas

---

## 🔌 Conexión a Base de Datos

Archivo: `conexion.txt`

```java
ENDPOINT = madbite.clo22mo4q4eb.us-east-1.rds.amazonaws.com
USER = postgres
PASS = ********
```

(Se recomienda usar variables de entorno o `.env` para entornos reales)

---

## 📚 Casos de Uso

**Usuarios**

* Registro (`POST /register`)
* Inicio de sesión (`POST /login`)
* Actualización de datos (`PUT /user/:id`)
* Roles: cliente, empleado, administrador

**Productos**

* Obtener productos por categoría (`GET /products?category=bebidas`)
* Gestión interna (crear, actualizar, eliminar productos)

**Pedidos**

* Crear pedido (`POST /order`)
* Obtener pedidos por usuario (`GET /orders?userId=...`)
* Ver detalles de un pedido (`GET /order/:id`)

**Personal**

* Gestión de empleados (crear, editar, ver fichas)
* Acceso a intranet y recursos del comité

---

## 🔁 Flujo de Peticiones

1. El **frontend** hace una petición `fetch` con JSON.
2. El **Servlet frontal** redirige a la clase `Action` correspondiente.
3. La `Action` parsea los datos y llama al `DAO`.
4. El `DAO` interactúa con la **base de datos PostgreSQL** vía `MotorSQL`.
5. Se genera una respuesta JSON para devolver al frontend.

---

## 🧪 Pruebas

* Pruebas de endpoints con **Postman**
* Mocks de frontend con datos reales
* Logs en consola y archivo
* Validaciones con JUnit en DAOs (si hay tiempo)

---

## 🛡️ Seguridad

* Hash de contraseñas con `SHA-256` o `BCrypt` (según disponibilidad)
* Validación de roles y acceso en cada endpoint
* Validación de inputs del usuario
* Inyección SQL prevenida con `PreparedStatements`

---

## 🚧 Estructura del Proyecto (Backend)

```
/src
├── /controller
│   └── FrontServlet.java
├── /actions
│   ├── UserAction.java
│   ├── ProductAction.java
│   └── OrderAction.java
├── /dao
│   ├── UserDAO.java
│   ├── ProductDAO.java
│   └── OrderDAO.java
├── /model
│   ├── User.java
│   ├── Product.java
│   └── Order.java
├── /util
│   └── MotorSQL.java
└── webapp
    └── WEB-INF/web.xml
```

---

## 📌 Tareas por Fases

1. \[✔] Diseñar el modelo ER
2. \[✔] Crear la base de datos en AWS RDS
3. \[✔] Establecer conexión con MotorSQL
4. \[🔧] Desarrollar servlet frontal
5. \[🔧] Crear clases Action y DAOs
6. \[🧪] Probar peticiones con Postman
7. \[🧩] Integrar con frontend
