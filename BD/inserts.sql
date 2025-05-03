-- 1) Asegurarnos de tener los roles
INSERT INTO rol (nombre, descripcion)
VALUES 
  ('admin',      'Administrador con permisos totales'),
  ('trabajador', 'Empleado con acceso a la intranet'),
  ('cliente',    'Usuario final de la aplicación')
ON CONFLICT (nombre) DO NOTHING;

-- 2) Crear usuarios
INSERT INTO usuario (
    email, nombre, apellidos, telefono, prefijo_tlf,
    rol_id, cognito_sub
) VALUES
(
    'inigoal96@gmail.com',
    'Iñigo',
    'Andrés Laya',
    '628089730',
    '+34',
    (SELECT id FROM rol WHERE nombre = 'admin'),
    uuid_generate_v4()
),
(
    'duquegarciap@gmail.com',
    'Mario',
    'Cortés Cantín',
    '601479302',
    '+34',
    (SELECT id FROM rol WHERE nombre = 'admin'),
    uuid_generate_v4()
);

-- Inserta usuarios trabajadores de EE.UU.
INSERT INTO usuario (
    email, nombre, apellidos, telefono, prefijo_tlf,
    rol_id, cognito_sub
) VALUES
('a28516@svalero.com', 'Daniel', 'Ibañez Betés', '9175558844', '+1', (SELECT id FROM rol WHERE nombre = 'trabajador'), uuid_generate_v4()),
('a24175@svalero.com', 'Daniel', 'Lalanza Hernández', '2137894455', '+1', (SELECT id FROM rol WHERE nombre = 'trabajador'), uuid_generate_v4()),
('a28518@svalero.com', 'Daniel', 'Lázar Badorrey', '6463317890', '+1', (SELECT id FROM rol WHERE nombre = 'trabajador'), uuid_generate_v4()),
('a26602@svalero.com', 'Jesús', 'Losada Carreras', '7861023344', '+1', (SELECT id FROM rol WHERE nombre = 'trabajador'), uuid_generate_v4()),
('a28519@svalero.com', 'Lucía', 'Navarro Fresno', '4152239981', '+1', (SELECT id FROM rol WHERE nombre = 'trabajador'), uuid_generate_v4()),
('a28525@svalero.com', 'Jairo', 'Villacreses Macías', '7028843371', '+1', (SELECT id FROM rol WHERE nombre = 'trabajador'), uuid_generate_v4()),
('acalveche@svalero.com', 'Andrew', 'Calveche Marquina', '678100001', '+34', (SELECT id FROM rol WHERE nombre = 'trabajador'), uuid_generate_v4()),
('agarcia@svalero.com', 'Ainhoa', 'García Sanz', '678100002', '+34', (SELECT id FROM rol WHERE nombre = 'trabajador'), uuid_generate_v4()),
('apina@svalero.com', 'Alejandro', 'Pina Escabosa', '678100003', '+34', (SELECT id FROM rol WHERE nombre = 'trabajador'), uuid_generate_v4()),
('apires@svalero.com', 'Alejandro', 'Pires Herrera', '678100004', '+34', (SELECT id FROM rol WHERE nombre = 'trabajador'), uuid_generate_v4()),
('alopez@svalero.com', 'Álvaro', 'López Martínez', '678100005', '+34', (SELECT id FROM rol WHERE nombre = 'trabajador'), uuid_generate_v4());

-- Inserta 10 clientes con distintas nacionalidades
INSERT INTO usuario (
    email, nombre, apellidos, telefono, prefijo_tlf,
    rol_id, cognito_sub
) VALUES
('laura.martinez@gmail.com',     'Laura',    'Martínez Ríos',     '612345678', '+34',  (SELECT id FROM rol WHERE nombre = 'cliente'), uuid_generate_v4()),
('julien.lefevre@gmail.com',     'Julien',   'Lefevre',           '0612345678','+33',  (SELECT id FROM rol WHERE nombre = 'cliente'), uuid_generate_v4()),
('anna.schmidt@gmail.com',       'Anna',     'Schmidt',           '1512345678','+49',  (SELECT id FROM rol WHERE nombre = 'cliente'), uuid_generate_v4()),
('giulia.rossi@gmail.com',       'Giulia',   'Rossi',             '3471234567','+39',  (SELECT id FROM rol WHERE nombre = 'cliente'), uuid_generate_v4()),
('miguel.silva@gmail.com',       'Miguel',   'Silva',             '912345678', '+351', (SELECT id FROM rol WHERE nombre = 'cliente'), uuid_generate_v4()),
('valentina.lopez@gmail.com',    'Valentina','López',             '5512345678','+52',  (SELECT id FROM rol WHERE nombre = 'cliente'), uuid_generate_v4()),
('lucas.peralta@gmail.com',      'Lucas',    'Peralta',           '1145678900','+54',  (SELECT id FROM rol WHERE nombre = 'cliente'), uuid_generate_v4()),
('brandon.smith@gmail.com',      'Brandon',  'Smith',             '3057771234','+1',   (SELECT id FROM rol WHERE nombre = 'cliente'), uuid_generate_v4()),
('catalina.moreno@gmail.com',    'Catalina', 'Moreno',            '3204567890','+57',  (SELECT id FROM rol WHERE nombre = 'cliente'), uuid_generate_v4()),
('yuki.tanaka@gmail.com',        'Yuki',     'Tanaka',            '09012345678','+81', (SELECT id FROM rol WHERE nombre = 'cliente'), uuid_generate_v4());

INSERT INTO departamento (nombre) VALUES 
('Cocina'),
('Sala'),
('Reparto'),
('Informática')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO categoria (nombre, descripcion) VALUES
('Hamburguesas', 'Clásicas y premium, hechas con carne de calidad.'),
('Pollo', 'Hamburguesas elaboradas con filete de pollo crujiente o a la plancha.'),
('Veggie', 'Opciones vegetarianas para todos los gustos.'),
('Para Picar', 'Entrantes y snacks ideales para compartir.'),
('Postres', 'Dulces irresistibles para rematar tu menú.'),
('Bebidas', 'Refrescos, aguas y bebidas especiales.'),
('Salsas', 'Nuestras salsas caseras para acompañar tus platos.'),
('Combos', 'Ofertas que combinan varios productos con precio especial.')
ON CONFLICT (nombre) DO NOTHING;

UPDATE categoria
SET nombre = 'Ternera'
WHERE nombre = 'Hamburguesas';

INSERT INTO pais (iso, nombre) VALUES
('US', 'Estados Unidos'),
('ES', 'España'),
('FR', 'Francia'),
('DE', 'Alemania'),
('IT', 'Italia'),
('PT', 'Portugal'),
('GB', 'Reino Unido'),
('MX', 'México'),
('AR', 'Argentina'),
('CO', 'Colombia'),
('CL', 'Chile'),
('BR', 'Brasil'),
('CA', 'Canadá'),
('AU', 'Australia'),
('JP', 'Japón'),
('CN', 'China'),
('IN', 'India'),
('KR', 'Corea del Sur'),
('ZA', 'Sudáfrica'),
('RU', 'Rusia')
ON CONFLICT (iso) DO NOTHING;

DELETE FROM pais;

INSERT INTO pais (iso, nombre) VALUES
('US', 'Estados Unidos'),
('ES', 'España'),
('FR', 'Francia'),
('DE', 'Alemania'),
('IT', 'Italia'),
('PT', 'Portugal'),
('GB', 'Reino Unido'),
('MX', 'México'),
('AR', 'Argentina'),
('CO', 'Colombia'),
('CL', 'Chile'),
('BR', 'Brasil'),
('CA', 'Canadá'),
('AU', 'Australia'),
('JP', 'Japón'),
('CN', 'China'),
('IN', 'India'),
('KR', 'Corea del Sur'),
('ZA', 'Sudáfrica'),
('RU', 'Rusia');

INSERT INTO restaurante (
  nombre, direccion, ciudad, estado,
  pais_id, lat, lng, image_key
) VALUES
-- NEW YORK – Times Square
('MadBite NYC',
 '234 W 42nd St',
 'New York',
 'NY',
 1,  -- ← id de Estados Unidos
 40.757000, -73.986900,
 'images/restaurantes/times-square.png'),

-- LOS ANGELES – Venice Beach
('MadBite LA',
 '1205 Abbot Kinney Blvd',
 'Venice',
 'CA',
 1,
 33.990500, -118.465100,
 'images/restaurantes/venice-beach-2.png'),

-- MIAMI – Miami Beach
('MadBite Miami',
 '723 Lincoln Rd',
 'Miami Beach',
 'FL',
 1,
 25.790300, -80.139500,
 'images/restaurantes/miami-beach.png');


INSERT INTO empleado (
    id, nif, fecha_contrato, salario_bruto,
    puesto, modalidad, restaurante_id, departamento_id
) VALUES
-- === RESTAURANTE 1 · NYC ======================================
(3 , '12345678A', '2024-02-01', 28000.00, 'Cocinero',     'onsite', 1, 1),
(4 , '22345678B', '2024-02-01', 22000.00, 'Camarero',     'onsite', 1, 2),
(5 , '32345678C', '2024-02-01', 21000.00, 'Repartidor',   'onsite', 1, 3),
(6 , '42345678D', '2024-02-01', 32000.00, 'Informático',  'remoto', 1, 4),

-- === RESTAURANTE 2 · LOS ÁNGELES ==============================
(7 , '52345678E', '2024-03-01', 28500.00, 'Cocinero',     'onsite', 2, 1),
(8 , '62345678F', '2024-03-01', 22500.00, 'Camarero',     'onsite', 2, 2),
(9 , '72345678G', '2024-03-01', 21500.00, 'Repartidor',   'onsite', 2, 3),
(10, '82345678H', '2024-03-01', 32500.00, 'Informático',  'remoto', 2, 4),

-- === RESTAURANTE 3 · MIAMI ====================================
(11, '92345678J', '2024-04-01', 28000.00, 'Cocinero',     'onsite', 3, 1),
(12, '03345678K', '2024-04-01', 22000.00, 'Camarero',     'onsite', 3, 2),
(13, '13345678L', '2024-04-01', 21000.00, 'Repartidor',   'onsite', 3, 3);
-- Falta un usuario-informático para Miami:
-- (14, '23345678M', '2024-04-01', 33000.00, 'Informático',  'remoto', 3, 4);

INSERT INTO usuario (
    email,  nombre,  apellidos,  telefono, prefijo_tlf,
    rol_id, cognito_sub
) VALUES (
    'carlos.dominguez@svalero.com',   -- correo ficticio
    'Carlos',
    'Domínguez Ortega',
    '678100006',
    '+34',
    (SELECT id FROM rol WHERE nombre = 'trabajador'),
    uuid_generate_v4()
);

INSERT INTO empleado (
    id,  nif,        fecha_contrato, salario_bruto,
    puesto,        modalidad,   restaurante_id, departamento_id
) VALUES (
    14,            -- ← id del nuevo usuario
    '23345678M',   -- NIF único ficticio
    CURRENT_DATE,
    33000.00,
    'Informático',
    'remoto',
    3,             -- restaurante “MadBite Miami”
    4              -- departamento Informática
);

INSERT INTO empleado_nacionalidad (empleado_id, pais_id, desde, hasta) VALUES
-- ============ NEW YORK ===================================================
(3 , 1, '2024-02-01', NULL),  -- Cocinero · nacionalidad EEUU
(4 , 1, '2024-02-01', NULL),  -- Camarero
(5 , 1, '2024-02-01', NULL),  -- Repartidor (actual)
(5 , 8, '2022-01-01', '2024-01-31'),  -- Repartidor tuvo MX antes
(6 , 1, '2024-02-01', NULL),  -- Informático remoto con doble (→ ES abajo)
(6 , 2, '2023-05-15', NULL),  -- Informático remoto · nacionalidad ES

-- ============ LOS ÁNGELES =================================================
(7 , 1, '2024-03-01', NULL),  -- Cocinero
(8 , 1, '2024-03-01', NULL),  -- Camarero
(9 , 1, '2024-03-01', NULL),  -- Repartidor
(10, 2, '2023-05-15', NULL),  -- Informático remoto · ES

-- ============ MIAMI ======================================================
(11, 1, '2024-04-01', NULL),  -- Cocinero
(12, 1, '2024-04-01', NULL),  -- Camarero
(13, 1, '2024-04-01', NULL),  -- Repartidor
(31, 2, '2023-05-15', NULL);  -- Informático remoto · ES

INSERT INTO direccion_envio (usuario_id, calle, ciudad, cp, pais_id) VALUES
-- ======= ADMINS (España) ==================================================
(1 , 'C/ Serrano 12',      'Madrid',       '28001', 2),
(2 , 'Pº Independencia 5', 'Zaragoza',     '50001', 2),

-- ======= TRABAJADORES · RESTAURANTE NYC ===================================
(3 , '234 W 42nd St',      'New York',     '10036', 1),
(4 , '235 W 42nd St',      'New York',     '10036', 1),
(5 , '236 W 42nd St',      'New York',     '10036', 1),
(6 , '237 W 42nd St',      'New York',     '10036', 1),

-- ======= TRABAJADORES · RESTAURANTE LA ====================================
(7 , '1205 Abbot Kinney',  'Venice',       '90291', 1),
(8 , '1206 Abbot Kinney',  'Venice',       '90291', 1),
(9 , '1207 Abbot Kinney',  'Venice',       '90291', 1),
(10, '1208 Abbot Kinney',  'Venice',       '90291', 1),

-- ======= TRABAJADORES · RESTAURANTE MIAMI =================================
(11, '723 Lincoln Rd',     'Miami Beach',  '33139', 1),
(12, '724 Lincoln Rd',     'Miami Beach',  '33139', 1),
(13, '725 Lincoln Rd',     'Miami Beach',  '33139', 1),

-- ======= CLIENTES =========================================================
(21, 'C/ Aragó 210',       'Barcelona',    '08007', 2),   -- Laura ES
(22, '15 Rue Cler',        'Paris',        '75007', 3),   -- Julien FR
(23, 'Unter den Linden 5', 'Berlin',       '10115', 4),   -- Anna DE
(24, 'Via Cavour 21',      'Roma',         '00184', 5),   -- Giulia IT
(25, 'Av. Liberdade 120',  'Lisboa',       '11001', 6),   -- Miguel PT
(26, 'Av. Reforma 350',    'Ciudad de MX', '11560', 8),   -- Valentina MX
(27, 'Av. Corrientes 4100','Buenos Aires', '14006', 9),   -- Lucas AR
(28, '1600 Pennsylvania',  'Miami',        '33101', 1),   -- Brandon US
(29, 'C/ 26 #45-60',       'Bogotá',       '11001',10),   -- Catalina CO
(30, '1-1 Chiyoda',        'Tokyo',        '10000',15),   -- Yuki JP
(31, '742 Evergreen Ter',  'Springfield',  '62704', 1);   -- Usuario extra (genérico US)

INSERT INTO producto (
    nombre, descripcion, precio, disponible, categoria_id, image_key
) VALUES
('Mineral Water',        'Agua mineral natural',                 1.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Bebidas'),
 'images/carta/bebidas/agua.png'),

('Sparkling Water',      'Agua con gas refrescante',             2.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Bebidas'),
 'images/carta/bebidas/agua_gas.png'),

('Coca-Cola',            'Refresco original',                    2.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Bebidas'),
 'images/carta/bebidas/cocacola.png'),

('Coca-Cola Zero',       'Sin azúcar, mismo sabor',              2.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Bebidas'),
 'images/carta/bebidas/cocacola_zero.png'),

('Fanta Orange',         'Fanta sabor naranja',                  2.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Bebidas'),
 'images/carta/bebidas/fanta_naranja.png'),

('Fanta Lemon',          'Fanta sabor limón',                    2.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Bebidas'),
 'images/carta/bebidas/fanta_limon.png'),

('Sprite',               'Refresco lima-limón',                  2.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Bebidas'),
 'images/carta/bebidas/sprite.png'),

('Red Bull',             'Bebida energética',                    3.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Bebidas'),
 'images/carta/bebidas/redbull.png'),

('Aquarius Lemon',       'Isotónica sabor limón',                2.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Bebidas'),
 'images/carta/bebidas/aquarius_limon.png'),

('Aquarius Orange',      'Isotónica sabor naranja',              2.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Bebidas'),
 'images/carta/bebidas/aquarius_naranja.png'),

('Budweiser Beer',       'Cerveza Budweiser 33 cl',              4.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Bebidas'),
 'images/carta/bebidas/cerveza_budweiser.png'),

('Corona Beer',          'Cerveza Corona 33 cl',                 4.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Bebidas'),
 'images/carta/bebidas/cerveza_corona.png'),

('Desperados Beer',      'Cerveza con toque de tequila',         5.49, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Bebidas'),
 'images/carta/bebidas/cerveza_desperados.png'),

('Ambar Beer',           'Cerveza Ambar especial',               4.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Bebidas'),
 'images/carta/bebidas/ambar.png'),

('Estrella Galicia',     'Cerveza Estrella Galicia 33 cl',       4.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Bebidas'),
 'images/carta/bebidas/cerveza_estrella_galicia.png');

  UPDATE producto
SET image_key = 'assets/' || image_key
WHERE categoria_id = (SELECT id
                      FROM categoria
                      WHERE nombre = 'Bebidas');

UPDATE restaurante
SET image_key = 'assets/' || image_key;

UPDATE categoria
SET nombre       = 'Complementos',
    descripcion  = 'Entrantes y guarniciones para compartir'
WHERE nombre = 'Para Picar';

INSERT INTO producto (
    nombre, descripcion, precio, disponible, categoria_id, image_key
) VALUES
-- 1  POTATO WEDGES  ($5.99)
('Potato Wedges',
 'Spiced potato wedges with our secret blend of herbs and spices.',
 5.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Complementos'),
 'assets/images/carta/complementos/patatas_gajo.png'),

-- 2  RUSTIC FRIES  ($6.99)
('Rustic Fries',
 'Potatoes cut into thin strips, fried and seasoned with freshly ground salt and black pepper.',
 6.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Complementos'),
 'assets/images/carta/complementos/patatas_tallarin.png'),

-- 3  SPICY WINGS  ($10.99)
('Spicy Wings',
 'Chicken wings with buffalo sauce, accompanied by fresh salad and carrot sticks.',
 10.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Complementos'),
 'assets/images/carta/complementos/alitas_ensalada.png'),

-- 4  WINGS WITH FRIES  ($12.99)
('Wings with Fries',
 'Crispy chicken wings with fries, accompanied by barbecue sauce.',
 12.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Complementos'),
 'assets/images/carta/complementos/alitas_patatas.png'),

-- 5  ONION RINGS  ($7.99)
('Onion Rings',
 'Crispy onion rings accompanied by our special MADBITE sauce.',
 7.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Complementos'),
 'assets/images/carta/complementos/aros_cebolla.png'),

-- 6  CAESAR SALAD  ($9.99)
('Caesar Salad',
 'Romaine lettuce, croutons, Parmesan, grilled chicken and our homemade Caesar dressing.',
 9.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Complementos'),
 'assets/images/carta/complementos/ensalada_cesar.png'),

-- 7  FRESH SALAD  ($8.99)
('Fresh Salad',
 'Mix of lettuce, tomato, onion and special vinaigrette.',
 8.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Complementos'),
 'assets/images/carta/complementos/ensalada_normal.png'),

-- 8  CHICKEN NUGGETS  ($8.99)
('Chicken Nuggets',
 'Homemade chicken nuggets served with barbecue or honey mustard sauce.',
 8.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Complementos'),
 'assets/images/carta/complementos/nuggets_pollo.png');

 UPDATE producto SET descripcion = 'Natural mineral water'
WHERE nombre = 'Mineral Water';

UPDATE producto SET descripcion = 'Refreshing sparkling water'
WHERE nombre = 'Sparkling Water';

UPDATE producto SET descripcion = 'Classic cola drink'
WHERE nombre = 'Coca-Cola';

UPDATE producto SET descripcion = 'Zero-sugar cola with full flavour'
WHERE nombre = 'Coca-Cola Zero';

UPDATE producto SET descripcion = 'Orange-flavoured Fanta soda'
WHERE nombre = 'Fanta Orange';

UPDATE producto SET descripcion = 'Lemon-flavoured Fanta soda'
WHERE nombre = 'Fanta Lemon';

UPDATE producto SET descripcion = 'Lemon-lime soda'
WHERE nombre = 'Sprite';

UPDATE producto SET descripcion = 'Energy drink'
WHERE nombre = 'Red Bull';

UPDATE producto SET descripcion = 'Lemon-flavoured isotonic drink'
WHERE nombre = 'Aquarius Lemon';

UPDATE producto SET descripcion = 'Orange-flavoured isotonic drink'
WHERE nombre = 'Aquarius Orange';

UPDATE producto SET descripcion = 'Budweiser beer, 33 cl'
WHERE nombre = 'Budweiser Beer';

UPDATE producto SET descripcion = 'Corona beer, 33 cl'
WHERE nombre = 'Corona Beer';

UPDATE producto SET descripcion = 'Beer with a tequila twist'
WHERE nombre = 'Desperados Beer';

UPDATE producto SET descripcion = 'Ambar special lager'
WHERE nombre = 'Ambar Beer';

UPDATE producto SET descripcion = 'Estrella Galicia beer, 33 cl'
WHERE nombre = 'Estrella Galicia';

INSERT INTO producto (
    nombre, descripcion, precio, disponible, categoria_id, image_key
) VALUES
-- 1  LA CLASSIC MADBITE  ($12.99)
('LA Classic Madbite',
 'Our classic burger with premium beef, cheddar cheese, tomato, lettuce and our secret sauce.',
 12.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Ternera'),
 'assets/images/carta/hamburguesas/carne/hamb_carne1.png'),

-- 2  Cheese Lover  ($14.99)
('Cheese Lover',
 'Triple cheese: cheddar, gouda and blue cheese with premium beef and crispy bacon.',
 14.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Ternera'),
 'assets/images/carta/hamburguesas/carne/hamb_carne2.png'),

-- 3  Diablo  ($14.99)
('Diablo',
 'Explosion of spice with jalapeños, spicy guacamole, pepper jack cheese and our infernal sauce.',
 14.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Ternera'),
 'assets/images/carta/hamburguesas/carne/hamb_carne3.png'),

-- 4  BBQ Deluxe  ($14.99)
('BBQ Deluxe',
 'Smoky flavour with homemade barbecue sauce, caramelised onions, bacon and melted cheddar cheese.',
 14.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Ternera'),
 'assets/images/carta/hamburguesas/carne/hamb_carne4.png');

 UPDATE producto
SET image_key = 'assets/images/carta/hamburguesas/carne/classic_madbite.png'
WHERE nombre = 'LA Classic Madbite';

UPDATE producto
SET image_key = 'assets/images/carta/hamburguesas/carne/cheese_lover.png'
WHERE nombre = 'Cheese Lover';

UPDATE producto
SET image_key = 'assets/images/carta/hamburguesas/carne/diablo.png'
WHERE nombre = 'Diablo';

UPDATE producto
SET image_key = 'assets/images/carta/hamburguesas/carne/bbq_deluxe.png'
WHERE nombre = 'BBQ Deluxe';

INSERT INTO producto (
    nombre, descripcion, precio, disponible, categoria_id, image_key
) VALUES
-- 1  INFERNO CHICKEN  ($14.99)
('Inferno Chicken',
 'For spicy lovers: jalapeños, spicy guacamole, pepper jack cheese and habanero sauce.',
 14.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Pollo'),
 'assets/images/carta/hamburguesas/pollo/inferno_chicken.png'),

-- 2  CRISPY RANCH  ($13.99)
('Crispy Ranch',
 'Crispy chicken with bacon, lettuce, tomato, cheddar cheese and our homemade ranch sauce.',
 13.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Pollo'),
 'assets/images/carta/hamburguesas/pollo/crispy_ranch.png'),

-- 3  BUFFALO CHICKEN  ($14.99)
('Buffalo Chicken',
 'Extra-crispy chicken with buffalo sauce, blue cheese, crispy celery and ranch sauce.',
 14.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Pollo'),
 'assets/images/carta/hamburguesas/pollo/buffalo_chicken.png'),

-- 4  DOUBLE CRISPY  ($16.99)
('Double Crispy',
 'Double extra-crispy chicken fillet, double cheddar cheese, lettuce, tomato and bourbon sauce.',
 16.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Pollo'),
 'assets/images/carta/hamburguesas/pollo/double_crispy.png'),

-- 5  SPICY ASIAN  ($15.99)
('Spicy Asian',
 'Chicken marinated in teriyaki sauce with Asian cabbage, pickled cucumbers and sriracha mayo.',
 15.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Pollo'),
 'assets/images/carta/hamburguesas/pollo/spicy_asian.png');

INSERT INTO producto (
    nombre, descripcion, precio, disponible, categoria_id, image_key
) VALUES
-- 1  Falafel Burger  ($13.99)
('Falafel Burger',
 'Homemade falafel patty, hummus, cucumber, tomato, red onion and vegan yogurt sauce.',
 13.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Veggie'),
 'assets/images/carta/hamburguesas/vegetal/falafel_burguer.png'),

-- 2  Beyond Classic  ($15.99)
('Beyond Classic',
 'Beyond Meat burger with vegan cheese, lettuce, tomato, red onion and our special vegan sauce.',
 15.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Veggie'),
 'assets/images/carta/hamburguesas/vegetal/beyond_classic.png');

INSERT INTO producto (
    nombre, descripcion, precio, disponible, categoria_id, image_key
) VALUES
-- 1  Chocolate Coulant  ($7.99)
('Chocolate Coulant',
 'Warm chocolate cake with molten center and vanilla ice cream.',
 7.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Postres'),
 'assets/images/carta/postres/coulant.png'),

-- 2  MadBite Sundae  ($6.99)
('MadBite Sundae',
 'Selection of ice creams with whipped cream, syrup of your choice, cookies and nuts.',
 6.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Postres'),
 'assets/images/carta/postres/helado.png'),

-- 3  Chocolate Cake  ($8.99)
('Chocolate Cake',
 'Three-layer chocolate cake with ganache, served with whipped cream and berries.',
 8.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Postres'),
 'assets/images/carta/postres/tarta_choco.png'),

-- 4  Cheesecake  ($7.99)
('Cheesecake',
 'Classic creamy cheesecake on a cookie base with red-berry coulis.',
 7.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Postres'),
 'assets/images/carta/postres/tarta_queso.png'),

-- 5  Tiramisu  ($8.99)
('Tiramisu',
 'Authentic Italian tiramisu with coffee, mascarpone, ladyfingers and cocoa powder.',
 8.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Postres'),
 'assets/images/carta/postres/tiramisu.png');


INSERT INTO producto (
    nombre, descripcion, precio, disponible, categoria_id, image_key
) VALUES
-- 1  Alioli  ($1.50)
('Alioli',
 'Creamy garlic sauce, perfect for fries and grilled meats.',
 1.50, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Salsas'),
 'assets/images/carta/salsas/alioli.png'),

-- 2  Barbecue  ($1.50)
('Barbecue',
 'Smoky and sweet BBQ sauce for burgers and grilled meats.',
 1.50, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Salsas'),
 'assets/images/carta/salsas/barbacoa.png'),

-- 3  Brava  ($1.50)
('Brava',
 'Traditional Spanish spicy sauce for potatoes and meats.',
 1.50, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Salsas'),
 'assets/images/carta/salsas/brava.png'),

-- 4  Ketchup  ($1.00)
('Ketchup',
 'Classic sweet-and-tangy tomato ketchup.',
 1.00, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Salsas'),
 'assets/images/carta/salsas/ketchup.png'),

-- 5  MadBite Secret  ($2.50)
('MadBite Secret',
 'Our exclusive secret sauce, a unique combo of flavours.',
 2.50, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Salsas'),
 'assets/images/carta/salsas/madbite_secret.png'),

-- 6  Ranch  ($1.50)
('Ranch',
 'Creamy herb ranch, ideal with chicken burgers and salads.',
 1.50, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Salsas'),
 'assets/images/carta/salsas/ranch.png');

 INSERT INTO producto (
    nombre, descripcion, precio, disponible, categoria_id, image_key
) VALUES
-- 1  Classic Combo  ($16.99)
('Classic Combo',
 'Classic MADBITE burger + french fries + soft drink of your choice.',
 16.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Combos'),
 'assets/images/carta/hamburguesas/combos/classic_combo.png'),

-- 2  Cheese Combo  ($18.99)
('Cheese Combo',
 'Cheese Lover burger + fries with cheddar cheese + soft drink of your choice.',
 18.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Combos'),
 'assets/images/carta/hamburguesas/combos/cheese_combo.png'),

-- 3  Diablo Combo  ($19.99)
('Diablo Combo',
 'Diablo burger + spicy potatoes + soft drink of your choice.',
 19.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Combos'),
 'assets/images/carta/hamburguesas/combos/diablo_combo.png'),

-- 4  Crispy Chicken Combo  ($17.99)
('Crispy Chicken Combo',
 'Crispy Ranch burger + french fries + soft drink of your choice.',
 17.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Combos'),
 'assets/images/carta/hamburguesas/combos/crispy_chicken_combo.png'),

-- 5  Veggie Combo  ($16.99)
('Veggie Combo',
 'Falafel burger + salad + drink of your choice.',
 16.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Combos'),
 'assets/images/carta/hamburguesas/combos/veggie_combo.png'),

-- 6  Family Combo  ($59.99)
('Family Combo',
 '4 burgers of your choice + 2 appetizers + 4 drinks + 2 desserts to share.',
 59.99, TRUE,
 (SELECT id FROM categoria WHERE nombre = 'Combos'),
 'assets/images/carta/hamburguesas/combos/family_combo.png');

 INSERT INTO pedido (fecha, canal, usuario_id, estado, descuento, total)
VALUES (now(), 'online', 9, 'nuevo', 0, 0)
RETURNING id, codigo;

DELETE FROM pedido
WHERE id = 3;

-- 1) Pedido ONLINE sin descuento (usuario 9)
INSERT INTO pedido (
    fecha,
    canal,
    usuario_id,
    restaurante_id,
    estado,
    descuento,
    total
) VALUES (
    now(),
    'online',
    9,        -- usuario_id
    NULL,     -- restaurante_id
    'nuevo',
    0.00,
    0.00
);

-- 2) Pedido ONLINE con 5€ de descuento (usuario 10)
INSERT INTO pedido (
    fecha,
    canal,
    usuario_id,
    restaurante_id,
    estado,
    descuento,
    total
) VALUES (
    now(),
    'online',
    10,       -- usuario_id
    NULL,     -- restaurante_id
    'nuevo',
    5.00,
    0.00
);

-- 3) Pedido LOCAL sin descuento (restaurante 2)
INSERT INTO pedido (
    fecha,
    canal,
    usuario_id,
    restaurante_id,
    estado,
    descuento,
    total
) VALUES (
    now(),
    'local',
    NULL,     -- usuario_id
    2,        -- restaurante_id
    'nuevo',
    0.00,
    0.00
);

-- 1) Pago completo con tarjeta para el pedido 5 (subtotal = 93.92)
INSERT INTO pago (pedido_id, metodo, fecha, importe, resultado)
VALUES (
  5,
  'card',
  now(),
  93.92,
  'ok'
);

-- 2) Pago completo con Bizum para el pedido 10 (subtotal = 36.96)
INSERT INTO pago (pedido_id, metodo, fecha, importe, resultado)
VALUES (
  10,
  'bizum',
  now() - interval '1 hour',
  36.96,
  'completed'
);

-- NOTA:
-- • Los pedidos 5 y 10 pasarán de “nuevo” a “pagado” gracias al trigger.
-- • No hemos insertado pagos para los pedidos 6 y 7, de modo que
--   ambos seguirán en estado “nuevo” (o “en preparacion” cuando lo quieras).





















