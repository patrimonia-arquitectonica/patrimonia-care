"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Historial() {
  const [REGISTROS, setREGISTROS] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase
        .from("Registros")
        .select("*")
        .order("fecha_creacion", { ascending: false });
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
    <div className="min-h-screen bg-[#F5F4F0] flex items-center justify-center">
      <p className="text-gray-400 text-sm">Cargando registros...</p>
    </div>
  );

  // Vista detalle
  if (vista === "detalle" && registroSeleccionado) {
    const r = registroSeleccionado;
    return (
      <div className="min-h-screen bg-[#F5F4F0] flex flex-col items-center justify-start p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm overflow-hidden">
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

          <div className="border-t border-gray-100 grid grid-cols-4">
            {[["🟡", "Crea", "/"], ["📅", "Calendario", "/calendario"], ["🕐", "Historial", "/historial"], ["⚙️", "Maestras", "/maestras"]].map(([icon, label, href]) => (
              <button key={label} onClick={() => router.push(href)} className={`flex flex-col items-center py-3 gap-1 text-xs ${label === "Historial" ? "text-[#534AB7] font-medium" : "text-gray-400"}`}>
                <span className="text-lg">{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Vista resultados
  if (vista === "resultados") {
    return (
      <div className="min-h-screen bg-[#F5F4F0] flex flex-col items-center justify-start p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-center gap-3">
            <button onClick={() => { setVista("filtros"); setIdsIA(null); }} className="text-gray-400 text-lg">←</button>
            <div className="flex-1">
              <h1 className="text-base font-semibold text-gray-900">Resultados</h1>
              <p className="text-xs text-gray-400">{resultados.length} registros{idsIA ? " · búsqueda IA ✨" : ""}</p>
            </div>
            <button onClick={() => { setVista("filtros"); setIdsIA(null); }} className="text-xs text-[#534AB7]">⚙ Filtros</button>
          </div>
          <div className="px-5 py-4 space-y-2">
            <div className="flex gap-2 flex-wrap mb-2">
              {filtroTipo !== "Todos" && !idsIA && <span className="text-xs px-3 py-1 rounded-full bg-[#EEEDFE] border border-[#534AB7] text-[#3C3489]">{filtroTipo} ×</span>}
              {filtroComunidad !== "Todas" && !idsIA && <span className="text-xs px-3 py-1 rounded-full bg-[#EEEDFE] border border-[#534AB7] text-[#3C3489]">{filtroComunidad} ×</span>}
              {filtroEstado !== "Todos" && !idsIA && <span className="text-xs px-3 py-1 rounded-full bg-[#EEEDFE] border border-[#534AB7] text-[#3C3489]">{filtroEstado} ×</span>}
              {idsIA && <span className="text-xs px-3 py-1 rounded-full bg-[#EEEDFE] border border-[#534AB7] text-[#3C3489]">✨ "{busqueda}"</span>}
            </div>
            {resultados.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No hay registros con estos filtros</p>
            ) : (
              resultados.map((r) => (
                <button key={r.id} onClick={() => { setRegistroSeleccionado(r); setVista("detalle"); }} className="w-full text-left bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 hover:border-[#534AB7] transition-all">
                  <p className={`text-xs font-medium mb-1 ${r.tipo === "mantenimiento" ? "text-[#534AB7]" : "text-[#0F6E56]"}`}>#{r.id.slice(0,8).toUpperCase()}</p>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{r.descripcion || "Sin descripción"}</p>
                      <p className="text-xs text-gray-400">{r.comunidad} · {r.persona}</p>
                    </div>
                    {badgeEstado(r.estado)}
                  </div>
                </button>
              ))
            )}
          </div>
          <div className="border-t border-gray-100 grid grid-cols-4">
            {[["🟡", "Crea", "/"], ["📅", "Calendario", "/calendario"], ["🕐", "Historial", "/historial"], ["⚙️", "Maestras", "/maestras"]].map(([icon, label, href]) => (
              <button key={label} onClick={() => router.push(href)} className={`flex flex-col items-center py-3 gap-1 text-xs ${label === "Historial" ? "text-[#534AB7] font-medium" : "text-gray-400"}`}>
                <span className="text-lg">{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Vista filtros
  return (
    <div className="min-h-screen bg-[#F5F4F0] flex flex-col items-center justify-start p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-gray-900">Buscar en historial</h1>
          <button onClick={() => { setFiltroTipo("Todos"); setFiltroComunidad("Todas"); setFiltroEstado("Todos"); setBusqueda(""); setIdsIA(null); }} className="text-xs text-gray-400">Limpiar</button>
        </div>
        <div className="px-5 py-5 space-y-4">
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
                } catch (e) {
                  console.error(e);
                }
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

        <div className="border-t border-gray-100 grid grid-cols-4">
          {[["🟡", "Crea", "/"], ["📅", "Calendario", "/calendario"], ["🕐", "Historial", "/historial"], ["⚙️", "Maestras", "/maestras"]].map(([icon, label, href]) => (
            <button key={label} onClick={() => router.push(href)} className={`flex flex-col items-center py-3 gap-1 text-xs ${label === "Historial" ? "text-[#534AB7] font-medium" : "text-gray-400"}`}>
              <span className="text-lg">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}