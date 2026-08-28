# Presentación final — Sistema analítico de capacidad de técnicos TELCO

**Estudiante:** Mario Daniel Enrique Pérez Jiménez  
**Programa:** Especialización en Analítica de Datos  
**Módulo:** Gerencia de Proyectos y Analítica  
**Docente:** Luis Felipe Ortiz-Clavijo  
**Duración sugerida:** 10 a 13 minutos

---

## 1. Propósito de esta guía

Este documento sirve como:

1. Material de repaso antes de la exposición.
2. Estructura narrativa para el video.
3. Presentación escrita que acompaña el prototipo interactivo.
4. Evidencia de cómo se conectan el problema, la arquitectura, la gobernanza y los marcos de trabajo.

La aplicación y este documento utilizan datos demostrativos. La arquitectura presentada es una propuesta de solución y no debe describirse como una implementación productiva ya desplegada.

---

# Guion de presentación

## 2. Apertura — 45 segundos

### Qué mostrar

Abrir la sección **Panorama** del prototipo.

### Qué decir

> Mi nombre es Mario Daniel Enrique Pérez Jiménez. El proyecto propone un sistema analítico para comprender y gestionar la capacidad operativa de los técnicos que atienden reparaciones de red externa en una empresa de telecomunicaciones.
>
> El producto conecta tres perspectivas. Primero, la operación registrada en Salesforce Field Service. Segundo, una arquitectura de datos sobre servicios de AWS y un histórico corporativo en Oracle. Tercero, un modelo de gobierno y gestión basado en PMBOK 7, Scrum, CRISP-DM y DataOps.

### Mensaje central

El proyecto no busca evaluar individualmente a los técnicos ni predecir cuántas órdenes completarán. Busca entregar información descriptiva y diagnóstica para mejorar la asignación y la agenda.

---

## 3. Problema y pregunta analítica — 1 minuto

### Problema

Salesforce Field Service es una fuente operacional. En el caso planteado, las órdenes finalizadas o canceladas solamente permanecen disponibles durante 90 días antes de su depuración.

Esto produce cuatro riesgos:

- Pérdida del histórico necesario para analizar tendencias.
- Cortes manuales con definiciones diferentes.
- Dificultad para relacionar carga, capacidad y ejecución.
- Decisiones operativas sin trazabilidad hasta el registro original.

### Pregunta analítica

> ¿Cómo distribuir las órdenes entre los técnicos según su capacidad disponible, carga comprometida, desplazamiento y tipo de reparación, para evitar sobreasignar trabajo que razonablemente no podrán cumplir y localizar brechas por zona y periodo?

### Alcance

- Zonas: COSTA, ORIENTE, SUR, BOGOTÁ y ANDINA.
- Universo: reparaciones de red externa.
- Unidades relacionadas: WorkOrder, ServiceAppointment y asignación cita–técnico, respetando la granularidad de cada una.
- Resultado: histórico, reglas de calidad, indicadores y tablero.
- Fuera de alcance: modelos predictivos, optimización automática y evaluación individual.

---

## 4. Demostración de la operación — 2 minutos

### Qué mostrar

Ir a **Operación** y seleccionar distintas órdenes en la cola.

### WorkOrder

La `WorkOrder` representa el trabajo que debe realizarse. En el ejemplo contiene:

- Identificador de la orden.
- Tipo de trabajo y reparación.
- Cuenta o cliente seudonimizado.
- Territorio de servicio.
- Prioridad.
- Relación con una o varias citas.

### ServiceAppointment

La `ServiceAppointment` representa la ejecución programada del trabajo. Contiene:

- Ventana de atención.
- Uno o varios técnicos o recursos asignados.
- Territorio.
- Estado operativo.
- Fechas programadas y reales.

### Estados simulados

1. **Creada:** la cita existe, pero aún no tiene una ejecución confirmada.
2. **Programada:** se asignó una ventana y normalmente un recurso.
3. **Despachada:** el despachador envió el trabajo al técnico.
4. **En ruta:** el técnico inició el desplazamiento.
5. **En sitio:** comenzó la atención en campo.
6. **Completada:** se cerró la ejecución y se registraron los tiempos reales.

Durante el video, utilizar el botón para mover la cita al siguiente estado.

### Relación entre objetos

Una WorkOrder puede relacionarse con más de una ServiceAppointment cuando existe diagnóstico, reprogramación o una nueva visita. A su vez, una ServiceAppointment puede ser trabajada por varios técnicos mediante `AssignedResource`.

```text
WorkOrder 1:N ServiceAppointment
ServiceAppointment N:M Technician
```

Por esta razón, la WorkOrder se cuenta una vez, las citas se cuentan de forma distinta y la carga compartida se imputa con una regla documentada para no duplicar minutos.

### Frase recomendada

> La orden explica qué trabajo existe; cada cita explica una visita; y AssignedResource identifica quién participa. La capacidad se analiza a nivel técnico–día sin duplicar la orden ni cargar la duración completa a todos los integrantes de la cuadrilla.

---

## 5. Arquitectura de datos propuesta — 2 minutos y 30 segundos

### Qué mostrar

Ir a **Arquitectura** y ejecutar la simulación del pipeline.

## Flujo general

```text
Salesforce Field Service
        ↓
Amazon EventBridge + AWS Step Functions
        ↓
Amazon S3 — zonas RAW y CURATED
        ↓
AWS Glue — catálogo, calidad y transformación
        ↓
Amazon Athena — perfilado y conciliación
        ↓
Oracle Database — históricos, puente cita–técnico y hecho técnico–día
        ↓
Vista semántica y tablero
```

### 5.1 Salesforce Field Service

Objetos principales:

- `WorkOrder`
- `ServiceAppointment`
- `ServiceResource`
- `AssignedResource`

La extracción debe ser incremental. Puede utilizar `SystemModstamp` o una marca equivalente para identificar registros nuevos y modificados antes de la depuración de 90 días.

### 5.2 EventBridge y Step Functions

**Amazon EventBridge** inicia el proceso en un horario definido.  
**AWS Step Functions** coordina las etapas, los reintentos y las rutas de error.

El flujo debe ser idempotente: volver a ejecutar un lote no debe duplicar registros.

### 5.3 Amazon S3

S3 conserva dos zonas principales:

- **RAW:** copia inmutable del dato extraído.
- **CURATED:** datos estandarizados y listos para consulta.

Se recomienda:

- Formato Parquet.
- Particiones por fecha, objeto y zona.
- Cifrado con AWS KMS.
- Versionado.
- Reglas de ciclo de vida.

### 5.4 AWS Glue

Glue cumple tres funciones:

1. Mantener el catálogo técnico de tablas y esquemas.
2. Transformar fechas, estados, claves y zonas.
3. Ejecutar reglas de calidad antes de la carga corporativa.

Ejemplos de reglas:

- Identificador de WorkOrder no nulo.
- Identificador de ServiceAppointment no duplicado en la versión vigente.
- Zona dentro del dominio aprobado.
- Relación válida entre orden y cita.
- Fecha final posterior a la fecha inicial.

### 5.5 Amazon Athena

Athena consulta los archivos de S3 sin administrar servidores.

Se utiliza para:

- Perfilar los extractos.
- Comparar conteos entre origen y destino.
- Detectar duplicados.
- Medir nulos.
- Validar integridad.
- Investigar un lote antes de cargarlo a Oracle.

Athena no reemplaza necesariamente el histórico corporativo. En esta propuesta funciona como capa de exploración, calidad y conciliación sobre el data lake.

### 5.6 Oracle Database

Oracle conserva cuatro estructuras con granularidades distintas:

- `HIST_WORK_ORDER`: una fila por versión de orden.
- `HIST_SERVICE_APPOINTMENT`: una fila por versión de cita.
- `BRIDGE_SA_TECHNICIAN`: una fila por técnico asignado a cada cita.
- `FACT_TECHNICIAN_DAY`: una fila por técnico, fecha y zona.

La tabla puente resuelve la relación N:M entre citas y técnicos. La carga se realiza mediante operaciones `MERGE`; la clave de negocio y la fecha efectiva evitan duplicados, mientras `EXTRACTED_AT` y el identificador de lote conservan el linaje.

### Aclaración técnica importante

> S3 conserva la evidencia inmutable del lote. Athena permite validarlo. Oracle entrega el histórico integrado para el consumo corporativo. No son copias sin propósito: cada capa tiene una responsabilidad diferente.

---

## 6. Indicadores analíticos — 1 minuto

### Capacidad disponible

```text
Minutos del turno
− ausencias
− bloqueos
= minutos disponibles netos
```

### Carga planificada

```text
Minutos programados de servicio
+ desplazamiento verificable
= carga planificada
```

### Utilización

```text
carga planificada / capacidad disponible
```

### Brecha

```text
carga planificada − capacidad disponible
```

- Resultado positivo: posible sobrecarga.
- Resultado negativo: holgura potencial.

### Completitud

```text
citas completadas / citas asignadas
```

### Precaución de interpretación

Una zona con bajo cumplimiento no demuestra por sí sola bajo desempeño. Puede estar afectada por:

- Complejidad de la reparación.
- Desplazamiento.
- Materiales.
- Condiciones del territorio.
- Reprogramaciones.
- Calidad del registro.

---

## 7. Gobernanza de los datos — 2 minutos

### Qué mostrar

Ir a **Gobernanza** y seleccionar varios dominios.

## 7.1 Roles

### Data Owner — Dirección de Operaciones

- Aprueba el uso de los datos.
- Define el propósito y los criterios de valor.
- Acepta definiciones críticas.

### Data Steward — Planeación Operativa

- Mantiene el glosario.
- Revisa reglas de calidad.
- Coordina la solución de incidencias del dato.

### Data Custodian — TI e Ingeniería de Datos

- Opera la plataforma.
- Gestiona accesos, cifrado y respaldos.
- Implementa pipelines y controles técnicos.

### Data Consumer — Despacho y Supervisión

- Utiliza los indicadores.
- Reporta diferencias.
- Deja evidencia de validación y uso.

## 7.2 Dominios de control

### Calidad

Umbrales propuestos:

- Completitud mínima: 98%.
- Duplicados: 0.
- Integridad WorkOrder–ServiceAppointment: 99,5% o superior.

### Seguridad y privacidad

- Acceso de mínimo privilegio.
- Cifrado en tránsito y reposo.
- Seudonimización del técnico.
- Exclusión de información innecesaria del cliente.
- Registro de accesos mediante CloudTrail.

### Linaje

Cada KPI debe rastrearse mediante:

```text
indicador
→ vista semántica
→ tabla Oracle
→ lote de carga
→ archivo S3
→ objeto Salesforce
```

Campos como `batch_id`, `EXTRACTED_AT` y `ROW_HASH` soportan esta trazabilidad.

### Retención

La fuente depura a los 90 días. La extracción debe ejecutarse antes de ese límite. El histórico se conserva según la política corporativa y no indefinidamente por defecto.

### Definiciones

Carga, capacidad, completitud, backlog y reprogramación deben tener una única definición aprobada.

### Observabilidad

Alertas propuestas:

- Último lote con más de 26 horas.
- Disminución de volumen superior al 20%.
- Fallo de una etapa.
- Aumento de registros en cuarentena.
- Cambio inesperado de esquema.

### Cuarentena

Los registros que incumplen una regla crítica no se eliminan ni llegan a la vista certificada. Se mueven a una zona de cuarentena con motivo, lote y responsable de corrección.

---

## 8. Marcos y enfoques — 1 minuto y 30 segundos

> En la interfaz esta sección aparece inmediatamente después del panorama porque PMBOK 7, Scrum, CRISP-DM y DataOps son el contenido central de la materia.

### Qué mostrar

Ir a **Marcos** y seleccionar las cuatro opciones.

## PMBOK 7

Responde:

> ¿Estamos entregando valor dentro del alcance y con los riesgos controlados?

Aplicación:

- Propósito y alcance.
- Interesados y RACI.
- Riesgos.
- Criterios de éxito.
- Estados de revisión y cierre.

## Scrum

Responde:

> ¿Qué incremento verificable se entrega y revisa ahora?

Aplicación:

- Product Backlog.
- Tres Sprints.
- Sprint Review con Operaciones.
- Retrospectiva.
- Definition of Done.

## CRISP-DM adaptado

Responde:

> ¿Los datos y resultados sostienen la pregunta del negocio?

Aplicación:

1. Comprensión del negocio.
2. Comprensión de los datos.
3. Preparación.
4. Construcción de indicadores.
5. Evaluación.
6. Despliegue.

La fase de modelado se adapta porque el alcance no incluye un modelo predictivo.

## DataOps

Responde:

> ¿Podemos reproducir, observar y confiar en el producto de datos?

Aplicación:

- Código versionado.
- Reglas automatizadas.
- Ambientes controlados.
- Linaje.
- Observabilidad.
- Gestión de incidencias.

### Forma correcta de explicar su integración

> PMBOK gobierna el proyecto. Scrum organiza incrementos. CRISP-DM estructura el trabajo analítico dentro de esos incrementos. DataOps mantiene confiable y reproducible el flujo de datos.

MLOps no es necesario porque no existe un modelo predictivo desplegado.

---

## 9. Avance del proyecto — 1 minuto

### Qué mostrar

Ir a **Avance**.

El avance demostrativo es 68%. No significa que la solución productiva esté implementada al 68%; representa el avance de los entregables del proyecto académico.

| Estado | Avance | Evidencia |
|---|---:|---|
| Formulación | 100% | Pregunta, alcance y usuarios |
| Diseño de datos | 100% | Arquitectura, contrato y modelo histórico |
| Base histórica | 72% | Simulación de extracción y tabla Oracle |
| Indicadores | 64% | Definiciones y prototipo |
| Validación | 35% | Pendiente revisión formal de Operaciones |
| Transferencia | 15% | Guía y presentación en construcción |

### Definition of Done

Un incremento solamente se considera terminado cuando:

1. La extracción cuadra con Salesforce.
2. Las reglas de calidad superan el umbral.
3. El indicador se rastrea hasta el dato original.
4. El usuario responsable deja evidencia de revisión.

---

## 10. Riesgos principales y respuesta — 45 segundos

| Riesgo | Respuesta propuesta |
|---|---|
| Acceso insuficiente a Salesforce | Usuario técnico y permisos de mínimo privilegio |
| Datos eliminados antes de extraerlos | Ejecución diaria y alerta de frescura |
| Estados inconsistentes | Tabla de homologación aprobada |
| Duplicados por reintento | Idempotencia, clave de negocio y MERGE |
| Exposición de datos personales | Minimización, seudonimización y control de acceso |
| Diferencias entre S3 y Oracle | Conciliación en Athena por lote |
| Baja adopción | Reviews frecuentes y validación con usuarios |
| Crecimiento descontrolado del alcance | Gobierno PMBOK y Product Backlog priorizado |

---

## 11. Cierre — 30 segundos

### Qué decir

> El valor de esta propuesta no está solamente en visualizar órdenes. Está en conservar un histórico verificable, definir indicadores comunes y demostrar de dónde proviene cada resultado.
>
> Salesforce registra la operación; AWS permite extraer, conservar, transformar y validar; Oracle integra el histórico corporativo; y el tablero convierte ese dato gobernado en una conversación operativa sobre capacidad, carga y ejecución.
>
> El siguiente paso sería reemplazar los datos demostrativos por una extracción autorizada, ejecutar el perfilado real y acordar con Operaciones los umbrales y metas a partir de una línea base.

---

# Lista de verificación antes de grabar

- [ ] Abrir el sitio desplegado en Netlify.
- [ ] Verificar que el zoom del navegador esté entre 90% y 100%.
- [ ] Cerrar pestañas y notificaciones personales.
- [ ] Mostrar que los datos son demostrativos.
- [ ] Cambiar al menos una zona del tablero.
- [ ] Seleccionar una WorkOrder con más de una ServiceAppointment.
- [ ] Mostrar una ServiceAppointment trabajada por varios técnicos.
- [ ] Avanzar una ServiceAppointment por sus estados.
- [ ] Explicar el simulador de capacidad y una alerta de sobrecarga.
- [ ] Mostrar la tabla puente Oracle y el `MERGE` simulado.
- [ ] Ejecutar el pipeline AWS.
- [ ] Seleccionar al menos dos dominios de gobernanza.
- [ ] Explicar los cuatro marcos sin tratarlos como sinónimos.
- [ ] Mostrar el avance y la Definition of Done.
- [ ] Cerrar con el siguiente paso realista.

---

# Preguntas que pueden surgir

## ¿Por qué usar S3 si el destino es Oracle?

Porque S3 conserva el extracto inmutable y desacopla la fuente del destino. Permite reprocesar, auditar y consultar el lote aun cuando Oracle no esté disponible.

## ¿Por qué Athena si ya existe Oracle?

Athena permite perfilar y reconciliar directamente sobre el data lake. Oracle se utiliza como histórico corporativo integrado y capa de consumo; ambos cumplen responsabilidades distintas.

## ¿Por qué Glue?

Porque centraliza el catálogo, las transformaciones y las reglas de calidad sobre los datos almacenados en S3.

## ¿Por qué no consultar Salesforce directamente desde el tablero?

Porque la fuente tiene retención limitada, está optimizada para la operación y no para consultas históricas intensivas. Además, las definiciones y controles quedarían dispersos.

## ¿Por qué no se utiliza inteligencia artificial?

La pregunta puede responderse inicialmente con analítica descriptiva y diagnóstica. Agregar un LLM no resuelve por sí solo calidad, linaje ni gobernanza. La prioridad de esta fase es construir una base confiable.

## ¿Dónde se encuentra el valor?

En reducir consolidación manual, conservar el histórico, hacer auditables los indicadores y orientar revisiones de asignación y agenda con una lectura común.

---

# Referencias de apoyo

- Project Management Institute. (2021). *Guía del PMBOK®, séptima edición*.
- Schwaber, K. y Sutherland, J. (2020). *La Guía de Scrum*.
- IBM. *Conceptos básicos de CRISP-DM*.
- DataOps Manifesto. *El Manifiesto DataOps*.
- Salesforce Trailhead. *Generate Work Orders for Efficient Service Management*.
- Salesforce Trailhead. *Mobile Field Service Experience*.
- AWS Big Data Blog. *Query your Oracle database using Athena Federated Query and join with data in Amazon S3*.
- AWS Big Data Blog. *Build and orchestrate ETL pipelines using Amazon Athena and AWS Step Functions*.
