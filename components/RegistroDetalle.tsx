"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Props {
  registro: any;
  miembros?: any[];
  onVolver: () => void;
  onActualizar?: () => void;
}

export default function RegistroDetalle({ registro: r, miembros = [], onVolver, onActualizar }: Props) {
  const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null);
  const [resolviendoRapido, setResolviendoRapido] = useState(false);
  const [reprogramando, setReprogramando] = useState(false);
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [fechaRevision, setFechaRevision] = useState("");
  const [accionPuntual, setAccionPuntual] = useState(false);
  const [resueltoPor, setResueltoPor] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [tieneHijo, setTieneHijo] = useState(false);
  const [cargandoHijo, setCargandoHijo] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editandoDescripcion, setEditandoDescripcion] = useState(false);
  const [descripcionActual, setDescripcionActual] = useState(r.descripcion || "");
  const [descripcionEditada, setDescripcionEditada] = useState("");

  const fotosArreglo: string[] = Array.isArray(r.fotos_arreglo) ? r.fotos_arreglo : [];
  const esImagen = (url: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  const esResuelto = r.estado === "Resuelto" || r.estado === "Hecho";

  useEffect(() => {
    const comprobar = async () => {
      const { data } = await supabase.from("Registros").select("id").eq("ref_padre", r.id).limit(1);
      setTieneHijo((data?.length ?? 0) > 0);
      setCargandoHijo(false);
    };
    comprobar();
  }, [r.id]);

  // Limpiar fecha si marcan acción puntual
  useEffect(() => {
    if (accionPuntual) setFechaRevision("");
  }, [accionPuntual]);

  const badgeEstado = (estado: string) => {
    if (estado === "Resuelto" || estado === "Hecho") return <span className="text-xs px-2 py-0.5 rounded-full bg-[#E1F5EE] text-[#085041] font-medium">Resuelto</span>;
    if (estado === "Pendiente") return <span className="text-xs px-2 py-0.5 rounded-full bg-[#FCEBEB] text-[#A32D2D] font-medium">Pendiente</span>;
    return null;
  };

  const guardarDescripcion = async () => {
    if (!descripcionEditada.trim()) return;
    const { error: err } = await supabase.from("Registros").update({ descripcion: descripcionEditada.trim() }).eq("id", r.id);
    if (err) { setError("No se pudo guardar. Inténtalo de nuevo."); return; }
    setError(null);
    setDescripcionActual(descripcionEditada.trim());
    setEditandoDescripcion(false);
    onActualizar?.();
  };

  const marcarResuelto = async () => {
    if (!resueltoPor) return;
    if (!accionPuntual && !fechaRevision) return;
    setGuardando(true);
    const { error: err } = await supabase.from("Registros").update({
      estado: "Resuelto",
      fecha_arreglo: new Date().toISOString().split("T")[0],
      fecha_revision: accionPuntual ? null : fechaRevision,
      accion_puntual: accionPuntual,
      resuelto_por: resueltoPor,
    }).eq("id", r.id);
    if (err) {
      setError("No se pudo guardar. Inténtalo de nuevo.");
      setGuardando(false);
      return;
    }
    setError(null);
    onActualizar?.();
    onVolver();
    setGuardando(false);
  };

  const marcarPendiente = async () => {
    const { error: err } = await supabase.from("Registros").update({ estado: "Pendiente", fecha_arreglo: null, resuelto_por: null }).eq("id", r.id);
    if (err) { setError("No se pudo guardar. Inténtalo de nuevo."); return; }
    setError(null);
    onActualizar?.();
    onVolver();
  };

  const reprogramar = async () => {
    if (!nuevaFecha) return;
    const { error: err } = await supabase.from("Registros").update({ fecha_revision: nuevaFecha }).eq("id", r.id);
    if (err) { setError("No se pudo guardar. Inténtalo de nuevo."); return; }
    setError(null);
    onActualizar?.();
    onVolver();
  };

  const volverAtras = () => {
    if (resolviendoRapido) { setResolviendoRapido(false); setFechaRevision(""); setResueltoPor(""); setAccionPuntual(false); }
    else if (reprogramando) { setReprogramando(false); setNuevaFecha(""); }
    else { onVolver(); }
  };

  const refPadreParaHijo = r.ref_padre || r.id;

  return (
    <>
      {fotoAmpliada && (
        <div onClick={() => setFotoAmpliada(null)} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-pointer">
          <img src={fotoAmpliada} alt="Foto ampliada" className="max-w-full max-h-full rounded-2xl object-contain" />
          <button className="absolute top-4 right-4 text-white text-2xl">✕</button>
        </div>
      )}

      <div className="p-4 md:p-6 max-w-lg">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-center gap-3">
            <button onClick={volverAtras} className="text-gray-400 text-lg hover:text-gray-600">←</button>
            <div className="flex-1">
              <h1 className="text-base font-semibold text-gray-900">Detalle registro</h1>
              <p className="text-xs text-gray-400">#{r.id.slice(0,8).toUpperCase()}{r.ref_padre ? ` · cadena #${r.ref_padre.slice(0,8).toUpperCase()}` : ""}</p>
            </div>
            {badgeEstado(r.estado)}
          </div>

          <div className="px-5 py-5 space-y-4">
            {error && (
              <div className="bg-[#FCEBEB] border border-[#F09595] text-[#A32D2D] text-xs rounded-xl px-4 py-2">{error}</div>
            )}

            <div className="bg-[#FDF0ED] rounded-2xl p-4 space-y-2">
              {[
                ["Creado por", r.persona],
                ["Resuelto por", r.resuelto_por],
                ["Comunidad", r.comunidad],
                ["Espacio", r.espacio],
                ["Categoría", r.categoria],
                ["Subcategoría", r.subcategoria],
                ["Tipo", r.tipo === "mantenimiento" ? "🔧 Mantenimiento" : "🪑 Permanente"],
                ["Fecha creación", r.fecha_creacion ? new Date(r.fecha_creacion).toLocaleString("es-ES", { timeZone: "Europe/Madrid", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"],
                ["Fecha arreglo", r.fecha_arreglo ? new Date(r.fecha_arreglo).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) : "—"],
                ["Próx. revisión", r.accion_puntual ? "⚡ Acción puntual" : r.fecha_revision ? new Date(r.fecha_revision).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) : "—"],
              ].filter(([, val]) => val && val !== "—").map(([lbl, val]) => (
                <div key={lbl} className="flex justify-between text-sm border-b border-[#F5C4BB] pb-2 last:border-0 last:pb-0">
                  <span className="text-[#E8614A]">{lbl}</span>
                  <span className="text-[#C44A35] font-medium text-right">{val}</span>
                </div>
              ))}
            </div>

            {(descripcionActual || editandoDescripcion) && (
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">📝 Descripción</p>
                  {!editandoDescripcion && (
                    <button onClick={() => { setDescripcionEditada(descripcionActual); setEditandoDescripcion(true); }} className="text-xs text-[#E8614A] hover:underline">✎ Editar</button>
                  )}
                </div>
                {editandoDescripcion ? (
                  <div className="space-y-2">
                    <textarea value={descripcionEditada} onChange={(e) => setDescripcionEditada(e.target.value)} rows={3} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 resize-none focus:outline-none focus:border-[#E8614A]" />
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setEditandoDescripcion(false)} className="py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs">Cancelar</button>
                      <button onClick={guardarDescripcion} disabled={!descripcionEditada.trim()} className="py-2 bg-[#E8614A] text-white rounded-lg text-xs font-semibold disabled:opacity-40">Guardar</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700">{descripcionActual}</p>
                )}
              </div>
            )}

            {fotosArreglo.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">📸 Fotos del arreglo</p>
                <div className="grid grid-cols-3 gap-2">
                  {fotosArreglo.map((url, i) => (
                    <div key={i} onClick={() => setFotoAmpliada(url)} className="aspect-square rounded-xl overflow-hidden cursor-pointer border border-gray-100 hover:border-[#E8614A] transition-all">
                      <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {r.foto_url && (
              <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                <div>
                  {r.gasto ? (
                    <>
                      <p className="text-xs text-gray-400">Gasto registrado</p>
                      <p className="text-base font-semibold text-gray-900">{r.gasto} €</p>
                    </>
                  ) : (
                    <p className="text-xs text-gray-400">Factura adjunta</p>
                  )}
                </div>
                {esImagen(r.foto_url) ? (
                  <div onClick={() => setFotoAmpliada(r.foto_url)} className="w-14 h-14 rounded-xl overflow-hidden cursor-pointer border border-gray-200 hover:border-[#E8614A] transition-all">
                    <img src={r.foto_url} alt="Factura" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <a href={r.foto_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 bg-[#E1F5EE] border border-[#5DCAA5] rounded-xl px-3 py-2 text-xs text-[#085041]">
                    🧾 Ver factura
                  </a>
                )}
              </div>
            )}

            {r.comentario && (
              <div className="bg-[#FDF0ED] border border-[#F5C4BB] rounded-2xl p-4">
                <p className="text-xs font-semibold text-[#E8614A] uppercase tracking-widest mb-2">💬 Comentario para el siguiente</p>
                <p className="text-sm text-[#C44A35]">{r.comentario}</p>
              </div>
            )}

            {/* Acciones */}
            {cargandoHijo ? null : tieneHijo ? (
              <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs text-gray-400 text-center">
                Ya existe un registro posterior en esta cadena
              </div>
            ) : esResuelto ? (
              <button onClick={marcarPendiente} className="w-full py-3 bg-gray-50 border border-gray-200 text-gray-500 rounded-xl text-xs hover:bg-gray-100 transition-all">
                ↩ Marcar como pendiente
              </button>
            ) : resolviendoRapido ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Marcar como resuelto</p>

                {/* Quién lo resolvió */}
                <div>
                  <p className="text-xs text-gray-400 mb-2">¿Quién lo resolvió? <span className="text-[#E8614A]">*</span></p>
                  <div className="space-y-1">
                    {miembros.map((m) => (
                      <button key={m.id} onClick={() => setResueltoPor(m.nombre)} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all text-left ${resueltoPor === m.nombre ? "bg-[#FDF0ED] border-[#E8614A]" : "bg-gray-50 border-gray-200"}`}>
                        <div className="w-7 h-7 rounded-full bg-[#FDF0ED] flex items-center justify-center text-xs font-medium text-[#E8614A]">{m.nombre.slice(0,2).toUpperCase()}</div>
                        <p className="text-sm font-medium text-gray-800">{m.nombre}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Próxima revisión + acción puntual */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-400">
                      Próxima revisión {!accionPuntual && <span className="text-[#E8614A]">*</span>}
                    </p>
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
                      value={fechaRevision}
                      onChange={(e) => setFechaRevision(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E8614A]"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => { setResolviendoRapido(false); setFechaRevision(""); setResueltoPor(""); setAccionPuntual(false); }} className="py-3 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl text-sm">Cancelar</button>
                  <button
                    onClick={marcarResuelto}
                    disabled={!resueltoPor || (!accionPuntual && !fechaRevision) || guardando}
                    className="py-3 bg-[#E8614A] text-white rounded-xl text-sm font-semibold disabled:opacity-40 transition-all"
                  >
                    {guardando ? "Guardando..." : "✓ Confirmar"}
                  </button>
                </div>
              </div>
            ) : reprogramando ? (
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 block">Nueva fecha de revisión</label>
                <input type="date" value={nuevaFecha} onChange={(e) => setNuevaFecha(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E8614A]" />
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => { setReprogramando(false); setNuevaFecha(""); }} className="py-3 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl text-sm">Cancelar</button>
                  <button onClick={reprogramar} disabled={!nuevaFecha} className="py-3 bg-[#E8614A] text-white rounded-xl text-sm font-semibold disabled:opacity-40">Confirmar</button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <button onClick={() => {
                  const params = new URLSearchParams({
                    miembro: r.persona || "",
                    comunidad: r.comunidad || "",
                    espacio: r.espacio || "",
                    resuelve: r.id,
                    ref_padre: refPadreParaHijo,
                  });
                  window.location.href = `/mantenimiento?${params.toString()}`;
                }} className="w-full py-3 bg-[#E8614A] text-white rounded-xl text-sm font-semibold hover:bg-[#C44A35] transition-all">
                  🔧 Crear nuevo registro de revisión
                </button>
                <button onClick={() => setReprogramando(true)} className="w-full py-3 bg-[#FAEEDA] border border-[#EF9F27] text-[#854F0B] rounded-xl text-sm font-semibold">📅 Reprogramar revisión</button>
                <button onClick={() => setResolviendoRapido(true)} className="w-full py-3 bg-[#E1F5EE] border border-[#1D9E75] text-[#085041] rounded-xl text-sm font-medium hover:bg-[#D0F0E4] transition-all">✓ Marcar como resuelto</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
