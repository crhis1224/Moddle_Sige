# Moddle Sige 🎓

**Moddle Sige** es una plataforma web moderna para la gestión académica, diseñada para optimizar los procesos de aprendizaje, control de planes de estudio, calificaciones y reportes. Construida con tecnologías de última generación como React 19, TypeScript, Vite y Tailwind CSS v4.

---

## 📸 Vista Previa del Proyecto

Aquí puedes ver la interfaz del sistema en sus diferentes roles:

### Inicio de Sesión
![Pantalla de Login](./public/login.png)

### Panel de Profesores
![Vista del Profesor](./public/vistaprofesores.png)

### Panel de Alumnos
![Vista del Alumno](./public/vistaalumnos.png)

---

## 🛠️ Tecnologías Utilizadas

### Core
* **React 19** & **TypeScript** (Tipado estricto y componentes eficientes)
* **Vite** (Entorno de desarrollo rápido)
* **Redux Toolkit** (Gestión de estado global centralizado)
* **React Router Dom v7** (Enrutamiento y vistas protegidas)

### UI y Estilos
* **Tailwind CSS v4** (Estilos modernos y optimizados)
* **Radix UI** (Componentes de interfaz accesibles y sin estilo previo)
* **Lucide React** (Paquete de iconos vectoriales)
* **TanStack Table v8** (Tablas de datos complejas, filtrado y ordenamiento)
* **Dnd Kit** (Soporte nativo para arrastrar y soltar / Drag and Drop)

### Formularios y Utilidades
* **React Hook Form** + **Zod** (Validación robusta de formularios)
* **Axios** (Cliente HTTP para consumo de servicios API)
* **React PDF** (Generación dinámica de reportes en formato PDF)
* **Date-fns** (Manipulación y formateo de fechas)

---

## 📁 Estructura del Proyecto

El proyecto sigue una arquitectura modular y escalable organizada de la siguiente manera:

```text
├───public               # Recursos estáticos y capturas de pantalla
└───src
    ├───api              # Capa de servicios y peticiones HTTP
    │   ├───grade-services
    │   ├───studyPlan
    │   ├───subject-services
    │   └───teacher-services
    ├───assets           # Imágenes, logos y recursos globales
    ├───components       # Componentes reutilizables de UI
    │   ├───reports      # Generadores de PDF y reportes
    │   ├───ui           # Componentes base (Botones, inputs, modales)
    │   └───widgets      # Bloques de interfaz complejos
    ├───lib              # Configuraciones de librerías de terceros
    ├───pages            # Vistas principales de la aplicación
    │   ├───private      # Rutas protegidas (Módulo de profesores, etc.)
    │   └───public       # Rutas abiertas (Pantalla de login)
    ├───redux            # Configuración del Store global y Slices
    ├───scennes          # Escenas y layouts de la aplicación
    └───utilities        # Funciones helpers y utilidades comunes
```

---

## 🚀 Instalación y Desarrollo Local

Sigue estos pasos para ejecutar el proyecto en tu entorno local:

### 1. Clonar el repositorio
```bash
git clone https://github.com
cd moddle_sige
```

### 2. Instalar las dependencias
```bash
npm install
```

### 3. Iniciar el servidor de desarrollo
```bash
npm run dev
```
El servidor se abrirá en [http://localhost:5173](http://localhost:5173).

---

## 📦 Scripts Disponibles

* `npm run dev`: Inicia el entorno local de desarrollo con Vite.
* `npm run build`: Compila el proyecto con TypeScript y genera los archivos de producción.
* `npm run lint`: Ejecuta ESLint para analizar errores de código y asegurar buenas prácticas.
* `npm run preview`: Sirve localmente la versión compilada en la carpeta de producción.