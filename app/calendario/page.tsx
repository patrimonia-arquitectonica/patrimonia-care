"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Calendario() {
  const router = useRouter();
  const [alertas, setAlertas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [diaSeleccionado, setDiaSeleccionado] = useState<number | null>(null);
  const [alertaSeleccionada, setAlertaSeleccionada] = useState<any | null>(null);

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase
        .from("alertas")
        .select("*")
        .order("fecha_alerta", { ascending: true });
      if (data) setAlertas(data);
      setCargando(false);
    };
    cargar();
  }, []);

  const alertasDelDia = diaSeleccionado
    ? alertas.filter((a) => {
        if (!a.fecha_alerta) return false;
        const dia = new Date(a.fecha_alerta).getUTCDate();
        return dia === diaSeleccionado;
      })
    : [];

  const diasConAlerta = alertas.reduce((acc, a) => {
    if (!a.fecha_alerta) return acc;
    const dia = new Date(a.fecha_alerta).getUTCDate();
    if (!acc[dia]) acc[dia] = { mant: false, perm: false };
    if (a.tipo === "permanente") acc[dia].perm = true;
    else acc[dia].mant = true;
    return acc;
  }, {} as Record<number, { mant: boolean; perm: boolean }>);

  const badgeUrgencia = (urgencia: string | null) => {
    if (!urgencia) return <span className="text-xs px-2 py-0.5 rounded-full bg-[#E1F5EE] text-[#085041] font-medium">Permanente</span>;
    if (urgencia === "Alta") return <span className="text-xs px-2 py-0.5 rounded-full bg-[#FCEBEB] text-[#A32D2D] font-medium">Alta</span>;
    if (urgencia === "Media") return <span className="text-xs px-2 py-0.5 rounded-full bg-[#FAEEDA] text-[#854F0B] font-medium">Media</span>;
    return <span className="text-xs px-2 py-0.5 rounded-full bg-[#EAF3DE] text-[#3B6D11] font-medium">Leve</span>;
  };

  if (cargando) return (
    <div className="min-h-screen bg-[#F5F4F0] flex items-center justify-center">
      <p className="text-gray-400 text-sm">Cargando calendario...</p>
    </div>
  );

  // Vista detalle alerta
  if (alertaSeleccionada) {
    const a = alertaSeleccionada;
    return (
      <div className="min-h-screen bg-[#F5F4F0] flex flex-col items-center justify-start p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-center gap-3">
            <button onClick={() => setAlertaSeleccionada(null)} className="text-gray-400 text-lg">←</button>
            <div className="flex-1">
              <h1 className="text-base font-semibold text-gray-900">Detalle alerta</h1>
              <p className="text-xs text-gray-400">#{a.id.slice(0,8).toUpperCase()}</p>
            </div>
            {badgeUrgencia(a.urgencia)}
          </div>
          <div className="px-5 py-5 space-y-4">
            <div className="bg-gray-50 rounded-2xl p-4 space-y-2 border border-gray-100">
              {[
                ["Creada por", a.persona],
                ["Comunidad", a.comunidad],
                ["Espacio", a.espacio],
                ["Categoría", a.categoria],
                ["Urgencia", a.urgencia || "—"],
                ["Fecha", a.fecha_alerta ? new Date(a.fecha_alerta).toLocaleDateString("es-ES") : "—"],
              ].map(([lbl, val]) => (
                <div key={lbl} className="flex justify-between text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                  <span className="text-gray-400">{lbl}</span>
                  <span className="text-gray-800 font-medium">{val}</span>
                </div>
              ))}
            </div>

            {a.descripcion && (
              <div className="bg-[#EEEDFE] border border-[#AFA9EC] rounded-2xl p-4">
                <p className="text-xs font-semibold text-[#534AB7] uppercase tracking-widest mb-2">📋 Descripción</p>
                <p className="text-sm text-[#3C3489]">{a.descripcion}</p>
              </div>
            )}

            {a.comentario && (
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">💬 Comentario</p>
                <p className="text-sm text-gray-700">{a.comentario}</p>
              </div>
            )}

            <button onClick={() => router.push(a.tipo === "permanente" ? "/permanente" : "/mantenimiento")} className="w-full py-3 bg-[#534AB7] text-white rounded-xl text-sm font-semibold hover:bg-[#3C3489] transition-all">
              → Crear registro desde esta alerta
            </button>
            <button className="w-full py-3 bg-[#E1F5EE] border border-[#1D9E75] text-[#085041] rounded-xl text-sm font-medium">
              ✓ Marcar como resuelta
            </button>
          </div>
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

  // Vista alertas del día
  if (diaSeleccionado) {
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
          <div className="px-5 py-5 space-y-2">
            {alertasDelDia.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No hay alertas este día</p>
            ) : (
              alertasDelDia.map((a) => (
                <button key={a.id} onClick={() => setAlertaSeleccionada(a)} className="w-full text-left bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 hover:border-[#534AB7] transition-all">
                  <p className="text-xs text-[#534AB7] font-medium mb-1">#{a.id.slice(0,8).toUpperCase()}</p>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{a.descripcion || "Sin descripción"}</p>
                      <p className="text-xs text-gray-400">{a.comunidad} · {a.espacio}</p>
                    </div>
                    {badgeUrgencia(a.urgencia)}
                  </div>
                </button>
              ))
            )}
          </div>
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

  // Vista calendario principal
  const dias = Array.from({ length: 30 }, (_, i) => i + 1);
  const hoy = new Date().getDate();

  return (
    <div className="min-h-screen bg-[#F5F4F0] flex flex-col items-center justify-start p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Calendario</h1>
            <p className="text-sm text-gray-400">Junio 2026</p>
          </div>
          <div className="flex gap-3 text-gray-400 text-lg">
            <button>‹</button>
            <button>›</button>
          </div>
        </div>

        <div className="px-5 py-4">
          <div className="grid grid-cols-7 mb-2">
            {["L","M","X","J","V","S","D"].map((d) => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {Array.from({ length: 0 }).map((_, i) => <div key={`e-${i}`} />)}
            {dias.map((dia) => {
              const info = diasConAlerta[dia];
              const esHoy = dia === hoy;
              return (
                <button key={dia} onClick={() => info && setDiaSeleccionado(dia)} className={`flex flex-col items-center py-1 rounded-lg transition-all ${esHoy ? "bg-[#534AB7] text-white" : info ? "bg-[#EEEDFE] text-[#3C3489] hover:bg-[#DDD9FC]" : "text-gray-400"}`}>
                  <span className="text-xs font-medium">{dia}</span>
                  {info && !esHoy && (
                    <div className="flex gap-0.5 mt-0.5">
                      {info.mant && <div className="w-1 h-1 rounded-full bg-[#534AB7]" />}
                      {info.perm && <div className="w-1 h-1 rounded-full bg-[#1D9E75]" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex gap-4 text-xs text-gray-400 mb-4">
            <span><span className="inline-block w-2 h-2 rounded-full bg-[#534AB7] mr-1"></span>Mantenimiento</span>
            <span><span className="inline-block w-2 h-2 rounded-full bg-[#1D9E75] mr-1"></span>Permanente</span>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Próximas alertas</p>
            {alertas.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-4">No hay alertas todavía</p>
            ) : (
              <div className="space-y-2">
                {alertas.slice(0, 3).map((a) => (
                  <button key={a.id} onClick={() => setAlertaSeleccionada(a)} className="w-full text-left bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 hover:border-[#534AB7] transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-[#534AB7] font-medium mb-0.5">#{a.id.slice(0,8).toUpperCase()} · {a.fecha_alerta ? new Date(a.fecha_alerta).toLocaleDateString("es-ES") : "Sin fecha"}</p>
                        <p className="text-sm font-medium text-gray-800">{a.descripcion || "Sin descripción"}</p>
                        <p className="text-xs text-gray-400">{a.comunidad}</p>
                      </div>
                      {badgeUrgencia(a.urgencia)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

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