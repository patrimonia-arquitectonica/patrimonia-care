"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const MIEMBROS = ["Sara García", "Luis Martín", "Ana Molina", "Pedro Ruiz"];
const COMUNIDADES = [
  { nombre: "Pico Peña", pisos: ["L2", "L4"], zonas: true },
  { nombre: "Centro", pisos: ["Fuencarral 29C", "Gracia 18"], zonas: false },
  { nombre: "Viñuelas", pisos: ["L1","L2","L3","L4","L5","L6","L7"], zonas: true },
  { nombre: "Abrantes", pisos: ["L1", "L2"], zonas: true },
  { nombre: "Olvido", pisos: ["L1", "L2"], zonas: true },
  { nombre: "Leoncio", pisos: ["DR1", "DR2", "DR4"], zonas: true },
];
const ESPACIOS = ["General", "Baño", "Cocina", "Salón", "Dormitorio", "Terraza", "Patio"];

export default function Home() {
  const router = useRouter();
  const [miembro, setMiembro] = useState("");
  const [comunidad, setComunidad] = useState("");
  const [area, setArea] = useState("");
  const [espacio, setEspacio] = useState("");
  const [tipo, setTipo] = useState<"mantenimiento" | "permanente">("mantenimiento");

  const comunidadObj = COMUNIDADES.find((c) => c.nombre === comunidad);
  const areaOpciones = comunidadObj
    ? [...(comunidadObj.zonas ? ["Zonas comunes"] : []), ...comunidadObj.pisos]
    : [];

  return (
    <div className="min-h-screen bg-[#F5F4F0] flex flex-col items-center justify-start p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex justify-between items-start">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Patrimonia Care</h1>
            <p className="text-sm text-gray-400">{new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}</p>
          </div>
          <button className="text-gray-400 hover:text-gray-600">🔔</button>
        </div>

        {/* Contenido */}
        <div className="px-5 py-5 space-y-4">
          <div>
            <p className="text-xl font-semibold text-gray-900">¡Holaaaaa,</p>
            <p className="text-sm text-gray-400">¿quién eres y dónde estás hoy?</p>
          </div>

          {/* Quién */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">¿Quién eres?</label>
            <select value={miembro} onChange={(e) => setMiembro(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 appearance-none">
              <option value="">Selecciona un miembro</option>
              {MIEMBROS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>

          {/* Comunidad */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">¿En qué comunidad?</label>
            <select value={comunidad} onChange={(e) => { setComunidad(e.target.value); setArea(""); }} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 appearance-none">
              <option value="">Elige comunidad</option>
              {COMUNIDADES.map((c) => <option key={c.nombre}>{c.nombre}</option>)}
            </select>
          </div>

          {/* Área */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">¿En qué área?</label>
            <select value={area} onChange={(e) => setArea(e.target.value)} disabled={!comunidad} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 appearance-none disabled:opacity-40">
              <option value="">Zonas comunes / piso concreto</option>
              {areaOpciones.map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>

          {/* Espacio */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">¿En qué espacio?</label>
            <select value={espacio} onChange={(e) => setEspacio(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 appearance-none">
              <option value="">General, baño, cocina…</option>
              {ESPACIOS.map((e) => <option key={e}>{e}</option>)}
            </select>
          </div>

          {/* Tipo */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 block">¿Qué vas a hacer?</label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setTipo("mantenimiento")} className={`py-3 rounded-xl text-sm font-medium border transition-all ${tipo === "mantenimiento" ? "bg-[#EEEDFE] border-[#534AB7] text-[#3C3489]" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
                🔧 Mantenimiento
              </button>
              <button onClick={() => setTipo("permanente")} className={`py-3 rounded-xl text-sm font-medium border transition-all ${tipo === "permanente" ? "bg-[#E1F5EE] border-[#1D9E75] text-[#085041]" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
                🪑 Permanente
              </button>
            </div>
          </div>

          {/* Acciones */}
          <div className="space-y-2 pt-1">
            <button className="w-full flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-100 transition-all">
              🕐 Cotillear historial
            </button>
            <button className="w-full flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-100 transition-all">
              🔔 Crear alerta
            </button>
            <button onClick={() => router.push(tipo === "permanente" ? "/permanente" : "/mantenimiento")} className="w-full px-4 py-3 bg-[#534AB7] text-white rounded-xl text-sm font-semibold hover:bg-[#3C3489] transition-all">
              + Crear registro
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="border-t border-gray-100 grid grid-cols-4">
          {[["🟡", "Crea"], ["📅", "Calendario"], ["🕐", "Historial"], ["⚙️", "Maestras"]].map(([icon, label]) => (
            <button key={label} className={`flex flex-col items-center py-3 gap-1 text-xs ${label === "Crea" ? "text-[#534AB7] font-medium" : "text-gray-400"}`}>
              <span className="text-lg">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
