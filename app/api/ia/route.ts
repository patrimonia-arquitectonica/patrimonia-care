import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const client = new Anthropic();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const { descripcion, categoria } = await req.json();

  const { data: protocolos } = await supabase
    .from("protocolos")
    .select("subcategoria")
    .eq("categoria", categoria || "");

  const subcategorias = protocolos?.map((p) => p.subcategoria) || [];

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 100,
    messages: [
      {
        role: "user",
        content: `Eres un asistente de gestión de inmuebles. Dado este mantenimiento de categoría "${categoria}", con la descripción: "${descripcion}", elige la subcategoría más adecuada de esta lista y responde ÚNICAMENTE con el texto exacto de una de estas opciones, sin cambiar ni una letra: ${subcategorias.length > 0 ? subcategorias.join(" | ") : "Revisión general"}`,
      },
    ],
  });

  const subcategoria = (message.content[0] as any).text.trim();
  return NextResponse.json({ subcategoria });
}