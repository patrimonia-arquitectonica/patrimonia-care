"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AppLayout from "@/components/AppLayout";

export default function Dashboard() {
  const router = useRouter();
  const [alertas, setAlertas] = useState<any[]>([]);
  const [registros, setRegistros] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [semanaOffset, setSemanaOffset] = useState(0);

  useEffect(() => {
    const cargar = async () => {
      const [{ data: a }, { data: r }] = await Promise.all([
        supabase.from("alertas").select("*").eq("resuelta", false).order("fecha_alerta", { ascending: true }),
        supabase.from("Registros").select("*").order("fecha_revision", { ascending: true }).limit(5),
      ]);
      if (a) setAlertas(a);
      if (r) setRegistros(r);
      setCargando(false);
    };
    cargar();
  }, []);

  const hoy = new Date();
  const inicioSemana = new Date(hoy);
  inicioSemana.setDate(hoy.getDate() - hoy.getDay() + 1 + semanaOffset * 7);

  const diasSemana = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(inicioSemana);
    d.setDate(inicioSemana.getDate() + i);
    return d;
  });

  const alertasPorDia = (dia: Date) => {
    const diaStr = dia.toISOString().split("T")[0];
    return alertas.filter((a) => a.fecha_alerta === diaStr);
  };

  const registrosPorDia = (dia: Date) => {
    const diaStr = dia.toISOString().split("T")[0];
    return registros.filter((r) => r.fecha_revision === diaStr);
  };

  const esHoy = (dia: Date) => dia.toDateString() === hoy.toDateString();
  const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  const badgeUrgencia = (urgencia: string | null) => {
    if (urgencia === "Alta") return <span className="text-xs px-2 py-0.5 rounded-full bg-[#FCEBEB] text-[#A32D2D] font-medium">Alta</span>;
    if (urgencia === "Media") return <span className="text-xs px-2 py-0.5 rounded-full bg-[#FAEEDA] text-[#854F0B] font-medium">Media</span>;
    if (urgencia === "Leve") return <span className="text-xs px-2 py-0.5 rounded-full bg-[#EAF3DE] text-[#3B6D11] font-medium">Leve</span>;
    return null;
  };

  const mesAnio = inicioSemana.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  const alertasHoy = alertasPorDia(hoy);
  const totalPendientes = alertas.length;

  if (cargando) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 text-sm">Cargando...</p>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {hoy.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
            </h1>
            <p className="text-sm text-gray-400">{totalPendientes} alertas pendientes</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => router.push("/alerta")} className="px-4 py-2 bg-[#FAEEDA] border border-[#EF9F27] text-[#854F0B] rounded-xl text-sm font-semibold">
              🔔 Crear alerta
            </button>
            <button onClick={() => router.push("/")} className="px-4 py-2 bg-[#534AB7] text-white rounded-xl text-sm font-semibold">
              + Crear registro
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Alertas hoy", value: alertasHoy.length, color: alertasHoy.length > 0 ? "text-[#A32D2D]" : "text-gray-900", bg: alertasHoy.length > 0 ? "border-[#F09595]" : "" },
            { label: "Pendientes total", value: totalPendientes, color: "text-gray-900", bg: "" },
            { label: "Registros cargados", value: registros.length, color: "text-gray-900", bg: "" },
            { label: "Alta urgencia", value: alertas.filter(a => a.urgencia === "Alta").length, color: "text-[#A32D2D]", bg: "" },
          ].map((s) => (
            <div key={s.label} className={`bg-white rounded-2xl border border-gray-100 p-4 ${s.bg}`}>
              <p className="text-xs text-gray-400 mb-1">{s.label}</p>
              <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Semana</h2>
              <p className="text-xs text-gray-400 capitalize">{mesAnio}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSemanaOffset(semanaOffset - 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm">‹</button>
              <button onClick={() => setSemanaOffset(0)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 text-xs">Hoy</button>
              <button onClick={() => setSemanaOffset(semanaOffset + 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm">›</button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {diasSemana.map((dia, i) => {
              const alertasDia = alertasPorDia(dia);
              const registrosDia = registrosPorDia(dia);
              const esEsteHoy = esHoy(dia);
              const tieneAlta = alertasDia.some(a => a.urgencia === "Alta");
              const tieneAlertas = alertasDia.length > 0;
              const tieneRegistros = registrosDia.length > 0;
              const tieneAlgo = tieneAlertas || tieneRegistros;

              return (
                <div key={i}
                  className={`rounded-xl p-3 border transition-all cursor-pointer ${
                    esEsteHoy ? "bg-[#534AB7] border-[#534AB7]" :
                    tieneAlta ? "bg-[#FCEBEB] border-[#F09595]" :
                    tieneAlertas ? "bg-[#EEEDFE] border-[#AFA9EC]" :
                    tieneRegistros ? "bg-[#E1F5EE] border-[#5DCAA5]" :
                    "bg-gray-50 border-gray-100 hover:bg-gray-100"
                  }`}
                  onClick={() => router.push(`/calendario?dia=${dia.getDate()}&mes=${dia.getMonth() + 1}&anio=${dia.getFullYear()}`)}>
                  <p className={`text-xs font-medium mb-1 ${esEsteHoy ? "text-[#EEEDFE]" : "text-gray-400"}`}>{DIAS[i]}</p>
                  <p className={`text-xl font-semibold ${
                    esEsteHoy ? "text-white" :
                    tieneAlta ? "text-[#A32D2D]" :
                    tieneAlertas ? "text-[#534AB7]" :
                    tieneRegistros ? "text-[#085041]" :
                    "text-gray-700"
                  }`}>{dia.getDate()}</p>
                  {tieneAlgo && (
                    <div className="mt-2 space-y-1">
                      {[...alertasDia, ...registrosDia].slice(0, 2).map((item, j) => (
                        <div key={j} className={`text-xs truncate rounded px-1 py-0.5 ${
                          esEsteHoy ? "bg-white/20 text-white" :
                          tieneAlta ? "bg-[#F7C1C1] text-[#A32D2D]" :
                          tieneAlertas ? "bg-[#CECBF6] text-[#3C3489]" :
                          "bg-[#9FE1CB] text-[#085041]"
                        }`}>
                          {item.descripcion || "Tarea"}
                        </div>
                      ))}
                      {(alertasDia.length + registrosDia.length) > 2 && (
                        <p className={`text-xs ${esEsteHoy ? "text-white/70" : "text-gray-400"}`}>
                          +{alertasDia.length + registrosDia.length - 2} más
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-900">Alertas pendientes</p>
              <button onClick={() => router.push("/calendario")} className="text-xs text-[#534AB7]">Ver todas →</button>
            </div>
            {alertas.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-6">¡Todo al día! 🎉</p>
            ) : (
              <div className="space-y-2">
                {alertas.slice(0, 4).map((a) => (
                  <div key={a.id} onClick={() => router.push(`/calendario?dia=${a.fecha_alerta ? new Date(a.fecha_alerta).getUTCDate() : ""}&mes=${a.fecha_alerta ? new Date(a.fecha_alerta).getUTCMonth() + 1 : ""}&anio=${a.fecha_alerta ? new Date(a.fecha_alerta).getUTCFullYear() : ""}`)} className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-all">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.urgencia === "Alta" ? "bg-[#E24B4A]" : a.urgencia === "Media" ? "bg-[#EF9F27]" : "bg-[#639922]"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{a.descripcion || "Sin descripción"}</p>
                      <p className="text-xs text-gray-400">{a.comunidad} · {a.fecha_alerta ? new Date(a.fecha_alerta).toLocaleDateString("es-ES") : "Sin fecha"}</p>
                    </div>
                    {badgeUrgencia(a.urgencia)}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-900">Próximas revisiones</p>
              <button onClick={() => router.push("/historial")} className="text-xs text-[#534AB7]">Ver historial →</button>
            </div>
            {registros.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-6">No hay revisiones programadas</p>
            ) : (
              <div className="space-y-2">
                {registros.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-all">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${r.tipo === "mantenimiento" ? "bg-[#EEEDFE]" : "bg-[#E1F5EE]"}`}>
                      {r.tipo === "mantenimiento" ? "🔧" : "🪑"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{r.descripcion || "Sin descripción"}</p>
                      <p className="text-xs text-gray-400">
                        {r.comunidad}{r.persona ? ` · ${r.persona}` : ""}
                        {r.fecha_revision ? ` · ${new Date(r.fecha_revision).toLocaleDateString("es-ES")}` : ""}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${r.estado === "Hecho" || r.estado === "Resuelto" ? "bg-[#E1F5EE] text-[#085041]" : "bg-[#FCEBEB] text-[#A32D2D]"}`}>
                      {r.estado}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}