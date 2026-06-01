"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const ALERTAS = [
  { id: "MNT-0047", titulo: "Humedad en baño", comunidad: "Viñuelas L3", espacio: "Baño", urgencia: "Alta", tipo: "mantenimiento", dia: 1, comentario: "Revisar también la junta de la ducha", creado: "Sara García" },
  { id: "MNT-0051", titulo: "Revisar lavadora", comunidad: "Abrantes L1", espacio: "Cocina", urgencia: "Media", tipo: "mantenimiento", dia: 1, comentario: "", creado: "Luis Martín" },
  { id: "PRM-0019", titulo: "Cambio cortinas salón", comunidad: "Fuencarral 29C", espacio: "Salón", urgencia: null, tipo: "permanente", dia: 6, comentario: "Las actuales están desgastadas", creado: "Ana Molina" },
  { id: "MNT-0039", titulo: "Pintura salón", comunidad: "Olvido L2", espacio: "Salón", urgencia: "Leve", tipo: "mantenimiento", dia: 14, comentario: "", creado: "Pedro Ruiz" },
  { id: "PRM-0021", titulo: "Cambio sofá 3 plazas", comunidad: "Fuencarral 29C", espacio: "Salón", urgencia: null, tipo: "permanente", dia: 14, comentario: "", creado: "Sara García" },
  { id: "MNT-0052", titulo: "Revisar caldera", comunidad: "Viñuelas L5", espacio: "General", urgencia: "Alta", tipo: "mantenimiento", dia: 20, comentario: "Hace ruido al arrancar", creado: "Luis Martín" },
];

const DIAS_CON_ALERTA = [...new Set(ALERTAS.map((a) => a.dia))];

export default function Calendario() {
  const router = useRouter();
  const [diaSeleccionado, setDiaSeleccionado] = useState<number | null>(null);
  const [alertaSeleccionada, setAlertaSeleccionada] = useState<typeof ALERTAS[0] | null>(null);

  const alertasDelDia = diaSeleccionado ? ALERTAS.filter((a) => a.dia === diaSeleccionado) : [];

  const badgeUrgencia = (urgencia: string | null) => {
    if (!urgencia) return <span className="text-xs px-2 py-0.5 rounded-full bg-[#E1F5EE] text-[#085041] font-medium">Permanente</span>;
    if (urgencia === "Alta") return <span className="text-xs px-2 py-0.5 rounded-full bg-[#FCEBEB] text-[#A32D2D] font-medium">Alta</span>;
    if (urgencia === "Media") return <span className="text-xs px-2 py-0.5 rounded-full bg-[#FAEEDA] text-[#854F0B] font-medium">Media</span>;
    return <span className="text-xs px-2 py-0.5 rounded-full bg-[#EAF3DE] text-[#3B6D11] font-medium">Leve</span>;
  };

  // Vista detalle alerta
  if (alertaSeleccionada) {
    return (
      <div className="min-h-screen bg-[#F5F4F0] flex flex-col items-center justify-start p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-center gap-3">
            <button onClick={() => setAlertaSeleccionada(null)} className="text-gray-400 text-lg">←</button>
            <div className="flex-1">
              <h1 className="text-base font-semibold text-gray-900">Detalle alerta</h1>
              <p className="text-xs text-gray-400">#{alertaSeleccionada.id}</p>
            </div>
            {badgeUrgencia(alertaSeleccionada.urgencia)}
          </div>
          <div className="px-5 py-5 space-y-4">
            <div className="bg-gray-50 rounded-2xl p-4 space-y-2 border border-gray-100">
              {[
                ["Creada por", alertaSeleccionada.creado],
                ["Comunidad", alertaSeleccionada.comunidad],
                ["Espacio", alertaSeleccionada.espacio],
                ["Tipo", alertaSeleccionada.tipo === "mantenimiento" ? "🔧 Mantenimiento" : "🪑 Permanente"],
                ["Urgencia", alertaSeleccionada.urgencia || "—"],
              ].map(([lbl, val]) => (
                <div key={lbl} className="flex justify-between text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                  <span className="text-gray-400">{lbl}</span>
                  <span className="text-gray-800 font-medium">{val}</span>
                </div>
              ))}
            </div>

            {alertaSeleccionada.comentario && (
              <div className="bg-[#EEEDFE] border border-[#AFA9EC] rounded-2xl p-4">
                <p className="text-xs font-semibold text-[#534AB7] uppercase tracking-widest mb-2">💬 Comentario</p>
                <p className="text-sm text-[#3C3489]">{alertaSeleccionada.comentario}</p>
              </div>
            )}

            <button onClick={() => router.push(alertaSeleccionada.tipo === "permanente" ? "/permanente" : "/mantenimiento")} className="w-full py-3 bg-[#534AB7] text-white rounded-xl text-sm font-semibold hover:bg-[#3C3489] transition-all">
              → Crear registro desde esta alerta
            </button>
            <button className="w-full py-3 bg-[#E1F5EE] border border-[#1D9E75] text-[#085041] rounded-xl text-sm font-medium">
              ✓ Marcar como resuelta
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vista alertas del día
  if (diaSeleccionado) {
    const mant = alertasDelDia.filter((a) => a.tipo === "mantenimiento");
    const perm = alertasDelDia.filter((a) => a.tipo === "permanente");
    return (
      <div className="min-h-screen bg-[#F5F4F0] flex flex-col items-center justify-start p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-center gap-3">
            <button onClick={() => setDiaSeleccionado(null)} className="text-gray-400 text-lg">←</button>
            <div className="flex-1">
              <h1 className="text-base font-semibold text-gray-900">{diaSeleccionado} de junio</h1>
              <p className="text-xs text-gray-400">{alertasDelDia.length} alerta{alertasDelDia.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <div className="px-5 py-5 space-y-4">
            {mant.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Mantenimiento</p>
                <div className="space-y-2">
                  {mant.map((a) => (
                    <button key={a.id} onClick={() => setAlertaSeleccionada(a)} className="w-full text-left bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 hover:border-[#534AB7] transition-all">
                      <p className="text-xs text-[#534AB7] font-medium mb-1">#{a.id}</p>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{a.titulo}</p>
                          <p className="text-xs text-gray-400">{a.comunidad} · {a.espacio}</p>
                        </div>
                        {badgeUrgencia(a.urgencia)}
                      </div>
                      {a.comentario && <p className="text-xs text-gray-400 mt-2">💬 "{a.comentario}"</p>}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {perm.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Permanente</p>
                <div className="space-y-2">
                  {perm.map((a) => (
                    <button key={a.id} onClick={() => setAlertaSeleccionada(a)} className="w-full text-left bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 hover:border-[#1D9E75] transition-all">
                      <p className="text-xs text-[#0F6E56] font-medium mb-1">#{a.id}</p>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{a.titulo}</p>
                          <p className="text-xs text-gray-400">{a.comunidad} · {a.espacio}</p>
                        </div>
                        {badgeUrgencia(a.urgencia)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Vista calendario principal
  const dias = Array.from({ length: 30 }, (_, i) => i + 1);
  const primerDia = 1; // junio 2026 empieza en lunes

  return (
    <div className="min-h-screen bg-[#F5F4F0] flex flex-col items-center justify-start p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Calendario</h1>
            <p className="text-sm text-gray-400">Junio 2026</p>
          </div>
          <div className="flex gap-3 text-gray-400">
            <button>‹</button>
            <button>›</button>
          </div>
        </div>

        <div className="px-5 py-4">
          {/* Cabecera días */}
          <div className="grid grid-cols-7 mb-2">
            {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
            ))}
          </div>
          {/* Días */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {Array.from({ length: primerDia - 1 }).map((_, i) => <div key={`empty-${i}`} />)}
            {dias.map((dia) => {
              const alertas = ALERTAS.filter((a) => a.dia === dia);
              const tieneMant = alertas.some((a) => a.tipo === "mantenimiento");
              const tienePerm = alertas.some((a) => a.tipo === "permanente");
              const esHoy = dia === 1;
              return (
                <button key={dia} onClick={() => alertas.length > 0 && setDiaSeleccionado(dia)} className={`flex flex-col items-center py-1 rounded-lg transition-all ${esHoy ? "bg-[#534AB7] text-white" : alertas.length > 0 ? "bg-[#EEEDFE] text-[#3C3489] hover:bg-[#DDD9FC]" : "text-gray-400"}`}>
                  <span className="text-xs font-medium">{dia}</span>
                  {(tieneMant || tienePerm) && !esHoy && (
                    <div className="flex gap-0.5 mt-0.5">
                      {tieneMant && <div className="w-1 h-1 rounded-full bg-[#534AB7]" />}
                      {tienePerm && <div className="w-1 h-1 rounded-full bg-[#1D9E75]" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Leyenda */}
          <div className="flex gap-4 text-xs text-gray-400 mb-4">
            <span><span className="inline-block w-2 h-2 rounded-full bg-[#534AB7] mr-1"></span>Mantenimiento</span>
            <span><span className="inline-block w-2 h-2 rounded-full bg-[#1D9E75] mr-1"></span>Permanente</span>
          </div>

          {/* Alertas próximas */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Próximas alertas</p>
            <div className="space-y-2">
              {ALERTAS.slice(0, 3).map((a) => (
                <button key={a.id} onClick={() => { setDiaSeleccionado(a.dia); setAlertaSeleccionada(a); }} className="w-full text-left bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 hover:border-[#534AB7] transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-[#534AB7] font-medium mb-0.5">#{a.id} · día {a.dia}</p>
                      <p className="text-sm font-medium text-gray-800">{a.titulo}</p>
                      <p className="text-xs text-gray-400">{a.comunidad}</p>
                    </div>
                    {badgeUrgencia(a.urgencia)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="border-t border-gray-100 grid grid-cols-4">
          {[["🟡", "Crea", "/"], ["📅", "Calendario", "/calendario"], ["🕐", "Historial", "/historial"], ["⚙️", "Maestras", "/maestras"]].map(([icon, label, href]) => (
            <button key={label} onClick={() => router.push(href)} className={`flex flex-col items-center py-3 gap-1 text-xs ${label === "Calendario" ? "text-[#534AB7] font-medium" : "text-gray-400"}`}>
              <span className="text-lg">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}