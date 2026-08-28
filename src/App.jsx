import { useMemo, useState } from 'react'
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Box, Check, CheckCircle2,
  ChevronDown, ChevronRight, Clock3, Cloud, Code2, Database,
  FileCheck2, Gauge, GitBranch, HardDrive, KeyRound, Layers3, LockKeyhole, ChartNoAxesCombined,
  Menu, Network, Play, RefreshCw, Route, Search, ShieldCheck,
  Table2, TimerReset, UserRound, Users, Workflow, XCircle,
} from 'lucide-react'
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ReferenceLine,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import {
  analyticalQuestion, appointmentStatuses, frameworks, governanceDomains,
  operationalData, oracleColumns, pipeline, projectStages, repairTypes,
  weekly, workOrders,
} from './data'

const formatNumber = new Intl.NumberFormat('es-CO')
const pct = (value) => `${Math.round(value)}%`
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function App() {
  const [zone, setZone] = useState('TODAS')
  const [period, setPeriod] = useState('Últimas 6 semanas')
  const [activeSection, setActiveSection] = useState('panorama')
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(workOrders[0].id)
  const [statusOverrides, setStatusOverrides] = useState({})
  const [objectTab, setObjectTab] = useState('appointment')
  const [pipelineStep, setPipelineStep] = useState(-1)
  const [pipelineRunning, setPipelineRunning] = useState(false)
  const [selectedPipeline, setSelectedPipeline] = useState('salesforce')
  const [selectedGovernance, setSelectedGovernance] = useState('quality')
  const [selectedFramework, setSelectedFramework] = useState('pmbok')

  const filtered = useMemo(() => zone === 'TODAS' ? operationalData : operationalData.filter((item) => item.zone === zone), [zone])
  const summary = useMemo(() => {
    const total = filtered.reduce((acc, item) => ({
      assigned: acc.assigned + item.assigned, completed: acc.completed + item.completed,
      capacity: acc.capacity + item.capacity, load: acc.load + item.load,
      backlog: acc.backlog + item.backlog, technicians: acc.technicians + item.technicians,
    }), { assigned: 0, completed: 0, capacity: 0, load: 0, backlog: 0, technicians: 0 })
    return { ...total, completion: total.assigned ? total.completed / total.assigned * 100 : 0, utilization: total.capacity ? total.load / total.capacity * 100 : 0, gap: total.load - total.capacity }
  }, [filtered])
  const trendData = useMemo(() => weekly.map((week, index) => ({
    week, completion: filtered.reduce((sum, item) => sum + item.trend[index], 0) / filtered.length,
  })), [filtered])

  const currentOrder = workOrders.find((item) => item.id === selectedOrder)
  const currentStatus = statusOverrides[currentOrder.id] ?? currentOrder.status
  const pipelineDetail = pipeline.find((item) => item.id === selectedPipeline)
  const governanceDetail = governanceDomains.find((item) => item.id === selectedGovernance)
  const frameworkDetail = frameworks.find((item) => item.id === selectedFramework)

  const scrollTo = (id) => {
    setActiveSection(id)
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const advanceAppointment = () => {
    setStatusOverrides((current) => ({ ...current, [currentOrder.id]: Math.min(currentStatus + 1, appointmentStatuses.length - 1) }))
  }

  const runPipeline = async () => {
    if (pipelineRunning) return
    setPipelineRunning(true)
    setPipelineStep(-1)
    for (let index = 0; index < pipeline.length; index += 1) {
      await delay(480)
      setPipelineStep(index)
      setSelectedPipeline(pipeline[index].id)
    }
    setPipelineRunning(false)
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => scrollTo('panorama')} aria-label="Ir al inicio"><span className="brand-mark"><Activity /></span><span>NODO</span><small>FIELD ANALYTICS</small></button>
        <nav className={menuOpen ? 'main-nav open' : 'main-nav'} aria-label="Navegación principal">
          {[['panorama', 'Panorama'], ['operacion', 'Operación'], ['arquitectura', 'Arquitectura'], ['gobernanza', 'Gobernanza'], ['marcos', 'Marcos'], ['avance', 'Avance']].map(([id, label]) => <button key={id} className={activeSection === id ? 'active' : ''} onClick={() => scrollTo(id)}>{label}</button>)}
        </nav>
        <button className="header-status" onClick={() => scrollTo('avance')}><span /> Proyecto 68%</button>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menú"><Menu /></button>
      </header>

      <main>
        <section className="hero section" id="panorama">
          <div className="eyebrow"><span className="live-dot" /> PROTOTIPO ANALÍTICO · ARQUITECTURA PROPUESTA · DATOS DEMOSTRATIVOS</div>
          <div className="hero-grid">
            <div><h1>Del trabajo en campo<br /><em>al dato gobernado.</em></h1><p className="hero-lead">Una experiencia interactiva que conecta Salesforce Field Service, servicios analíticos de AWS y un histórico corporativo en Oracle para explicar la capacidad de técnicos de red externa.</p></div>
            <div className="question-card"><span>PREGUNTA ANALÍTICA</span><p>{analyticalQuestion}</p><div className="question-footer"><Route /> WorkOrder → ServiceAppointment → AWS → Oracle SQL → Indicador</div></div>
          </div>
          <div className="filter-bar">
            <div><label htmlFor="zone">ZONA</label><div className="select-wrap"><select id="zone" value={zone} onChange={(e) => setZone(e.target.value)}><option>TODAS</option>{operationalData.map((item) => <option key={item.zone}>{item.zone}</option>)}</select><ChevronDown /></div></div>
            <div><label htmlFor="period">PERIODO</label><div className="select-wrap"><select id="period" value={period} onChange={(e) => setPeriod(e.target.value)}><option>Últimas 6 semanas</option><option>Últimos 30 días</option><option>Últimos 90 días</option></select><ChevronDown /></div></div>
            <div className="filter-meta"><RefreshCw /> Corte demostrativo: 12 ago 2026 · 06:00</div>
          </div>
          <div className="kpi-grid">
            <Kpi icon={<Users />} label="TÉCNICOS ACTIVOS" value={summary.technicians} detail={`${filtered.length} zonas en alcance`} />
            <Kpi icon={<CheckCircle2 />} label="CUMPLIMIENTO" value={pct(summary.completion)} detail={`${summary.completed} de ${summary.assigned} órdenes`} tone={summary.completion >= 85 ? 'positive' : 'warning'} />
            <Kpi icon={<Gauge />} label="UTILIZACIÓN" value={pct(summary.utilization)} detail={`${formatNumber.format(summary.load)} min planificados`} tone={summary.utilization > 100 ? 'negative' : 'positive'} />
            <Kpi icon={<Clock3 />} label="BRECHA NETA" value={`${summary.gap > 0 ? '+' : ''}${formatNumber.format(summary.gap)} min`} detail={summary.gap > 0 ? 'Carga sobre capacidad' : 'Holgura potencial'} tone={summary.gap > 0 ? 'negative' : 'positive'} />
          </div>
        </section>

        <section className="section operation-section" id="operacion">
          <SectionHeading number="01" kicker="OPERACIÓN SIMULADA" title="Una reparación, dos objetos, seis estados." description="La WorkOrder define el trabajo. La ServiceAppointment organiza cuándo, dónde y quién lo ejecuta. El histórico conserva cada cambio antes de la depuración operativa." />
          <div className="simulator-layout">
            <aside className="order-list">
              <div className="list-title"><div><span>COLA DEL DÍA</span><strong>Órdenes de red externa</strong></div><Search /></div>
              {workOrders.map((order) => {
                const status = statusOverrides[order.id] ?? order.status
                return <button key={order.id} className={selectedOrder === order.id ? 'order-item active' : 'order-item'} onClick={() => setSelectedOrder(order.id)}><div><span>{order.id}</span><Status level={order.priority === 'Alta' ? 'critical' : 'watch'} label={order.priority} /></div><strong>{order.repair}</strong><small>{order.zone} · {order.window}</small><div className="mini-progress"><i style={{ width: `${((status + 1) / appointmentStatuses.length) * 100}%` }} /></div><em>{appointmentStatuses[status]}</em></button>
              })}
            </aside>

            <article className="service-console">
              <div className="console-top"><div><span className="sf-cloud"><Cloud /></span><div><small>SALESFORCE FIELD SERVICE · SIMULACIÓN</small><h3>{currentOrder.appointment}</h3></div></div><Status level={currentStatus === 5 ? 'stable' : currentStatus >= 3 ? 'progress' : 'watch'} label={appointmentStatuses[currentStatus]} /></div>
              <div className="object-tabs"><button className={objectTab === 'appointment' ? 'active' : ''} onClick={() => setObjectTab('appointment')}>ServiceAppointment</button><button className={objectTab === 'workorder' ? 'active' : ''} onClick={() => setObjectTab('workorder')}>WorkOrder</button><button className={objectTab === 'oracle' ? 'active' : ''} onClick={() => setObjectTab('oracle')}>Registro Oracle</button></div>

              {objectTab === 'appointment' && <div className="appointment-view">
                <div className="technician-card"><span>{currentOrder.initials}</span><div><small>TÉCNICO ASIGNADO</small><strong>{currentOrder.tech}</strong><p><UserRound /> Recurso móvil · {currentOrder.territory}</p></div><div className="schedule"><small>VENTANA</small><strong>{currentOrder.window}</strong></div></div>
                <div className="status-track">{appointmentStatuses.map((status, index) => <div className={`${index < currentStatus ? 'done' : ''} ${index === currentStatus ? 'current' : ''}`} key={status}><span>{index < currentStatus ? <Check /> : index + 1}</span><strong>{status}</strong><small>{index <= currentStatus ? ['07:42', '07:55', '08:21', '08:48', '09:36', '—'][index] : 'Pendiente'}</small></div>)}</div>
                <div className="field-grid"><Field label="UBICACIÓN" value={currentOrder.address} /><Field label="PRIORIDAD" value={currentOrder.priority} /><Field label="DURACIÓN REFERENCIA" value={`${currentOrder.duration} minutos`} /><Field label="ÚLTIMA ACTUALIZACIÓN" value={currentOrder.lastUpdate} /></div>
                <button className="advance-button" onClick={advanceAppointment} disabled={currentStatus === 5}><Play />{currentStatus === 5 ? 'Cita completada' : `Mover a “${appointmentStatuses[currentStatus + 1]}”`}</button>
              </div>}

              {objectTab === 'workorder' && <div className="record-view"><div className="record-hero"><div><small>ORDEN DE TRABAJO</small><h3>{currentOrder.id}</h3><p>{currentOrder.account}</p></div><Box /></div><div className="field-grid"><Field label="TIPO DE TRABAJO" value="Reparación red externa" /><Field label="TIPO DE DAÑO" value={currentOrder.repair} /><Field label="TERRITORIO" value={currentOrder.territory} /><Field label="CITA RELACIONADA" value={currentOrder.appointment} /><Field label="CREADA" value={currentOrder.created} /><Field label="ESTADO DERIVADO" value={appointmentStatuses[currentStatus]} /></div><div className="relation-note"><Network /> Relación 1:N: una WorkOrder puede originar una o más ServiceAppointments por reprogramación.</div></div>}

              {objectTab === 'oracle' && <div className="sql-record"><div className="sql-head"><div><Database /><span>HIST_FFS_CAPACIDAD</span></div><em>MERGE · batch_20260812_0600</em></div><code>{`MERGE INTO HIST_FFS_CAPACIDAD h\nUSING STG_FFS_APPOINTMENT s\nON (h.SERVICE_APPOINTMENT_ID = '${currentOrder.appointment}')\nWHEN MATCHED THEN UPDATE SET\n  h.STATUS_CODE = '${appointmentStatuses[currentStatus].toUpperCase().replace(' ', '_')}',\n  h.TECHNICIAN_ID = 'TECH_${currentOrder.initials}',\n  h.ZONE_CODE = '${currentOrder.zone}',\n  h.ROW_HASH = 'a84f…91c2'\nWHEN NOT MATCHED THEN INSERT (…);`}</code><div className="sql-success"><CheckCircle2 /> Registro historizado y trazable hasta Salesforce · dato demostrativo</div></div>}
            </article>
          </div>

          <div className="diagnostic-grid">
            <article className="panel"><PanelHeader title="Carga frente a capacidad" subtitle="Minutos por zona" badge="BRECHA" /><div className="chart-area"><ResponsiveContainer width="100%" height="100%"><BarChart data={filtered} barGap={7} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}><CartesianGrid vertical={false} stroke="#e9e4dc" /><XAxis dataKey="zone" axisLine={false} tickLine={false} tick={{ fill: '#645f58', fontSize: 11, fontWeight: 700 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#8a847c', fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} /><Tooltip content={<ChartTooltip />} /><Bar dataKey="capacity" name="Capacidad" fill="#d9d3ca" radius={[4, 4, 0, 0]} /><Bar dataKey="load" name="Carga" radius={[4, 4, 0, 0]}>{filtered.map((item) => <Cell key={item.zone} fill={item.load > item.capacity ? '#e56e44' : '#32a58b'} />)}</Bar></BarChart></ResponsiveContainer></div></article>
            <article className="panel"><PanelHeader title="Evolución del cumplimiento" subtitle="Completadas / asignadas" badge={zone} /><div className="chart-area"><ResponsiveContainer width="100%" height="100%"><LineChart data={trendData} margin={{ top: 10, right: 14, left: -18, bottom: 0 }}><CartesianGrid vertical={false} stroke="#e9e4dc" /><XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#8a847c', fontSize: 10 }} /><YAxis domain={[65, 100]} axisLine={false} tickLine={false} tick={{ fill: '#8a847c', fontSize: 10 }} tickFormatter={(v) => `${v}%`} /><ReferenceLine y={85} stroke="#b8b1a8" strokeDasharray="4 4" /><Tooltip content={<ChartTooltip suffix="%" />} /><Line type="monotone" dataKey="completion" name="Cumplimiento" stroke="#1f4850" strokeWidth={3} dot={{ fill: '#f7f4ef', stroke: '#1f4850', strokeWidth: 2, r: 4 }} /></LineChart></ResponsiveContainer></div></article>
          </div>
        </section>

        <section className="section architecture-section" id="arquitectura">
          <SectionHeading number="02" kicker="ARQUITECTURA DE DATOS PROPUESTA" title="De Salesforce a Oracle, con control en cada salto." description="AWS desacopla la extracción, preserva el dato crudo y permite validar antes de cargar el histórico corporativo. Haz clic en cada servicio para revisar su función." light />
          <div className="pipeline-toolbar"><div><span>SIMULACIÓN DE EJECUCIÓN</span><strong>{pipelineStep < 0 ? 'Lista para iniciar' : pipelineStep === pipeline.length - 1 ? 'Carga finalizada · 639 filas' : `Procesando ${pipeline[pipelineStep].name}`}</strong></div><button onClick={runPipeline} disabled={pipelineRunning}><Play /> {pipelineRunning ? 'Ejecutando…' : 'Ejecutar pipeline'}</button></div>
          <div className="pipeline-map">{pipeline.map((item, index) => <div className="pipeline-wrap" key={item.id}><button className={`pipeline-node ${selectedPipeline === item.id ? 'selected' : ''} ${pipelineStep >= index ? 'complete' : ''} ${pipelineStep === index && pipelineRunning ? 'running' : ''}`} onClick={() => setSelectedPipeline(item.id)}><span>{index + 1}</span><PipelineIcon id={item.id} /><strong>{item.name}</strong><small>{item.service}</small>{pipelineStep >= index && <CheckCircle2 className="node-check" />}</button>{index < pipeline.length - 1 && <div className={pipelineStep > index ? 'connector complete' : 'connector'}><i /></div>}</div>)}</div>
          <div className="pipeline-detail"><div><span>ETAPA SELECCIONADA</span><h3>{pipelineDetail.name}</h3><p>{pipelineDetail.detail}</p></div><div><span>CONTROL DE GOBIERNO</span><strong><ShieldCheck /> {pipelineDetail.control}</strong></div></div>

          <div className="oracle-section"><div className="oracle-copy"><span className="mini-kicker">MODELO DEL HISTÓRICO</span><h3>Oracle conserva lo que Salesforce depura.</h3><p>La tabla propuesta mantiene una fila vigente por cita y atributos de auditoría para detectar cambios. La zona de S3 conserva el extracto inmutable; Oracle soporta el consumo corporativo y las vistas certificadas.</p><div className="oracle-metrics"><div><strong>90 días</strong><small>retención fuente</small></div><div><strong>Daily</strong><small>extracción incremental</small></div><div><strong>SCD / MERGE</strong><small>estrategia histórica</small></div></div></div><div className="oracle-table"><div className="oracle-title"><Table2 /><div><strong>HIST_FFS_CAPACIDAD</strong><small>ORACLE SQL · ESQUEMA ANALYTICS</small></div><span>12 CAMPOS CLAVE</span></div><div className="schema-rows">{oracleColumns.map(([name, type, detail], index) => <div key={name}><span>{index < 2 ? <KeyRound /> : <Code2 />}</span><strong>{name}</strong><code>{type}</code><small>{detail}</small></div>)}</div></div></div>
        </section>

        <section className="section governance-section" id="gobernanza">
          <SectionHeading number="03" kicker="GOBERNANZA DEL DATO" title="Confiar exige dueño, regla y evidencia." description="La gobernanza define quién decide, qué condición debe cumplirse y cómo se demuestra. Selecciona un dominio para revisar el control propuesto." />
          <div className="governance-layout"><div className="governance-wheel">{governanceDomains.map((item) => <button key={item.id} className={selectedGovernance === item.id ? 'active' : ''} onClick={() => setSelectedGovernance(item.id)}><div className="score-ring" style={{ '--score': `${item.score * 3.6}deg` }}><span>{item.score}</span></div><div><strong>{item.title}</strong><small>{item.owner}</small></div><ChevronRight /></button>)}</div><article className="governance-detail"><span>DOMINIO ACTIVO</span><h3>{governanceDetail.title}</h3><div className="owner"><UserRound /><div><small>RESPONSABLE</small><strong>{governanceDetail.owner}</strong></div></div><div className="governance-rule"><small>REGLA</small><p>{governanceDetail.rule}</p></div><div className="governance-evidence"><FileCheck2 /><div><small>EVIDENCIA DE CONTROL</small><p>{governanceDetail.evidence}</p></div></div></article></div>
          <div className="raci-strip"><div><span>DATA OWNER</span><strong>Dirección de Operaciones</strong><small>Aprueba uso y definición</small></div><ArrowRight /><div><span>DATA STEWARD</span><strong>Planeación Operativa</strong><small>Controla calidad y glosario</small></div><ArrowRight /><div><span>DATA CUSTODIAN</span><strong>TI / Ingeniería de Datos</strong><small>Protege y opera la plataforma</small></div><ArrowRight /><div><span>DATA CONSUMER</span><strong>Despacho y Supervisión</strong><small>Decide con el producto</small></div></div>
          <div className="control-cards"><ControlCard icon={<LockKeyhole />} title="Privacidad por diseño" text="No se expone información del cliente; el técnico se seudonimiza en la capa analítica." /><ControlCard icon={<TimerReset />} title="Frescura controlada" text="CloudWatch alerta si el último lote supera 26 horas o si disminuye el volumen esperado." /><ControlCard icon={<GitBranch />} title="Linaje reproducible" text="batch_id, EXTRACTED_AT y ROW_HASH conectan indicador, Oracle, S3 y objeto fuente." /><ControlCard icon={<XCircle />} title="Cuarentena" text="Los registros que incumplen reglas no llegan a la vista certificada; se corrigen con evidencia." /></div>
        </section>

        <section className="section frameworks-section" id="marcos">
          <SectionHeading number="04" kicker="MARCOS Y ENFOQUES" title="Cada marco responde una pregunta distinta." description="No se mezclan como una receta única: PMBOK gobierna, Scrum organiza la entrega, CRISP-DM guía el trabajo analítico y DataOps opera el producto de datos." light />
          <div className="framework-tabs">{frameworks.map((item) => <button key={item.id} className={selectedFramework === item.id ? 'active' : ''} onClick={() => setSelectedFramework(item.id)}><span>{item.progress}%</span><strong>{item.name}</strong><small>{item.tag}</small></button>)}</div>
          <div className="framework-detail"><div className="framework-main"><span>PREGUNTA QUE RESPONDE</span><h3>{frameworkDetail.question}</h3><div className="progress-line"><i style={{ width: `${frameworkDetail.progress}%` }} /></div><small>Aplicación demostrada: {frameworkDetail.progress}%</small></div><div className="practice-list"><span>PRÁCTICAS APLICADAS</span>{frameworkDetail.practices.map((item) => <div key={item}><CheckCircle2 />{item}</div>)}</div><div className="evidence-box"><FileCheck2 /><div><span>EVIDENCIA</span><p>{frameworkDetail.evidence}</p></div></div></div>
          <div className="integration-map"><div><strong>PMBOK 7</strong><small>Define valor, riesgo y aceptación</small></div><ArrowRight /><div><strong>Scrum</strong><small>Prioriza y revisa incrementos</small></div><ArrowRight /><div><strong>CRISP-DM</strong><small>Itera negocio, datos y evaluación</small></div><ArrowRight /><div><strong>DataOps</strong><small>Automatiza, observa y reproduce</small></div></div>
        </section>

        <section className="section progress-section" id="avance">
          <SectionHeading number="05" kicker="AVANCE DEL PROYECTO" title="El progreso se demuestra con evidencia." description="El porcentaje no es percepción: cada estado exige un entregable revisable y un criterio de salida." />
          <div className="overall-progress"><div><span>AVANCE GLOBAL DEMOSTRATIVO</span><strong>68<small>%</small></strong></div><div className="overall-bar"><i style={{ width: '68%' }} /></div><p>Próximo hito: validar reglas e indicadores con Operaciones.</p></div>
          <div className="stage-list">{projectStages.map((stage, index) => <div className="stage-row" key={stage.name}><span className="stage-number">{String(index + 1).padStart(2, '0')}</span><div className="stage-copy"><strong>{stage.name}</strong><small>{stage.evidence}</small></div><div className="stage-bar"><i style={{ width: `${stage.progress}%` }} /></div><strong className="stage-percent">{stage.progress}%</strong><Status level={stage.progress === 100 ? 'stable' : stage.progress > 50 ? 'progress' : 'watch'} label={stage.state} /></div>)}</div>
          <div className="definition-done"><div><span>DEFINITION OF DONE</span><h3>Un incremento solo termina cuando…</h3></div><ul><li><Check /> La extracción cuadra con Salesforce</li><li><Check /> Las reglas de calidad superan el umbral</li><li><Check /> El indicador se rastrea hasta el dato original</li><li><Check /> El usuario responsable deja evidencia de revisión</li></ul></div>
          <div className="repair-summary"><div><span className="mini-kicker">LECTURA POR TIPO DE REPARACIÓN</span><h3>La mezcla también consume capacidad.</h3></div><div className="repair-list">{repairTypes.map((item) => <div className="repair-row" key={item.name}><div><strong>{item.name}</strong><small>{item.completed}/{item.assigned} completadas</small></div><div className="duration"><span style={{ width: `${item.median / 1.4}%` }} /><em>{item.median} min</em></div><div className="reprogram">{item.reprogramming}%<small>reprog.</small></div></div>)}</div></div>
        </section>

        <section className="closing"><span>DEL REGISTRO OPERATIVO A UNA DECISIÓN TRAZABLE</span><h2>La capacidad no es un número.<br />Es un dato con contexto y gobierno.</h2><button onClick={() => scrollTo('arquitectura')}><Workflow /> Recorrer nuevamente el flujo <ArrowUpRight /></button><p>Mario Daniel Enrique Pérez Jiménez · Especialización en Analítica de Datos · 2026</p></section>
      </main>
    </div>
  )
}

function Kpi({ icon, label, value, detail, tone = '' }) { return <article className={`kpi ${tone}`}><div className="kpi-top"><span>{icon}</span><small>{label}</small></div><strong>{value}</strong><p>{tone === 'negative' ? <ArrowUpRight /> : tone === 'positive' ? <ArrowDownRight /> : null}{detail}</p></article> }
function SectionHeading({ number, kicker, title, description, light = false }) { return <div className={`section-heading ${light ? 'light' : ''}`}><div className="section-number">{number}</div><div><span>{kicker}</span><h2>{title}</h2></div><p>{description}</p></div> }
function PanelHeader({ title, subtitle, badge }) { return <div className="panel-header"><div><h3>{title}</h3><p>{subtitle}</p></div><span>{badge}</span></div> }
function Field({ label, value }) { return <div className="field"><small>{label}</small><strong>{value}</strong></div> }
function Status({ level, label }) { return <span className={`status ${level}`}><i />{label}</span> }
function ChartTooltip({ active, payload, label, suffix = '' }) { if (!active || !payload?.length) return null; return <div className="chart-tooltip"><strong>{label}</strong>{payload.map((entry) => <span key={entry.dataKey}><i style={{ background: entry.color }} />{entry.name}: {Number(entry.value).toLocaleString('es-CO', { maximumFractionDigits: 1 })}{suffix}</span>)}</div> }
function PipelineIcon({ id }) { const icons = { salesforce: <Cloud />, orchestration: <Workflow />, landing: <HardDrive />, catalog: <Layers3 />, athena: <Search />, oracle: <Database />, dashboard: <ChartNoAxesCombined /> }; return <span className="pipeline-icon">{icons[id]}</span> }
function ControlCard({ icon, title, text }) { return <article><span>{icon}</span><h3>{title}</h3><p>{text}</p></article> }

export default App
