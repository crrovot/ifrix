# Gestor de Comisiones

Este proyecto es una aplicación React para la gestión de comisiones de técnicos, utilizando Firebase como backend.

## Requisitos

- Node.js (v16 o superior)
- npm o yarn

## Instalación

1. Clona este repositorio:
   ```bash
   git clone https://github.com/tu-usuario/gestor-comisiones.git
   cd gestor-comisiones
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno:
   - Copia el archivo `.env.example` a `.env` y completa los valores correspondientes:
     ```bash
     cp .env.example .env
     ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Construcción para Producción

Para construir la aplicación para producción, ejecuta:
```bash
npm run build
```
Los archivos generados estarán en la carpeta `dist/`.

## Despliegue en VPS (Hostinger)

1. Asegúrate de tener configurado el acceso SSH a tu VPS.
2. Ejecuta el script de despliegue:
   ```bash
   ./scripts/deploy.sh
   ```
3. Asegúrate de que el servidor esté configurado para servir los archivos estáticos desde la carpeta `dist/`.

## Tecnologías Utilizadas

- React
- Firebase
- Vite
- TailwindCSS

## Licencia

Este proyecto está bajo la licencia MIT.