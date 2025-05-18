# Twitter API

El proyecto esta containerizado usando Docker y Docker Compose.

## Prerequisitos

- Docker Engine (20.10.0+)
- Docker Compose (2.0.0+)

## Variables de entorno

Las variables de entornp ya se encuentran definidas en `docker-compose.yml` para un despliegue rápido localmente (esto no es adecuado para un ambiente de producción).

## Inicialización

```bash
docker-compose up -d
```

Este comando construira la aplicación y la correrá en modo detached. Se podrá acceder a la api en **http://api.localhost:3000**.

## Finalización

```bash
docker-compose down
```
