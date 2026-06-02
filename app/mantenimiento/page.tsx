"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function MantenimientoInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const miembro = searchParams.get("miembro") || "";
  const comunidad = searchParams.get("comunidad") || "";
  const area = searchParams.get("area") || "";
  const espacio = searchParams.get("espacio") || "";

  const [categoria, setCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [comentario, setComentario] = useState("");
  const [guardado, setGuardado] = useState(false);
  const [subcategoriaIA, setSubcategoriaIA] = useState<string | null>(null);
  const [cargandoIA, setCargandoIA] = useState(false);
  const [subcategoriaConfirmada, setSubcategoriaConfirmada] = useState(false);
  const [subcategoriaEditando, setSubcategoriaEditando] = useState(false);
  const [subcategoriaManual, setSubcategoriaManual] = useState("");
  const [protocolo, setProtocolo] = useState<{ pasos: string[]; materiales: string[] } | null>(null);
  const [pasosCompletados, setPasosCompletados] = useState<boolean[]>([]);
  const [foto, setFoto] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);

  const CATEGORIAS = ["Albañilería", "Carpintería", "Fontanería", "Limpieza", "Electricidad"];

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

  useEffect(() => {
    if (!subcategoriaIA) { setProtocolo(null); setPasosCompletados([]); return; }
    const cargar = async () => {
      const { data } = await supabase
        .from("protocolos")
        .select("*")
        .eq("subcategoria", subcategoriaIA)
        .single();
      if (data) {
        setProtocolo(data);
        setPasosCompletados(new Array(data.pasos.length).fill(false));
      } else {
        setProtocolo(null);
      }
    };
    cargar();
  }, [subcategoriaIA]);

  if (guardado) {
    return (
      <div className="min-h-screen bg-[#F5F4F0] flex flex-col items-center justify-start p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="px-5 py-10 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-[#E1F5EE] flex items-center justify-center text-2xl">✅</div>
            <h2 className="text-lg font-semibold text-gray-900">Registro guardado</h2>
            <div className="w-full bg-gray-50 rounded-2xl p-4 text-left space-y-3 border border-gray-100">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Acciones realizadas</p>
              <div className="flex items-center gap-2 text-sm text-gray-700">📅 Próxima revisión añadida al calendario</div>
              <div className="flex items-center gap-2 text-sm text-gray-700">📧 Factura enviada a facturas@patrimoniacare.com</div>
              <div className="flex items-center gap-2 text-sm text-gray-700">🗄️ Registro guardado en historial</div>
            </div>
            <button onClick={() => router.push("/")} className="w-full py-3 bg-[#EEEDFE] border border-[#534AB7] text-[#3C3489] rounded-xl text-sm font-semibold">
              + Crear otro registro
            </button>
            <button onClick={() => router.push("/historial")} className="w-full py-3 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl text-sm">
              Ver en historial
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
            <h1 className="text-base font-semibold text-gray-900">Nuevo mantenimiento</h1>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-[#534AB7] text-white font-medium">Registro</span>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div className="bg-[#EEEDFE] rounded-2xl p-4 space-y-2">
            <div className="flex gap-2 text-sm"><span className="text-[#534AB7] font-medium w-20">Persona</span><span className="text-[#3C3489]">{miembro || "—"}</span></div>
            <div className="flex gap-2 text-sm"><span className="text-[#534AB7] font-medium w-20">Comunidad</span><span className="text-[#3C3489]">{comunidad}{area ? ` · ${area}` : ""}</span></div>
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
            <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={2} placeholder="Ej: hay una gotera en el techo del baño…" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 resize-none" />
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

          {protocolo && (
            <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">📋 Protocolo de revisión</p>
              <div className="space-y-2">
                {protocolo.pasos.map((paso, i) => (
                  <button key={i} onClick={() => {
                    const nuevo = [...pasosCompletados];
                    nuevo[i] = !nuevo[i];
                    setPasosCompletados(nuevo);
                  }} className={`w-full flex items-start gap-3 text-left p-2 rounded-xl transition-all ${pasosCompletados[i] ? "bg-[#E1F5EE]" : "bg-white border border-gray-100"}`}>
                    <span className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 flex items-center justify-center text-xs border ${pasosCompletados[i] ? "bg-[#1D9E75] border-[#1D9E75] text-white" : "border-gray-300"}`}>
                      {pasosCompletados[i] ? "✓" : ""}
                    </span>
                    <span className={`text-xs ${pasosCompletados[i] ? "line-through text-gray-400" : "text-gray-700"}`}>{paso}</span>
                  </button>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">🛒 Material necesario</p>
                <div className="flex gap-2 flex-wrap">
                  {protocolo.materiales.map((m, i) => (
                    <span key={i} className="text-xs px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-600">{m}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Siguiente revisión</label>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700" />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Factura / ticket</label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <label className="flex flex-col items-center gap-1 py-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-xs text-gray-500 cursor-pointer">
                📷<span>Foto ticket</span>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => {
                  if (e.target.files?.[0]) setFoto(e.target.files[0]);
                }} />
              </label>
              <label className="flex flex-col items-center gap-1 py-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-xs text-gray-500 cursor-pointer">
                📄<span>Subir PDF</span>
                <input type="file" accept=".pdf" className="hidden" onChange={(e) => {
                  if (e.target.files?.[0]) setFoto(e.target.files[0]);
                }} />
              </label>
            </div>
            {foto && (
              <div className="flex items-center gap-2 bg-[#EEEDFE] border border-[#AFA9EC] rounded-xl px-3 py-2 mb-2">
                <span className="text-sm">📎</span>
                <span className="text-xs text-[#3C3489] flex-1 truncate">{foto.name}</span>
                <button onClick={() => setFoto(null)} className="text-xs text-gray-400">✕</button>
              </div>
            )}
            <div className="flex items-center gap-2 bg-[#E1F5EE] border border-[#5DCAA5] rounded-xl px-3 py-2">
              <span className="text-sm">📧</span>
              <span className="text-xs text-[#085041]">Se enviará a facturas@patrimoniacare.com</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Comentario para el siguiente</label>
            <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} rows={2} placeholder="Ej: revisar también la junta de la ducha…" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 resize-none" />
          </div>

          <button onClick={async () => {
            setSubiendo(true);
            const ref = `MNT-${Date.now()}`;

            // Subir foto si hay
            if (foto) {
              const fd = new FormData();
              fd.append("file", foto);
              fd.append("bucket", "facturas");
              fd.append("ref", ref);
              await fetch("/api/upload", { method: "POST", body: fd });
            }

            // Guardar en Supabase
            const { error } = await supabase.from("Registros").insert({
              tipo: "mantenimiento",
              comunidad: `${comunidad}${area ? ` · ${area}` : ""}`,
              area: area,
              espacio: espacio,
              persona: miembro,
              categoria: categoria,
              subcategoria: subcategoriaIA || "",
              descripcion: descripcion,
              comentario: comentario,
              estado: "Pendiente",
              gasto: null,
              fecha_creacion: new Date().toISOString(),
            });

            // Enviar email
            if (!error) {
              await fetch("/api/email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ref,
                  persona: miembro,
                  comunidad: `${comunidad}${area ? ` · ${area}` : ""}`,
                  espacio,
                  descripcion,
                  tipo: "Mantenimiento",
                }),
              });
              setGuardado(true);
            } else {
              console.error(error);
            }
            setSubiendo(false);
          }} disabled={subiendo} className="w-full py-3 bg-[#534AB7] text-white rounded-xl text-sm font-semibold hover:bg-[#3C3489] transition-all disabled:opacity-40">
            {subiendo ? "Guardando..." : "Guardar registro"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Mantenimiento() {
  return (
    <Suspense>
      <MantenimientoInner />
    </Suspense>
  );
}