import OpenAI from 'openai'

const headers = { 'Content-Type': 'application/json' }

export default async (request) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido' }), { status: 405, headers })
  }

  if (!process.env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'El asistente no está configurado' }), { status: 503, headers })
  }

  try {
    const { question, zone, period, data } = await request.json()
    if (!question || typeof question !== 'string' || question.length > 800) {
      return new Response(JSON.stringify({ error: 'Pregunta inválida' }), { status: 400, headers })
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    })

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-5-mini',
      temperature: 0.2,
      max_tokens: 450,
      messages: [
        {
          role: 'system',
          content: `Eres el asistente analítico NODO para una empresa de telecomunicaciones colombiana. Interpretas un tablero descriptivo sobre técnicos de reparación de red externa. Responde en español, de forma concisa y ejecutiva. Distingue hechos de hipótesis. Nunca atribuyas causalidad ni desempeño individual con estos agregados. No predigas. Si recomiendas una acción, formúlala como validación operativa. La pregunta analítica es: ¿Cómo se distribuyen la carga, capacidad y ejecución, y dónde aparecen brechas que requieran ajustar asignación o agenda? Los datos enviados son demostrativos, no productivos.`,
        },
        {
          role: 'user',
          content: `Filtro: zona=${zone}; periodo=${period}. Datos agregados: ${JSON.stringify(data)}. Pregunta: ${question}`,
        },
      ],
    })

    const answer = completion.choices?.[0]?.message?.content?.trim()
    if (!answer) throw new Error('Respuesta vacía')
    return new Response(JSON.stringify({ answer }), { status: 200, headers })
  } catch (error) {
    console.error('Assistant error:', error instanceof Error ? error.message : 'unknown')
    return new Response(JSON.stringify({ error: 'No fue posible generar el análisis' }), { status: 500, headers })
  }
}
