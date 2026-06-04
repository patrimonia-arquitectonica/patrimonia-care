"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AppLayout from "@/components/AppLayout";

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function CalendarioInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hoy = new Date();

  const [mes, setMes] = useState(searchParams.get("mes") ? parseInt(searchParams.get("mes")!) - 1 : hoy.getMonth());
  const [anio, setAnio] = useState(searchParams.get("anio") ? parseInt(searchParams.get("anio")!) : hoy.getFullYear());
  const [alertas, setAlertas] = useState<any[]>([]);
  const [alertasResueltas, setAlertasResueltas] = useState<any[]>([]);
  const [miembros, setMiembros] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [diaSeleccionado, setDiaSeleccionado] = useState<number | null>(searchParams.get("dia") ? parseInt(searchParams.get("dia")!) : null);
  const [alertaSeleccionada, setAlertaSeleccionada] = useState<any | null>(null);
  const [reprogramando, setReprogramando] = useState(false);
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [seleccionandoMiembro, setSeleccionandoMiembro] = useState(false);
  const [miembroSeleccionado, setMiembroSeleccionado] = useState("");
  const [creandoEnDia, setCreandoEnDia] = useState(false);

  const hoyStr = hoy.toISOString().split("T")[0];

  useEffect(() => {
    cargarTodo();
  }, [mes, anio]);

  const cargarTodo = async () => {
    setCargando(true);
    const primerDia = `${anio}-${String(mes + 1).padStart(2, "0")}-01`;
    const ultimoDia = `${anio}-${String(mes + 1).padStart(2, "0")}-${new Date(anio, mes + 1, 0).getDate()}`;

    const [{ data: pend }, { data: res }, { data: miem }] = await Promise.all([
      supabase.from("alertas").select("*").eq("resuelta", false).gte("fecha_alerta", primerDia).lte("fecha_alerta", ultimoDia).order("fecha_alerta", { ascending: true }),
      supabase.from("alertas").select("*").eq("resuelta", true).gte("fecha_alerta", primerDia).lte("fecha_alerta", ultimoDia).order("fecha_alerta", { ascending: true }),
      supabase.from("miembros").select("*").order("nombre"),
    ]);
    if (pend) setAlertas(pend);
    if (res) setAlertasResueltas(res);
    if (miem) setMiembros(miem);
    setCargando(false);
  };

  const marcarResuelta = async (id: string) => {
    await supabase.from("alertas").update({ resuelta: true }).eq("id", id);
    setAlertaSeleccionada(null);
    cargarTodo();
  };

  const reprogramar = async (id: string, fecha: string) => {
    await supabase.from("alertas").update({ fecha_alerta: fecha }).eq("id", id);
    setReprogramando(false);
    setNuevaFecha("");
    setAlertaSeleccionada(null);
    cargarTodo();
  };

  const mesAnterior = () => {
    if (mes === 0) { setMes(11); setAnio(anio - 1); }
    else setMes(mes - 1);
    setDiaSeleccionado(null);
  };

  const mesSiguiente = () => {
    if (mes === 11) { setMes(0); setAnio(anio + 1); }
    else setMes(mes + 1);
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

  if (alertaSeleccionada) {
    const a = alertaSeleccionada;
    return (
      <AppLayout>
        <div className="p-6 max-w-lg">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-center gap-3">
              <button onClick={() => { setAlertaSeleccionada(null); setReprogramando(false); setSeleccionandoMiembro(false); setMiembroSeleccionado(""); }} className="text-gray-400 text-lg">←</button>
              <div className="flex-1">
                <h1 className="text-base font-semibold text-gray-900">Detalle alerta</h1>
                <p className="text-xs text-gray-400">#{a.id.slice(0,8).toUpperCase()}</p>
              </div>
              {badgeUrgencia(a.urgencia)}
            </div>
            <div className="px-5 py-5 space-y-4">
              {a.resuelta && (
                <div className="bg-[#E1F5EE] border border-[#5DCAA5] rounded-xl px-4 py-2 text-xs text-[#085041] font-medium">
                  ✓ Esta alerta fue resuelta
                </div>
              )}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2 border border-gray-100">
                {[["Creada por", a.persona], ["Comunidad", a.comunidad], ["Espacio", a.espacio], ["Categoría", a.categoria], ["Urgencia", a.urgencia || "—"], ["Fecha", a.fecha_alerta ? new Date(a.fecha_alerta).toLocaleDateString("es-ES") : "—"]].map(([lbl, val]) => (
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
              {!a.resuelta && (
                reprogramando ? (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 block">Nueva fecha</label>
                    <input type="date" value={nuevaFecha} onChange={(e) => setNuevaFecha(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700" />
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setReprogramando(false)} className="py-3 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl text-sm">Cancelar</button>
                      <button onClick={() => nuevaFecha && reprogramar(a.id, nuevaFecha)} disabled={!nuevaFecha} className="py-3 bg-[#534AB7] text-white rounded-xl text-sm font-semibold disabled:opacity-40">Confirmar</button>
                    </div>
                  </div>
                ) : seleccionandoMiembro ? (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">¿Quién resuelve esta alerta?</p>
                    <div className="space-y-2">
                      {miembros.map((m) => (
                        <button key={m.id} onClick={() => setMiembroSeleccionado(m.nombre)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${miembroSeleccionado === m.nombre ? "bg-[#EEEDFE] border-[#534AB7]" : "bg-gray-50 border-gray-200"}`}>
                          <div className="w-7 h-7 rounded-full bg-[#EEEDFE] flex items-center justify-center text-xs font-medium text-[#534AB7]">
                            {m.nombre.slice(0,2).toUpperCase()}
                          </div>
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
                        const params = new URLSearchParams({ miembro: miembroSeleccionado, comunidad: a.comunidad || "", area: a.area || "", espacio: a.espacio || "" });
                        router.push(`${a.tipo === "permanente" ? "/permanente" : "/mantenimiento"}?${params.toString()}`);
                      }} disabled={!miembroSeleccionado} className="py-3 bg-[#534AB7] text-white rounded-xl text-sm font-semibold disabled:opacity-40">
                        Ir al formulario →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button onClick={() => setSeleccionandoMiembro(true)} className="w-full py-3 bg-[#534AB7] text-white rounded-xl text-sm font-semibold hover:bg-[#3C3489] transition-all">✅ Crear registro — resolver ahora</button>
                    <button onClick={() => setReprogramando(true)} className="w-full py-3 bg-[#FAEEDA] border border-[#EF9F27] text-[#854F0B] rounded-xl text-sm font-semibold">📅 Reprogramar</button>
                    <button onClick={() => marcarResuelta(a.id)} className="w-full py-3 bg-[#E1F5EE] border border-[#1D9E75] text-[#085041] rounded-xl text-sm font-medium">✓ Marcar como resuelta</button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (diaSeleccionado) {
    const pendientes = alertasDelDia(diaSeleccionado);
    const resueltas = alertasResueltasDelDia(diaSeleccionado);
    const todas = [...pendientes, ...resueltas];
    const diaStr = `${anio}-${String(mes + 1).padStart(2, "0")}-${String(diaSeleccionado).padStart(2, "0")}`;

    return (
      <AppLayout>
        <div className="p-6 max-w-lg">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-center gap-3">
              <button onClick={() => { setDiaSeleccionado(null); setCreandoEnDia(false); }} className="text-gray-400 text-lg">←</button>
              <div className="flex-1">
                <h1 className="text-base font-semibold text-gray-900">{diaSeleccionado} de {MESES[mes].toLowerCase()}</h1>
                <p className="text-xs text-gray-400">{pendientes.length} pendiente{pendientes.length !== 1 ? "s" : ""} · {resueltas.length} resuelta{resueltas.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <div className="px-5 py-5 space-y-2">
              {todas.length === 0 && !creandoEnDia && (
                <p className="text-center text-gray-400 text-sm py-4">No hay alertas este día</p>
              )}
              {todas.map((a) => (
                <button key={a.id} onClick={() => setAlertaSeleccionada(a)} className={`w-full text-left border rounded-xl px-4 py-3 transition-all ${a.resuelta ? "bg-[#E1F5EE] border-[#5DCAA5] opacity-75" : a.vencida ? "bg-[#FCEBEB] border-[#F09595]" : "bg-gray-50 border-gray-200 hover:border-[#534AB7]"}`}>
                  <p className="text-xs text-[#534AB7] font-medium mb-1">#{a.id.slice(0,8).toUpperCase()}{a.resuelta ? " ✓ resuelta" : a.vencida ? " ⚠️ vencida" : ""}</p>
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
                    const params = new URLSearchParams({ miembro: "", comunidad: "", area: "", espacio: "" });
                    router.push(`/alerta?${params.toString()}`);
                  }} className="w-full py-3 bg-[#FAEEDA] border border-[#EF9F27] text-[#854F0B] rounded-xl text-sm font-semibold">
                    🔔 Crear alerta para este día
                  </button>
                  <button onClick={() => router.push("/")} className="w-full py-3 bg-[#534AB7] text-white rounded-xl text-sm font-semibold">
                    + Crear registro
                  </button>
                  <button onClick={() => setCreandoEnDia(false)} className="w-full py-3 bg-gray-50 border border-gray-200 text-gray-500 rounded-xl text-sm">
                    Cancelar
                  </button>
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

  // Calcular primer día del mes
  const primerDiaMes = new Date(anio, mes, 1).getDay();
  const offsetInicio = primerDiaMes === 0 ? 6 : primerDiaMes - 1;
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  const hoyDia = hoy.getDate();
  const esMesActual = mes === hoy.getMonth() && anio === hoy.getFullYear();

  return (
    <AppLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Calendario</h1>
            <p className="text-sm text-gray-400 capitalize">{MESES[mes]} {anio}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={mesAnterior} className="px-3 py-1.5 hover:bg-gray-100 rounded-lg border border-gray-200 text-gray-500">‹</button>
            <button onClick={() => { setMes(hoy.getMonth()); setAnio(hoy.getFullYear()); }} className="px-3 py-1.5 hover:bg-gray-100 rounded-lg border border-gray-200 text-xs text-gray-500">Hoy</button>
            <button onClick={mesSiguiente} className="px-3 py-1.5 hover:bg-gray-100 rounded-lg border border-gray-200 text-gray-500">›</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="grid grid-cols-7 mb-2">
              {["L","M","X","J","V","S","D"].map((d) => (
                <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {Array.from({ length: offsetInicio }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: diasEnMes }, (_, i) => i + 1).map((dia) => {
                const pendientes = alertasDelDia(dia);
                const resueltas = alertasResueltasDelDia(dia);
                const tieneVencidas = pendientes.some(a => a.vencida);
                const tienePendientes = pendientes.length > 0;
                const tieneResueltas = resueltas.length > 0 && pendientes.length === 0;
                const esHoyDia = esMesActual && dia === hoyDia;

                return (
                  <button key={dia} onClick={() => setDiaSeleccionado(dia)}
                    className={`flex flex-col items-center py-2 rounded-lg transition-all ${
                      esHoyDia ? "bg-[#534AB7] text-white" :
                      tieneVencidas ? "bg-[#FCEBEB] text-[#A32D2D]" :
                      tienePendientes ? "bg-[#EEEDFE] text-[#3C3489] hover:bg-[#DDD9FC]" :
                      tieneResueltas ? "bg-[#E1F5EE] text-[#085041]" :
                      "text-gray-400 hover:bg-gray-50"
                    }`}>
                    <span className="text-xs font-medium">{dia}</span>
                    {(tienePendientes || tieneResueltas) && !esHoyDia && (
                      <div className="flex gap-0.5 mt-0.5">
                        {pendientes.some(a => a.tipo !== "permanente") && <div className={`w-1 h-1 rounded-full ${tieneVencidas ? "bg-[#A32D2D]" : "bg-[#534AB7]"}`} />}
                        {pendientes.some(a => a.tipo === "permanente") && <div className="w-1 h-1 rounded-full bg-[#1D9E75]" />}
                        {tieneResueltas && <div className="w-1 h-1 rounded-full bg-[#1D9E75]" />}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-3 text-xs text-gray-400 flex-wrap">
              <span><span className="inline-block w-2 h-2 rounded-full bg-[#534AB7] mr-1"></span>Pendiente</span>
              <span><span className="inline-block w-2 h-2 rounded-full bg-[#1D9E75] mr-1"></span>Resuelto</span>
              <span><span className="inline-block w-2 h-2 rounded-full bg-[#A32D2D] mr-1"></span>Vencida</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Próximas alertas</p>
            {alertas.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">¡Todo al día! 🎉</p>
            ) : (
              <div className="space-y-2">
                {alertas.slice(0, 5).map((a) => (
                  <button key={a.id} onClick={() => setAlertaSeleccionada(a)} className="w-full text-left border rounded-xl px-4 py-3 bg-gray-50 border-gray-200 hover:border-[#534AB7] transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-[#534AB7] font-medium mb-0.5">
                          #{a.id.slice(0,8).toUpperCase()} · {a.fecha_alerta ? new Date(a.fecha_alerta).toLocaleDateString("es-ES") : "Sin fecha"}
                        </p>
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