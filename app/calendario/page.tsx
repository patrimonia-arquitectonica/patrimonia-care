"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AppLayout from "@/components/AppLayout";
import RegistroDetalle from "@/components/RegistroDetalle";
import AlertaDetalle from "@/components/AlertaDetalle";

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

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

function CalendarioInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hoy = new Date();

  const [mes, setMes] = useState(searchParams.get("mes") ? parseInt(searchParams.get("mes")!) - 1 : hoy.getMonth());
  const [anio, setAnio] = useState(searchParams.get("anio") ? parseInt(searchParams.get("anio")!) : hoy.getFullYear());
  const [diaSeleccionado, setDiaSeleccionado] = useState<number | null>(searchParams.get("dia") ? parseInt(searchParams.get("dia")!) : null);
  const [alertas, setAlertas] = useState<any[]>([]);
  const [alertasResueltas, setAlertasResueltas] = useState<any[]>([]);
  const [revisiones, setRevisiones] = useState<any[]>([]);
  const [miembros, setMiembros] = useState<any[]>([]);
  const [campanas, setCampanas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [creandoEnDia, setCreandoEnDia] = useState(false);

  const [itemSeleccionado, setItemSeleccionado] = useState<any | null>(null);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<"registro" | "alerta" | null>(null);

  useEffect(() => { cargarTodo(); }, [mes, anio]);

  const cargarTodo = async () => {
    setCargando(true);
    const primerDia = `${anio}-${String(mes + 1).padStart(2, "0")}-01`;
    const ultimoDia = `${anio}-${String(mes + 1).padStart(2, "0")}-${new Date(anio, mes + 1, 0).getDate()}`;
    const hoyStr = new Date().toISOString().split("T")[0];
    const [{ data: pend }, { data: res }, { data: miem }, { data: rev }, { data: c }] = await Promise.all([
      supabase.from("alertas").select("*").eq("resuelta", false).gte("fecha_alerta", primerDia).lte("fecha_alerta", ultimoDia).order("fecha_alerta", { ascending: true }),
      supabase.from("alertas").select("*").eq("resuelta", true).gte("fecha_alerta", primerDia).lte("fecha_alerta", ultimoDia).order("fecha_alerta", { ascending: true }),
      supabase.from("miembros").select("*").order("nombre"),
      supabase.from("Registros").select("*").is("campana_id", null).gte("fecha_revision", primerDia).lte("fecha_revision", ultimoDia).order("fecha_revision", { ascending: true }),
      supabase.from("campanas").select("*").eq("activa", true),
    ]);
    // Una alerta pendiente está vencida si su fecha ya pasó y sigue sin resolver.
    if (pend) setAlertas(pend.map((a) => ({ ...a, vencida: !!a.fecha_alerta && a.fecha_alerta < hoyStr })));
    if (res) setAlertasResueltas(res);
    if (miem) setMiembros(miem);
    if (rev) setRevisiones(rev);
    if (c) setCampanas(c);
    setCargando(false);
  };

  const mesAnterior = () => {
    if (mes === 0) { setMes(11); setAnio(anio - 1); } else setMes(mes - 1);
    setDiaSeleccionado(null);
  };

  const mesSiguiente = () => {
    if (mes === 11) { setMes(0); setAnio(anio + 1); } else setMes(mes + 1);
    setDiaSeleccionado(null);
  };

  const alertasDelDia = (dia: number) => {
    const diaStr = `${anio}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    return alertas.filter((a) => a.fecha_alerta === diaStr);
  };

  const alertasResueltasDelDia = (dia: number) => {
    const diaStr = `${anio}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    return alertasResueltas.filter((a) => a.fecha_alerta === diaStr);
  };

  const revisionesDelDia = (dia: number) => {
    const diaStr = `${anio}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    return revisiones.filter((r) => r.fecha_revision === diaStr);
  };

  // Campañas activas en un día concreto
  const campanasDelDia = (dia: number) => {
    const fecha = new Date(anio, mes, dia, 12, 0, 0);
    return campanas.filter(c => {
        const [y, m, d] = c.fecha_instancia.split("-").map(Number);
        const instancia = new Date(y, m - 1, d, 12, 0, 0);
        const lunes = getLunes(instancia);
        const domingo = getDomingo(instancia);
        return fecha >= lunes && fecha <= domingo;
    });
   };

  const badgeUrgencia = (urgencia: string | null) => {
    if (!urgencia) return <span className="text-xs px-2 py-0.5 rounded-full bg-[#E1F5EE] text-[#085041] font-medium">Permanente</span>;
    if (urgencia === "Alta") return <span className="text-xs px-2 py-0.5 rounded-full bg-[#FCEBEB] text-[#A32D2D] font-medium">Alta</span>;
    if (urgencia === "Media") return <span className="text-xs px-2 py-0.5 rounded-full bg-[#FAEEDA] text-[#854F0B] font-medium">Media</span>;
    return <span className="text-xs px-2 py-0.5 rounded-full bg-[#EAF3DE] text-[#3B6D11] font-medium">Leve</span>;
  };

  if (cargando) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 text-sm">Cargando calendario...</p>
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
          onActualizar={cargarTodo}
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
          onActualizar={cargarTodo}
        />
      </AppLayout>
    );
  }

  if (diaSeleccionado) {
    const pendientes = alertasDelDia(diaSeleccionado);
    const resueltas = alertasResueltasDelDia(diaSeleccionado);
    const revs = revisionesDelDia(diaSeleccionado);
    const camps = campanasDelDia(diaSeleccionado);
    const todas = [...pendientes, ...resueltas];

    return (
      <AppLayout>
        <div className="p-6 max-w-lg">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-center gap-3">
              <button onClick={() => { setDiaSeleccionado(null); setCreandoEnDia(false); }} className="text-gray-400 text-lg">←</button>
              <div className="flex-1">
                <h1 className="text-base font-semibold text-gray-900">{diaSeleccionado} de {MESES[mes].toLowerCase()}</h1>
                <p className="text-xs text-gray-400">{pendientes.length} alerta{pendientes.length !== 1 ? "s" : ""} · {revs.length} revisión{revs.length !== 1 ? "es" : ""}{camps.length > 0 ? ` · ${camps.length} campaña${camps.length !== 1 ? "s" : ""}` : ""}</p>
              </div>
            </div>
            <div className="px-5 py-5 space-y-2">

              {/* Campañas */}
              {camps.length > 0 && (
                <div className="mb-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">📋 Campañas</p>
                  {camps.map((c) => (
                    <button key={c.id} onClick={() => router.push(`/campanas?id=${c.id}`)} className="w-full text-left border rounded-xl px-4 py-3 bg-gray-50 border-gray-200 hover:border-gray-300 transition-all mb-2" style={{ borderLeftColor: c.color || "#639922", borderLeftWidth: 3 }}>
                      <p className="text-xs font-medium mb-1" style={{ color: c.color || "#3B6D11" }}>📋 Campaña semanal</p>
                      <p className="text-sm font-medium text-gray-800">{c.nombre}</p>
                      <p className="text-xs text-gray-400">{c.categoria} · Ver desglose →</p>
                    </button>
                  ))}
                </div>
              )}

              {revs.length > 0 && (
                <div className="mb-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">📅 Revisiones programadas</p>
                  {revs.map((r) => (
                    <button key={r.id} onClick={() => { setItemSeleccionado(r); setTipoSeleccionado("registro"); }} className="w-full text-left border rounded-xl px-4 py-3 bg-[#FDF0ED] border-[#F5C4BB] hover:border-[#E8614A] transition-all mb-2">
                      <p className="text-xs text-[#E8614A] font-medium mb-1">🔧 {r.categoria || "Mantenimiento"}</p>
                      <p className="text-sm font-medium text-gray-800">{r.descripcion || "Sin descripción"}</p>
                      <p className="text-xs text-gray-400">{r.comunidad} · {r.persona}</p>
                    </button>
                  ))}
                </div>
              )}

              {todas.length === 0 && revs.length === 0 && camps.length === 0 && !creandoEnDia && <p className="text-center text-gray-400 text-sm py-4">No hay nada este día</p>}
              {todas.map((a) => (
                <button key={a.id} onClick={() => { setItemSeleccionado(a); setTipoSeleccionado("alerta"); }} className={`w-full text-left border rounded-xl px-4 py-3 transition-all ${a.resuelta ? "bg-[#E1F5EE] border-[#5DCAA5] opacity-75" : a.vencida ? "bg-[#FCEBEB] border-[#F09595]" : "bg-gray-50 border-gray-200 hover:border-[#E8614A]"}`}>
                  <p className="text-xs text-[#E8614A] font-medium mb-1">#{a.id.slice(0,8).toUpperCase()}{a.resuelta ? " ✓ resuelta" : a.vencida ? " ⚠️ vencida" : ""}</p>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{a.descripcion || "Sin descripción"}</p>
                      <p className="text-xs text-gray-400">{a.comunidad} · {a.espacio}</p>
                    </div>
                    {badgeUrgencia(a.urgencia)}
                  </div>
                </button>
              ))}
              {creandoEnDia ? (
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">¿Qué quieres crear?</p>
                  <button onClick={() => {
                    const diaStr = `${anio}-${String(mes + 1).padStart(2, "0")}-${String(diaSeleccionado).padStart(2, "0")}`;
                    router.push(`/inicio?fecha=${diaStr}`);
                  }} className="w-full py-3 bg-[#FAEEDA] border border-[#EF9F27] text-[#854F0B] rounded-xl text-sm font-semibold">🔔 Crear alerta para este día</button>
                  <button onClick={() => router.push("/inicio")} className="w-full py-3 bg-[#E8614A] text-white rounded-xl text-sm font-semibold">+ Crear registro</button>
                  <button onClick={() => setCreandoEnDia(false)} className="w-full py-3 bg-gray-50 border border-gray-200 text-gray-500 rounded-xl text-sm">Cancelar</button>
                </div>
              ) : (
                <button onClick={() => setCreandoEnDia(true)} className="w-full py-3 bg-gray-50 border border-dashed border-gray-300 text-gray-500 rounded-xl text-sm hover:bg-gray-100 transition-all">
                  + Añadir alerta o registro en este día
                </button>
              )}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const primerDiaMes = new Date(anio, mes, 1).getDay();
  const offsetInicio = primerDiaMes === 0 ? 6 : primerDiaMes - 1;
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  const hoyDia = hoy.getDate();
  const esMesActual = mes === hoy.getMonth() && anio === hoy.getFullYear();

  return (
    <AppLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Calendario</h1>
            <p className="text-sm text-[#E8614A] font-medium capitalize">{MESES[mes]} {anio}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={mesAnterior} className="px-3 py-1.5 hover:bg-[#FDF0ED] rounded-lg border border-gray-200 text-gray-500 hover:border-[#E8614A] hover:text-[#E8614A] transition-all">‹</button>
            <button onClick={() => { setMes(hoy.getMonth()); setAnio(hoy.getFullYear()); }} className="px-3 py-1.5 hover:bg-[#FDF0ED] rounded-lg border border-gray-200 text-xs text-gray-500 hover:border-[#E8614A] hover:text-[#E8614A] transition-all">Hoy</button>
            <button onClick={mesSiguiente} className="px-3 py-1.5 hover:bg-[#FDF0ED] rounded-lg border border-gray-200 text-gray-500 hover:border-[#E8614A] hover:text-[#E8614A] transition-all">›</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="grid grid-cols-7 mb-3">
              {["L","M","X","J","V","S","D"].map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-gray-300 py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5 mb-5">
              {Array.from({ length: offsetInicio }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: diasEnMes }, (_, i) => i + 1).map((dia) => {
                const pendientes = alertasDelDia(dia);
                const resueltas = alertasResueltasDelDia(dia);
                const revs = revisionesDelDia(dia);
                const camps = campanasDelDia(dia);
                const tieneVencidas = pendientes.some(a => a.vencida);
                const tienePendientes = pendientes.length > 0;
                const tieneResueltas = resueltas.length > 0 && pendientes.length === 0;
                const tieneRevisiones = revs.length > 0;
                const tieneCampana = camps.length > 0;
                const esHoyDia = esMesActual && dia === hoyDia;

                return (
                  <button key={dia} onClick={() => setDiaSeleccionado(dia)}
                    style={!esHoyDia && !tieneVencidas && !tienePendientes && !tieneResueltas && !tieneRevisiones && tieneCampana ? { backgroundColor: `${camps[0].color || "#639922"}22`, color: camps[0].color || "#3B6D11" } : undefined}
                    className={`flex flex-col items-center py-2.5 rounded-xl transition-all ${
                      esHoyDia ? "bg-[#E8614A] text-white shadow-sm" :
                      tieneVencidas ? "bg-[#FCEBEB] text-[#A32D2D]" :
                      tienePendientes ? "bg-[#FDF0ED] text-[#C44A35] hover:bg-[#F5C4BB]" :
                      tieneResueltas ? "bg-[#E1F5EE] text-[#085041]" :
                      tieneRevisiones ? "bg-[#FDF0ED] text-[#C44A35] hover:bg-[#F5C4BB]" :
                      tieneCampana ? "hover:opacity-80" :
                      "text-gray-400 hover:bg-gray-50"
                    }`}>
                    <span className="text-sm font-medium">{dia}</span>
                    {(tienePendientes || tieneResueltas || tieneRevisiones || tieneCampana) && !esHoyDia && (
                      <div className="flex gap-0.5 mt-1">
                        {tienePendientes && <div className={`w-1.5 h-1.5 rounded-full ${tieneVencidas ? "bg-[#A32D2D]" : "bg-[#E8614A]"}`} />}
                        {tieneResueltas && <div className="w-1.5 h-1.5 rounded-full bg-[#1D9E75]" />}
                        {tieneRevisiones && <div className="w-1.5 h-1.5 rounded-full bg-[#C44A35]" />}
                        {camps.map((c) => (
                          <div key={c.id} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.color || "#639922" }} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-4 text-xs text-gray-400 flex-wrap pt-3 border-t border-gray-100">
              <span><span className="inline-block w-2 h-2 rounded-full bg-[#E8614A] mr-1.5"></span>Alerta</span>
              <span><span className="inline-block w-2 h-2 rounded-full bg-[#1D9E75] mr-1.5"></span>Resuelto</span>
              <span><span className="inline-block w-2 h-2 rounded-full bg-[#C44A35] mr-1.5"></span>Revisión</span>
              <span><span className="inline-block w-2 h-2 rounded-full bg-[#A32D2D] mr-1.5"></span>Vencida</span>
              <span><span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ background: "conic-gradient(#639922 0 33%, #378ADD 33% 66%, #E8614A 66% 100%)" }}></span>Campaña (color propio · varios puntos si coinciden)</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Este mes</p>
            {alertas.length === 0 && revisiones.length === 0 && campanas.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">¡Todo al día! 🎉</p>
            ) : (
              <div className="space-y-2">
                {campanas.slice(0, 3).map((c) => (
                  <button key={c.id} onClick={() => router.push(`/campanas?id=${c.id}`)} className="w-full text-left border rounded-xl px-4 py-3 bg-gray-50 border-gray-200 hover:border-gray-300 transition-all" style={{ borderLeftColor: c.color || "#639922", borderLeftWidth: 3 }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-medium mb-0.5" style={{ color: c.color || "#3B6D11" }}>📋 Campaña semanal</p>
                        <p className="text-sm font-medium text-gray-800">{c.nombre}</p>
                        <p className="text-xs text-gray-400">{c.categoria}</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#E1F5EE] text-[#085041] font-medium">Ver →</span>
                    </div>
                  </button>
                ))}
                {revisiones.slice(0, 3).map((r) => (
                  <button key={r.id} onClick={() => { setItemSeleccionado(r); setTipoSeleccionado("registro"); }} className="w-full text-left border rounded-xl px-4 py-3 bg-[#FDF0ED] border-[#F5C4BB] hover:border-[#E8614A] transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-[#E8614A] font-medium mb-0.5">📅 {r.fecha_revision ? new Date(r.fecha_revision).toLocaleDateString("es-ES") : "Sin fecha"}</p>
                        <p className="text-sm font-medium text-gray-800">{r.descripcion || "Sin descripción"}</p>
                        <p className="text-xs text-gray-400">{r.comunidad} · {r.persona}</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#FDF0ED] border border-[#F5C4BB] text-[#E8614A] font-medium">Revisión</span>
                    </div>
                  </button>
                ))}
                {alertas.slice(0, 3).map((a) => (
                  <button key={a.id} onClick={() => { setItemSeleccionado(a); setTipoSeleccionado("alerta"); }} className="w-full text-left border rounded-xl px-4 py-3 bg-gray-50 border-gray-200 hover:border-[#E8614A] hover:bg-[#FDF0ED] transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-[#E8614A] font-medium mb-0.5">🔔 {a.fecha_alerta ? new Date(a.fecha_alerta).toLocaleDateString("es-ES") : "Sin fecha"}</p>
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
      </div>
    </AppLayout>
  );
}

export default function Calendario() {
  return (
    <Suspense>
      <CalendarioInner />
    </Suspense>
  );
}