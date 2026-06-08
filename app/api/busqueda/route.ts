import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { consulta, registros = [], alertas = [] } = await req.json();

  const todos = [...registros, ...alertas];

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: `Eres un asistente de gestión de inmuebles. El usuario busca: "${consulta}".

Aquí están los registros y alertas disponibles en formato JSON:
${JSON.stringify(todos.map((r: any) => ({ id: r.id, descripcion: r.descripcion, comunidad: r.comunidad, espacio: r.espacio, categoria: r.categoria, subcategoria: r.subcategoria, comentario: r.comentario, persona: r.persona })))}

Devuelve SOLO un array JSON con los IDs más relevantes para la búsqueda, ordenados por relevancia. Máximo 5 resultados. Si ninguno es relevante devuelve []. Ejemplo: ["id1", "id2"]`,
      },
    ],
  });

  try {
    const texto = (message.content[0] as any).text.trim();
    const ids = JSON.parse(texto);
    return NextResponse.json({ ids });
  } catch {
    return NextResponse.json({ ids: [] });
  }
}