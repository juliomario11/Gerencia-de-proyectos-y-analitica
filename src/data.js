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

export const methodology = [
  { code: '01', name: 'PMBOK 7', role: 'Gobierna el valor', detail: 'Define alcance, interesados, riesgos, criterios de éxito y cierre.' },
  { code: '02', name: 'Scrum', role: 'Entrega en ciclos', detail: 'Tres incrementos revisables: histórico, indicadores y producto.' },
  { code: '03', name: 'CRISP-DM', role: 'Ordena el análisis', detail: 'Permite iterar entre negocio, datos, preparación, evaluación y despliegue.' },
  { code: '04', name: 'DataOps', role: 'Asegura confianza', detail: 'Versiona reglas y controla conteos, duplicados, frescura y linaje.' },
]

export const sprints = [
  { number: '01', title: 'Base confiable', result: 'Contrato de datos, extracción incremental e histórico conciliado con Salesforce.', status: 'Definido' },
  { number: '02', title: 'Indicadores', result: 'Perfilado, reglas de calidad, medidas trazables y conjunto analítico.', status: 'Diseñado' },
  { number: '03', title: 'Uso y entrega', result: 'Tablero, prueba con usuarios, documentación y transferencia.', status: 'Prototipo' },
]

export const analyticalQuestion = '¿Cómo se distribuyen diariamente la carga asignada, la capacidad disponible y la ejecución de los técnicos de red externa, y en qué tipos de reparación, zonas y periodos se presentan brechas que requieran ajustar la asignación o la agenda?'
