"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Props {
  alerta: any;
  miembros: any[];
  onVolver: () => void;
  onActualizar: () => void;
}

export default function AlertaDetalle({ alerta: a, miembros, onVolver, onActualizar }: Props) {
  const router = useRouter();
  const [reprogramando, setReprogramando] = useState(false);
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [seleccionandoMiembro, setSeleccionandoMiembro] = useState(false);
  const [miembroSeleccionado, setMiembroSeleccionado] = useState("");
  const [resolviendoRapido, setResolviendoRapido] = useState(false);
  const [miembroRapido, setMiembroRapido] = useState("");
  const [fechaRevisionRapida, setFechaRevisionRapida] = useState("");
  const [guardando, setGuardando] = useState(false);

  const tieneRegistro = a.tiene_registro === true;

  const badgeUrgencia = (urgencia: string | null) => {
    if (!urgencia) return <span className="text-xs px-2 py-0.5 rounded-full bg-[#E1F5EE] text-[#085041] font-medium">Permanente</span>;
    if (urgencia === "Alta") return <span className="text-xs px-2 py-0.5 rounded-full bg-[#FCEBEB] text-[#A32D2D] font-medium">Alta</span>;
    if (urgencia === "Media") return <span className="text-xs px-2 py-0.5 rounded-full bg-[#FAEEDA] text-[#854F0B] font-medium">Media</span>;
    return <span className="text-xs px-2 py-0.5 rounded-full bg-[#EAF3DE] text-[#3B6D11] font-medium">Leve</span>;
  };

  const marcarResueltaRapido = async () => {
    if (!miembroRapido || !fechaRevisionRapida) return;
    setGuardando(true);
    await supabase.from("alertas").update({
      resuelta: true,
      resuelto_por: miembroRapido,
      fecha_revision: fechaRevisionRapida,
    }).eq("id", a.id);
    onActualizar();
    onVolver();
    setGuardando(false);
  };

  const reprogramar = async () => {
    if (!nuevaFecha) return;
    await supabase.from("alertas").update({ fecha_alerta: nuevaFecha }).eq("id", a.id);
    onActualizar();
    onVolver();
  };

  const volverAtras = () => {
    if (resolviendoRapido) { setResolviendoRapido(false); setMiembroRapido(""); setFechaRevisionRapida(""); }
    else if (seleccionandoMiembro) { setSeleccionandoMiembro(false); setMiembroSeleccionado(""); }
    else if (reprogramando) { setReprogramando(false); }
    else { onVolver(); }
  };

  return (
    <div className="p-6 max-w-lg">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-center gap-3">
          <button onClick={volverAtras} className="text-gray-400 text-lg hover:text-gray-600">←</button>
          <div className="flex-1">
            <h1 className="text-base font-semibold text-gray-900">Detalle alerta</h1>
            <p className="text-xs text-gray-400">#{a.id.slice(0,8).toUpperCase()}</p>
          </div>
          {badgeUrgencia(a.urgencia)}
        </div>

        <div className="px-5 py-5 space-y-4">
          {a.resuelta && (
            <div className="space-y-2">
              <div className="bg-[#E1F5EE] border border-[#5DCAA5] rounded-xl px-4 py-2 text-xs text-[#085041] font-medium">✓ Esta alerta fue resuelta</div>
              {!tieneRegistro && (
                <button onClick={async () => {
                  await supabase.from("alertas").update({ resuelta: false }).eq("id", a.id);
                  onActualizar();
                  onVolver();
                }} className="w-full py-2 bg-gray-50 border border-gray-200 text-gray-500 rounded-xl text-xs hover:bg-gray-100 transition-all">
                  ↩ Marcar como pendiente
                </button>
              )}
            </div>
          )}

          {tieneRegistro && (
            <div className="bg-[#FDF0ED] border border-[#F5C4BB] rounded-xl px-4 py-2 text-xs text-[#C44A35]">
              🔗 Ya tiene un registro asociado
            </div>
          )}

          <div className="bg-[#FDF0ED] rounded-2xl p-4 space-y-2">
            {[
              ["Creada por", a.persona],
              ["Resuelta por", a.resuelto_por],
              ["Comunidad", a.comunidad],
              ["Espacio", a.espacio],
              ["Categoría", a.categoria],
              ["Urgencia", a.urgencia || "—"],
              ["Fecha", a.fecha_alerta ? new Date(a.fecha_alerta).toLocaleDateString("es-ES") : "—"],
              ["Próx. revisión", a.fecha_revision ? new Date(a.fecha_revision).toLocaleDateString("es-ES") : "—"],
            ].filter(([, val]) => val && val !== "—").map(([lbl, val]) => (
              <div key={lbl} className="flex justify-between text-sm border-b border-[#F5C4BB] pb-2 last:border-0 last:pb-0">
                <span className="text-[#E8614A]">{lbl}</span>
                <span className="text-[#C44A35] font-medium">{val}</span>
              </div>
            ))}
          </div>

          {a.descripcion && (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">📋 Descripción</p>
              <p className="text-sm text-gray-700">{a.descripcion}</p>
            </div>
          )}

          {a.comentario && (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">💬 Comentario</p>
              <p className="text-sm text-gray-700">{a.comentario}</p>
            </div>
          )}

          {!a.resuelta && !tieneRegistro && (
            resolviendoRapido ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Resolución rápida</p>
                <div>
                  <p className="text-xs text-gray-400 mb-2">¿Quién lo resolvió?</p>
                  <div className="space-y-1">
                    {miembros.map((m) => (
                      <button key={m.id} onClick={() => setMiembroRapido(m.nombre)} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all text-left ${miembroRapido === m.nombre ? "bg-[#FDF0ED] border-[#E8614A]" : "bg-gray-50 border-gray-200"}`}>
                        <div className="w-7 h-7 rounded-full bg-[#FDF0ED] flex items-center justify-center text-xs font-medium text-[#E8614A]">{m.nombre.slice(0,2).toUpperCase()}</div>
                        <p className="text-sm font-medium text-gray-800">{m.nombre}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Próxima revisión <span className="text-[#E8614A]">*</span></p>
                  <input type="date" value={fechaRevisionRapida} onChange={(e) => setFechaRevisionRapida(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E8614A]" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => { setResolviendoRapido(false); setMiembroRapido(""); setFechaRevisionRapida(""); }} className="py-3 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl text-sm">Cancelar</button>
                  <button onClick={marcarResueltaRapido} disabled={!miembroRapido || !fechaRevisionRapida || guardando} className="py-3 bg-[#E8614A] text-white rounded-xl text-sm font-semibold disabled:opacity-40 transition-all">
                    {guardando ? "Guardando..." : "✓ Confirmar"}
                  </button>
                </div>
              </div>
            ) : reprogramando ? (
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 block">Nueva fecha</label>
                <input type="date" value={nuevaFecha} onChange={(e) => setNuevaFecha(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E8614A]" />
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setReprogramando(false)} className="py-3 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl text-sm">Cancelar</button>
                  <button onClick={reprogramar} disabled={!nuevaFecha} className="py-3 bg-[#E8614A] text-white rounded-xl text-sm font-semibold disabled:opacity-40">Confirmar</button>
                </div>
              </div>
            ) : seleccionandoMiembro ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">¿Quién resuelve esta alerta?</p>
                <div className="space-y-2">
                  {miembros.map((m) => (
                    <button key={m.id} onClick={() => setMiembroSeleccionado(m.nombre)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${miembroSeleccionado === m.nombre ? "bg-[#FDF0ED] border-[#E8614A]" : "bg-gray-50 border-gray-200"}`}>
                      <div className="w-7 h-7 rounded-full bg-[#FDF0ED] flex items-center justify-center text-xs font-medium text-[#E8614A]">{m.nombre.slice(0,2).toUpperCase()}</div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{m.nombre}</p>
                        <p className="text-xs text-gray-400">{m.rol}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => { setSeleccionandoMiembro(false); setMiembroSeleccionado(""); }} className="py-3 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl text-sm">Cancelar</button>
                  <button onClick={() => {
                    if (!miembroSeleccionado) return;
                    const params = new URLSearchParams({
                      miembro: miembroSeleccionado,
                      comunidad: a.comunidad || "",
                      area: a.area || "",
                      espacio: a.espacio || "",
                      ref_alerta: a.id,
                    });
                    router.push(`${a.tipo === "permanente" ? "/permanente" : "/mantenimiento"}?${params.toString()}`);
                  }} disabled={!miembroSeleccionado} className="py-3 bg-[#E8614A] text-white rounded-xl text-sm font-semibold disabled:opacity-40">
                    Ir al formulario →
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <button onClick={() => setSeleccionandoMiembro(true)} className="w-full py-3 bg-[#E8614A] text-white rounded-xl text-sm font-semibold hover:bg-[#C44A35] transition-all">✅ Crear registro — resolver ahora</button>
                <button onClick={() => setReprogramando(true)} className="w-full py-3 bg-[#FAEEDA] border border-[#EF9F27] text-[#854F0B] rounded-xl text-sm font-semibold">📅 Reprogramar</button>
                <button onClick={() => setResolviendoRapido(true)} className="w-full py-3 bg-[#E1F5EE] border border-[#1D9E75] text-[#085041] rounded-xl text-sm font-medium">✓ Marcar como resuelta</button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
