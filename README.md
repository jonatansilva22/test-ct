# Solicitudes de promociones

Aplicación web para administrar solicitudes de promociones internas. Los solicitantes pueden registrar y editar sus promociones pendientes; la administradora puede revisar, aprobar o rechazar las solicitudes. También permite importar promociones desde un archivo Excel.

La aplicación simula la selección de Ana, Luis o Marta. No incluye inicio de sesión ni autenticación real.

## Tecnologías

- **Backend:** Node.js, Express, MongoDB y Mongoose.
- **Frontend:** React y Vite.
- **Peticiones HTTP:** Axios.
- **Lectura de archivos Excel:** SheetJS (`xlsx`).

## Requisitos

- Node.js y npm.
- MongoDB instalado localmente o una base de datos en MongoDB Atlas.

## Configuración y ejecución

### Backend

Abre una terminal en la raíz del proyecto e instala las dependencias:


npm install


Copia el archivo de ejemplo de variables de entorno a la raíz del proyecto


Carga los usuarios iniciales:

```powershell
node src/scripts/usersSeed.js
```

Inicia el servidor:

```powershell
npm run dev
```

El backend se ejecuta en `http://localhost:3000`.

### Frontend

Abre otra terminal y ejecuta:

```powershell
cd client
npm install
npm run dev
```

Abre en el navegador la dirección que indique Vite, normalmente `http://localhost:5173`.

Durante el desarrollo, Vite reenvía las peticiones de la API al backend en el puerto `3000`.


## Nota sobre autenticación

No se implementó autenticación ni manejo de sesiones con JWT, porque no formaban parte de los requisitos de la prueba. Los usuarios se seleccionan de forma simulada; por lo tanto, tampoco hay registro de usuarios ni almacenamiento de contraseñas.
