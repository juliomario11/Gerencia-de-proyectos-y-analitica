# RESUMEN — Guía de estudio antes de grabar

## Proyecto

**Sistema analítico para gestionar la capacidad de técnicos de reparación de red externa**  
**Estudiante:** Mario Daniel Enrique Pérez Jiménez  
**Pregunta central:**

> ¿Cómo distribuir las órdenes entre los técnicos según su capacidad disponible, carga comprometida, desplazamiento y tipo de reparación, para evitar sobreasignar trabajo que razonablemente no podrán cumplir y localizar brechas por zona y periodo?

---

# 1. Lo principal de la materia

La presentación debe comenzar explicando los cuatro enfoques. No son sinónimos ni etapas consecutivas de una misma metodología.

## PMBOK 7 — Gobierno del proyecto

### Pregunta que responde

> ¿Estamos entregando valor dentro del alcance y con los riesgos controlados?

### Cómo se aplica

- Define el propósito del proyecto.
- Delimita el alcance: analítica descriptiva y diagnóstica.
- Identifica interesados: Operaciones, Despacho, Planeación, Salesforce, Ingeniería de Datos y Dirección.
- Define responsables y criterios de aceptación.
- Gestiona riesgos de acceso, calidad, retención, seguridad y adopción.
- Evita que el proyecto crezca sin control hacia predicción u optimización.

### Evidencias

- Pregunta analítica aprobada.
- Alcance y exclusiones.
- Matriz de interesados o RACI.
- Registro de riesgos.
- Criterios de éxito y cierre.

### Frase para recordar

> PMBOK 7 mantiene el rumbo, el valor, los riesgos y la aceptación del proyecto.

---

## Scrum — Organización de la entrega

### Pregunta que responde

> ¿Qué incremento verificable se entregará y revisará ahora?

### Cómo se aplica

El proyecto se divide en tres Sprints:

1. **Base confiable:** contrato, extracción e histórico.
2. **Indicadores:** perfilado, calidad, modelo analítico y medidas.
3. **Uso y entrega:** tablero, validación y transferencia.

Cada Sprint incluye:

- Objetivo.
- Backlog priorizado.
- Incremento revisable.
- Sprint Review con Operaciones.
- Retrospectiva.
- Definition of Done.

### Por qué Scrum y no Kanban

Scrum se utiliza porque el proyecto tiene fecha de cierre e incrementos definidos. Kanban sería más apropiado después, para soporte continuo, incidentes y solicitudes de mejora.

### Frase para recordar

> Scrum transforma el proyecto en incrementos cortos que Operaciones puede revisar antes de continuar.

---

## CRISP-DM — Desarrollo analítico

### Pregunta que responde

> ¿Los datos y los resultados realmente sostienen la pregunta del negocio?

### Cómo se aplica

1. **Comprensión del negocio:** definir capacidad, carga, brecha y usuarios.
2. **Comprensión de los datos:** revisar WorkOrder, ServiceAppointment, AssignedResource, horarios y estados.
3. **Preparación:** homologar zonas, fechas, estados, claves y relaciones.
4. **Construcción analítica:** calcular indicadores y conjunto técnico-día.
5. **Evaluación:** validar resultados con Operaciones.
6. **Despliegue:** publicar el tablero y transferirlo.

CRISP-DM es iterativo. Si un indicador no se sostiene, se regresa a negocio, datos o preparación.

### Adaptación importante

No se entrena un modelo predictivo. La fase de modelado se adapta a la construcción y validación de indicadores descriptivos.

### Frase para recordar

> CRISP-DM permite volver atrás cuando el dato no respalda la interpretación del negocio.

---

## DataOps — Confiabilidad del producto de datos

### Pregunta que responde

> ¿Podemos reproducir, observar y confiar en cada resultado?

### Cómo se aplica

- Código y reglas versionados en Git.
- Extracciones identificadas por lote.
- Pruebas automáticas de calidad.
- Linaje desde el indicador hasta Salesforce.
- Monitoreo de frescura y volumen.
- Alertas y reintentos.
- Separación entre datos crudos, preparados y certificados.
- Promoción controlada de cambios.

### Frase para recordar

> DataOps evita que el tablero funcione una vez y falle silenciosamente después.

---

## Integración de los cuatro enfoques

```text
PMBOK 7
Gobierna valor, alcance, interesados y riesgos
        ↓
Scrum
Organiza el trabajo en incrementos revisables
        ↓
CRISP-DM
Guía el análisis dentro de cada incremento
        ↓
DataOps
Automatiza y mantiene confiable el producto de datos
```

### Frase completa para la exposición

> PMBOK 7 gobierna el proyecto; Scrum organiza los incrementos; CRISP-DM estructura el trabajo analítico dentro de esos incrementos; y DataOps hace que los datos y resultados sean reproducibles, observables y confiables.

---

# 2. Problema operativo

La empresa necesita decidir cuántas órdenes puede recibir cada técnico sin construir agendas imposibles de cumplir.

No es correcto asignar únicamente por cantidad de órdenes, porque las reparaciones tienen duraciones diferentes y consumen tiempo de desplazamiento.

## Información necesaria por técnico y día

- Minutos de turno.
- Ausencias.
- Bloqueos de agenda.
- Órdenes ya comprometidas.
- Duración de referencia por reparación.
- Desplazamiento verificable.
- Territorio.
- Habilidades requeridas.
- Participación como técnico principal o apoyo.

## Cálculo de capacidad restante

```text
Capacidad disponible neta
= minutos del turno − ausencias − bloqueos

Carga comprometida
= minutos de servicio ya asignados + desplazamientos

Capacidad restante después de una nueva orden
= capacidad disponible neta
− carga comprometida
− desplazamiento de la nueva orden
− duración de referencia de la nueva orden
```

Si el resultado es negativo, la nueva asignación produciría sobrecarga.

## Objetivo de negocio

> Detectar antes de despachar si una nueva orden cabe razonablemente en la jornada del técnico, para reasignarla, cambiar la ventana o solicitar apoyo.

## Precaución

El cálculo no garantiza que el técnico completará la orden. Es una referencia de planeación porque pueden ocurrir contingencias, falta de materiales, condiciones del territorio o cambios en la complejidad.

---

# 3. Relación correcta entre objetos de Salesforce

## WorkOrder

Representa el trabajo o necesidad de reparación.

Ejemplo:

```text
WO-00094821 — Reparar fibra cortada
```

Una WorkOrder debe contarse una sola vez como orden, aunque tenga varias visitas.

## ServiceAppointment

Representa una visita programada para ejecutar parte o la totalidad de la WorkOrder.

Una WorkOrder puede tener varias ServiceAppointments por:

- Reprogramación.
- Segunda visita.
- Diagnóstico previo.
- Falta de material.
- Necesidad de apoyo especializado.

Ejemplo:

```text
WO-00094821
├── SA-00178390 — diagnóstico
└── SA-00178432 — reparación
```

## AssignedResource o relación cita–técnico

Una ServiceAppointment puede tener uno o varios técnicos.

Ejemplo:

```text
SA-00178432
├── Andrés Molina — técnico principal
└── Julián Castro — apoyo de empalme
```

La relación completa es:

```text
WorkOrder 1:N ServiceAppointment
ServiceAppointment N:M Technician
```

## Riesgos de una tabla plana

Si se unen todos los objetos en una sola tabla sin controlar la granularidad:

- La WorkOrder puede contarse varias veces.
- La ServiceAppointment puede duplicarse por cada técnico.
- La duración puede sumarse completa a todos los técnicos.
- La carga total puede quedar inflada.
- El cumplimiento puede calcularse incorrectamente.

## Reglas de conteo

- **Órdenes asignadas:** contar `DISTINCT WORK_ORDER_ID` por técnico cuando exista asignación válida.
- **Citas asignadas:** contar `DISTINCT SERVICE_APPOINTMENT_ID`.
- **Técnicos involucrados:** contar la relación en `AssignedResource`.
- **Carga compartida:** definir una regla de imputación para no duplicar minutos.

Ejemplo de distribución simple:

```text
Cita de 120 minutos con dos técnicos
→ 60 minutos imputados a cada técnico
```

La regla real puede utilizar tiempo registrado, rol o porcentaje de dedicación, pero debe estar aprobada y documentada.

---

# 4. Modelo histórico propuesto en Oracle

No se recomienda una sola tabla plana. Se proponen cuatro estructuras:

## HIST_WORK_ORDER

- Una fila por versión de WorkOrder.
- Conserva estado, tipo de reparación, zona y vigencia.

## HIST_SERVICE_APPOINTMENT

- Una fila por versión de ServiceAppointment.
- Conserva programación, estado y tiempos reales.
- Relación N:1 con WorkOrder.

## BRIDGE_SA_TECHNICIAN

- Una fila por técnico asignado a una cita.
- Conserva rol, vigencia y minutos imputados.
- Resuelve la relación N:M.

Clave conceptual:

```text
SERVICE_APPOINTMENT_ID
+ TECHNICIAN_ID
+ ASSIGNED_FROM
```

## FACT_TECHNICIAN_DAY

- Una fila por técnico, fecha y zona.
- Consolida capacidad y carga sin duplicar órdenes ni minutos.

Clave conceptual:

```text
TECHNICIAN_ID + WORK_DATE + ZONE_CODE
```

---

# 5. Arquitectura de datos

```text
Salesforce Field Service
        ↓ extracción incremental
EventBridge + Step Functions
        ↓
Amazon S3 RAW
        ↓
AWS Glue — catálogo, calidad y transformación
        ↓
Amazon Athena — perfilado y conciliación
        ↓
Oracle Database — histórico corporativo
        ↓
Vista técnico-día y tablero
```

## Función de cada componente

- **Salesforce:** fuente operacional.
- **EventBridge:** inicia el proceso diario.
- **Step Functions:** orquesta etapas y reintentos.
- **S3 RAW:** conserva el extracto inmutable.
- **Glue:** cataloga, transforma y ejecuta reglas.
- **Athena:** valida conteos, duplicados e integridad sobre S3.
- **Oracle:** conserva el histórico relacional corporativo.
- **Tablero:** presenta capacidad, carga, brechas y ejecución.

---

# 6. Indicadores que debo saber explicar

## Órdenes asignadas

```text
COUNT(DISTINCT WORK_ORDER_ID)
```

Debe definirse el momento de asignación y el técnico relacionado.

## Citas asignadas

```text
COUNT(DISTINCT SERVICE_APPOINTMENT_ID)
```

No debe confundirse con órdenes, especialmente cuando existe reprogramación.

## Capacidad disponible

```text
minutos del turno − ausencias − bloqueos
```

## Carga planificada

```text
minutos de servicio imputados + desplazamiento verificable
```

## Utilización

```text
carga planificada / capacidad disponible
```

## Brecha

```text
carga planificada − capacidad disponible
```

- Positiva: sobrecarga potencial.
- Negativa: holgura potencial.

## Cumplimiento

```text
citas completadas / citas asignadas
```

## Backlog

Citas u órdenes pendientes al corte, acompañadas por antigüedad y vencimiento.

---

# 7. Gobernanza que debo mencionar

## Data Owner

Dirección de Operaciones. Aprueba uso, valor y definiciones críticas.

## Data Steward

Planeación Operativa. Mantiene glosario, calidad y reglas de conteo.

## Data Custodian

TI e Ingeniería de Datos. Opera seguridad, almacenamiento y pipelines.

## Data Consumer

Despacho y Supervisión. Usa el tablero y valida resultados.

## Controles principales

- Completitud mínima.
- Cero duplicados críticos.
- Integridad WorkOrder–ServiceAppointment.
- Integridad ServiceAppointment–AssignedResource.
- Cifrado y mínimo privilegio.
- Seudonimización del técnico.
- Linaje mediante lote, fecha y hash.
- Alerta por datos con más de 26 horas.
- Cuarentena de registros inválidos.

---

# 8. Orden recomendado para el video

1. Presentar la pregunta y el objetivo de evitar sobreasignación.
2. Explicar PMBOK 7, Scrum, CRISP-DM y DataOps.
3. Mostrar los tres Sprints y el avance.
4. Seleccionar una WorkOrder con dos ServiceAppointments.
5. Mostrar una cita trabajada por dos técnicos.
6. Explicar la relación 1:N y N:M.
7. Mostrar el simulador de capacidad por técnico.
8. Explicar por qué una asignación aparece como “Asignable” o “Sobrecarga”.
9. Ejecutar el pipeline AWS.
10. Mostrar las cuatro tablas Oracle.
11. Explicar gobernanza y calidad.
12. Cerrar con valor, limitaciones y siguiente paso.

---

# 9. Frases cortas para memorizar

- **PMBOK 7:** “Gobierna valor, alcance y riesgos”.
- **Scrum:** “Entrega incrementos que el usuario puede revisar”.
- **CRISP-DM:** “Permite iterar cuando el dato no sostiene la hipótesis”.
- **DataOps:** “Mantiene el producto reproducible y observable”.
- **WorkOrder:** “Representa el trabajo y se cuenta una vez”.
- **ServiceAppointment:** “Representa cada visita programada”.
- **AssignedResource:** “Relaciona una cita con uno o varios técnicos”.
- **Capacidad:** “No es solamente cantidad de órdenes; son minutos realmente disponibles”.
- **Gobernanza:** “Cada dato importante necesita dueño, definición, regla y evidencia”.
- **Alcance:** “El sistema apoya la decisión; no predice ni reemplaza el criterio operativo”.

---

# 10. Posibles preguntas del docente

## ¿Por qué una WorkOrder puede aparecer varias veces al unir las tablas?

Porque puede tener varias ServiceAppointments y cada cita puede tener varios AssignedResources. Una unión plana multiplica filas.

## ¿Cómo se evita contar la misma orden varias veces?

Con una medida distinta para cada granularidad y `COUNT(DISTINCT WORK_ORDER_ID)` cuando se mide órdenes.

## ¿Cómo se calcula la carga cuando trabajan dos técnicos?

Mediante una regla de imputación documentada. Puede dividirse por porcentaje, rol o tiempo real. Nunca se debe sumar automáticamente la duración completa a todos los técnicos.

## ¿Qué evita sobrecargar a un técnico?

Comparar su capacidad neta con órdenes comprometidas, desplazamientos y duración de la nueva reparación antes de asignarla.

## ¿Por qué no se garantiza el cumplimiento?

Porque la duración depende de complejidad, territorio, materiales, cliente y contingencias. Es una referencia descriptiva para planear.

## ¿Por qué se necesita DataOps si no existe machine learning?

Porque el pipeline, las reglas, los indicadores y el tablero también requieren versionamiento, pruebas, monitoreo y reproducibilidad.

## ¿Se necesita MLOps?

No en esta fase. Solo sería necesario si posteriormente se desplegara un modelo para predecir demanda o duración.

---

# 11. Cierre que puedo decir literalmente

> Este proyecto utiliza PMBOK 7 para gobernar el valor y los riesgos, Scrum para entregar incrementos revisables, CRISP-DM para estructurar el análisis y DataOps para mantener confiable el producto de datos. La solución diferencia órdenes, citas y recursos para evitar doble conteo y busca comparar la carga con la capacidad real de cada técnico antes de asignar nuevas reparaciones. Así, el tablero no promete el desempeño futuro, pero permite construir agendas más realistas, trazables y sostenibles.
