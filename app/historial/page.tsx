"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const REGISTROS = [
  { id: "MNT-0051", titulo: "Revisar lavadora", comunidad: "Abrantes L1", espacio: "Cocina", persona: "Luis Martín", fecha: "29 may 2026", tipo: "mantenimiento", urgencia: "Media", estado: "Resuelto", gasto: "47,50 €", comentario: "Correa de lavadora desgastada, se sustituyó. Revisar en 3 meses.", subcategoria: "Electrodoméstico" },
  { id: "PRM-0023", titulo: "Cambio sofá 3 plazas", comunidad: "Fuencarral 29C", espacio: "Salón", persona: "Sara García", fecha: "20 may 2026", tipo: "permanente", urgencia: null, estado: "Hecho", gasto: "650 €", comentario: "Sofá anterior deteriorado, sustituido por esquinero Westwing.", subcategoria: "Mobiliario" },
  { id: "MNT-0047", titulo: "Humedad en baño", comunidad: "Viñuelas L3", espacio: "Baño", persona: "Sara García", fecha: "28 may 2026", tipo: "mantenimiento", urgencia: "Alta", estado: "Pendiente", gasto: null, comentario: "Humedad visible en techo, revisar junta de ducha.", subcategoria: "Fontanería" },
  { id: "MNT-0039", titulo: "Pintura salón", comunidad: "Olvido L2", espacio: "Salón", persona: "Ana Molina", fecha: "15 may 2026", tipo: "mantenimiento", urgencia: "Leve", estado: "Resuelto", gasto: "120 €", comentario: "", subcategoria: "Albañilería" },
  { id: "PRM-0019", titulo: "Cambio cortinas salón", comunidad: "Fuencarral 29C", espacio: "Salón", persona: "Ana Molina", fecha: "10 may 2026", tipo: "permanente", urgencia: null, estado: "Hecho", gasto: "85 €", comentario: "", subcategoria: "Decoración" },
  { id: "MNT-0033", titulo: "Grifo cocina", comunidad: "Abrantes L2", espacio: "Cocina", persona: "Pedro Ruiz", fecha: "5 may 2026", tipo: "mantenimiento", urgencia: "Media", estado: "Resuelto", gasto: "95 €", comentario: "Grifo monomando sustituido.", subcategoria: "Fontanería" },
];

export default function Historial() {
  const router = useRouter();
  const [vista, setVista] = useState<"filtros" | "resultados" | "detalle">("filtros");
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [filtroComunidad, setFiltroComunidad] = useState("Todas");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [registroSeleccionado, setRegistroSeleccionado] = useState<typeof REGISTROS[0] | null>(null);

  const resultados = REGISTROS.filter((r) => {
    if (filtroTipo !== "Todos" && r.tipo !== filtroTipo.toLowerCase()) return false;
    if (filtroComunidad !== "Todas" && !r.comunidad.includes(filtroComunidad)) return false;
    if (filtroEstado !== "Todos" && r.estado !== filtroEstado) return false;
    if (busqueda && !r.titulo.toLowerCase().includes(busqueda.toLowerCase()) && !r.id.toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  const badgeEstado = (estado: string) => {
    if (estado === "Resuelto" || estado === "Hecho") return <span className="text-xs px-2 py-0.5 rounded-full bg-[#E1F5EE] text-[#085041] font-medium">{estado}</span>;
    if (estado === "Pendiente") return <span className="text-xs px-2 py-0.5 rounded-full bg-[#FCEBEB] text-[#A32D2D] font-medium">{estado}</span>;
    return null;
  };

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
              <p className="text-xs text-gray-400">#{r.id}</p>
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
                ["Fecha", r.fecha],
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
                  <p className="text-base font-semibold text-gray-900">{r.gasto}</p>
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
            <button onClick={() => setVista("filtros")} className="text-gray-400 text-lg">←</button>
            <div className="flex-1">
              <h1 className="text-base font-semibold text-gray-900">Resultados</h1>
              <p className="text-xs text-gray-400">{resultados.length} registros</p>
            </div>
            <button onClick={() => setVista("filtros")} className="text-xs text-[#534AB7]">⚙ Filtros</button>
          </div>
          <div className="px-5 py-4 space-y-2">
            {/* Filtros activos */}
            <div className="flex gap-2 flex-wrap mb-2">
              {filtroTipo !== "Todos" && <span className="text-xs px-3 py-1 rounded-full bg-[#EEEDFE] border border-[#534AB7] text-[#3C3489]">{filtroTipo} ×</span>}
              {filtroComunidad !== "Todas" && <span className="text-xs px-3 py-1 rounded-full bg-[#EEEDFE] border border-[#534AB7] text-[#3C3489]">{filtroComunidad} ×</span>}
              {filtroEstado !== "Todos" && <span className="text-xs px-3 py-1 rounded-full bg-[#EEEDFE] border border-[#534AB7] text-[#3C3489]">{filtroEstado} ×</span>}
            </div>
            {resultados.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No hay registros con estos filtros</p>
            ) : (
              resultados.map((r) => (
                <button key={r.id} onClick={() => { setRegistroSeleccionado(r); setVista("detalle"); }} className="w-full text-left bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 hover:border-[#534AB7] transition-all">
                  <p className={`text-xs font-medium mb-1 ${r.tipo === "mantenimiento" ? "text-[#534AB7]" : "text-[#0F6E56]"}`}>#{r.id}</p>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{r.titulo}</p>
                      <p className="text-xs text-gray-400">{r.comunidad} · {r.persona} · {r.fecha}</p>
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
          <button onClick={() => { setFiltroTipo("Todos"); setFiltroComunidad("Todas"); setFiltroEstado("Todos"); setBusqueda(""); }} className="text-xs text-gray-400">Limpiar</button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Ref. #MNT-0047, palabra clave…" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700" />

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