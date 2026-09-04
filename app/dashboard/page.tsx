"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AppLayout from "@/components/AppLayout";
import RegistroDetalle from "@/components/RegistroDetalle";
import AlertaDetalle from "@/components/AlertaDetalle";

const getLunes = (fecha: Date) => {
  const d = new Date(fecha);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getDomingo = (fecha: Date) => {
  const lunes = getLunes(fecha);
  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);
  domingo.setHours(23, 59, 59, 999);
  return domingo;
};

export default function Dashboard() {
  const router = useRouter();
  const [alertas, setAlertas] = useState<any[]>([]);
  const [registros, setRegistros] = useState<any[]>([]);
  const [miembros, setMiembros] = useState<any[]>([]);
  const [campanas, setCampanas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [semanaOffset, setSemanaOffset] = useState(0);
  const [itemSeleccionado, setItemSeleccionado] = useState<any | null>(null);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<"registro" | "alerta" | null>(null);

  const cargar = async () => {
    const [{ data: a }, { data: r }, { data: m }, { data: c }] = await Promise.all([
      supabase.from("alertas").select("*").eq("resuelta", false).order("fecha_alerta", { ascending: true }),
      supabase.from("Registros").select("*").is("campana_id", null).order("fecha_revision", { ascending: true }).limit(10),
      supabase.from("miembros").select("*").order("nombre"),
      supabase.from("campanas").select("*").eq("activa", true),
    ]);
    if (a) setAlertas(a);
    if (r) setRegistros(r);
    if (m) setMiembros(m);
    if (c) setCampanas(c);
    setCargando(false);
  };

  useEffect(() => { cargar(); }, []);

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

  // Campañas activas esta semana
  const campanasActivasSemana = campanas.filter(c => {
    const lunes = getLunes(new Date(c.fecha_instancia));
    const domingo = getDomingo(new Date(c.fecha_instancia));
    return hoy >= lunes && hoy <= domingo;
  });

  // Hay campaña en un día concreto (cualquier día de la semana de la campaña)
  const campanasEnDia = (dia: Date) => {
    return campanas.filter(c => {
      const lunes = getLunes(new Date(c.fecha_instancia));
      const domingo = getDomingo(new Date(c.fecha_instancia));
      return dia >= lunes && dia <= domingo;
    });
  };

  const esHoy = (dia: Date) => dia.toDateString() === hoy.toDateString();
  const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const mesAnio = inicioSemana.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  const alertasHoy = alertasPorDia(hoy);
  const totalPendientes = alertas.length;
  const altaUrgencia = alertas.filter(a => a.urgencia === "Alta").length;
  const hoyStr = hoy.toISOString().split("T")[0];
  const alertasVencidas = alertas.filter(a => a.fecha_alerta && a.fecha_alerta < hoyStr);

  const badgeUrgencia = (urgencia: string | null) => {
    if (urgencia === "Alta") return <span className="text-xs px-2 py-0.5 rounded-full bg-[#FCEBEB] text-[#A32D2D] font-medium">Alta</span>;
    if (urgencia === "Media") return <span className="text-xs px-2 py-0.5 rounded-full bg-[#FAEEDA] text-[#854F0B] font-medium">Media</span>;
    if (urgencia === "Leve") return <span className="text-xs px-2 py-0.5 rounded-full bg-[#EAF3DE] text-[#3B6D11] font-medium">Leve</span>;
    return null;
  };

  if (cargando) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 text-sm">Cargando...</p>
      </div>
    </AppLayout>
  );

  if (itemSeleccionado && tipoSeleccionado === "registro") {
    return (
      <AppLayout>
        <RegistroDetalle
          registro={itemSeleccionado}
          miembros={miembros}
          onVolver={() => { setItemSeleccionado(null); setTipoSeleccionado(null); }}
          onActualizar={cargar}
        />
      </AppLayout>
    );
  }

  if (itemSeleccionado && tipoSeleccionado === "alerta") {
    return (
      <AppLayout>
        <AlertaDetalle
          alerta={itemSeleccionado}
          miembros={miembros}
          onVolver={() => { setItemSeleccionado(null); setTipoSeleccionado(null); }}
          onActualizar={cargar}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {hoy.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
            </h1>
            <p className="text-sm text-gray-400">
              {alertasHoy.length} alertas hoy · {registros.filter(r => r.fecha_revision === hoy.toISOString().split("T")[0]).length} revisiones hoy
              {alertasVencidas.length > 0 && <span className="text-[#A32D2D] font-medium"> · {alertasVencidas.length} vencida{alertasVencidas.length !== 1 ? "s" : ""} ⚠️</span>}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => router.push("/inicio")} className="px-4 py-2 bg-[#FAEEDA] border border-[#EF9F27] text-[#854F0B] rounded-xl text-sm font-semibold">
              🔔 Crear alerta
            </button>
            <button onClick={() => router.push("/inicio")} className="px-4 py-2 bg-[#E8614A] text-white rounded-xl text-sm font-semibold hover:bg-[#C44A35] transition-all">
              + Crear registro
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Alertas hoy", value: alertasHoy.length, color: alertasHoy.length > 0 ? "text-[#A32D2D]" : "text-gray-900", border: alertasHoy.length > 0 ? "border-[#F09595]" : "border-gray-100" },
            { label: "Pendientes total", value: totalPendientes, color: "text-gray-900", border: "border-gray-100" },
            { label: "Alta urgencia", value: altaUrgencia, color: altaUrgencia > 0 ? "text-[#A32D2D]" : "text-gray-900", border: "border-gray-100" },
            { label: "Campañas activas", value: campanasActivasSemana.length, color: campanasActivasSemana.length > 0 ? "text-[#3B6D11]" : "text-gray-900", border: "border-gray-100" },
          ].map((s) => (
            <div key={s.label} className={`bg-white rounded-2xl border p-4 ${s.border}`}>
              <p className="text-xs text-gray-400 mb-1">{s.label}</p>
              <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Semana */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Semana</h2>
              <p className="text-xs text-gray-400 capitalize">{mesAnio}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSemanaOffset(semanaOffset - 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-[#FDF0ED] hover:border-[#E8614A] hover:text-[#E8614A] transition-all text-sm">‹</button>
              <button onClick={() => setSemanaOffset(0)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-[#FDF0ED] hover:border-[#E8614A] hover:text-[#E8614A] transition-all text-xs">Hoy</button>
              <button onClick={() => setSemanaOffset(semanaOffset + 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-[#FDF0ED] hover:border-[#E8614A] hover:text-[#E8614A] transition-all text-sm">›</button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {diasSemana.map((dia, i) => {
              const alertasDia = alertasPorDia(dia);
              const registrosDia = registrosPorDia(dia);
              const campanasDia = campanasEnDia(dia);
              const esEsteHoy = esHoy(dia);
              const tieneAlta = alertasDia.some(a => a.urgencia === "Alta");
              const tieneAlertas = alertasDia.length > 0;
              const tieneRegistros = registrosDia.length > 0;
              const tieneCampana = campanasDia.length > 0;
              const tieneAlgo = tieneAlertas || tieneRegistros || tieneCampana;

              return (
                <div key={i}
                  onClick={() => router.push(`/calendario?dia=${dia.getDate()}&mes=${dia.getMonth() + 1}&anio=${dia.getFullYear()}`)}
                  className={`rounded-xl p-3 border transition-all cursor-pointer ${
                    esEsteHoy ? "bg-[#E8614A] border-[#E8614A]" :
                    tieneAlta ? "bg-[#FCEBEB] border-[#F09595]" :
                    tieneAlertas ? "bg-[#FDF0ED] border-[#F5C4BB]" :
                    tieneRegistros ? "bg-[#E1F5EE] border-[#5DCAA5]" :
                    tieneCampana ? "bg-[#EAF3DE] border-[#639922]" :
                    "bg-gray-50 border-gray-100 hover:bg-gray-100"
                  }`}>
                  <p className={`text-xs font-medium mb-1 ${esEsteHoy ? "text-white/80" : "text-gray-400"}`}>{DIAS[i]}</p>
                  <p className={`text-xl font-semibold ${
                    esEsteHoy ? "text-white" :
                    tieneAlta ? "text-[#A32D2D]" :
                    tieneAlertas ? "text-[#C44A35]" :
                    tieneRegistros ? "text-[#085041]" :
                    tieneCampana ? "text-[#3B6D11]" :
                    "text-gray-700"
                  }`}>{dia.getDate()}</p>
                  {tieneAlgo && (
                    <div className="mt-2 space-y-1">
                      {tieneCampana && !tieneAlertas && !tieneRegistros && campanasDia.slice(0, 2).map((c, j) => (
                        <div key={j} className={`text-xs truncate rounded px-1 py-0.5 ${esEsteHoy ? "bg-white/20 text-white" : "bg-[#D4EDBA] text-[#3B6D11]"}`}>
                          📋 {c.nombre}
                        </div>
                      ))}
                      {[...alertasDia, ...registrosDia].slice(0, 2).map((item, j) => (
                        <div key={j} className={`text-xs truncate rounded px-1 py-0.5 ${
                          esEsteHoy ? "bg-white/20 text-white" :
                          tieneAlta ? "bg-[#F7C1C1] text-[#A32D2D]" :
                          tieneAlertas ? "bg-[#F5C4BB] text-[#C44A35]" :
                          "bg-[#9FE1CB] text-[#085041]"
                        }`}>
                          {item.descripcion || "Tarea"}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alertas pendientes */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-900">Alertas pendientes</p>
              <button onClick={() => router.push("/historial?tipo=Alertas")} className="text-xs text-[#E8614A] hover:underline">Ver historial →</button>
            </div>
            {alertas.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-6">¡Todo al día! 🎉</p>
            ) : (
              <div className="space-y-2">
                {alertas.slice(0, 4).map((a) => {
                  const vencida = !!a.fecha_alerta && a.fecha_alerta < hoyStr;
                  return (
                  <div key={a.id} onClick={() => { setItemSeleccionado(a); setTipoSeleccionado("alerta"); }} className={`flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-[#FDF0ED] cursor-pointer transition-all ${vencida ? "bg-[#FCEBEB]" : ""}`}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.urgencia === "Alta" ? "bg-[#E24B4A]" : a.urgencia === "Media" ? "bg-[#EF9F27]" : "bg-[#639922]"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{a.descripcion || "Sin descripción"}</p>
                      <p className="text-xs text-gray-400">{a.comunidad} · {a.fecha_alerta ? new Date(a.fecha_alerta).toLocaleDateString("es-ES") : "Sin fecha"}{vencida ? " · ⚠️ vencida" : ""}</p>
                    </div>
                    {badgeUrgencia(a.urgencia)}
                  </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Próximas revisiones + campañas */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-900">Próximas revisiones</p>
              <button onClick={() => router.push("/historial")} className="text-xs text-[#E8614A] hover:underline">Ver historial →</button>
            </div>

            {/* Campañas activas esta semana */}
            {campanasActivasSemana.map((c) => (
              <div key={c.id} onClick={() => router.push(`/campanas?id=${c.id}`)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#EAF3DE] cursor-pointer transition-all mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 bg-[#EAF3DE]">📋</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{c.nombre}</p>
                  <p className="text-xs text-gray-400">Campaña · Esta semana</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-[#EAF3DE] text-[#3B6D11]">En curso</span>
              </div>
            ))}

            {registros.length === 0 && campanasActivasSemana.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-6">No hay revisiones programadas</p>
            ) : (
              <div className="space-y-2">
                {registros.slice(0, 4).map((r) => (
                  <div key={r.id} onClick={() => { setItemSeleccionado(r); setTipoSeleccionado("registro"); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#FDF0ED] cursor-pointer transition-all">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${r.tipo === "mantenimiento" ? "bg-[#FDF0ED]" : "bg-[#E1F5EE]"}`}>
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