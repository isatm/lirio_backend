# Lirio & Hibisco · Backend

API de la app Lirio & Hibisco (ideas de outfits). Backend en **NestJS** con **MongoDB** (Mongoose) y autenticación con **JWT**.

## Requisitos

- Node.js 18 o superior
- MongoDB (local, por ejemplo vía MongoDB Compass, o Atlas)
- Una cuenta de Cloudinary para subir las imágenes de los outfits

## Variables de entorno

Copia `.env.example` a `.env` y llena los valores:

```bash
MONGODB_URI=mongodb://localhost:27017/lirio_hibisco
JWT_SECRET=password
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
```

| Variable                | Qué es                                                              |
| ----------------------- | ------------------------------------------------------------------- |
| `MONGODB_URI`           | Cadena de conexión a MongoDB (local o Atlas)                        |
| `JWT_SECRET`            | Secreto con el que se firman los tokens. Usa uno largo y al azar.   |
| `CLOUDINARY_CLOUD_NAME` | Nombre de tu cuenta en Cloudinary (se ve en el dashboard)           |
| `CLOUDINARY_API_KEY`    | Llave pública de la API de Cloudinary                               |
| `CLOUDINARY_API_SECRET` | Llave secreta de la API de Cloudinary. **Nunca se sube a git.**     |

### Cómo conseguir las llaves de Cloudinary

Crea una cuenta gratuita en [Cloudinary](https://cloudinary.com). Al entrar, el
dashboard te muestra las tres llaves (`Cloud name`, `API Key`, `API Secret`).
Úsalas para llenar las variables `CLOUDINARY_*` del `.env`. Sin ellas, la
subida de imágenes de los posts falla en tiempo de ejecución.

## Levantar el backend

```bash
npm install
npm run start:dev
```

El servidor queda escuchando en `http://localhost:3000` (y en el resto de las interfaces `0.0.0.0:3000`, para que lo alcancen los dispositivos de la red local).

## Conexión con la app

El frontend (carpeta `frontend`) se conecta por `EXPO_PUBLIC_API_URL`. Si pruebas en un dispositivo físico, pon la IP de esta máquina en la red local en vez de `localhost`:

```bash
# Windows: ver la IP con
ipconfig
# Linux / macOS:
ifconfig  # o ip a
```

## Estructura

| Carpeta          | Qué hay                                        |
| ---------------- | ---------------------------------------------- |
| `src/users/`     | Registro, login, perfil y CRUD administrador   |
| `src/categories/`| Catálogo de categorías (CRUD administrador)    |
| `src/posts/`     | Publicaciones de outfits con subida a Cloudinary|
| `src/auth/`      | Emisión de JWT, guardias de autenticación y roles |