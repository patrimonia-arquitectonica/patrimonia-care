"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function AlertaInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const miembro = searchParams.get("miembro") || "";
  const comunidad = searchParams.get("comunidad") || "";
  const area = searchParams.get("area") || "";
  const espacio = searchParams.get("espacio") || "";

  const [categoria, setCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [urgencia, setUrgencia] = useState("");
  const [comentario, setComentario] = useState("");
  const [fechaAlerta, setFechaAlerta] = useState("");
  const [guardado, setGuardado] = useState(false);
  const [subcategoriaIA, setSubcategoriaIA] = useState<string | null>(null);
  const [cargandoIA, setCargandoIA] = useState(false);
  const [subcategoriaConfirmada, setSubcategoriaConfirmada] = useState(false);
  const [subcategoriaEditando, setSubcategoriaEditando] = useState(false);
  const [subcategoriaManual, setSubcategoriaManual] = useState("");

  const CATEGORIAS = ["Albañilería", "Carpintería", "Fontanería", "Limpieza", "Electricidad"];
  const comunidadCompleta = `${comunidad}${area ? ` · ${area}` : ""}`;

  useEffect(() => {
    if (descripcion.length < 15) { setSubcategoriaIA(null); setSubcategoriaConfirmada(false); return; }
    const timer = setTimeout(async () => {
      setCargandoIA(true);
      try {
        const res = await fetch("/api/ia", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ descripcion, categoria }),
        });
        const data = await res.json();
        setSubcategoriaIA(data.subcategoria);
        setSubcategoriaConfirmada(false);
        setSubcategoriaEditando(false);
      } catch (e) {
        console.error(e);
      }
      setCargandoIA(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [descripcion, categoria]);

  if (guardado) {
    return (
      <div className="min-h-screen bg-[#F5F4F0] flex flex-col items-center justify-start p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="px-5 py-10 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-[#FAEEDA] flex items-center justify-center text-2xl">🔔</div>
            <h2 className="text-lg font-semibold text-gray-900">Alerta creada</h2>
            <p className="text-sm text-gray-400">Aparecerá en el calendario el día seleccionado</p>
            <div className="w-full bg-gray-50 rounded-2xl p-4 text-left space-y-3 border border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-700">📅 Añadida al calendario</div>
              <div className="flex items-center gap-2 text-sm text-gray-700">🔔 Recordatorio configurado — urgencia {urgencia}</div>
            </div>
            <button onClick={() => router.push("/")} className="w-full py-3 bg-[#EEEDFE] border border-[#534AB7] text-[#3C3489] rounded-xl text-sm font-semibold">
              + Crear otra alerta
            </button>
            <button onClick={() => router.push("/calendario")} className="w-full py-3 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl text-sm">
              Ver en calendario
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F4F0] flex flex-col items-center justify-start p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-center gap-3">
          <button onClick={() => router.push("/")} className="text-gray-400 hover:text-gray-600 text-lg">←</button>
          <div className="flex-1">
            <h1 className="text-base font-semibold text-gray-900">Nueva alerta</h1>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-[#FAEEDA] text-[#854F0B] font-medium border border-[#EF9F27]">Alerta</span>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div className="bg-[#EEEDFE] rounded-2xl p-4 space-y-2">
            <div className="flex gap-2 text-sm"><span className="text-[#534AB7] font-medium w-20">Persona</span><span className="text-[#3C3489]">{miembro || "—"}</span></div>
            <div className="flex gap-2 text-sm"><span className="text-[#534AB7] font-medium w-20">Comunidad</span><span className="text-[#3C3489]">{comunidadCompleta || "—"}</span></div>
            <div className="flex gap-2 text-sm"><span className="text-[#534AB7] font-medium w-20">Espacio</span><span className="text-[#3C3489]">{espacio || "—"}</span></div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Categoría</label>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 appearance-none">
              <option value="">Selecciona categoría</option>
              {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Descripción</label>
            <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={2} placeholder="Describe qué hay que hacer…" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 resize-none" />
          </div>

          {cargandoIA && (
            <div className="border border-[#AFA9EC] rounded-2xl p-3 text-xs text-[#534AB7]">
              ✨ Analizando descripción...
            </div>
          )}

          {subcategoriaIA && !cargandoIA && (
            <div className="border border-[#AFA9EC] rounded-2xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">✨</span>
                <span className="text-xs font-semibold text-[#534AB7] uppercase tracking-widest">Subcategoría sugerida por IA</span>
              </div>
              {subcategoriaEditando ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={subcategoriaManual}
                    onChange={(e) => setSubcategoriaManual(e.target.value)}
                    placeholder="Escribe la subcategoría…"
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700"
                  />
                  <button onClick={() => {
                    if (subcategoriaManual) {
                      setSubcategoriaIA(subcategoriaManual);
                      setSubcategoriaConfirmada(true);
                      setSubcategoriaEditando(false);
                    }
                  }} className="text-xs px-3 py-2 rounded-xl bg-[#E1F5EE] border border-[#5DCAA5] text-[#0F6E56]">✓</button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium px-3 py-1 rounded-full border ${subcategoriaConfirmada ? "bg-[#E1F5EE] border-[#5DCAA5] text-[#0F6E56]" : "bg-[#EEEDFE] border-[#AFA9EC] text-[#3C3489]"}`}>
                    {subcategoriaConfirmada ? "✓ " : ""}{subcategoriaIA}
                  </span>
                  {!subcategoriaConfirmada && (
                    <div className="flex gap-2">
                      <button onClick={() => setSubcategoriaConfirmada(true)} className="text-xs px-3 py-1 rounded-lg bg-[#E1F5EE] border border-[#5DCAA5] text-[#0F6E56]">✓ Confirmar</button>
                      <button onClick={() => { setSubcategoriaEditando(true); setSubcategoriaManual(subcategoriaIA || ""); }} className="text-xs px-3 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-500">✎ Cambiar</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 block">Urgencia</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Alta", sub: "cada día", color: "bg-[#FCEBEB] border-[#E24B4A] text-[#A32D2D]" },
                { label: "Media", sub: "cada 3 días", color: "bg-[#FAEEDA] border-[#EF9F27] text-[#854F0B]" },
                { label: "Leve", sub: "1 vez/semana", color: "bg-[#EAF3DE] border-[#639922] text-[#3B6D11]" },
              ].map((u) => (
                <button key={u.label} onClick={() => setUrgencia(u.label)} className={`py-2 rounded-xl text-xs font-medium border transition-all ${urgencia === u.label ? u.color : "bg-gray-50 border-gray-200 text-gray-500"}`}>
                  {u.label}
                  <div className="text-xs font-normal mt-1">{u.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Fecha para el calendario</label>
            <input type="date" value={fechaAlerta} onChange={(e) => setFechaAlerta(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700" />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Comentario para el siguiente</label>
            <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} rows={2} placeholder="Contexto útil para quien lo resuelva…" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 resize-none" />
          </div>

          <button onClick={async () => {
            const { error } = await supabase.from("alertas").insert({
              tipo: "mantenimiento",
              comunidad: comunidadCompleta,
              area: area,
              espacio: espacio,
              persona: miembro,
              categoria: categoria,
              descripcion: descripcion,
              urgencia: urgencia,
              comentario: comentario,
              estado: "Pendiente",
              fecha_alerta: fechaAlerta || null,
            });
            if (!error) setGuardado(true);
            else console.error(error);
          }} disabled={!descripcion || !urgencia} className="w-full py-3 bg-[#534AB7] text-white rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-[#3C3489] transition-all">
            Crear alerta
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Alerta() {
  return (
    <Suspense>
      <AlertaInner />
    </Suspense>
  );
}