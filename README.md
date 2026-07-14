# Psister - Hackathon Proyecto

WattIA es una aplicación web full-stack de monitoreo de consumo eléctrico residencial.

## Requisitos
- Node.js (v18+)
- npm

## Instalación de Dependencias

Puedes revisar el archivo `requirements.txt` adjunto en la raíz para conocer las librerías exactas utilizadas en cada módulo del proyecto. Para descargar e instalar las dependencias automáticamente, sigue estos pasos:

1. Instala las dependencias en la raíz (esto instalará `concurrently` para correr el entorno):
   ```bash
   npm install
   ```
2. Instala las dependencias del backend:
   ```bash
   cd backend
   npm install
   ```
3. Instala las dependencias del frontend:
   ```bash
   cd frontend
   npm install
   ```

## Configuración de Entorno

En la carpeta `backend`, asegúrate de tener un archivo `.env` con las siguientes variables:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="super-secret-key-for-wattia-hackathon-2026"
ANTHROPIC_API_KEY="tu_clave_api_de_anthropic_aqui"
```

## Base de Datos y Archivo Semilla

El proyecto usa SQLite para facilitar la prueba local. 
Se ha incluido un **archivo semilla (`backend/prisma/seed.js`)** que ya contiene información precargada para probar la plataforma inmediatamente (electrodomésticos con historiales y planillas). 

El usuario precargado (semilla) es:
- **Correo:** `ale.zambrano@wattia.com`
- **Contraseña:** `123456`

Para inicializar la base de datos y poblarla con el archivo semilla, ejecuta desde la carpeta `backend`:
```bash
npx prisma migrate dev --name init_v5
node prisma/seed.js
```

## Ejecución

Para levantar ambos servicios (frontend y backend) con un solo comando, ve a la carpeta raíz (`wattia`) y ejecuta:
```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173` y el backend en `http://localhost:3001`.
