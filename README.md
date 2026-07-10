# WattIA - Hackathon Proyecto

WattIA es una aplicación web full-stack de monitoreo de consumo eléctrico residencial.

## Requisitos
- Node.js (v18+)
- npm

## Instalación

1. Instala las dependencias en la raíz (esto instalará `concurrently`):
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

## Base de Datos

El proyecto usa SQLite para facilitar la prueba local. Para inicializar/poblar la base de datos, ejecuta desde la carpeta `backend`:
```bash
npx prisma migrate dev --name init
```

## Ejecución

Para levantar ambos servicios (frontend y backend) con un solo comando, ve a la carpeta raíz (`wattia`) y ejecuta:
```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173` y el backend en `http://localhost:3001`.
