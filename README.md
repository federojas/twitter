# Twitter API

Versión simplificada de una plataforma de microblogging similar a twitter que
permite a los usuarios publicar, seguir y ver el timeline de tweets.

El proyecto esta containerizado usando Docker y Docker Compose.

## Prerequisitos

- Docker Engine (20.10.0+)
- Docker Compose (2.0.0+)

## Variables de entorno

Las variables de entorno ya se encuentran definidas en `docker-compose.yml` para un despliegue rápido localmente (esto no es adecuado para un ambiente de producción).

## Inicialización

```bash
docker-compose up -d
```

Este comando construirá la aplicación y la ejecutará en modo detached. Se podrá acceder a la API en **http://api.localhost:3000**.

También se puede interactuar con la API a través de una Swagger UI en **http://api.localhost:3000/swagger**.

## Autenticación

Para los endpoints que requieren autenticación, usar el header **Authorization** con el valor **Bearer <user-id>** donde el **<user-id>** es el ID del usuario que esta haciendo el request (simulando ser un JWT).

## Finalización

```bash
docker-compose down
```
