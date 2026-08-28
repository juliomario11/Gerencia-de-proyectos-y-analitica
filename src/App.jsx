import { useMemo, useRef, useState } from 'react'
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Bot, CheckCircle2,
  ChevronDown, CircleAlert, Clock3, Database, Gauge, GitBranch, Menu,
  MessageSquareText, RefreshCw, Send, Sparkles, Users, X,
} from 'lucide-react'
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ReferenceLine,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { analyticalQuestion, methodology, operationalData, repairTypes, sprints, weekly } from './data'

const zoneColors = {
  COSTA: '#e56e44', ORIENTE: '#d89e3d', SUR: '#dc4f61', 'BOGOTÁ': '#6878ce', ANDINA: '#32a58b',
}

const quickQuestions = [
  '¿Dónde está la mayor brecha de capacidad?',
  '¿Qué zona requiere atención inmediata?',
  'Resume los indicadores para Operaciones',
]

const formatNumber = new Intl.NumberFormat('es-CO')
const pct = (value) => `${Math.round(value)}%`

function App() {
  const [zone, setZone] = useState('TODAS')
  const [period, setPeriod] = useState('Últimas 6 semanas')
  const [activeSection, setActiveSection] = useState('panorama')
  const [menuOpen, setMenuOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Puedo ayudarte a interpretar las brechas del tablero. Pregunta por zonas, capacidad, cumplimiento o metodología.' },
  ])
  const chatEnd = useRef(null)

  const filtered = useMemo(
    () => zone === 'TODAS' ? operationalData : operationalData.filter((item) => item.zone === zone),
    [zone],
  )

  const summary = useMemo(() => {
    const total = filtered.reduce((acc, item) => ({
      assigned: acc.assigned + item.assigned,
      completed: acc.completed + item.completed,
      capacity: acc.capacity + item.capacity,
      load: acc.load + item.load,
      backlog: acc.backlog + item.backlog,
      technicians: acc.technicians + item.technicians,
      reprogrammed: acc.reprogrammed + item.reprogrammed,
    }), { assigned: 0, completed: 0, capacity: 0, load: 0, backlog: 0, technicians: 0, reprogrammed: 0 })
    return {
      ...total,
      completion: total.assigned ? total.completed / total.assigned * 100 : 0,
      utilization: total.capacity ? total.load / total.capacity * 100 : 0,
      gap: total.load - total.capacity,
    }
  }, [filtered])

  const trendData = useMemo(() => weekly.map((week, index) => {
    const values = filtered.map((item) => item.trend[index])
    return { week, completion: values.reduce((a, b) => a + b, 0) / values.length }
  }), [filtered])

  const scrollTo = (id) => {
    setActiveSection(id)
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const ask = async (prompt) => {
    const text = (prompt || question).trim()
    if (!text || loading) return
    const nextMessages = [...messages, { role: 'user', content: text }]
    setMessages(nextMessages)
    setQuestion('')
    setLoading(true)
    setTimeout(() => chatEnd.current?.scrollIntoView({ behavior: 'smooth' }), 50)

    try {
      const response = await fetch('/.netlify/functions/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text, zone, period, data: filtered }),
      })
      if (!response.ok) throw new Error('No fue posible consultar el asistente')
      const payload = await response.json()
      setMessages([...nextMessages, { role: 'assistant', content: payload.answer }])
    } catch {
      const overloaded = filtered.filter((item) => item.load > item.capacity).sort((a, b) => (b.load - b.capacity) - (a.load - a.capacity))
      const lead = overloaded[0]
      const fallback = lead
        ? `Lectura local: ${lead.zone} presenta la mayor brecha del filtro actual (${formatNumber.format(lead.load - lead.capacity)} minutos sobre su capacidad) y una completitud de ${pct(lead.completed / lead.assigned * 100)}. Conviene revisar primero la mezcla de reparaciones, los desplazamientos y las reprogramaciones. Conecta OPENAI_API_KEY en Netlify para habilitar el análisis generativo.`
        : `Lectura local: el filtro actual no presenta sobrecarga agregada. La utilización es ${pct(summary.utilization)} y la completitud ${pct(summary.completion)}. Conecta OPENAI_API_KEY en Netlify para habilitar el análisis generativo.`
      setMessages([...nextMessages, { role: 'assistant', content: fallback }])
    } finally {
      setLoading(false)
      setTimeout(() => chatEnd.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => scrollTo('panorama')} aria-label="Ir al inicio">
          <span className="brand-mark"><Activity size={20} strokeWidth={2.5} /></span>
          <span>NODO</span>
          <small>FIELD ANALYTICS</small>
        </button>
        <nav className={menuOpen ? 'main-nav open' : 'main-nav'} aria-label="Navegación principal">
          {[
            ['panorama', 'Panorama'], ['diagnostico', 'Diagnóstico'], ['metodologia', 'Metodología'], ['ruta', 'Ruta del proyecto'],
          ].map(([id, label]) => (
            <button key={id} className={activeSection === id ? 'active' : ''} onClick={() => scrollTo(id)}>{label}</button>
          ))}
        </nav>
        <button className="assistant-trigger" onClick={() => setChatOpen(true)}><Sparkles size={16} /> Consultar al asistente</button>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menú"><Menu /></button>
      </header>

      <main>
        <section className="hero section" id="panorama">
          <div className="eyebrow"><span className="live-dot" /> PROTOTIPO ANALÍTICO · DATOS DEMOSTRATIVOS</div>
          <div className="hero-grid">
            <div>
              <h1>Capacidad visible.<br /><em>Decisiones a tiempo.</em></h1>
              <p className="hero-lead">Una lectura descriptiva y diagnóstica de la operación de técnicos de red externa en Salesforce Field Service.</p>
            </div>
            <div className="question-card">
              <span>PREGUNTA ANALÍTICA</span>
              <p>{analyticalQuestion}</p>
              <div className="question-footer"><Database size={16} /> WorkOrder + ServiceAppointment · histórico de 90 días</div>
            </div>
          </div>

          <div className="filter-bar">
            <div><label htmlFor="zone">ZONA</label><div className="select-wrap"><select id="zone" value={zone} onChange={(e) => setZone(e.target.value)}><option>TODAS</option>{operationalData.map((item) => <option key={item.zone}>{item.zone}</option>)}</select><ChevronDown size={16} /></div></div>
            <div><label htmlFor="period">PERIODO</label><div className="select-wrap"><select id="period" value={period} onChange={(e) => setPeriod(e.target.value)}><option>Últimas 6 semanas</option><option>Últimos 30 días</option><option>Últimos 90 días</option></select><ChevronDown size={16} /></div></div>
            <div className="filter-meta"><RefreshCw size={15} /> Corte demostrativo: 12 ago 2026 · 06:00</div>
          </div>

          <div className="kpi-grid">
            <Kpi icon={<Users />} label="TÉCNICOS ACTIVOS" value={summary.technicians} detail={`${filtered.length} zonas en alcance`} />
            <Kpi icon={<CheckCircle2 />} label="CUMPLIMIENTO" value={pct(summary.completion)} detail={`${summary.completed} de ${summary.assigned} órdenes`} tone={summary.completion >= 85 ? 'positive' : 'warning'} />
            <Kpi icon={<Gauge />} label="UTILIZACIÓN" value={pct(summary.utilization)} detail={`${formatNumber.format(summary.load)} min planificados`} tone={summary.utilization > 100 ? 'negative' : 'positive'} />
            <Kpi icon={<Clock3 />} label="BRECHA NETA" value={`${summary.gap > 0 ? '+' : ''}${formatNumber.format(summary.gap)} min`} detail={summary.gap > 0 ? 'Carga sobre capacidad' : 'Holgura potencial'} tone={summary.gap > 0 ? 'negative' : 'positive'} />
          </div>
        </section>

        <section className="section diagnosis" id="diagnostico">
          <SectionHeading number="01" kicker="LECTURA OPERATIVA" title="¿Dónde se abre la brecha?" description="La capacidad no se interpreta sola: se contrasta con carga, ejecución y pendientes para localizar decisiones posibles." />
          <div className="chart-grid">
            <article className="panel wide">
              <PanelHeader title="Carga frente a capacidad" subtitle="Minutos planificados y disponibles por zona" badge="BRECHA" />
              <div className="chart-area">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filtered} barGap={7} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="#e9e4dc" />
                    <XAxis dataKey="zone" axisLine={false} tickLine={false} tick={{ fill: '#645f58', fontSize: 11, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8a847c', fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="capacity" name="Capacidad" fill="#d9d3ca" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="load" name="Carga" radius={[4, 4, 0, 0]}>{filtered.map((item) => <Cell key={item.zone} fill={item.load > item.capacity ? '#e56e44' : '#32a58b'} />)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="legend"><span><i className="capacity" /> Capacidad disponible</span><span><i className="load" /> Carga planificada</span></div>
            </article>

            <article className="panel">
              <PanelHeader title="Evolución del cumplimiento" subtitle="Órdenes completadas / asignadas" badge={zone} />
              <div className="chart-area">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 14, left: -18, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="#e9e4dc" />
                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#8a847c', fontSize: 10 }} />
                    <YAxis domain={[65, 100]} axisLine={false} tickLine={false} tick={{ fill: '#8a847c', fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                    <ReferenceLine y={85} stroke="#b8b1a8" strokeDasharray="4 4" />
                    <Tooltip content={<ChartTooltip suffix="%" />} />
                    <Line type="monotone" dataKey="completion" name="Cumplimiento" stroke="#1f4850" strokeWidth={3} dot={{ fill: '#f7f4ef', stroke: '#1f4850', strokeWidth: 2, r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="chart-note"><span /> Referencia operativa de lectura: 85%</p>
            </article>
          </div>

          <div className="insight-strip">
            <div className="insight-icon"><CircleAlert /></div>
            <div><span>HALLAZGO PRIORITARIO</span><p><strong>SUR</strong> concentra la mayor brecha demostrativa: <strong>+1.920 minutos</strong>, 31 pendientes y 22 reprogramaciones. El dato sugiere revisar mezcla de daños y agenda; no atribuir automáticamente bajo desempeño al técnico.</p></div>
            <button onClick={() => { setZone('SUR'); setChatOpen(true); ask('Analiza la situación de SUR y propone tres preguntas de diagnóstico.') }}>Analizar con IA <ArrowRight size={16} /></button>
          </div>

          <div className="table-panel">
            <PanelHeader title="Lectura comparativa por zona" subtitle="Indicadores operativos agregados del periodo seleccionado" badge={`${filtered.length} REGISTROS`} />
            <div className="table-wrap">
              <table>
                <thead><tr><th>ZONA</th><th>ASIGNADAS</th><th>COMPLETADAS</th><th>CUMPLIMIENTO</th><th>UTILIZACIÓN</th><th>BRECHA</th><th>BACKLOG</th><th>SEÑAL</th></tr></thead>
                <tbody>{filtered.map((item) => {
                  const gap = item.load - item.capacity
                  const completion = item.completed / item.assigned * 100
                  return <tr key={item.zone}>
                    <td><span className="zone-dot" style={{ background: zoneColors[item.zone] }} />{item.zone}</td><td>{item.assigned}</td><td>{item.completed}</td><td>{pct(completion)}</td><td>{pct(item.load / item.capacity * 100)}</td><td className={gap > 0 ? 'negative-text' : 'positive-text'}>{gap > 0 ? '+' : ''}{formatNumber.format(gap)} min</td><td>{item.backlog}</td><td><Status level={gap > 1000 || completion < 80 ? 'critical' : gap > 0 ? 'watch' : 'stable'} /></td>
                  </tr>
                })}</tbody>
              </table>
            </div>
          </div>

          <div className="repair-grid">
            <div>
              <span className="mini-kicker">TIPOS DE REPARACIÓN</span>
              <h3>La duración explica parte de la presión.</h3>
              <p>La mediana histórica permite comparar la mezcla operativa sin convertirla en una promesa individual.</p>
            </div>
            <div className="repair-list">{repairTypes.map((item) => <div className="repair-row" key={item.name}><div><strong>{item.name}</strong><small>{item.completed}/{item.assigned} completadas</small></div><div className="duration"><span style={{ width: `${item.median / 1.4}%` }} /><em>{item.median} min</em></div><div className="reprogram">{item.reprogramming}%<small>reprog.</small></div></div>)}</div>
          </div>
        </section>

        <section className="section methodology-section" id="metodologia">
          <SectionHeading number="02" kicker="ENFOQUE INTEGRADO" title="Cuatro marcos. Un producto confiable." description="La entrega conecta gobierno, iteración, análisis y operación; cada enfoque resuelve una necesidad distinta del proyecto." light />
          <div className="method-grid">{methodology.map((item) => <article key={item.code}><span>{item.code}</span><div className="method-icon">{item.code === '01' ? <GitBranch /> : item.code === '02' ? <RefreshCw /> : item.code === '03' ? <Database /> : <Activity />}</div><h3>{item.name}</h3><strong>{item.role}</strong><p>{item.detail}</p></article>)}</div>
          <div className="scope-note"><div><span>DECISIÓN DE ALCANCE</span><strong>Descriptivo + diagnóstico</strong></div><p>Esta fase no incorpora predicción, optimización ni evaluación individual. MLOps será pertinente solo cuando exista un modelo que deba desplegarse y monitorearse.</p><CheckCircle2 /></div>
        </section>

        <section className="section roadmap" id="ruta">
          <SectionHeading number="03" kicker="RUTA DE ENTREGA" title="Tres incrementos con evidencia." description="Cada Sprint produce un resultado revisable y solo cierra cuando el dato cuadra, la regla se valida y el usuario deja evidencia." />
          <div className="sprint-grid">{sprints.map((sprint, index) => <article key={sprint.number}><div className="sprint-top"><span>SPRINT {sprint.number}</span><em>{sprint.status}</em></div><h3>{sprint.title}</h3><p>{sprint.result}</p><div className="sprint-check"><CheckCircle2 size={17} /> Criterio de aceptación verificable</div>{index < sprints.length - 1 && <ArrowRight className="sprint-arrow" />}</article>)}</div>
          <div className="data-flow">
            <span>FLUJO DEL PRODUCTO</span>
            <div className="flow-items">{['Salesforce', 'Extracción', 'Histórico', 'Calidad', 'Dataset', 'Tablero'].map((item, index) => <div key={item}><strong>{item}</strong>{index < 5 && <ArrowRight />}</div>)}</div>
            <small>Linaje trazable desde WorkOrder y ServiceAppointment hasta cada indicador.</small>
          </div>
        </section>

        <section className="closing">
          <span>UNA DECISIÓN MEJOR EMPIEZA CON UNA PREGUNTA MEJOR</span>
          <h2>La capacidad no es un número.<br />Es una conversación operativa.</h2>
          <button onClick={() => setChatOpen(true)}><MessageSquareText /> Explorar los datos con el asistente <ArrowUpRight /></button>
          <p>Mario Daniel Enrique Pérez Jiménez · Especialización en Analítica de Datos · 2026</p>
        </section>
      </main>

      {chatOpen && <div className="chat-backdrop" onClick={(e) => e.target === e.currentTarget && setChatOpen(false)}>
        <aside className="chat-panel" aria-label="Asistente analítico">
          <div className="chat-header"><div><span className="assistant-avatar"><Bot /></span><div><strong>Asistente NODO</strong><small><i /> Contexto del tablero activo</small></div></div><button onClick={() => setChatOpen(false)} aria-label="Cerrar"><X /></button></div>
          <div className="chat-context"><span>FILTRO ACTIVO</span><strong>{zone}</strong><i>·</i><span>{period}</span></div>
          <div className="messages">{messages.map((message, index) => <div className={`message ${message.role}`} key={`${message.role}-${index}`}><span>{message.role === 'assistant' ? <Sparkles size={14} /> : 'TÚ'}</span><p>{message.content}</p></div>)}{loading && <div className="message assistant"><span><Sparkles size={14} /></span><p className="typing"><i /><i /><i /></p></div>}<div ref={chatEnd} /></div>
          <div className="quick-questions">{quickQuestions.map((item) => <button key={item} onClick={() => ask(item)}>{item}</button>)}</div>
          <form className="chat-input" onSubmit={(e) => { e.preventDefault(); ask() }}><textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Pregunta sobre la operación…" rows="2" onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask() } }} /><button type="submit" disabled={!question.trim() || loading} aria-label="Enviar"><Send /></button></form>
          <p className="ai-disclaimer">La IA apoya la interpretación; no reemplaza el criterio operativo.</p>
        </aside>
      </div>}
    </div>
  )
}

function Kpi({ icon, label, value, detail, tone = '' }) {
  return <article className={`kpi ${tone}`}><div className="kpi-top"><span>{icon}</span><small>{label}</small></div><strong>{value}</strong><p>{tone === 'negative' ? <ArrowUpRight /> : tone === 'positive' ? <ArrowDownRight /> : null}{detail}</p></article>
}

function SectionHeading({ number, kicker, title, description, light = false }) {
  return <div className={`section-heading ${light ? 'light' : ''}`}><div className="section-number">{number}</div><div><span>{kicker}</span><h2>{title}</h2></div><p>{description}</p></div>
}

function PanelHeader({ title, subtitle, badge }) {
  return <div className="panel-header"><div><h3>{title}</h3><p>{subtitle}</p></div><span>{badge}</span></div>
}

function ChartTooltip({ active, payload, label, suffix = '' }) {
  if (!active || !payload?.length) return null
  return <div className="chart-tooltip"><strong>{label}</strong>{payload.map((entry) => <span key={entry.dataKey}><i style={{ background: entry.color }} />{entry.name}: {Number(entry.value).toLocaleString('es-CO', { maximumFractionDigits: 1 })}{suffix}</span>)}</div>
}

function Status({ level }) {
  const labels = { critical: 'CRÍTICO', watch: 'VIGILAR', stable: 'ESTABLE' }
  return <span className={`status ${level}`}><i />{labels[level]}</span>
}

export default App
