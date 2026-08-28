export const operationalData = [
  { zone: 'COSTA', assigned: 148, completed: 121, capacity: 13260, load: 14710, backlog: 27, reprogrammed: 18, technicians: 18, avgDuration: 94, trend: [74, 79, 81, 86, 89, 84] },
  { zone: 'ORIENTE', assigned: 104, completed: 91, capacity: 10080, load: 9870, backlog: 13, reprogrammed: 9, technicians: 14, avgDuration: 86, trend: [83, 85, 88, 86, 90, 88] },
  { zone: 'SUR', assigned: 119, completed: 88, capacity: 10560, load: 12480, backlog: 31, reprogrammed: 22, technicians: 15, avgDuration: 103, trend: [77, 75, 79, 73, 76, 74] },
  { zone: 'BOGOTÁ', assigned: 172, completed: 151, capacity: 15840, load: 16320, backlog: 21, reprogrammed: 14, technicians: 22, avgDuration: 89, trend: [84, 87, 86, 89, 91, 88] },
  { zone: 'ANDINA', assigned: 96, completed: 88, capacity: 9360, load: 8420, backlog: 8, reprogrammed: 6, technicians: 13, avgDuration: 82, trend: [87, 89, 90, 92, 91, 92] },
]

export const repairTypes = [
  { name: 'Fibra cortada', assigned: 141, completed: 108, median: 128, reprogramming: 19 },
  { name: 'Caja / empalme', assigned: 126, completed: 106, median: 102, reprogramming: 14 },
  { name: 'Acometida externa', assigned: 168, completed: 151, median: 76, reprogramming: 8 },
  { name: 'Poste / herraje', assigned: 88, completed: 68, median: 116, reprogramming: 17 },
  { name: 'Señal degradada', assigned: 116, completed: 106, median: 68, reprogramming: 7 },
]

export const weekly = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6']

export const appointmentStatuses = ['Creada', 'Programada', 'Despachada', 'En ruta', 'En sitio', 'Completada']

export const workOrders = [
  { id: 'WO-00094821', appointment: 'SA-00178432', tech: 'Andrés Molina', initials: 'AM', zone: 'SUR', repair: 'Fibra cortada', account: 'Cliente TELCO •••4821', window: '08:00–10:00', duration: 128, status: 4, priority: 'Alta', territory: 'Cali Sur', address: 'Sector La Buitrera', created: '2026-08-11 16:42', lastUpdate: '2026-08-12 09:36' },
  { id: 'WO-00094857', appointment: 'SA-00178481', tech: 'Laura Rojas', initials: 'LR', zone: 'BOGOTÁ', repair: 'Acometida externa', account: 'Cliente TELCO •••7350', window: '09:00–11:00', duration: 76, status: 3, priority: 'Media', territory: 'Bogotá Norte', address: 'Sector Suba', created: '2026-08-11 18:20', lastUpdate: '2026-08-12 09:18' },
  { id: 'WO-00094902', appointment: 'SA-00178511', tech: 'Camilo Torres', initials: 'CT', zone: 'COSTA', repair: 'Caja / empalme', account: 'Cliente TELCO •••0926', window: '10:00–12:00', duration: 102, status: 2, priority: 'Alta', territory: 'Barranquilla Centro', address: 'Sector Boston', created: '2026-08-12 06:04', lastUpdate: '2026-08-12 08:56' },
  { id: 'WO-00094935', appointment: 'SA-00178542', tech: 'Diana Méndez', initials: 'DM', zone: 'ANDINA', repair: 'Señal degradada', account: 'Cliente TELCO •••3158', window: '11:00–13:00', duration: 68, status: 1, priority: 'Media', territory: 'Medellín Oriente', address: 'Sector Buenos Aires', created: '2026-08-12 07:12', lastUpdate: '2026-08-12 08:40' },
]

export const pipeline = [
  { id: 'salesforce', name: 'Salesforce FFS', service: 'Fuente operacional', detail: 'WorkOrder, ServiceAppointment, ServiceResource y AssignedResource. Extracción incremental antes de la depuración de 90 días.', control: 'API Only User · OAuth · filtro SystemModstamp' },
  { id: 'orchestration', name: 'EventBridge + Step Functions', service: 'Orquestación AWS', detail: 'EventBridge activa el flujo diario. Step Functions coordina extracción, validación, transformación, carga y reintentos.', control: 'Ejecución idempotente · alertas · reintentos' },
  { id: 'landing', name: 'Amazon S3', service: 'Zona RAW / CURATED', detail: 'Conserva el extracto inmutable en Parquet, particionado por fecha de corte, objeto y zona.', control: 'SSE-KMS · versionado · lifecycle · bloqueo' },
  { id: 'catalog', name: 'AWS Glue', service: 'Catálogo y transformación', detail: 'Cataloga esquemas, estandariza estados y fechas, aplica reglas y prepara el conjunto analítico.', control: 'Schema Registry · jobs versionados · DQ rules' },
  { id: 'athena', name: 'Amazon Athena', service: 'Consulta y conciliación', detail: 'Consulta S3 sin servidor para perfilar datos, reconciliar conteos y validar duplicados, nulos e integridad.', control: 'Workgroups · límite de escaneo · resultados cifrados' },
  { id: 'oracle', name: 'Oracle Database', service: 'Histórico corporativo', detail: 'Glue carga por JDBC la tabla HIST_FFS_CAPACIDAD. MERGE conserva cambios por clave y fecha efectiva.', control: 'PK compuesta · auditoría · particiones · roles' },
  { id: 'dashboard', name: 'Producto analítico', service: 'Capa de consumo', detail: 'Vista semántica y tablero descriptivo-diagnóstico con filtros, trazabilidad y fecha de actualización.', control: 'RLS por zona · glosario · certificación de KPIs' },
]

export const oracleColumns = [
  ['WORK_ORDER_ID', 'VARCHAR2(18)', 'PK de WorkOrder'],
  ['SERVICE_APPOINTMENT_ID', 'VARCHAR2(18)', 'Cita relacionada'],
  ['TECHNICIAN_ID', 'VARCHAR2(18)', 'Recurso asignado seudonimizado'],
  ['ZONE_CODE', 'VARCHAR2(20)', 'Zona operativa normalizada'],
  ['STATUS_CODE', 'VARCHAR2(30)', 'Estado homologado'],
  ['REPAIR_TYPE', 'VARCHAR2(80)', 'Tipo de reparación externa'],
  ['SCHED_START_TS', 'TIMESTAMP TZ', 'Inicio programado UTC'],
  ['ACTUAL_END_TS', 'TIMESTAMP TZ', 'Fin real UTC'],
  ['AVAILABLE_MINUTES', 'NUMBER(6)', 'Capacidad neta técnico-día'],
  ['PLANNED_MINUTES', 'NUMBER(6)', 'Servicio + desplazamiento'],
  ['EXTRACTED_AT', 'TIMESTAMP TZ', 'Fecha de linaje'],
  ['ROW_HASH', 'VARCHAR2(64)', 'Detección de cambios'],
]

export const governanceDomains = [
  { id: 'quality', title: 'Calidad', owner: 'Data Steward Operaciones', score: 94, rule: 'Completitud ≥ 98%; duplicados = 0; integridad WO–SA ≥ 99,5%.', evidence: 'Reporte de reglas Glue Data Quality y consulta de conciliación en Athena.' },
  { id: 'security', title: 'Seguridad y privacidad', owner: 'Data Owner + Seguridad', score: 92, rule: 'Mínimo privilegio, cifrado en tránsito/reposo y seudonimización del técnico.', evidence: 'IAM roles, KMS keys, CloudTrail y matriz de acceso aprobada.' },
  { id: 'lineage', title: 'Linaje', owner: 'Ingeniería de Datos', score: 96, rule: 'Todo KPI debe rastrearse hasta WorkOrder y ServiceAppointment.', evidence: 'EXTRACTED_AT, batch_id, ROW_HASH, catálogo Glue y versión de transformación.' },
  { id: 'retention', title: 'Retención', owner: 'Administrador Salesforce', score: 88, rule: 'Extraer antes de 90 días y conservar según la política corporativa.', evidence: 'Lifecycle S3, particiones Oracle y bitácora de ejecuciones.' },
  { id: 'definition', title: 'Definiciones', owner: 'Product Owner Operaciones', score: 90, rule: 'Una definición aprobada para carga, capacidad, brecha y completitud.', evidence: 'Glosario, contrato de datos y acta de validación del indicador.' },
  { id: 'observability', title: 'Observabilidad', owner: 'DataOps', score: 91, rule: 'Alertar frescura > 26 h, caída de volumen > 20% o ejecución fallida.', evidence: 'CloudWatch metrics, SNS, logs y tablero de salud del pipeline.' },
]

export const frameworks = [
  { id: 'pmbok', name: 'PMBOK 7', tag: 'Gobernanza del proyecto', progress: 82, question: '¿Estamos entregando valor dentro del alcance?', practices: ['Acta y propósito del proyecto', 'Mapa de interesados y RACI', 'Registro de riesgos', 'Criterios de éxito y cierre'], evidence: 'Backlog aprobado, matriz de riesgos y actas de revisión.' },
  { id: 'scrum', name: 'Scrum', tag: 'Cadencia de entrega', progress: 76, question: '¿Qué incremento verificable entregamos ahora?', practices: ['Product Backlog priorizado', 'Tres Sprints con objetivo', 'Review con Operaciones', 'Retrospectiva y Definition of Done'], evidence: 'Incrementos revisables y aceptación al cierre de Sprint.' },
  { id: 'crisp', name: 'CRISP-DM', tag: 'Ciclo analítico', progress: 71, question: '¿El dato sostiene la pregunta de negocio?', practices: ['Comprensión del negocio', 'Comprensión y perfilado de datos', 'Preparación e indicadores', 'Evaluación y despliegue'], evidence: 'Perfilado, dataset analítico, validación de KPIs y tablero.' },
  { id: 'dataops', name: 'DataOps', tag: 'Confiabilidad operativa', progress: 68, question: '¿Podemos reproducir y confiar en cada resultado?', practices: ['Código y reglas versionados', 'Pruebas automatizadas', 'Linaje y observabilidad', 'Promoción controlada'], evidence: 'Git, pruebas DQ, logs de pipeline y catálogo.' },
]

export const projectStages = [
  { name: 'Formulación', progress: 100, evidence: 'Pregunta, alcance y usuarios definidos', state: 'Aprobado' },
  { name: 'Diseño de datos', progress: 100, evidence: 'Arquitectura, contrato y modelo histórico', state: 'Aprobado' },
  { name: 'Base histórica', progress: 72, evidence: 'Simulación de extracción y tabla Oracle', state: 'En curso' },
  { name: 'Indicadores', progress: 64, evidence: 'Definiciones y prototipo visual', state: 'En curso' },
  { name: 'Validación', progress: 35, evidence: 'Pendiente revisión formal de Operaciones', state: 'Pendiente' },
  { name: 'Transferencia', progress: 15, evidence: 'Guía y presentación en construcción', state: 'Pendiente' },
]

export const analyticalQuestion = '¿Cómo se distribuyen diariamente la carga asignada, la capacidad disponible y la ejecución de los técnicos de red externa, y en qué tipos de reparación, zonas y periodos se presentan brechas que requieran ajustar la asignación o la agenda?'
