# 🏷️ MADBITE Fullstack Project

**Descripción**: Proyecto **MADBITE**, una solución web completa para una hamburguesería moderna, con frontend responsive en **HTML5/CSS3/JavaScript** y backend robusto en **Java J2EE**, desplegado en **Apache Tomcat** y persistencia en **PostgreSQL en AWS RDS**.

---

## 🗂️ Índice

1. [Arquitectura](#arquitectura)
2. [Tecnologías](#tecnologías)
3. [Estructura del Repositorio](#estructura-del-repositorio)
4. [Quickstart Desarrollo](#quickstart-desarrollo)
5. [Build & Deploy Automatizado](#build--deploy-automatizado)
6. [CI/CD](#cicd)
7. [Versionado y Releases](#versionado-y-releases)
8. [Buenas Prácticas](#buenas-prácticas)

---

## 🏛️ Arquitectura

```text
[Frontend: Vite DevServer (puerto 3000)]
      ↓ Proxy /api → Tomcat (puerto 8090)
[Backend: Java J2EE (Servlet MVC) + AWS RDS PostgreSQL]
```

1. **Frontend**: Bundling y hot‑reload con Vite.
2. **Proxy**: En desarrollo, `/api/*` se redirige a Tomcat.
3. **Backend**: Servlet frontal dirige a Actions → DAOs → MotorSQL.
4. **DB**: PostgreSQL alojado en AWS RDS.

---

## 🚀 Tecnologías

| Capa         | Herramienta / Librería                 |
| ------------ | -------------------------------------- |
| Frontend     | HTML5, CSS3, JavaScript ES6+, Vite 🛠️ |
| Bundler      | Vite v6.x (Rollup internals)           |
| Backend      | Java J2EE (Servlet API), Maven 🛠️     |
| Persistencia | PostgreSQL (AWS RDS), HikariCP         |
| JSON         | Jackson (Java), fetch API              |
| Contenedor   | Apache Tomcat 10.1                     |
| CI/CD        | GitHub Actions / Jenkins               |

---

## 📁 Estructura del Repositorio

```
/ (root)
├─ pom.xml                 # Build Maven, WAR
├─ README.md               # Documentación unificada
├─ src/
│  └─ main/
│     ├─ java/             # Código Java (MVC: controllers, actions, dao)
│     └─ webapp/           # Frontend + assets
│         ├─ index.html
│         ├─ js/
│         ├─ css/
│         ├─ assets/
│         ├─ vite.config.js
│         ├─ package.json
│         ├─ yarn.lock
│         └─ dist/         # Generado por `yarn build` (Ignorado)
└─ .gitignore              # Ignorar node_modules, dist/
```

---

## 🛠️ Quickstart Desarrollo

> **Requisitos**: Node.js ≥ 18 LTS, Yarn, JDK ≥ 11, Maven.

1. **Frontend** (hot‑reload en `localhost:3000`):

   ```bash
   cd src/main/webapp
   yarn install        # Instalación de dependencias
   yarn dev            # Levanta Vite Dev Server
   ```

2. **Backend + WAR** (Tomcat en `localhost:8090`):

   ```bash
   cd ../../..         # Raíz del proyecto
   mvn clean package   # Build completo (incluye frontend build)
   ```

3. **Despliegue en Tomcat**:

   * Configura SmartTomcat en IntelliJ apuntando a `target/HAM_BACK.war`.
   * Contexto `/back`, puerto 8090.

---

## 🔄 Build & Deploy Automatizado

El **frontend-maven-plugin** integra el build de Vite en Maven:

```xml
<build>
  <plugins>
    <plugin>
      <groupId>com.github.eirslett</groupId>
      <artifactId>frontend-maven-plugin</artifactId>
      <version>1.12.0</version>
      <configuration>
        <workingDirectory>src/main/webapp</workingDirectory>
      </configuration>
      <executions>
        <execution><id>install-node</id><goals><goal>install-node-and-npm</goal></goals><configuration><nodeVersion>v22.15.0</nodeVersion></configuration></execution>
        <execution><id>npm install</id><goals><goal>npm</goal></goals><configuration><arguments>install</arguments></configuration></execution>
        <execution><id>npm build</id><goals><goal>npm</goal></goals><configuration><arguments>run build</arguments></configuration></execution>
      </executions>
    </plugin>
    <plugin><artifactId>maven-war-plugin</artifactId><version>3.4.0</version><configuration><warSourceDirectory>src/main/webapp</warSourceDirectory></configuration></plugin>
  </plugins>
</build>
```

* **`mvn clean package`**: instala Node, npm install, `npm run build` → `dist/`, empaqueta WAR.

---

## ⚙️ CI/CD

**Ejemplo GitHub Actions**:

```yaml
name: Build & Deploy
on: [ push ]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '22'
      - name: Install Frontend Dependencies
        working-directory: src/main/webapp
        run: yarn install
      - name: Build Frontend
        run: yarn build
        working-directory: src/main/webapp
      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          distribution: 'temurin'
          java-version: '17'
      - name: Build Backend
        run: mvn clean package --file pom.xml
```

---

## 📌 Versionado y Releases

* **SemVer**: etiquetas `vMAJOR.MINOR.PATCH`.
* **Etiquetar** release estable:

  ```bash
  git tag v1.0.0
  git push origin v1.0.0
  ```
* **CHANGELOG.md**: documentar mejoras y breaking changes.

---

## ✅ Buenas Prácticas

* Mantener `.gitignore` limpio (sin `node_modules`, `dist`).
* Revisiones trimestrales de dependencias (Dependabot).
* Monitoreo de logs y métricas en producción.
* Documentar endpoints principales y convenciones de API.

---

*⚙️ Visión tradicional, metodología probada, sin atajos. Desarrollo y build confiables, alineados con estándares corporativos.*
