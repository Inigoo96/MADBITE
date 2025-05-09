# MADBITE Frontend 🍔⚡

Frontend del proyecto **MADBITE**, una hamburguesería moderna con presencia en EE.UU. y desarrollada por un equipo de informáticos en España. Este frontend forma parte de un ecosistema completo web con backend en Java J2EE y base de datos alojada en AWS.

## 📅 Cronograma

Reto activo: **24 de abril - 21 de mayo de 2025**
Dedicación: **4h/día, 7 días a la semana**
Equipo: **2 personas**

---

## 📱 Mobile First & Diseño Responsive

* Diseño centrado en **Mobile First**
* Adaptabilidad mediante **media queries**
* Separación de capas: `HTML`, `CSS`, `JavaScript`
* Accesibilidad web según buenas prácticas (roles ARIA, contraste, etc.)

---

## 🌐 Tecnologías Usadas

* **HTML5** / **CSS3**
* **JavaScript ES6+** (con `fetch` + `async/await`)
* **JSON** como formato de intercambio
* **API REST** para comunicación con backend
* Diseño adaptado a estándares de **WAI-ARIA**
* Estilo visual basado en guía de marca (ver más abajo)

---

## 🎨 Estilo Visual

Extraído del [Moodboard de marca](MADBITE.docx):

* **Tipografías**

  * `Outrun Future` (títulos)
  * `Eurostile Extended Bold` (subtítulos)
  * `Montserrat` (texto corrido)

* **Colores corporativos**

  ```
  Azul Neón       #00F0FF
  Rosa Magenta    #FF00CD
  Naranja Eléctrico #FF5D00
  Negro Profundo   #0A0A0F
  Blanco Brillante #FFFFFF
  Turquesa         #0AFFDA
  Gris Acero       #2B2D42
  ```

* **Reglas**

  * Base negra, acentos en neón
  * Alto contraste para legibilidad
  * Glow en títulos y sombra sutil en subtítulos
  * Diseño inspirado en estética retro-futurista y cultura diner americana

---

## 📂 Estructura del Proyecto

```
/frontend
├── /assets
│   ├── /img
│   └── /fonts
├── /css
│   └── styles.css
├── /js
│   └── app.js
├── /components
│   └── header.html, footer.html, etc.
├── index.html
└── README.md
```

---

## 🔌 Comunicación Front–Back

* Las peticiones se realizarán al backend J2EE mediante **fetch API**
* Todas las respuestas e intercambios serán en **formato JSON**
* Endpoints definidos en función de los **casos de uso**:

### Ejemplos:

* `POST /login`
* `POST /register`
* `GET /products`
* `POST /order`
* `GET /order/:id`

---

## 📚 Casos de Uso Cubiertos en el Front

* Registro de usuario
* Inicio de sesión
* Navegación por productos por categoría
* Gestión de pedidos (añadir, confirmar, ver historial)
* Acceso personalizado según rol (cliente, personal)
* Visualización dinámica vía JavaScript de datos obtenidos de la API

---

## 🧪 Pruebas y Validación

* Validación de accesibilidad con herramientas como Lighthouse
* Pruebas manuales en distintos dispositivos (responsive)
* Pruebas de integración con el backend mediante mocks y entorno de pruebas

---

## 💡 Creatividad & Detalles Visuales

* Animaciones sutiles con CSS (hover, transición de botones, etc.)
* Elementos visuales únicos como botones con efecto neón y banners dinámicos
* Fondo dinámico animado (opcional)
* Estética coherente con concepto cyber-diner neón

---

## 🔐 Notas de Seguridad

* Sanitización de entradas del usuario
* Validación básica antes de enviar formularios
* Manejo de errores y feedback visual en el frontend
