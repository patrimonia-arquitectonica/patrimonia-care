"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AppLayout from "@/components/AppLayout";

function MantenimientoInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const miembro = searchParams.get("miembro") || "";
  const comunidad = searchParams.get("comunidad") || "";
  const area = searchParams.get("area") || "";
  const espacio = searchParams.get("espacio") || "";
  const resuelve = searchParams.get("resuelve") || "";
  const ref_padre = searchParams.get("ref_padre") || "";
  const ref_alerta = searchParams.get("ref_alerta") || "";

  const [categoria, setCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [accionPuntual, setAccionPuntual] = useState(false);
  const [comentario, setComentario] = useState("");
  const [guardado, setGuardado] = useState(false);
  const [subcategoriaIA, setSubcategoriaIA] = useState<string | null>(null);
  const [cargandoIA, setCargandoIA] = useState(false);
  const [subcategoriaConfirmada, setSubcategoriaConfirmada] = useState(false);
  const [subcategoriaEditando, setSubcategoriaEditando] = useState(false);
  const [subcategoriaManual, setSubcategoriaManual] = useState("");
  const [protocolo, setProtocolo] = useState<{ pasos: string[]; materiales: string[] } | null>(null);
  const [pasosCompletados, setPasosCompletados] = useState<boolean[]>([]);
  const [fotos, setFotos] = useState<File[]>([]);
  const [fotosArreglo, setFotosArreglo] = useState<File[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      } catch (e) { console.error(e); }
      setCargandoIA(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [descripcion, categoria]);

  useEffect(() => {
    if (!subcategoriaIA) { setProtocolo(null); setPasosCompletados([]); return; }
    const cargar = async () => {
      const { data } = await supabase.from("protocolos").select("*").eq("subcategoria", subcategoriaIA).single();
      if (data) { setProtocolo(data); setPasosCompletados(new Array(data.pasos.length).fill(false)); }
      else setProtocolo(null);
    };
    cargar();
  }, [subcategoriaIA]);

  // Si marcan acción puntual, limpiamos la fecha
  useEffect(() => {
    if (accionPuntual) setFecha("");
  }, [accionPuntual]);

  if (guardado) {
    return (
      <AppLayout>
        <div className="p-4 md:p-6 max-w-lg">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-[#FDF0ED] flex items-center justify-center text-2xl">✅</div>
            <h2 className="text-lg font-semibold text-gray-900">Registro guardado</h2>
            <div className="w-full bg-gray-50 rounded-2xl p-4 text-left space-y-3 border border-gray-100">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Acciones realizadas</p>
              {resuelve && <div className="flex items-center gap-2 text-sm text-gray-700">✅ Registro anterior marcado como resuelto</div>}
              {ref_alerta && <div className="flex items-center gap-2 text-sm text-gray-700">🔔 Alerta marcada como resuelta</div>}
              {accionPuntual
                ? <div className="flex items-center gap-2 text-sm text-gray-700">⚡ Acción puntual — sin próxima revisión</div>
                : fecha && <div className="flex items-center gap-2 text-sm text-gray-700">📅 Próxima revisión: {new Date(fecha).toLocaleDateString("es-ES")}</div>
              }
              <div className="flex items-center gap-2 text-sm text-gray-700">📧 Factura enviada a facturas@arca.com</div>
              <div className="flex items-center gap-2 text-sm text-gray-700">🗄️ Registro guardado en historial</div>
            </div>
            <button onClick={() => router.push("/")} className="w-full py-3 bg-[#FDF0ED] border border-[#E8614A] text-[#E8614A] rounded-xl text-sm font-semibold hover:bg-[#F5C4BB] transition-all">
              + Crear otro registro
            </button>
            <button onClick={() => router.push("/historial")} className="w-full py-3 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-100 transition-all">
              Ver en historial
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Nuevo mantenimiento</h1>
            {(miembro || comunidad) && <p className="text-sm text-gray-400">{miembro}{comunidad ? ` · ${comunidad}${area ? ` · ${area}` : ""}` : ""}{espacio ? ` · ${espacio}` : ""}</p>}
            {resuelve && <p className="text-xs text-[#E8614A] mt-0.5">↩ Resolverá el registro anterior</p>}
            {ref_alerta && <p className="text-xs text-[#EF9F27] mt-0.5">🔔 Resolverá la alerta asociada</p>}
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-[#E8614A] text-white font-medium">Registro</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">

            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
              <div className="bg-[#FDF0ED] rounded-xl p-4 space-y-2">
                <div className="flex gap-2 text-sm"><span className="text-[#E8614A] font-medium w-20">Persona</span><span className="text-[#C44A35]">{miembro || "—"}</span></div>
                <div className="flex gap-2 text-sm"><span className="text-[#E8614A] font-medium w-20">Comunidad</span><span className="text-[#C44A35]">{comunidad}{area ? ` · ${area}` : ""}</span></div>
                <div className="flex gap-2 text-sm"><span className="text-[#E8614A] font-medium w-20">Espacio</span><span className="text-[#C44A35]">{espacio || "—"}</span></div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Categoría</label>
                <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 appearance-none focus:outline-none focus:border-[#E8614A]">
                  <option value="">Selecciona categoría</option>
                  {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Descripción</label>
                <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={3} placeholder="Ej: hay una gotera en el techo del baño…" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 resize-none focus:outline-none focus:border-[#E8614A]" />
              </div>

              {cargandoIA && (
                <div className="border border-[#F5C4BB] rounded-xl p-3 text-xs text-[#E8614A]">✨ Analizando descripción...</div>
              )}

              {subcategoriaIA && !cargandoIA && (
                <div className="border border-[#F5C4BB] rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">✨</span>
                    <span className="text-xs font-semibold text-[#E8614A] uppercase tracking-widest">Subcategoría sugerida por IA</span>
                  </div>
                  {subcategoriaEditando ? (
                    <div className="flex gap-2">
                      <input type="text" value={subcategoriaManual} onChange={(e) => setSubcategoriaManual(e.target.value)} placeholder="Escribe la subcategoría…" className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#E8614A]" />
                      <button onClick={() => { if (subcategoriaManual) { setSubcategoriaIA(subcategoriaManual); setSubcategoriaConfirmada(true); setSubcategoriaEditando(false); } }} className="text-xs px-3 py-2 rounded-xl bg-[#E1F5EE] border border-[#5DCAA5] text-[#0F6E56]">✓</button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium px-3 py-1 rounded-full border ${subcategoriaConfirmada ? "bg-[#E1F5EE] border-[#5DCAA5] text-[#0F6E56]" : "bg-[#FDF0ED] border-[#F5C4BB] text-[#C44A35]"}`}>
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
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Fotos del arreglo</label>
                <label className="flex flex-col items-center gap-1 py-4 bg-gray-50 border border-dashed border-[#F5C4BB] rounded-xl text-xs text-gray-500 cursor-pointer w-full hover:bg-[#FDF0ED] transition-all">
                  📷 <span className="text-[#E8614A] font-medium">Añadir fotos</span>
                  <span className="text-gray-400">Puedes subir varias a la vez</span>
                  <input type="file" accept="image/*" multiple className="hidden"
                    onChange={(e) => { if (e.target.files) setFotosArreglo(prev => [...prev, ...Array.from(e.target.files!)]); }} />
                </label>
                {fotosArreglo.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {fotosArreglo.map((f, i) => (
                      <div key={i} className="flex items-center gap-1 bg-[#FDF0ED] border border-[#F5C4BB] rounded-xl px-3 py-1">
                        <span className="text-xs text-[#E8614A] truncate max-w-[100px]">{f.name}</span>
                        <button onClick={() => setFotosArreglo(prev => prev.filter((_, j) => j !== i))} className="text-xs text-gray-400 hover:text-red-400 ml-1">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Siguiente revisión + acción puntual */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Siguiente revisión {!accionPuntual && <span className="text-[#E8614A]">*</span>}
                  </label>
                  <button
                    onClick={() => setAccionPuntual(!accionPuntual)}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                      accionPuntual
                        ? "bg-[#FDF0ED] border-[#E8614A] text-[#C44A35] font-medium"
                        : "bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300"
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${accionPuntual ? "bg-[#E8614A] border-[#E8614A]" : "border-gray-300"}`}>
                      {accionPuntual && <span className="text-white text-[9px] leading-none">✓</span>}
                    </span>
                    Acción puntual
                  </button>
                </div>

                {accionPuntual ? (
                  <div className="flex items-center gap-2 bg-[#FDF0ED] border border-[#F5C4BB] rounded-xl px-4 py-3">
                    <span className="text-sm">⚡</span>
                    <span className="text-xs text-[#C44A35]">Esta acción no requiere seguimiento futuro</span>
                  </div>
                ) : (
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-[#E8614A]"
                  />
                )}
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Factura / ticket</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <label className="flex flex-col items-center gap-1 py-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-xs text-gray-500 cursor-pointer hover:bg-gray-100 transition-all">
                    📷<span>Foto ticket</span>
                    <input type="file" accept="image/*" multiple capture="environment" className="hidden"
                      onChange={(e) => { if (e.target.files) setFotos(prev => [...prev, ...Array.from(e.target.files!)]); }} />
                  </label>
                  <label className="flex flex-col items-center gap-1 py-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-xs text-gray-500 cursor-pointer hover:bg-gray-100 transition-all">
                    📄<span>Subir PDF</span>
                    <input type="file" accept=".pdf" multiple className="hidden"
                      onChange={(e) => { if (e.target.files) setFotos(prev => [...prev, ...Array.from(e.target.files!)]); }} />
                  </label>
                </div>
                {fotos.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 mb-2">
                    {fotos.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 bg-[#FDF0ED] border border-[#F5C4BB] rounded-xl px-3 py-2">
                        <span className="text-sm">📎</span>
                        <span className="text-xs text-[#C44A35] truncate max-w-[100px]">{f.name}</span>
                        <button onClick={() => setFotos(prev => prev.filter((_, j) => j !== i))} className="text-xs text-gray-400 hover:text-red-400">✕</button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 bg-[#E1F5EE] border border-[#5DCAA5] rounded-xl px-3 py-2">
                  <span className="text-sm">📧</span>
                  <span className="text-xs text-[#085041]">Se enviará a facturas@arca.com</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Comentario para el siguiente</label>
                <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} rows={2} placeholder="Ej: revisar también la junta de la ducha…" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 resize-none focus:outline-none focus:border-[#E8614A]" />
              </div>

              {error && (
                <div className="bg-[#FCEBEB] border border-[#F09595] text-[#A32D2D] text-xs rounded-xl px-4 py-2">{error}</div>
              )}

              <button onClick={async () => {
                if (!accionPuntual && !fecha) { alert("Pon una fecha de siguiente revisión, o marca como acción puntual"); return; }
                setSubiendo(true);
                setError(null);
                const ref = `MNT-${Date.now()}`;

                let urlsFactura: string[] = [];
                if (fotos.length > 0) {
                  for (const f of fotos) {
                    const fd = new FormData();
                    fd.append("file", f); fd.append("bucket", "facturas"); fd.append("ref", ref);
                    const res = await fetch("/api/upload", { method: "POST", body: fd });
                    const data = await res.json();
                    if (data.url) urlsFactura.push(data.url);
                    else {
                      setError("No se pudo subir la factura. Comprueba tu conexión e inténtalo de nuevo.");
                      setSubiendo(false);
                      return;
                    }
                  }
                }

                let urlsFotos: string[] = [];
                if (fotosArreglo.length > 0) {
                  for (const f of fotosArreglo) {
                    const fd = new FormData();
                    fd.append("file", f); fd.append("bucket", "fotos"); fd.append("ref", ref);
                    const res = await fetch("/api/upload", { method: "POST", body: fd });
                    const data = await res.json();
                    if (data.url) urlsFotos.push(data.url);
                    else {
                      setError("No se pudo subir la foto. Comprueba tu conexión e inténtalo de nuevo.");
                      setSubiendo(false);
                      return;
                    }
                  }
                }

                const { error: errInsert } = await supabase.from("Registros").insert({
                  tipo: "mantenimiento",
                  comunidad: `${comunidad}${area ? ` · ${area}` : ""}`,
                  area, espacio, persona: miembro, categoria,
                  subcategoria: subcategoriaIA || "",
                  descripcion, comentario,
                  estado: "Pendiente",
                  gasto: null,
                  foto_url: urlsFactura[0] || null,
                  fotos_arreglo: urlsFotos,
                  fecha_revision: accionPuntual ? null : (fecha || null),
                  accion_puntual: accionPuntual,
                  fecha_creacion: new Date().toISOString(),
                  ref_padre: ref_padre || null,
                  ref_alerta: ref_alerta || null,
                  protocolo: protocolo || null,
                });

                if (!errInsert && resuelve) {
                  await supabase.from("Registros").update({
                    estado: "Resuelto",
                    resuelto_por: miembro,
                    fecha_arreglo: new Date().toISOString().split("T")[0],
                  }).eq("id", resuelve);
                }

                if (!errInsert && ref_alerta) {
                  await supabase.from("alertas").update({
                    resuelta: true,
                    tiene_registro: true,
                    resuelto_por: miembro,
                  }).eq("id", ref_alerta);
                }

                if (!errInsert) {
                  await fetch("/api/email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ref, persona: miembro, comunidad: `${comunidad}${area ? ` · ${area}` : ""}`, espacio, descripcion, tipo: "Mantenimiento", fotoUrl: urlsFactura[0] || null }),
                  });
                  setGuardado(true);
                } else {
                  setError("No se pudo guardar el registro. Inténtalo de nuevo.");
                }
                setSubiendo(false);
              }} disabled={subiendo} className="w-full py-3 bg-[#E8614A] text-white rounded-xl text-sm font-semibold hover:bg-[#C44A35] transition-all disabled:opacity-40">
                {subiendo ? "Guardando..." : "Guardar registro"}
              </button>
            </div>
          </div>

          {protocolo && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">📋 Protocolo de revisión</p>
              <div className="space-y-2 mb-4">
                {protocolo.pasos.map((paso, i) => (
                  <button key={i} onClick={() => {
                    const nuevo = [...pasosCompletados];
                    nuevo[i] = !nuevo[i];
                    setPasosCompletados(nuevo);
                  }} className={`w-full flex items-start gap-3 text-left p-2 rounded-xl transition-all ${pasosCompletados[i] ? "bg-[#E1F5EE]" : "bg-gray-50 border border-gray-100"}`}>
                    <span className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 flex items-center justify-center text-xs border ${pasosCompletados[i] ? "bg-[#1D9E75] border-[#1D9E75] text-white" : "border-gray-300"}`}>
                      {pasosCompletados[i] ? "✓" : ""}
                    </span>
                    <span className={`text-xs ${pasosCompletados[i] ? "line-through text-gray-400" : "text-gray-700"}`}>{paso}</span>
                  </button>
                ))}
              </div>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">🛒 Material necesario</p>
                <div className="flex gap-2 flex-wrap">
                  {protocolo.materiales.map((m, i) => (
                    <span key={i} className="text-xs px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-600">{m}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default function Mantenimiento() {
  return (
    <Suspense>
      <MantenimientoInner />
    </Suspense>
  );
}