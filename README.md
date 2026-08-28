# NODO · Field Analytics

Entrega interactiva basada en la pregunta analítica de las sesiones 1 y 2 del módulo **Gerencia de Proyectos y Analítica**. El prototipo explica cómo una operación TELCO en Salesforce Field Service puede conservar y gobernar su histórico con servicios de AWS y Oracle Database.

> Todos los registros, nombres, métricas y ejecuciones visibles son simulados. La arquitectura representa una propuesta de diseño, no una plataforma productiva desplegada.

## Qué incluye

- Tablero de capacidad, carga, cumplimiento y brechas por zona.
- Simulador de `WorkOrder` y `ServiceAppointment`, técnico asignado y ciclo de estados.
- Representación de la carga incremental a `HIST_FFS_CAPACIDAD` en Oracle SQL.
- Flujo interactivo Salesforce → EventBridge/Step Functions → S3 → Glue → Athena → Oracle → tablero.
- Controles de calidad, seguridad, linaje, retención, definiciones y observabilidad.
- Aplicación de PMBOK 7, Scrum, CRISP-DM y DataOps.
- Avance del proyecto basado en entregables y evidencia.

No se incluye chat, asistente LLM, API ni claves externas.

## Ejecución local

```bash
npm install
npm run dev
```

Validación:

```bash
npm test
```

## Despliegue en Netlify

1. Importar el repositorio privado desde GitHub.
2. Netlify leerá `netlify.toml`.
3. Comando de compilación: `npm run build`.
4. Directorio de publicación: `dist`.
5. No se requieren variables de entorno.

## Documento para la exposición

La guía completa para preparar y grabar el video se encuentra en [`PRESENTACION_FINAL.md`](./PRESENTACION_FINAL.md).

## Referencias visuales de la simulación

La interfaz de los objetos de campo se diseñó como una simulación propia, tomando como referencia conceptual documentación pública de Salesforce:

- [Generate Work Orders for Efficient Service Management — Salesforce Trailhead](https://trailhead.salesforce.com/content/learn/modules/field_service_maint/field-service-generate-work-orders)
- [Mobile Field Service Experience — Salesforce Trailhead](https://trailhead.salesforce.com/content/learn/modules/field-service-mobile/work-from-anywhere)
- [Work Orders & Service Appointments](https://www.aintiram.com/blog-work-orders-service-appointments)

La arquitectura se apoya en patrones públicos de AWS:

- [Query your Oracle database using Athena Federated Query — AWS](https://aws.amazon.com/blogs/big-data/query-your-oracle-database-using-athena-federated-query-and-join-with-data-in-your-amazon-s3-data-lake/)
- [Build and orchestrate ETL pipelines using Amazon Athena and AWS Step Functions — AWS](https://aws.amazon.com/blogs/big-data/build-and-orchestrate-etl-pipelines-using-amazon-athena-and-aws-step-functions/)

## Alcance

- Zonas: COSTA, ORIENTE, SUR, BOGOTÁ y ANDINA.
- Fuentes: `WorkOrder`, `ServiceAppointment`, `ServiceResource` y `AssignedResource`.
- Enfoque: descriptivo y diagnóstico.
- Fuera de alcance: predicción, optimización y evaluación individual.
