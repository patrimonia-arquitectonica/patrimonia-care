import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { ref, persona, comunidad, espacio, descripcion, tipo } = await req.json();

  try {
    await resend.emails.send({
      from: "Patrimonia Care <onboarding@resend.dev>",
      to: ["facturas@patrimoniacare.com"],
      subject: `[FAC] ${ref} · ${comunidad} · ${new Date().toLocaleDateString("es-ES")}`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #534AB7;">Nueva factura — Patrimonia Care</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; color: #666;">Referencia</td><td style="padding: 8px; font-weight: bold;">${ref}</td></tr>
            <tr style="background: #f9f9f9;"><td style="padding: 8px; color: #666;">Persona</td><td style="padding: 8px;">${persona}</td></tr>
            <tr><td style="padding: 8px; color: #666;">Comunidad</td><td style="padding: 8px;">${comunidad}</td></tr>
            <tr style="background: #f9f9f9;"><td style="padding: 8px; color: #666;">Espacio</td><td style="padding: 8px;">${espacio}</td></tr>
            <tr><td style="padding: 8px; color: #666;">Tipo</td><td style="padding: 8px;">${tipo}</td></tr>
            <tr style="background: #f9f9f9;"><td style="padding: 8px; color: #666;">Descripción</td><td style="padding: 8px;">${descripcion}</td></tr>
          </table>
          <p style="color: #999; font-size: 12px; margin-top: 24px;">Generado automáticamente por Patrimonia Care</p>
        </div>
      `,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}