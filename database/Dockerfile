FROM postgres:16-alpine

ENV POSTGRES_DB=drivemotors
ENV POSTGRES_USER=drivex
ENV POSTGRES_PASSWORD=drivex_secret_2024

COPY init/ /docker-entrypoint-initdb.d/

EXPOSE 5432
