"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AppLayout from "@/components/AppLayout";

export default function Inicio() {
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
      const miembroGuardado = localStorage.getItem("miembro");
      if (miembroGuardado) setMiembro(miembroGuardado);
      setCargando(false);
    };
    cargar();
  }, []);

  const comunidadObj = comunidades.find((c) => c.nombre === comunidad);
  const areaOpciones = comunidadObj
    ? [...(comunidadObj.zonas_comunes ? ["Zonas comunes"] : []), ...(comunidadObj.pisos || [])]
    : [];

  const puedeActuar = !!miembro && !!comunidad;

  if (cargando) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 text-sm">Cargando...</p>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Holaaaaa!</h1>
          <p className="text-sm text-gray-400">Quien eres y donde estas hoy?</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Identificate</p>

            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">
                Quien eres? <span className="text-[#E8614A]">*</span>
              </label>
              <select value={miembro} onChange={(e) => {
                setMiembro(e.target.value);
                localStorage.setItem("miembro", e.target.value);
              }} className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm text-gray-700 appearance-none focus:outline-none ${!miembro ? "border-gray-200" : "border-[#E8614A]"}`}>
                <option value="">Selecciona un miembro</option>
                {miembros.map((m) => <option key={m.id} value={m.nombre}>{m.nombre} -- {m.rol}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">
                En que comunidad? <span className="text-[#E8614A]">*</span>
              </label>
              <select value={comunidad} onChange={(e) => { setComunidad(e.target.value); setArea(""); }} className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm text-gray-700 appearance-none focus:outline-none ${!comunidad ? "border-gray-200" : "border-[#E8614A]"}`}>
                <option value="">Elige comunidad</option>
                {comunidades.map((c) => <option key={c.id} value={c.nombre}>{c.nombre}{c.prime ? " *" : ""}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">En que area?</label>
              <select value={area} onChange={(e) => setArea(e.target.value)} disabled={!comunidad} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 appearance-none disabled:opacity-40 focus:outline-none focus:border-[#E8614A]">
                <option value="">Zonas comunes / piso concreto</option>
                {areaOpciones.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">En que espacio?</label>
              <select value={espacio} onChange={(e) => setEspacio(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 appearance-none focus:outline-none focus:border-[#E8614A]">
                <option value="">General, bano, cocina...</option>
                {espacios.map((e) => <option key={e.id} value={e.nombre}>{e.nombre}</option>)}
              </select>
            </div>

            {!puedeActuar && (
              <p className="text-xs text-gray-400">* Selecciona miembro y comunidad para continuar</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Que vas a hacer?</p>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setTipo("mantenimiento")} className={`py-4 rounded-xl text-sm font-medium border transition-all flex flex-col items-center gap-2 ${tipo === "mantenimiento" ? "bg-[#FDF0ED] border-[#E8614A] text-[#C44A35]" : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"}`}>
                  <span className="text-2xl">🔧</span>
                  Mantenimiento
                </button>
                <button onClick={() => setTipo("permanente")} className={`py-4 rounded-xl text-sm font-medium border transition-all flex flex-col items-center gap-2 ${tipo === "permanente" ? "bg-[#E1F5EE] border-[#1D9E75] text-[#085041]" : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"}`}>
                  <span className="text-2xl">🪑</span>
                  Permanente
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button onClick={() => {
                  const params = new URLSearchParams({ miembro, comunidad, area, espacio });
                  router.push(`/alerta?${params.toString()}`);
                }} disabled={!puedeActuar} className="w-full px-4 py-3 bg-[#FAEEDA] border border-[#EF9F27] text-[#854F0B] rounded-xl text-sm font-semibold hover:bg-[#F5E0C0] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  Crear alerta
                </button>
                <button onClick={() => {
                  const params = new URLSearchParams({ miembro, comunidad, area, espacio });
                  router.push(`${tipo === "permanente" ? "/permanente" : "/mantenimiento"}?${params.toString()}`);
                }} disabled={!puedeActuar} className="w-full px-4 py-3 bg-[#E8614A] text-white rounded-xl text-sm font-semibold hover:bg-[#C44A35] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  + Crear registro
                </button>
              </div>
            </div>

            {miembro && comunidad && (
              <div className="bg-[#FDF0ED] rounded-2xl border border-[#F5C4BB] p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#E8614A] mb-3">Listo para empezar</p>
                <div className="space-y-2">
                  <div className="flex gap-2 text-sm"><span className="text-[#E8614A] font-medium w-20">Persona</span><span className="text-[#C44A35]">{miembro}</span></div>
                  <div className="flex gap-2 text-sm"><span className="text-[#E8614A] font-medium w-20">Comunidad</span><span className="text-[#C44A35]">{comunidad}{area ? ` · ${area}` : ""}</span></div>
                  {espacio && <div className="flex gap-2 text-sm"><span className="text-[#E8614A] font-medium w-20">Espacio</span><span className="text-[#C44A35]">{espacio}</span></div>}
                  <div className="flex gap-2 text-sm"><span className="text-[#E8614A] font-medium w-20">Tipo</span><span className="text-[#C44A35]">{tipo === "mantenimiento" ? "Mantenimiento" : "Permanente"}</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}