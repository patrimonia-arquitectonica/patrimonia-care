import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { descripcion, categoria } = await req.json();

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 100,
    messages: [
      {
        role: "user",
        content: `Eres un asistente de gestión de inmuebles. Dado este mantenimiento de categoría "${categoria}", con la descripción: "${descripcion}", sugiere UNA subcategoría corta (máximo 4 palabras) que clasifique mejor el problema. Responde SOLO con la subcategoría, sin explicaciones ni puntos.`,
      },
    ],
  });

  const subcategoria = (message.content[0] as any).text.trim();
  return NextResponse.json({ subcategoria });
}