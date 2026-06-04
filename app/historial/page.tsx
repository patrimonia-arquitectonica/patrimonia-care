"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AppLayout from "@/components/AppLayout";

export default function Historial() {
  const [REGISTROS, setREGISTROS] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase.from("Registros").select("*").order("fecha_creacion", { ascending: false });
      if (data) setREGISTROS(data);
      setCargando(false);
    };
    cargar();
  }, []);

  const router = useRouter();
  const [vista, setVista] = useState<"filtros" | "resultados" | "detalle">("filtros");
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [filtroComunidad, setFiltroComunidad] = useState("Todas");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [registroSeleccionado, setRegistroSeleccionado] = useState<any | null>(null);
  const [buscandoIA, setBuscandoIA] = useState(false);
  const [idsIA, setIdsIA] = useState<string[] | null>(null);

  const resultados = REGISTROS.filter((r) => {
    if (idsIA) return idsIA.includes(r.id);
    if (filtroTipo !== "Todos" && r.tipo !== filtroTipo.toLowerCase()) return false;
    if (filtroComunidad !== "Todas" && !r.comunidad.includes(filtroComunidad)) return false;
    if (filtroEstado !== "Todos" && r.estado !== filtroEstado) return false;
    if (busqueda && !r.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) && !r.id.toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  const badgeEstado = (estado: string) => {
    if (estado === "Resuelto" || estado === "Hecho") return <span className="text-xs px-2 py-0.5 rounded-full bg-[#E1F5EE] text-[#085041] font-medium">{estado}</span>;
    if (estado === "Pendiente") return <span className="text-xs px-2 py-0.5 rounded-full bg-[#FCEBEB] text-[#A32D2D] font-medium">{estado}</span>;
    return null;
  };

  if (cargando) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 text-sm">Cargando registros...</p>
      </div>
    </AppLayout>
  );

  // Vista detalle
  if (vista === "detalle" && registroSeleccionado) {
    const r = registroSeleccionado;
    return (
      <AppLayout>
        <div className="p-6 max-w-lg">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-center gap-3">
              <button onClick={() => setVista("resultados")} className="text-gray-400 text-lg">←</button>
              <div className="flex-1">
                <h1 className="text-base font-semibold text-gray-900">Detalle registro</h1>
                <p className="text-xs text-gray-400">#{r.id.slice(0,8).toUpperCase()}</p>
              </div>
              {badgeEstado(r.estado)}
            </div>
            <div className="px-5 py-5 space-y-4">
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2 border border-gray-100">
                {[
                  ["Persona", r.persona],
                  ["Comunidad", r.comunidad],
                  ["Espacio", r.espacio],
                  ["Categoría", r.subcategoria],
                  ["Fecha", r.fecha_creacion ? new Date(r.fecha_creacion).toLocaleString("es-ES", { timeZone: "Europe/Madrid", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"],
                  ["Tipo", r.tipo === "mantenimiento" ? "🔧 Mantenimiento" : "🪑 Permanente"],
                ].map(([lbl, val]) => (
                  <div key={lbl} className="flex justify-between text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                    <span className="text-gray-400">{lbl}</span>
                    <span className="text-gray-800 font-medium text-right">{val}</span>
                  </div>
                ))}
              </div>
              {r.gasto && (
                <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-xs text-gray-400">Gasto registrado</p>
                    <p className="text-base font-semibold text-gray-900">{r.gasto} €</p>
                  </div>
                  <button className="flex items-center gap-1 bg-[#E1F5EE] border border-[#5DCAA5] rounded-xl px-3 py-2 text-xs text-[#085041]">
                    🧾 Ver factura
                  </button>
                </div>
              )}
              {r.comentario && (
                <div className="bg-[#EEEDFE] border border-[#AFA9EC] rounded-2xl p-4">
                  <p className="text-xs font-semibold text-[#534AB7] uppercase tracking-widest mb-2">💬 Comentario</p>
                  <p className="text-sm text-[#3C3489]">{r.comentario}</p>
                </div>
              )}
              {r.estado === "Pendiente" && (
                <button onClick={() => router.push(r.tipo === "permanente" ? "/permanente" : "/mantenimiento")} className="w-full py-3 bg-[#534AB7] text-white rounded-xl text-sm font-semibold hover:bg-[#3C3489] transition-all">
                  → Crear registro desde esta alerta
                </button>
              )}
              <button className="w-full py-3 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl text-sm">
                ✎ Editar registro
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Vista resultados
  if (vista === "resultados") {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Resultados</h1>
              <p className="text-sm text-gray-400">{resultados.length} registros{idsIA ? " · búsqueda IA ✨" : ""}</p>
            </div>
            <button onClick={() => { setVista("filtros"); setIdsIA(null); }} className="text-sm text-[#534AB7] px-3 py-1.5 rounded-lg border border-[#534AB7] hover:bg-[#EEEDFE] transition-all">
              ⚙ Filtros
            </button>
          </div>
          <div className="flex gap-2 flex-wrap mb-4">
            {filtroTipo !== "Todos" && !idsIA && <span className="text-xs px-3 py-1 rounded-full bg-[#EEEDFE] border border-[#534AB7] text-[#3C3489]">{filtroTipo} ×</span>}
            {filtroComunidad !== "Todas" && !idsIA && <span className="text-xs px-3 py-1 rounded-full bg-[#EEEDFE] border border-[#534AB7] text-[#3C3489]">{filtroComunidad} ×</span>}
            {filtroEstado !== "Todos" && !idsIA && <span className="text-xs px-3 py-1 rounded-full bg-[#EEEDFE] border border-[#534AB7] text-[#3C3489]">{filtroEstado} ×</span>}
            {idsIA && <span className="text-xs px-3 py-1 rounded-full bg-[#EEEDFE] border border-[#534AB7] text-[#3C3489]">✨ "{busqueda}"</span>}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {resultados.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-12">No hay registros con estos filtros</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-widest">Ref.</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-widest">Descripción</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-widest">Comunidad</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-widest">Persona</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-widest">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {resultados.map((r) => (
                    <tr key={r.id} onClick={() => { setRegistroSeleccionado(r); setVista("detalle"); }} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-all">
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium ${r.tipo === "mantenimiento" ? "text-[#534AB7]" : "text-[#0F6E56]"}`}>#{r.id.slice(0,8).toUpperCase()}</span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-800">{r.descripcion || "Sin descripción"}</td>
                      <td className="px-5 py-3 text-sm text-gray-400">{r.comunidad}</td>
                      <td className="px-5 py-3 text-sm text-gray-400">{r.persona}</td>
                      <td className="px-5 py-3">{badgeEstado(r.estado)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </AppLayout>
    );
  }

  // Vista filtros
  return (
    <AppLayout>
      <div className="p-6 max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Historial</h1>
          <button onClick={() => { setFiltroTipo("Todos"); setFiltroComunidad("Todas"); setFiltroEstado("Todos"); setBusqueda(""); setIdsIA(null); }} className="text-xs text-gray-400 hover:text-gray-600">Limpiar filtros</button>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <div>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setIdsIA(null); }}
              placeholder="Busca cualquier cosa: 'el problema del baño de viñuelas'…"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700"
            />
            {busqueda.length > 10 && (
              <button onClick={async () => {
                setBuscandoIA(true);
                try {
                  const res = await fetch("/api/busqueda", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ consulta: busqueda, registros: REGISTROS }),
                  });
                  const data = await res.json();
                  setIdsIA(data.ids);
                  setVista("resultados");
                } catch (e) { console.error(e); }
                setBuscandoIA(false);
              }} className="w-full mt-2 py-2 bg-[#534AB7] text-white rounded-xl text-sm font-semibold hover:bg-[#3C3489] transition-all">
                {buscandoIA ? "✨ Buscando con IA..." : "✨ Buscar con IA"}
              </button>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 block">Tipo</label>
            <div className="flex gap-2">
              {["Todos", "Mantenimiento", "Permanente"].map((t) => (
                <button key={t} onClick={() => setFiltroTipo(t)} className={`px-3 py-1.5 rounded-full text-xs border transition-all ${filtroTipo === t ? "bg-[#EEEDFE] border-[#534AB7] text-[#3C3489] font-medium" : "bg-gray-50 border-gray-200 text-gray-500"}`}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 block">Comunidad</label>
            <div className="flex gap-2 flex-wrap">
              {["Todas", "Viñuelas", "Centro", "Abrantes", "Olvido", "Leoncio"].map((c) => (
                <button key={c} onClick={() => setFiltroComunidad(c)} className={`px-3 py-1.5 rounded-full text-xs border transition-all ${filtroComunidad === c ? "bg-[#EEEDFE] border-[#534AB7] text-[#3C3489] font-medium" : "bg-gray-50 border-gray-200 text-gray-500"}`}>{c}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 block">Estado</label>
            <div className="flex gap-2 flex-wrap">
              {["Todos", "Pendiente", "Resuelto", "Hecho"].map((e) => (
                <button key={e} onClick={() => setFiltroEstado(e)} className={`px-3 py-1.5 rounded-full text-xs border transition-all ${filtroEstado === e ? "bg-[#EEEDFE] border-[#534AB7] text-[#3C3489] font-medium" : "bg-gray-50 border-gray-200 text-gray-500"}`}>{e}</button>
              ))}
            </div>
          </div>
          <button onClick={() => setVista("resultados")} className="w-full py-3 bg-[#534AB7] text-white rounded-xl text-sm font-semibold hover:bg-[#3C3489] transition-all">
            Ver resultados →
          </button>
        </div>
      </div>
    </AppLayout>
  );
}