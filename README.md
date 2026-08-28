# NODO · Field Analytics

Entrega interactiva basada en la pregunta analítica de las sesiones 1 y 2 del módulo **Gerencia de Proyectos y Analítica**. El prototipo permite explorar carga, capacidad, cumplimiento, brechas, backlog y tipos de reparación para técnicos de red externa.

> Los datos incluidos son demostrativos. No representan información productiva ni deben usarse para evaluar individualmente a un técnico.

## Ejecución local

```bash
npm install
npm run dev
```

Validación completa:

```bash
npm test
```

## Asistente LLM

El frontend consulta la función `/.netlify/functions/assistant`. La clave nunca se expone en el navegador.

Variables necesarias:

- `OPENAI_API_KEY`: clave del proveedor compatible con OpenAI.
- `OPENAI_BASE_URL`: URL base del proveedor (opcional).
- `OPENAI_MODEL`: modelo habilitado, por defecto `gpt-5-mini`.

Sin una clave configurada, el prototipo mantiene una lectura local de respaldo para la demostración.

## Despliegue en Netlify

1. Importar este repositorio privado desde GitHub.
2. Netlify detectará `netlify.toml`: comando `npm run build`, publicación desde `dist` y funciones desde `netlify/functions`.
3. Agregar las variables del asistente en **Site configuration → Environment variables**.
4. Desplegar y comprobar el tablero y el asistente.

## Alcance analítico

- Zonas: COSTA, ORIENTE, SUR, BOGOTÁ y ANDINA.
- Fuentes conceptuales: `WorkOrder` y `ServiceAppointment` de Salesforce Field Service.
- Enfoque: descriptivo y diagnóstico.
- Marcos: PMBOK 7, Scrum, CRISP-DM adaptado y DataOps.
- Fuera de alcance: predicción, optimización y evaluación individual.
