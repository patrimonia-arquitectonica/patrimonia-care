"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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

function HistorialInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filtroInicialTipo = searchParams.get("tipo") || "Todos";

  const [registros, setRegistros] = useState<any[]>([]);
  const [alertas, setAlertas] = useState<any[]>([]);
  const [miembros, setMiembros] = useState<any[]>([]);
  const [campanas, setCampanas] = useState<any[]>([]);
  const [registrosCampana, setRegistrosCampana] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const [filtroTipo, setFiltroTipo] = useState(filtroInicialTipo);
  const [filtroComunidad, setFiltroComunidad] = useState("Todas");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [buscandoIA, setBuscandoIA] = useState(false);
  const [idsIA, setIdsIA] = useState<string[] | null>(null);

  const [itemSeleccionado, setItemSeleccionado] = useState<any | null>(null);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<"registro" | "alerta" | null>(null);

  const hoy = new Date();

  useEffect(() => {
    const cargar = async () => {
      const [{ data: r }, { data: a }, { data: m }, { data: c }, { data: rc }] = await Promise.all([
        supabase.from("Registros").select("*").order("fecha_creacion", { ascending: false }),
        supabase.from("alertas").select("*").order("fecha_alerta", { ascending: false }),
        supabase.from("miembros").select("*").order("nombre"),
        supabase.from("campanas").select("*").eq("activa", true),
        supabase.from("Registros").select("*").not("campana_id", "is", null),
      ]);
      if (r) setRegistros(r);
      if (a) setAlertas(a);
      if (m) setMiembros(m);
      if (c) setCampanas(c);
      if (rc) setRegistrosCampana(rc);
      setCargando(false);
    };
    cargar();
  }, []);

  const recargar = async () => {
    const [{ data: r }, { data: a }] = await Promise.all([
      supabase.from("Registros").select("*").order("fecha_creacion", { ascending: false }),
      supabase.from("alertas").select("*").order("fecha_alerta", { ascending: false }),
    ]);
    if (r) setRegistros(r);
    if (a) setAlertas(a);
  };

  // Campañas con instancia activa esta semana
  const campanasActivas = campanas.filter(c => {
    const lunes = getLunes(new Date(c.fecha_instancia));
    const domingo = getDomingo(new Date(c.fecha_instancia));
    return hoy >= lunes && hoy <= domingo;
  });

  // Progreso de una campaña
  const getProgresoCampana = (campana: any) => {
    const regs = registrosCampana.filter(r => r.campana_id === campana.id);
    const lunes = getLunes(new Date(campana.fecha_instancia));
    const domingo = getDomingo(new Date(campana.fecha_instancia));
    const regsInstancia = regs.filter(r =>
      new Date(r.fecha_creacion) >= lunes && new Date(r.fecha_creacion) <= domingo
    );
    const hechos = regsInstancia.filter(r => r.estado === "Resuelto" || r.estado === "Hecho").length;
    // Total aproximado (no tenemos comunidades aquí, usamos registros como proxy)
    return { hechos, total: regsInstancia.length > 0 ? Math.max(regsInstancia.length, hechos) : "?" };
  };

  const todosLosItems = [
    ...registros.filter(r => !r.campana_id).map(r => ({ ...r, _tabla: "registro" })),
    ...alertas.map(a => ({ ...a, _tabla: "alerta" })),
    ...campanas.map(c => ({ ...c, _tabla: "campana", fecha_creacion: c.fecha_instancia })),
  ].sort((a, b) => {
    const fechaA = a.fecha_creacion || a.fecha_alerta || "";
    const fechaB = b.fecha_creacion || b.fecha_alerta || "";
    return fechaB.localeCompare(fechaA);
  });

  const resultados = todosLosItems.filter((item) => {
    if (idsIA) return idsIA.includes(item.id);
    if (item._tabla === "campana") {
      // Campañas solo salen en "Todos" y sin búsqueda
      if (filtroTipo !== "Todos") return false;
      if (busqueda) {
        const q = busqueda.toLowerCase();
        return item.nombre?.toLowerCase().includes(q) || item.categoria?.toLowerCase().includes(q);
      }
      return true;
    }
    if (filtroTipo === "Registros" && item._tabla !== "registro") return false;
    if (filtroTipo === "Alertas" && item._tabla !== "alerta") return false;
    if (filtroTipo === "Mantenimiento" && item.tipo !== "mantenimiento") return false;
    if (filtroTipo === "Permanente" && item.tipo !== "permanente") return false;
    if (filtroComunidad !== "Todas" && !item.comunidad?.includes(filtroComunidad)) return false;
    if (filtroEstado === "Pendiente") {
      const pendiente = item._tabla === "alerta" ? !item.resuelta : item.estado === "Pendiente";
      if (!pendiente) return false;
    }
    if (filtroEstado === "Resuelto") {
      const resuelto = item._tabla === "alerta" ? item.resuelta : (item.estado === "Resuelto" || item.estado === "Hecho");
      if (!resuelto) return false;
    }
    if (busqueda) {
      const q = busqueda.toLowerCase();
      const coincide =
        item.descripcion?.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.comunidad?.toLowerCase().includes(q) ||
        item.persona?.toLowerCase().includes(q) ||
        item.categoria?.toLowerCase().includes(q);
      if (!coincide) return false;
    }
    return true;
  });

  const badgeEstado = (item: any) => {
    if (item._tabla === "alerta") {
      if (item.resuelta) return <span className="text-xs px-2 py-0.5 rounded-full bg-[#E1F5EE] text-[#085041] font-medium">Resuelta</span>;
      return <span className="text-xs px-2 py-0.5 rounded-full bg-[#FCEBEB] text-[#A32D2D] font-medium">Pendiente</span>;
    }
    if (item.estado === "Resuelto" || item.estado === "Hecho") return <span className="text-xs px-2 py-0.5 rounded-full bg-[#E1F5EE] text-[#085041] font-medium">Resuelto</span>;
    if (item.estado === "Pendiente") return <span className="text-xs px-2 py-0.5 rounded-full bg-[#FCEBEB] text-[#A32D2D] font-medium">Pendiente</span>;
    return null;
  };

  const badgeTipo = (item: any) => {
    if (item._tabla === "campana") return <span className="text-xs px-2 py-0.5 rounded-full bg-[#EAF3DE] text-[#3B6D11] font-medium">📋 Campaña</span>;
    if (item._tabla === "alerta") return <span className="text-xs px-2 py-0.5 rounded-full bg-[#FAEEDA] text-[#854F0B] font-medium">🔔 Alerta</span>;
    if (item.tipo === "mantenimiento") return <span className="text-xs px-2 py-0.5 rounded-full bg-[#FDF0ED] text-[#E8614A] font-medium">🔧 Mantenimiento</span>;
    return <span className="text-xs px-2 py-0.5 rounded-full bg-[#E1F5EE] text-[#085041] font-medium">🪑 Permanente</span>;
  };

  if (cargando) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 text-sm">Cargando historial...</p>
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
          onActualizar={recargar}
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
          onActualizar={recargar}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Historial</h1>
            <p className="text-sm text-gray-400">{resultados.length} resultados{idsIA ? " · búsqueda IA ✨" : ""}</p>
          </div>
          <div className="flex gap-2 items-center">
            {busqueda.length > 10 && (
              <button onClick={async () => {
                setBuscandoIA(true);
                try {
                  const res = await fetch("/api/busqueda", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ consulta: busqueda, registros, alertas }),
                  });
                  const data = await res.json();
                  setIdsIA(data.ids);
                } catch (e) { console.error(e); }
                setBuscandoIA(false);
              }} className="text-sm text-white bg-[#E8614A] px-3 py-1.5 rounded-lg hover:bg-[#C44A35] transition-all">
                {buscandoIA ? "✨ Buscando..." : "✨ Buscar con IA"}
              </button>
            )}
            <button onClick={() => setMostrarFiltros(!mostrarFiltros)} className={`text-sm px-3 py-1.5 rounded-lg border transition-all ${mostrarFiltros ? "bg-[#FDF0ED] border-[#E8614A] text-[#E8614A]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
              ⚙ Filtros
            </button>
          </div>
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setIdsIA(null); }}
            placeholder="Busca por descripción, ref, comunidad…"
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-[#E8614A]"
          />
        </div>

        {mostrarFiltros && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 block">Tipo</label>
              <div className="flex gap-2 flex-wrap">
                {["Todos", "Registros", "Alertas", "Mantenimiento", "Permanente"].map((t) => (
                  <button key={t} onClick={() => setFiltroTipo(t)} className={`px-3 py-1.5 rounded-full text-xs border transition-all ${filtroTipo === t ? "bg-[#FDF0ED] border-[#E8614A] text-[#C44A35] font-medium" : "bg-gray-50 border-gray-200 text-gray-500"}`}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 block">Comunidad</label>
              <div className="flex gap-2 flex-wrap">
                {["Todas", "Viñuelas", "Centro", "Abrantes", "Olvido", "Leoncio", "Pico Peña"].map((c) => (
                  <button key={c} onClick={() => setFiltroComunidad(c)} className={`px-3 py-1.5 rounded-full text-xs border transition-all ${filtroComunidad === c ? "bg-[#FDF0ED] border-[#E8614A] text-[#C44A35] font-medium" : "bg-gray-50 border-gray-200 text-gray-500"}`}>{c}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 block">Estado</label>
              <div className="flex gap-2 flex-wrap">
                {["Todos", "Pendiente", "Resuelto"].map((e) => (
                  <button key={e} onClick={() => setFiltroEstado(e)} className={`px-3 py-1.5 rounded-full text-xs border transition-all ${filtroEstado === e ? "bg-[#FDF0ED] border-[#E8614A] text-[#C44A35] font-medium" : "bg-gray-50 border-gray-200 text-gray-500"}`}>{e}</button>
                ))}
              </div>
            </div>
            <button onClick={() => { setFiltroTipo("Todos"); setFiltroComunidad("Todas"); setFiltroEstado("Todos"); setBusqueda(""); setIdsIA(null); }} className="text-xs text-gray-400 hover:text-gray-600">Limpiar filtros</button>
          </div>
        )}

        {(filtroTipo !== "Todos" || filtroComunidad !== "Todas" || filtroEstado !== "Todos" || idsIA) && (
          <div className="flex gap-2 flex-wrap mb-4">
            {filtroTipo !== "Todos" && <span className="text-xs px-3 py-1 rounded-full bg-[#FDF0ED] border border-[#E8614A] text-[#C44A35]">{filtroTipo} ×</span>}
            {filtroComunidad !== "Todas" && <span className="text-xs px-3 py-1 rounded-full bg-[#FDF0ED] border border-[#E8614A] text-[#C44A35]">{filtroComunidad} ×</span>}
            {filtroEstado !== "Todos" && <span className="text-xs px-3 py-1 rounded-full bg-[#FDF0ED] border border-[#E8614A] text-[#C44A35]">{filtroEstado} ×</span>}
            {idsIA && <span className="text-xs px-3 py-1 rounded-full bg-[#FDF0ED] border border-[#E8614A] text-[#C44A35]">✨ "{busqueda}"</span>}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {resultados.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-12">No hay resultados</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-widest">Ref.</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-widest">Tipo</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-widest">Descripción</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-widest">Comunidad</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-widest">Persona</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-widest">Estado</th>
                </tr>
              </thead>
              <tbody>
                {resultados.map((item) => {
                  if (item._tabla === "campana") {
                    const { hechos, total } = getProgresoCampana(item);
                    const pct = total === "?" ? 0 : total === 0 ? 0 : Math.round((hechos / (total as number)) * 100);
                    return (
                      <tr key={`campana-${item.id}`} onClick={() => router.push(`/campanas?id=${item.id}`)} className="border-b border-gray-50 hover:bg-[#FDF0ED] cursor-pointer transition-all">
                        <td className="px-5 py-3">
                          <span className="text-xs font-medium text-[#E8614A]">#{item.id.slice(0,8).toUpperCase()}</span>
                        </td>
                        <td className="px-5 py-3">{badgeTipo(item)}</td>
                        <td className="px-5 py-3 text-sm text-gray-800 font-medium">{item.nombre}</td>
                        <td className="px-5 py-3 text-sm text-gray-400">{item.categoria}</td>
                        <td className="px-5 py-3 text-sm text-gray-400">—</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            item.completada ? "bg-[#E1F5EE] text-[#085041]" :
                            hechos > 0 ? "bg-[#FAEEDA] text-[#854F0B]" :
                            "bg-[#FCEBEB] text-[#A32D2D]"
                          }`}>
                            {item.completada ? "Completada" : hechos > 0 ? "En curso" : "Pendiente"}
                          </span>
                        </td>
                      </tr>
                    );
                  }
                  return (
                    <tr key={`${item._tabla}-${item.id}`} onClick={() => { setItemSeleccionado(item); setTipoSeleccionado(item._tabla); }} className="border-b border-gray-50 hover:bg-[#FDF0ED] cursor-pointer transition-all">
                      <td className="px-5 py-3">
                        <span className="text-xs font-medium text-[#E8614A]">#{item.id.slice(0,8).toUpperCase()}</span>
                      </td>
                      <td className="px-5 py-3">{badgeTipo(item)}</td>
                      <td className="px-5 py-3 text-sm text-gray-800">{item.descripcion || "Sin descripción"}</td>
                      <td className="px-5 py-3 text-sm text-gray-400">{item.comunidad}</td>
                      <td className="px-5 py-3 text-sm text-gray-400">{item.persona}</td>
                      <td className="px-5 py-3">{badgeEstado(item)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default function Historial() {
  return (
    <Suspense>
      <HistorialInner />
    </Suspense>
  );
}