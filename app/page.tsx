"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();
  const [miembros, setMiembros] = useState<any[]>([]);
  const [comunidades, setComunidades] = useState<any[]>([]);
  const [espacios, setEspacios] = useState<any[]>([]);
  const [miembro, setMiembro] = useState("");
  const [comunidad, setComunidad] = useState("");
  const [area, setArea] = useState("");
  const [espacio, setEspacio] = useState("");
  const [tipo, setTipo] = useState<"mantenimiento" | "permanente">("mantenimiento");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      const [{ data: m }, { data: c }, { data: e }] = await Promise.all([
        supabase.from("miembros").select("*").order("nombre"),
        supabase.from("comunidades").select("*").order("nombre"),
        supabase.from("espacios").select("*").order("nombre"),
      ]);
      if (m) setMiembros(m);
      if (c) setComunidades(c);
      if (e) setEspacios(e);
      setCargando(false);
    };
    cargar();
  }, []);

  const comunidadObj = comunidades.find((c) => c.nombre === comunidad);
  const areaOpciones = comunidadObj
    ? [...(comunidadObj.zonas_comunes ? ["Zonas comunes"] : []), ...(comunidadObj.pisos || [])]
    : [];

  if (cargando) return (
    <div className="min-h-screen bg-[#F5F4F0] flex items-center justify-center">
      <p className="text-gray-400 text-sm">Cargando...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F4F0] flex flex-col items-center justify-start p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex justify-between items-start">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Patrimonia Care</h1>
            <p className="text-sm text-gray-400">{new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}</p>
          </div>
          <button className="text-gray-400 hover:text-gray-600">🔔</button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div>
            <p className="text-xl font-semibold text-gray-900">¡Holaaaaa,</p>
            <p className="text-sm text-gray-400">¿quién eres y dónde estás hoy?</p>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">¿Quién eres?</label>
            <select value={miembro} onChange={(e) => setMiembro(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 appearance-none">
              <option value="">Selecciona un miembro</option>
              {miembros.map((m) => <option key={m.id} value={m.nombre}>{m.nombre} — {m.rol}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">¿En qué comunidad?</label>
            <select value={comunidad} onChange={(e) => { setComunidad(e.target.value); setArea(""); }} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 appearance-none">
              <option value="">Elige comunidad</option>
              {comunidades.map((c) => <option key={c.id} value={c.nombre}>{c.nombre}{c.prime ? " ✦" : ""}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">¿En qué área?</label>
            <select value={area} onChange={(e) => setArea(e.target.value)} disabled={!comunidad} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 appearance-none disabled:opacity-40">
              <option value="">Zonas comunes / piso concreto</option>
              {areaOpciones.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">¿En qué espacio?</label>
            <select value={espacio} onChange={(e) => setEspacio(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 appearance-none">
              <option value="">General, baño, cocina…</option>
              {espacios.map((e) => <option key={e.id} value={e.nombre}>{e.nombre}</option>)}
            </select>
          </div>

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

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button onClick={() => {
              const params = new URLSearchParams({
                miembro: miembro || "",
                comunidad: comunidad || "",
                area: area || "",
                espacio: espacio || "",
              });
              router.push(`/alerta?${params.toString()}`);
            }} className="w-full px-4 py-3 bg-[#FAEEDA] border border-[#EF9F27] text-[#854F0B] rounded-xl text-sm font-semibold hover:bg-[#F5E0C0] transition-all">
              🔔 Crear alerta
            </button>
            <button onClick={() => {
              const params = new URLSearchParams({
                miembro: miembro || "",
                comunidad: comunidad || "",
                area: area || "",
                espacio: espacio || "",
              });
              router.push(`${tipo === "permanente" ? "/permanente" : "/mantenimiento"}?${params.toString()}`);
            }} className="w-full px-4 py-3 bg-[#534AB7] text-white rounded-xl text-sm font-semibold hover:bg-[#3C3489] transition-all">
              + Crear registro
            </button>
          </div>
        </div>

        <div className="border-t border-gray-100 grid grid-cols-4">
          {[["🟡", "Crea", "/"], ["📅", "Calendario", "/calendario"], ["🕐", "Historial", "/historial"], ["⚙️", "Maestras", "/maestras"]].map(([icon, label, href]) => (
            <button key={label} onClick={() => router.push(href)} className={`flex flex-col items-center py-3 gap-1 text-xs ${label === "Crea" ? "text-[#534AB7] font-medium" : "text-gray-400"}`}>
              <span className="text-lg">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
