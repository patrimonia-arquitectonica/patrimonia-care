"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const MIEMBROS_INIT = [
  { nombre: "Sara García", rol: "Gestora", iniciales: "SG", color: "bg-[#EEEDFE] text-[#3C3489]" },
  { nombre: "Luis Martín", rol: "Técnico", iniciales: "LM", color: "bg-[#E1F5EE] text-[#085041]" },
  { nombre: "Ana Molina", rol: "Limpieza", iniciales: "AM", color: "bg-[#FAEEDA] text-[#854F0B]" },
  { nombre: "Pedro Ruiz", rol: "Gestor", iniciales: "PR", color: "bg-[#FAECE7] text-[#712B13]" },
];

const COMUNIDADES = [
  { nombre: "Viñuelas", pisos: 7, zonas: true, color: "#534AB7", prime: false },
  { nombre: "Centro", pisos: 2, zonas: false, color: "#BA7517", prime: true },
  { nombre: "Abrantes", pisos: 2, zonas: true, color: "#1D9E75", prime: false },
  { nombre: "Olvido", pisos: 2, zonas: true, color: "#D85A30", prime: false },
  { nombre: "Leoncio", pisos: 3, zonas: true, color: "#D4537E", prime: false },
  { nombre: "Pico Peña", pisos: 2, zonas: true, color: "#378ADD", prime: false },
];

const ESPACIOS_INIT = ["General", "Baño", "Cocina", "Salón", "Dormitorio", "Terraza", "Patio"];
const CATEGORIAS_INIT = ["Albañilería", "Carpintería", "Fontanería", "Limpieza", "Electricidad"];

export default function Maestras() {
  const router = useRouter();
  const [miembros, setMiembros] = useState(MIEMBROS_INIT);
  const [espacios, setEspacios] = useState(ESPACIOS_INIT);
  const [categorias, setCategorias] = useState(CATEGORIAS_INIT);
  const [nuevoEspacio, setNuevoEspacio] = useState("");
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [mostrarFormEspacio, setMostrarFormEspacio] = useState(false);
  const [mostrarFormCategoria, setMostrarFormCategoria] = useState(false);
  const [editandoMiembro, setEditandoMiembro] = useState<typeof MIEMBROS_INIT[0] | null>(null);

  // Vista editar miembro
  if (editandoMiembro) {
    return (
      <div className="min-h-screen bg-[#F5F4F0] flex flex-col items-center justify-start p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-center gap-3">
            <button onClick={() => setEditandoMiembro(null)} className="text-gray-400 text-lg">←</button>
            <h1 className="text-base font-semibold text-gray-900 flex-1">Editar miembro</h1>
          </div>
          <div className="px-5 py-5 space-y-4">
            <div className="flex flex-col items-center gap-2 mb-2">
              <div className={`w-14 h-14 rounded-full ${editandoMiembro.color} flex items-center justify-center text-lg font-semibold`}>{editandoMiembro.iniciales}</div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Nombre</label>
              <input type="text" defaultValue={editandoMiembro.nombre} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700" />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 block">Rol</label>
              <div className="flex gap-2 flex-wrap">
                {["Gestor", "Técnico", "Limpieza"].map((r) => (
                  <button key={r} className={`px-4 py-2 rounded-full text-xs border transition-all ${editandoMiembro.rol === r ? "bg-[#EEEDFE] border-[#534AB7] text-[#3C3489] font-medium" : "bg-gray-50 border-gray-200 text-gray-500"}`}>{r}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 block">Comunidades asignadas</label>
              <div className="flex gap-2 flex-wrap">
                {COMUNIDADES.map((c) => (
                  <button key={c.nombre} className="px-3 py-1.5 rounded-full text-xs border bg-gray-50 border-gray-200 text-gray-500">{c.nombre}</button>
                ))}
              </div>
            </div>

            <button onClick={() => setEditandoMiembro(null)} className="w-full py-3 bg-[#1D9E75] text-white rounded-xl text-sm font-semibold">
              Guardar cambios
            </button>
            <button onClick={() => { setMiembros(miembros.filter((m) => m.nombre !== editandoMiembro.nombre)); setEditandoMiembro(null); }} className="w-full py-3 bg-white border border-[#F09595] text-[#A32D2D] rounded-xl text-sm">
              Eliminar miembro
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F4F0] flex flex-col items-center justify-start p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <h1 className="text-lg font-semibold text-gray-900">Listas maestras</h1>
          <p className="text-sm text-gray-400">Configuración base</p>
        </div>

        <div className="px-5 py-5 space-y-6">

          {/* EQUIPO */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">👥 Equipo</p>
              <button className="text-xs text-[#534AB7] border border-dashed border-[#AFA9EC] px-3 py-1 rounded-full">+ Añadir</button>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden">
              {miembros.map((m, i) => (
                <div key={m.nombre} className={`flex items-center gap-3 px-4 py-3 ${i < miembros.length - 1 ? "border-b border-gray-100" : ""}`}>
                  <div className={`w-9 h-9 rounded-full ${m.color} flex items-center justify-center text-xs font-semibold flex-shrink-0`}>{m.iniciales}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{m.nombre}</p>
                    <p className="text-xs text-gray-400">{m.rol}</p>
                  </div>
                  <button onClick={() => setEditandoMiembro(m)} className="text-gray-300 hover:text-gray-500 text-sm">✎</button>
                  <button onClick={() => setMiembros(miembros.filter((x) => x.nombre !== m.nombre))} className="text-gray-300 hover:text-red-400 text-sm">✕</button>
                </div>
              ))}
            </div>
          </div>

          {/* COMUNIDADES */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">🏢 Comunidades</p>
              <button className="text-xs text-[#534AB7] border border-dashed border-[#AFA9EC] px-3 py-1 rounded-full">+ Añadir</button>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden">
              {COMUNIDADES.map((c, i) => (
                <div key={c.nombre} className={`flex items-center gap-3 px-4 py-3 ${i < COMUNIDADES.length - 1 ? "border-b border-gray-100" : ""}`}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-800">{c.nombre}</p>
                      {c.prime && <span className="text-xs px-2 py-0.5 rounded-full bg-[#FAEEDA] border border-[#EF9F27] text-[#854F0B] font-medium">✦ prime</span>}
                    </div>
                    <p className="text-xs text-gray-400">{c.pisos} pisos{c.zonas ? " · zonas comunes" : ""}</p>
                  </div>
                  <span className="text-gray-300 text-sm">›</span>
                </div>
              ))}
            </div>
          </div>

          {/* ESPACIOS */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">🚪 Espacios</p>
              <button onClick={() => setMostrarFormEspacio(!mostrarFormEspacio)} className="text-xs text-[#534AB7] border border-dashed border-[#AFA9EC] px-3 py-1 rounded-full">+ Añadir</button>
            </div>
            {mostrarFormEspacio && (
              <div className="flex gap-2 mb-2">
                <input type="text" value={nuevoEspacio} onChange={(e) => setNuevoEspacio(e.target.value)} placeholder="Ej: Garaje" className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm" />
                <button onClick={() => { if (nuevoEspacio) { setEspacios([...espacios, nuevoEspacio]); setNuevoEspacio(""); setMostrarFormEspacio(false); } }} className="px-4 py-2 bg-[#534AB7] text-white rounded-xl text-sm">✓</button>
              </div>
            )}
            <div className="flex gap-2 flex-wrap">
              {espacios.map((e) => (
                <div key={e} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-xs text-gray-600">
                  {e}
                  <button onClick={() => setEspacios(espacios.filter((x) => x !== e))} className="text-gray-300 hover:text-red-400 ml-1">×</button>
                </div>
              ))}
            </div>
          </div>

          {/* CATEGORÍAS */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">🏷️ Categorías</p>
              <button onClick={() => setMostrarFormCategoria(!mostrarFormCategoria)} className="text-xs text-[#534AB7] border border-dashed border-[#AFA9EC] px-3 py-1 rounded-full">+ Añadir</button>
            </div>
            {mostrarFormCategoria && (
              <div className="flex gap-2 mb-2">
                <input type="text" value={nuevaCategoria} onChange={(e) => setNuevaCategoria(e.target.value)} placeholder="Ej: Climatización" className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm" />
                <button onClick={() => { if (nuevaCategoria) { setCategorias([...categorias, nuevaCategoria]); setNuevaCategoria(""); setMostrarFormCategoria(false); } }} className="px-4 py-2 bg-[#534AB7] text-white rounded-xl text-sm">✓</button>
              </div>
            )}
            <div className="flex gap-2 flex-wrap">
              {categorias.map((c) => (
                <div key={c} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#EEEDFE] border border-[#AFA9EC] text-xs text-[#3C3489]">
                  {c}
                  <button onClick={() => setCategorias(categorias.filter((x) => x !== c))} className="text-[#AFA9EC] hover:text-red-400 ml-1">×</button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Tab bar */}
        <div className="border-t border-gray-100 grid grid-cols-4">
          {[["🟡", "Crea", "/"], ["📅", "Calendario", "/calendario"], ["🕐", "Historial", "/historial"], ["⚙️", "Maestras", "/maestras"]].map(([icon, label, href]) => (
            <button key={label} onClick={() => router.push(href)} className={`flex flex-col items-center py-3 gap-1 text-xs ${label === "Maestras" ? "text-[#534AB7] font-medium" : "text-gray-400"}`}>
              <span className="text-lg">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}