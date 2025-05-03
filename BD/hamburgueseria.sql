/* ========================================================= */
/*  0. utilidades                                           */
/* ========================================================= */
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

/* ========================================================= */
/*  1. tablas de referencia                                 */
/* ========================================================= */

CREATE TABLE PAIS (
    ISO        CHAR(2),
    NOMBRE     VARCHAR(80),
    CONSTRAINT PK_PAIS PRIMARY KEY (ISO),
    CONSTRAINT CK_PAIS_ISO CHECK (ISO ~ '^[A-Z]{2}$'),
    CONSTRAINT NN_NOMBRE_PAIS CHECK (NOMBRE IS NOT NULL)
);

CREATE TYPE TIPO_ROL AS ENUM ('admin','trabajador', 'cliente');

CREATE TABLE ROL (
    ID         SERIAL,
    NOMBRE     TIPO_ROL,
    DESCRIPCION TEXT,
    CONSTRAINT PK_ROL PRIMARY KEY (ID),
    CONSTRAINT UQ_ROL_NOMBRE UNIQUE (NOMBRE),
    CONSTRAINT NN_NOMBRE_ROL CHECK (NOMBRE IS NOT NULL)
);

CREATE TABLE DEPARTAMENTO (
    ID     SERIAL,
    NOMBRE VARCHAR(60),
    CONSTRAINT PK_DEPARTAMENTO PRIMARY KEY (ID),
    CONSTRAINT UQ_DEP_NOMBRE UNIQUE (NOMBRE),
    CONSTRAINT NN_NOMBRE_DEPARTAMENTO CHECK (NOMBRE IS NOT NULL)
);

/* ========================================================= */
/*  2. usuarios, empleados                                   */
/* ========================================================= */

CREATE TABLE USUARIO (
    ID             SERIAL,
    EMAIL          VARCHAR(120),
    PASSWORD_HASH  VARCHAR(255),
    NOMBRE         VARCHAR(30),
    APELLIDOS      VARCHAR(80),
    TELEFONO       VARCHAR(20),
    FECHA_ALTA     TIMESTAMPTZ DEFAULT NOW(),
    ACTIVO         BOOLEAN DEFAULT TRUE,
    ROL_ID         INT,
    CONSTRAINT PK_USUARIO PRIMARY KEY (ID),
    CONSTRAINT UQ_USUARIO_EMAIL UNIQUE (EMAIL),
    CONSTRAINT CK_USUARIO_EMAIL CHECK (EMAIL ~ '^[^@]+@[^@]+\.[^@]+$'),
    CONSTRAINT NN_USUARIO_EMAIL CHECK (EMAIL IS NOT NULL),
    CONSTRAINT NN_USUARIO_PASS  CHECK (PASSWORD_HASH IS NOT NULL),  
    CONSTRAINT NN_USUARIO_NOMBRE CHECK (NOMBRE IS NOT NULL),
    CONSTRAINT NN_USUARIO_FECHA_ALTA CHECK (FECHA_ALTA IS NOT NULL),
    CONSTRAINT NN_USUARIO_ACTIVO CHECK (ACTIVO IS NOT NULL),
    CONSTRAINT FK_USUARIO_ROL   FOREIGN KEY (ROL_ID) REFERENCES ROL (ID)
);

-- TABLA PARA RECUPERAR LA CONTRASENIA OLVIDADA
CREATE TABLE TOKEN_RECUPERACION (
    TOKEN UUID DEFAULT uuid_generate_v4(),
    USUARIO_ID  INT,
    EXPIRA      TIMESTAMPTZ,
    CONSTRAINT PK_TOKEN PRIMARY KEY (TOKEN),
    CONSTRAINT FK_TOKEN_USUARIO FOREIGN KEY (USUARIO_ID) REFERENCES USUARIO (ID) ON DELETE CASCADE,
    CONSTRAINT NN_USUARIO_ID CHECK (USUARIO_ID IS NOT NULL),
    CONSTRAINT NN_EXPIRA CHECK (EXPIRA IS NOT NULL)
);

CREATE TABLE RESTAURANTE (
    ID         SERIAL,
    NOMBRE     VARCHAR(30),
    DIRECCION  VARCHAR(200),
    CIUDAD     VARCHAR(50),
    ESTADO     VARCHAR(50),
    PAIS_ISO   CHAR(2),
    LAT        NUMERIC(9,6),
    LNG        NUMERIC(9,6),
    CONSTRAINT PK_RESTAURANTE PRIMARY KEY (ID),
    CONSTRAINT FK_REST_PAIS FOREIGN KEY (PAIS_ISO) REFERENCES PAIS (ISO),
    CONSTRAINT NN_RESTAURANTE_NOMBRE CHECK (NOMBRE IS NOT NULL),
    CONSTRAINT NN_RESTAURANTE_DIRECCION CHECK (DIRECCION IS NOT NULL),
    CONSTRAINT NN_RESTAURANTE_CIUDAD CHECK (CIUDAD IS NOT NULL),
    CONSTRAINT NN_RESTAURANTE_PAIS_ISO CHECK (PAIS_ISO IS NOT NULL)
);

CREATE TABLE EMPLEADO (
    ID               INT,   
    NIF              VARCHAR(15),
    FECHA_CONTRATO   DATE,
    SALARIO_BRUTO    NUMERIC(10,2),
    PUESTO           VARCHAR(60),
    MODALIDAD        VARCHAR(20),
    RESTAURANTE_ID   INT,
    DEPARTAMENTO_ID  INT,
    CONSTRAINT PK_EMPLEADO              PRIMARY KEY (ID),
    CONSTRAINT FK_EMP_USUARIO           FOREIGN KEY (ID) REFERENCES USUARIO (ID) ON DELETE CASCADE,
    CONSTRAINT FK_EMP_RESTAURANTE       FOREIGN KEY (RESTAURANTE_ID) REFERENCES RESTAURANTE(ID),
    CONSTRAINT NN_EMP_RESTAURANTE       CHECK (RESTAURANTE_ID IS NOT NULL),
    CONSTRAINT FK_EMP_DEP               FOREIGN KEY (DEPARTAMENTO_ID) REFERENCES DEPARTAMENTO(ID),
    CONSTRAINT NN_EMP_DEPART            CHECK (DEPARTAMENTO_ID  IS NOT NULL),
    CONSTRAINT CK_EMP_MODALIDAD         CHECK (MODALIDAD IN ('onsite','remoto')),
    CONSTRAINT NN_EMP_MODALIDAD         CHECK (MODALIDAD IS NOT NULL),
    CONSTRAINT UQ_EMP_NIF               UNIQUE (NIF),
    CONSTRAINT NN_EMP_NIF               CHECK (NIF IS NOT NULL),
    CONSTRAINT CK_EMP_NIF               CHECK (NIF ~ '^[0-9]{8}[A-Z]$'),
    CONSTRAINT NN_EMP_SALARIO           CHECK (SALARIO_BRUTO IS NOT NULL),
    CONSTRAINT CK_EMP_SALARIO           CHECK (SALARIO_BRUTO > 0),
    CONSTRAINT NN_EMP_FECHA             CHECK (FECHA_CONTRATO IS NOT NULL),
    CONSTRAINT NN_EMP_PUESTO            CHECK (PUESTO IS NOT NULL)
);

CREATE TABLE EMPLEADO_NACIONALIDAD (
    EMPLEADO_ID INT,
    PAIS_ISO    CHAR(2),
    DESDE       DATE,
    HASTA       DATE,
    CONSTRAINT PK_EMP_NAC PRIMARY KEY (EMPLEADO_ID, PAIS_ISO, DESDE),
    CONSTRAINT FK_EN_EMP  FOREIGN KEY (EMPLEADO_ID) REFERENCES EMPLEADO (ID) ON DELETE CASCADE,
    CONSTRAINT FK_EN_PAIS FOREIGN KEY (PAIS_ISO)   REFERENCES PAIS (ISO),
    CONSTRAINT NN_EMP_NAC_PAIS_ISO CHECK (PAIS_ISO IS NOT NULL),
    CONSTRAINT NN_EMP_NAC_DESDE CHECK (DESDE IS NOT NULL),
    CONSTRAINT CK_EMP_NAC_DESDE CHECK (DESDE <= CURRENT_DATE)
);

/* ========================================================= */
/*  3. catalogo de productos y recetas                      */
/* ========================================================= */

CREATE TABLE CATEGORIA (
    ID          SERIAL,
    NOMBRE      VARCHAR(60),
    DESCRIPCION TEXT,
    CONSTRAINT PK_CATEGORIA PRIMARY KEY (ID),
    CONSTRAINT UQ_CAT_NOMBRE UNIQUE (NOMBRE),
    CONSTRAINT NN_CAT_NOMBRE CHECK (NOMBRE IS NOT NULL)
);

CREATE TABLE PRODUCTO (
    ID           SERIAL,
    NOMBRE       VARCHAR(120),
    DESCRIPCION  TEXT,
    PRECIO       NUMERIC(10,2),
    DISPONIBLE   BOOLEAN DEFAULT TRUE,
    CATEGORIA_ID INT,
    CONSTRAINT PK_PRODUCTO PRIMARY KEY (ID),
    CONSTRAINT FK_PROD_CAT FOREIGN KEY (CATEGORIA_ID) REFERENCES CATEGORIA (ID),
    CONSTRAINT NN_PROD_NOMBRE CHECK (NOMBRE IS NOT NULL),
    CONSTRAINT NN_PROD_PRECIO CHECK (PRECIO IS NOT NULL),
    CONSTRAINT CK_PROD_PRECIO CHECK (PRECIO >= 0),
    CONSTRAINT NN_PROD_DISPONIBLE CHECK (DISPONIBLE IS NOT NULL)
);

CREATE TABLE PRODUCTO_IMAGEN (
    ID          SERIAL,
    PRODUCTO_ID INT,
    URL_S3      TEXT,
    ALT_TEXT    VARCHAR(120),
    CONSTRAINT PK_PROD_IMG PRIMARY KEY (ID),
    CONSTRAINT FK_PI_PROD FOREIGN KEY (PRODUCTO_ID) REFERENCES PRODUCTO (ID) ON DELETE CASCADE,
    CONSTRAINT NN_PROD_IMG_PROD_ID CHECK (PRODUCTO_ID IS NOT NULL),
    CONSTRAINT NN_PROD_IMG_URLS3 CHECK (URL_S3 IS NOT NULL),
    CONSTRAINT NN_PROD_IMG_TXT CHECK (ALT_TEXT IS NOT NULL)
);

/* ========================================================= */
/*  5. pedidos (online y local)                             */
/* ========================================================= */

CREATE TYPE PEDIDO_CANAL AS ENUM ('online','local');
CREATE TYPE PEDIDO_ESTADO AS ENUM (
  'nuevo',
  'en preparacion',
  'preparado',
  'enviado',
  'entregado',
  'cancelado'
);

CREATE TABLE PEDIDO (
    ID             SERIAL,
    CODIGO         VARCHAR(20),
    FECHA          TIMESTAMPTZ,
    CANAL          PEDIDO_CANAL,
    RESTAURANTE_ID INT,
    USUARIO_ID     INT,
    ESTADO         PEDIDO_ESTADO,
    DESCUENTO      NUMERIC(5,2),
    TOTAL          NUMERIC(10,2),
    CONSTRAINT PK_PEDIDO            PRIMARY KEY (ID),
    CONSTRAINT UQ_PED_CODIGO        UNIQUE (CODIGO),
    CONSTRAINT FK_PED_USU           FOREIGN KEY (USUARIO_ID)     REFERENCES USUARIO     (ID),
    CONSTRAINT FK_PED_REST          FOREIGN KEY (RESTAURANTE_ID) REFERENCES RESTAURANTE (ID),
    CONSTRAINT CK_PED_LOGICA        CHECK (
        (CANAL = 'online' AND USUARIO_ID IS NOT NULL  AND RESTAURANTE_ID IS NULL)
     OR (CANAL = 'local'  AND RESTAURANTE_ID IS NOT NULL AND USUARIO_ID IS NULL)
    ),
    CONSTRAINT NN_PEDIDO_COD        CHECK (CODIGO IS NOT NULL),
    CONSTRAINT CK_PEDIDO_COD        CHECK (trim(CODIGO) <> ''),
    CONSTRAINT NN_PEDIDO_FECHA      CHECK (FECHA IS NOT NULL),
    CONSTRAINT CK_PEDIDO_FECHA      CHECK (FECHA <= CURRENT_DATE),
    CONSTRAINT NN_PEDIDO_TOTAL      CHECK (TOTAL IS NOT NULL),
    CONSTRAINT CK_PEDIDO_TOTAL      CHECK (TOTAL > 0),
    CONSTRAINT NN_PED_DESCUENTO     CHECK (DESCUENTO IS NOT NULL),
    CONSTRAINT CK_PED_DESCUENTO     CHECK (DESCUENTO >= 0 AND DESCUENTO <= 100)
);



CREATE TABLE PEDIDO_LINEA (
    ID              SERIAL,
    PEDIDO_ID       INT,
    PRODUCTO_ID     INT,
    CANTIDAD        INT,
    PRECIO_UNITARIO NUMERIC(10,2),
    CONSTRAINT PK_PED_LINEA PRIMARY KEY (ID),
    CONSTRAINT FK_PL_PEDIDO  FOREIGN KEY (PEDIDO_ID)   REFERENCES PEDIDO (ID) ON DELETE CASCADE,
    CONSTRAINT FK_PL_PROD    FOREIGN KEY (PRODUCTO_ID) REFERENCES PRODUCTO (ID),
    CONSTRAINT NN_PEDIDO_LINEA_PEDIDO_ID CHECK (PEDIDO_ID IS NOT NULL),
    CONSTRAINT NN_PEDIDO_LINEA_PRODUCTO_ID CHECK (PRODUCTO_ID IS NOT NULL),
    CONSTRAINT NN_PEDIDO_LINEA_CANTIDAD CHECK (CANTIDAD IS NOT NULL),
    CONSTRAINT CK_PEDIDO_LINEA_CANTIDAD CHECK (CANTIDAD > 0),
    CONSTRAINT NN_PEDIDO_LINEA_PRECIO CHECK (PRECIO_UNITARIO IS NOT NULL),
    CONSTRAINT CK_PEDIDO_LINEA_PRECIO CHECK (PRECIO_UNITARIO > 0)
);

CREATE TABLE DIRECCION_ENVIO (
    ID         SERIAL,
    USUARIO_ID INT,
    CALLE      VARCHAR(120),
    CIUDAD     VARCHAR(80),
    CP         VARCHAR(15),
    PAIS_ISO   CHAR(2),
    CONSTRAINT PK_DIR_ENVIO PRIMARY KEY (ID),
    CONSTRAINT FK_DE_USU   FOREIGN KEY (USUARIO_ID) REFERENCES USUARIO (ID) ON DELETE CASCADE,
    CONSTRAINT FK_DE_PAIS  FOREIGN KEY (PAIS_ISO)   REFERENCES PAIS (ISO),
    CONSTRAINT NN_ENVIO_USUARIO_ID CHECK (USUARIO_ID IS NOT NULL),
    CONSTRAINT NN_ENVIO_CALLE CHECK (CALLE IS NOT NULL),
    CONSTRAINT NN_ENVIO_CIUDAD CHECK (CIUDAD IS NOT NULL),
    CONSTRAINT NN_ENVIO_CP CHECK (CP IS NOT NULL),
    CONSTRAINT CK_ENVIO_CP CHECK (CP ~ '^[0-9]{5}$')
);

CREATE TYPE PAGO_METODO AS ENUM ('efectivo','card','bizum');

CREATE TABLE PAGO (
    ID        SERIAL,
    PEDIDO_ID INT,
    METODO    PAGO_METODO,
    FECHA     TIMESTAMPTZ,
    IMPORTE   NUMERIC(10,2),
    RESULTADO VARCHAR(20),
    CONSTRAINT PK_PAGO               PRIMARY KEY  (ID),
    CONSTRAINT FK_PAGO_PEDIDO        FOREIGN KEY  (PEDIDO_ID)
                                              REFERENCES PEDIDO (ID)
                                              ON DELETE CASCADE,
    CONSTRAINT NN_PAGO_PEDIDO_ID     CHECK        (PEDIDO_ID IS NOT NULL),
    CONSTRAINT NN_PAGO_METODO        CHECK        (METODO    IS NOT NULL),
    CONSTRAINT NN_PAGO_FECHA         CHECK        (FECHA     IS NOT NULL),
    CONSTRAINT NN_PAGO_IMPORTE       CHECK        (IMPORTE   IS NOT NULL)
);

-- 2) Función-trigger que obliga a que el pago cubra el resto exacto del pedido
CREATE OR REPLACE FUNCTION trg_pago_importe_exacto()
RETURNS TRIGGER AS $$
DECLARE
  pedido_total   NUMERIC(10,2);
  suma_pagada    NUMERIC(10,2);
BEGIN
  -- Obtenemos el total del pedido
  SELECT total INTO pedido_total
    FROM pedido
    WHERE id = NEW.pedido_id;

  IF pedido_total IS NULL THEN
    RAISE EXCEPTION 'Pedido % no existe', NEW.pedido_id;
  END IF;

  -- Sumamos los pagos anteriores (sin incluir el nuevo)
  SELECT COALESCE(SUM(importe),0) INTO suma_pagada
    FROM pago
    WHERE pedido_id = NEW.pedido_id;

  -- Verificamos que el nuevo importe + ya pagado = total
  IF suma_pagada + NEW.importe <> pedido_total THEN
    RAISE EXCEPTION
      'Pago inválido: suma de pagos (%) debe ser exactamente igual a total (%)',
      suma_pagada + NEW.importe, pedido_total;
  END IF;

  -- Marcamos el pedido como pagado
  UPDATE pedido
    SET estado = 'pagado'
    WHERE id = NEW.pedido_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3) Asociamos el trigger a la tabla PAGO
DROP TRIGGER IF EXISTS chk_pago_importe_exacto ON pago;

CREATE TRIGGER chk_pago_importe_exacto
BEFORE INSERT OR UPDATE ON pago
FOR EACH ROW
EXECUTE FUNCTION trg_pago_importe_exacto();

/* ========================================================= */
/*  6. notificaciones y log                                 */
/* ========================================================= */

CREATE TABLE NOTIFICACION (
    ID               UUID,
    USUARIO_ID       INT,
    TIPO             VARCHAR(30),
    ASUNTO           VARCHAR(150),
    CUERPO           TEXT,
    FECHA_PROGRAMADA TIMESTAMPTZ,
    ENVIADA          BOOLEAN,
    CONSTRAINT PK_NOTIF                   PRIMARY KEY  (ID),
    CONSTRAINT FK_NOTIF_USUARIO           FOREIGN KEY  (USUARIO_ID)       REFERENCES USUARIO (ID),
    CONSTRAINT NN_NOTIF_ID                CHECK        (ID               IS NOT NULL),
    CONSTRAINT NN_NOTIF_USUARIO_ID        CHECK        (USUARIO_ID       IS NOT NULL),
    CONSTRAINT NN_NOTIF_TIPO              CHECK        (TIPO             IS NOT NULL),
    CONSTRAINT NN_NOTIF_ASUNTO            CHECK        (ASUNTO           IS NOT NULL),
    CONSTRAINT NN_NOTIF_CUERPO            CHECK        (CUERPO           IS NOT NULL),
    CONSTRAINT NN_NOTIF_FECHA_PROGRAMADA  CHECK        (FECHA_PROGRAMADA IS NOT NULL),
    CONSTRAINT NN_NOTIF_ENVIADA           CHECK        (ENVIADA          IS NOT NULL)
);

CREATE TABLE LOG_API (
    ID         SERIAL,
    ENDPOINT   VARCHAR(120),
    METODO     VARCHAR(10),
    STATUS     SMALLINT,
    IP         INET,
    USUARIO_ID INT,
    FECHA      TIMESTAMPTZ,
    CONSTRAINT PK_LOG                     PRIMARY KEY  (ID),
    CONSTRAINT FK_LOG_USUARIO             FOREIGN KEY  (USUARIO_ID)       REFERENCES USUARIO (ID),
    CONSTRAINT NN_LOG_ENDPOINT            CHECK        (ENDPOINT IS NOT NULL),
    CONSTRAINT NN_LOG_METODO              CHECK        (METODO   IS NOT NULL),
    CONSTRAINT NN_LOG_STATUS              CHECK        (STATUS   IS NOT NULL),
    CONSTRAINT NN_LOG_IP                  CHECK        (IP       IS NOT NULL),
    CONSTRAINT NN_LOG_FECHA               CHECK        (FECHA    IS NOT NULL)
);

COMMIT;

-- 1) Limpia versiones previas
DROP TRIGGER IF EXISTS chk_pago_importe_exacto ON pago;
DROP FUNCTION IF EXISTS trg_pago_importe_exacto();

-- 2) Crea la función trigger
CREATE OR REPLACE FUNCTION trg_pago_importe_exacto()
RETURNS TRIGGER AS $$
DECLARE
  pedido_total NUMERIC(10,2);
  suma_pagada  NUMERIC(10,2);
BEGIN
  -- 2.1 Obtenemos el total del pedido
  SELECT total
    INTO pedido_total
    FROM pedido
    WHERE id = NEW.pedido_id;
  IF pedido_total IS NULL THEN
    RAISE EXCEPTION 'Pedido % no existe', NEW.pedido_id;
  END IF;

  -- 2.2 Sumamos los pagos anteriores
  SELECT COALESCE(SUM(importe),0)
    INTO suma_pagada
    FROM pago
    WHERE pedido_id = NEW.pedido_id;

  -- 2.3 Validamos que paguen justo el total
  IF suma_pagada + NEW.importe <> pedido_total THEN
    RAISE EXCEPTION
      'Pago inválido: % + % ≠ %',
      suma_pagada, NEW.importe, pedido_total;
  END IF;

  -- 2.4 Marcamos el pedido como pagado
  UPDATE pedido
    SET estado = 'pagado'
    WHERE id = NEW.pedido_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3) Asocia el trigger a la tabla PAGO
CREATE TRIGGER chk_pago_importe_exacto
BEFORE INSERT OR UPDATE ON pago
FOR EACH ROW
EXECUTE PROCEDURE trg_pago_importe_exacto();

-- 1) Eliminamos la tabla PRODUCTO_IMAGEN
DROP TABLE IF EXISTS PRODUCTO_IMAGEN;

-- 2) Añadimos las columnas URL_S3 y ALT_TEXT a PRODUCTO
ALTER TABLE PRODUCTO
    ADD COLUMN URL_S3   TEXT,
    ADD COLUMN ALT_TEXT VARCHAR(120);

-- 3) Constraints para PRODUCTO
ALTER TABLE PRODUCTO
    ADD CONSTRAINT NN_PROD_URL_S3    CHECK (URL_S3   IS NOT NULL),
    ADD CONSTRAINT NN_PROD_ALT_TEXT  CHECK (ALT_TEXT IS NOT NULL);

-- 4) Añadimos las columnas URL_S3 y ALT_TEXT a RESTAURANTE
ALTER TABLE RESTAURANTE
    ADD COLUMN URL_S3   TEXT,
    ADD COLUMN ALT_TEXT VARCHAR(120);

-- 5) Constraints para RESTAURANTE
ALTER TABLE RESTAURANTE
    ADD CONSTRAINT NN_REST_URL_S3    CHECK (URL_S3   IS NOT NULL),
    ADD CONSTRAINT NN_REST_ALT_TEXT  CHECK (ALT_TEXT IS NOT NULL);

-- 1) Quitamos las columnas URL_S3 y ALT_TEXT de PRODUCTO
ALTER TABLE PRODUCTO
    DROP CONSTRAINT IF EXISTS NN_PROD_URL_S3,
    DROP CONSTRAINT IF EXISTS NN_PROD_ALT_TEXT,
    DROP COLUMN IF EXISTS URL_S3,
    DROP COLUMN IF EXISTS ALT_TEXT;

-- 2) Quitamos las columnas URL_S3 y ALT_TEXT de RESTAURANTE
ALTER TABLE RESTAURANTE
    DROP CONSTRAINT IF EXISTS NN_REST_URL_S3,
    DROP CONSTRAINT IF EXISTS NN_REST_ALT_TEXT,
    DROP COLUMN IF EXISTS URL_S3,
    DROP COLUMN IF EXISTS ALT_TEXT;

-- 1.1) Elimina el antiguo PASSWORD_HASH
ALTER TABLE USUARIO
  DROP COLUMN IF EXISTS PASSWORD_HASH;

-- 1.2) Añade la clave “sub” que Cognito genera para cada usuario
ALTER TABLE USUARIO
  ADD COLUMN COGNITO_SUB VARCHAR(36),
  ADD CONSTRAINT UQ_USU_COGNITO_SUB UNIQUE (COGNITO_SUB),
  ADD CONSTRAINT NN_USU_COGNITO_SUB CHECK (COGNITO_SUB IS NOT NULL);

ALTER TABLE PRODUCTO
  ADD COLUMN IMAGE_KEY VARCHAR(50), 
  ADD CONSTRAINT UQ_PRODUCTO_IMG UNIQUE (IMAGE_KEY),
  ADD CONSTRAINT NN_PRODUCTO_IMG CHECK (IMAGE_KEY IS NOT NULL);

ALTER TABLE RESTAURANTE
  ADD COLUMN IMAGE_KEY VARCHAR(50), 
  ADD CONSTRAINT UQ_RESTAURANTE_IMG UNIQUE (IMAGE_KEY),
  ADD CONSTRAINT NN_RESTAURANTE_IMG CHECK (IMAGE_KEY IS NOT NULL);

/* ① Añadir el estado 'pagado' al ENUM si no existe */
DO $$
BEGIN
  IF NOT EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'pedido_estado'
        AND e.enumlabel = 'pagado'
  ) THEN
      ALTER TYPE pedido_estado ADD VALUE 'pagado' AFTER 'entregado';
  END IF;
END $$;

/* ② Eliminar TOKEN_RECUPERACION (si ya no la necesitas) */
DROP TABLE IF EXISTS TOKEN_RECUPERACION CASCADE;

/* ③ Ampliar longitud de IMAGE_KEY a 255 y asegurar NOT NULL + UNIQUE */
ALTER TABLE PRODUCTO
  ALTER COLUMN IMAGE_KEY TYPE VARCHAR(255);

ALTER TABLE RESTAURANTE
  ALTER COLUMN IMAGE_KEY TYPE VARCHAR(255);

/* ④ Índices para nuevas columnas */
CREATE UNIQUE INDEX IF NOT EXISTS IX_PRODUCTO_IMG_KEY
        ON PRODUCTO (IMAGE_KEY);

CREATE UNIQUE INDEX IF NOT EXISTS IX_RESTAURANTE_IMG_KEY
        ON RESTAURANTE (IMAGE_KEY);

ALTER TABLE usuario
ADD COLUMN prefijo_tlf VARCHAR(5);

-- Constraint: no puede ser NULL (si siempre vas a guardarlo)
ALTER TABLE usuario
ALTER COLUMN prefijo_tlf SET NOT NULL;

-- Opcional: verifica formato básico
ALTER TABLE usuario
ADD CONSTRAINT ck_usuario_prefijo CHECK (prefijo_tlf ~ '^\\+\\d{1,4}$');

ALTER TABLE usuario
DROP CONSTRAINT IF EXISTS ck_usuario_prefijo;

ALTER TABLE usuario
ADD CONSTRAINT ck_usuario_prefijo
CHECK (prefijo_tlf ~ E'^\\+\\d{1,4}$');

ALTER TABLE pais
ADD COLUMN id SERIAL PRIMARY KEY;

-- Y garantizar que iso sigue siendo único
ALTER TABLE pais
ADD CONSTRAINT uq_pais_iso UNIQUE (iso);

DROP TABLE IF EXISTS pais CASCADE;

CREATE TABLE pais (
    id      SERIAL PRIMARY KEY,
    iso     CHAR(2) UNIQUE NOT NULL CHECK (iso ~ '^[A-Z]{2}$'),
    nombre  VARCHAR(80) NOT NULL
);

ALTER TABLE restaurante
RENAME COLUMN pais_iso TO pais_id;

ALTER TABLE restaurante
ALTER COLUMN pais_id TYPE INTEGER
USING pais_id::text::INTEGER;  -- ← fuerza la conversión segura

ALTER TABLE restaurante
ADD CONSTRAINT fk_rest_pais
FOREIGN KEY (pais_id) REFERENCES pais(id);

ALTER TABLE direccion_envio
RENAME COLUMN pais_iso TO pais_id;

ALTER TABLE direccion_envio
ALTER COLUMN pais_id TYPE INTEGER
USING pais_id::text::INTEGER;

ALTER TABLE direccion_envio
ADD CONSTRAINT fk_direnv_pais
FOREIGN KEY (pais_id) REFERENCES pais(id);

ALTER TABLE empleado_nacionalidad
RENAME COLUMN pais_iso TO pais_id;

ALTER TABLE empleado_nacionalidad
ALTER COLUMN pais_id TYPE INTEGER
USING pais_id::text::INTEGER;

ALTER TABLE empleado_nacionalidad
ADD CONSTRAINT fk_empnac_pais
FOREIGN KEY (pais_id) REFERENCES pais(id);

/* ================================================================
   ⬇️  COPIA-PEGA COMPLETO  —  AJUSTES FINALES A TABLAS “PEDIDO”  
   • Genera CODIGO automáticamente
   • Mantiene TOTAL siempre sincronizado
   • Índices de rendimiento
   ================================================================ */

/* ---------- 1 · SECUENCIA y FUNCIÓN para CODIGO --------------- */
-- (Elimina la secuencia anterior si existiese)
DROP SEQUENCE IF EXISTS seq_pedido_codigo;

-- Crea una secuencia independiente
CREATE SEQUENCE seq_pedido_codigo;

-- Función que devuelve, p. ej.  "240503-0001"
CREATE OR REPLACE FUNCTION gen_pedido_codigo()
RETURNS text AS $$
BEGIN
  RETURN to_char(now(), 'YYMMDD')                         -- fecha
         || '-' ||
         lpad(nextval('seq_pedido_codigo')::text, 4, '0'); -- contador
END;
$$ LANGUAGE plpgsql;

/* ---------- 2 · DEFAULT del campo CODIGO ---------------------- */
-- Asegúrate de que CODIGO permite 13–14 chars (ya era VARCHAR(20))
ALTER TABLE pedido
  ALTER COLUMN codigo SET DEFAULT gen_pedido_codigo();

/* ---------- 3 · TRIGGER para recalcular TOTAL ----------------- */
-- Elimina versión previa si la hubiese
DROP TRIGGER  IF EXISTS recalc_total_after_pl ON pedido_linea;
DROP FUNCTION IF EXISTS trg_recalc_total();

CREATE OR REPLACE FUNCTION trg_recalc_total()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualiza el total sumando todas las líneas menos el descuento
  UPDATE pedido p
  SET total = (
      SELECT COALESCE(SUM(cantidad * precio_unitario),0)
      FROM   pedido_linea
      WHERE  pedido_id = p.id
  ) - COALESCE(p.descuento,0)
  WHERE id = NEW.pedido_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recalc_total_after_pl
AFTER INSERT OR UPDATE OR DELETE ON pedido_linea
FOR EACH ROW EXECUTE FUNCTION trg_recalc_total();

/* ---------- 4 · ÍNDICES de ayuda ------------------------------ */
CREATE INDEX IF NOT EXISTS idx_pedido_usuario    ON pedido       (usuario_id);
CREATE INDEX IF NOT EXISTS idx_pedido_rest       ON pedido       (restaurante_id);
CREATE INDEX IF NOT EXISTS idx_pl_pedido         ON pedido_linea (pedido_id);
CREATE INDEX IF NOT EXISTS idx_pl_producto       ON pedido_linea (producto_id);

/* ---------- 5 · (Opcional) Verificación rápida ---------------- */
-- Inserta un pedido vacío para asegurarte de que CODIGO se genera:
-- INSERT INTO pedido (fecha, canal, usuario_id, estado, descuento, total)
-- VALUES (now(), 'online', 9, 'nuevo', 0, 0)
-- RETURNING id, codigo;

ALTER TABLE pedido DROP CONSTRAINT ck_pedido_fecha; ALTER TABLE pedido ADD CONSTRAINT ck_pedido_fecha CHECK (FECHA::date <= CURRENT_DATE);

-- 1) Asignar DEFAULT 0 a descuento (evita tener que pasarlo en el INSERT)
ALTER TABLE pedido
  ALTER COLUMN descuento SET DEFAULT 0;

-- 2) Quitar la antigua restricción de total > 0
ALTER TABLE pedido
  DROP CONSTRAINT IF EXISTS ck_pedido_total;

-- 3) Añadir nueva restricción que permita total = 0
ALTER TABLE pedido
  ADD CONSTRAINT ck_pedido_total
    CHECK (total >= 0);


/* ================================================================
   TRIGGER: Auto-llenar precio_unitario en pedido_linea
   – Copia el precio actual de producto.precio al insertar una línea
   – Garantiza historial inmutable aunque cambie el precio en catálogo
   ================================================================ */

-- 1) Elimina versiones previas (idempotente)
DROP TRIGGER IF EXISTS trg_fill_precio_unitario ON pedido_linea;
DROP FUNCTION IF EXISTS trg_fill_precio_unitario();

-- 2) Crea la función PL/pgSQL
CREATE OR REPLACE FUNCTION trg_fill_precio_unitario()
RETURNS TRIGGER AS $$
BEGIN
  -- Toma el precio del producto en catálogo
  SELECT precio
    INTO NEW.precio_unitario
    FROM producto
   WHERE id = NEW.producto_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3) Asocia el trigger a la tabla pedido_linea
CREATE TRIGGER trg_fill_precio_unitario
BEFORE INSERT ON pedido_linea
FOR EACH ROW
EXECUTE FUNCTION trg_fill_precio_unitario();

ALTER TABLE pedido
  ALTER COLUMN total SET DEFAULT 0,
  ALTER COLUMN total SET NOT NULL;









