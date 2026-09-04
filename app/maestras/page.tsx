"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AppLayout from "@/components/AppLayout";

const COLORES_MIEMBRO = [
  { id: "purple", label: "Morado", bg: "bg-[#EEEDFE] text-[#3C3489]", dot: "#534AB7" },
  { id: "teal", label: "Verde", bg: "bg-[#E1F5EE] text-[#085041]", dot: "#1D9E75" },
  { id: "amber", label: "Ámbar", bg: "bg-[#FAEEDA] text-[#854F0B]", dot: "#EF9F27" },
  { id: "coral", label: "Coral", bg: "bg-[#FAECE7] text-[#712B13]", dot: "#D85A30" },
  { id: "yellow", label: "Rosa", bg: "bg-[#FBEAF0] text-[#72243E]", dot: "#D4537E" },
];

const colorAvatar = (color: string) =>
  COLORES_MIEMBRO.find((c) => c.id === color)?.bg || "bg-gray-100 text-gray-600";

export default function Maestras() {
  const [miembros, setMiembros] = useState<any[]>([]);
  const [comunidades, setComunidades] = useState<any[]>([]);
  const [espacios, setEspacios] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  const [nuevoEspacio, setNuevoEspacio] = useState("");
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [mostrarFormEspacio, setMostrarFormEspacio] = useState(false);
  const [mostrarFormCategoria, setMostrarFormCategoria] = useState(false);

  const [mostrarFormMiembro, setMostrarFormMiembro] = useState(false);
  const [nuevoMiembro, setNuevoMiembro] = useState({ nombre: "", iniciales: "", rol: "Técnico", color: "purple" });

  const [mostrarFormComunidad, setMostrarFormComunidad] = useState(false);
  const [nuevaComunidad, setNuevaComunidad] = useState({ nombre: "", color: "#378ADD", prime: false, zonas_comunes: true, pisos: [] as string[] });
  const [nuevaVivienda, setNuevaVivienda] = useState("");

  const [editandoMiembro, setEditandoMiembro] = useState<any | null>(null);
  const [editandoComunidad, setEditandoComunidad] = useState<any | null>(null);
  const [nuevaViviendaEdit, setNuevaViviendaEdit] = useState("");
  const [guardandoMiembro, setGuardandoMiembro] = useState(false);
  const [guardandoComunidad, setGuardandoComunidad] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      const [{ data: m }, { data: c }, { data: e }, { data: cat }] = await Promise.all([
        supabase.from("miembros").select("*").order("nombre"),
        supabase.from("comunidades").select("*").order("nombre"),
        supabase.from("espacios").select("*").order("nombre"),
        supabase.from("categorias").select("*").order("nombre"),
      ]);
      if (m) setMiembros(m);
      if (c) setComunidades(c);
      if (e) setEspacios(e);
      if (cat) setCategorias(cat);
      setCargando(false);
    };
    cargar();
  }, []);

  const eliminarMiembro = async (id: string) => {
    const { error: err } = await supabase.from("miembros").delete().eq("id", id);
    if (err) { setError("No se pudo eliminar. Inténtalo de nuevo."); return; }
    setError(null);
    setMiembros(miembros.filter((m) => m.id !== id));
  };

  const guardarMiembro = async () => {
    if (!editandoMiembro) return;
    setGuardandoMiembro(true);
    const { error } = await supabase.from("miembros").update({
      nombre: editandoMiembro.nombre,
      iniciales: editandoMiembro.iniciales,
      rol: editandoMiembro.rol,
      color: editandoMiembro.color,
    }).eq("id", editandoMiembro.id);
    if (!error) {
      setMiembros(miembros.map((m) => m.id === editandoMiembro.id ? editandoMiembro : m));
      setEditandoMiembro(null);
    }
    setGuardandoMiembro(false);
  };

  const guardarComunidad = async () => {
    if (!editandoComunidad) return;
    setGuardandoComunidad(true);
    const { error } = await supabase.from("comunidades").update({
      nombre: editandoComunidad.nombre,
      color: editandoComunidad.color,
      prime: editandoComunidad.prime,
      zonas_comunes: editandoComunidad.zonas_comunes,
      pisos: editandoComunidad.pisos || [],
    }).eq("id", editandoComunidad.id);
    if (!error) {
      setComunidades(comunidades.map((c) => c.id === editandoComunidad.id ? editandoComunidad : c));
      setEditandoComunidad(null);
    }
    setGuardandoComunidad(false);
  };

  const eliminarEspacio = async (id: string) => {
    const { error: err } = await supabase.from("espacios").delete().eq("id", id);
    if (err) { setError("No se pudo eliminar. Inténtalo de nuevo."); return; }
    setError(null);
    setEspacios(espacios.filter((e) => e.id !== id));
  };

  const eliminarCategoria = async (id: string) => {
    const { error: err } = await supabase.from("categorias").delete().eq("id", id);
    if (err) { setError("No se pudo eliminar. Inténtalo de nuevo."); return; }
    setError(null);
    setCategorias(categorias.filter((c) => c.id !== id));
  };

  const añadirEspacio = async () => {
    if (!nuevoEspacio) return;
    const { data, error: err } = await supabase.from("espacios").insert({ nombre: nuevoEspacio }).select().single();
    if (err) { setError("No se pudo guardar. Inténtalo de nuevo."); return; }
    setError(null);
    if (data) setEspacios([...espacios, data]);
    setNuevoEspacio(""); setMostrarFormEspacio(false);
  };

  const añadirCategoria = async () => {
    if (!nuevaCategoria) return;
    const { data, error: err } = await supabase.from("categorias").insert({ nombre: nuevaCategoria }).select().single();
    if (err) { setError("No se pudo guardar. Inténtalo de nuevo."); return; }
    setError(null);
    if (data) setCategorias([...categorias, data]);
    setNuevaCategoria(""); setMostrarFormCategoria(false);
  };

  const añadirMiembro = async () => {
    if (!nuevoMiembro.nombre || !nuevoMiembro.iniciales) return;
    const { data, error: err } = await supabase.from("miembros").insert(nuevoMiembro).select().single();
    if (err) { setError("No se pudo guardar. Inténtalo de nuevo."); return; }
    setError(null);
    if (data) setMiembros([...miembros, data].sort((a, b) => a.nombre.localeCompare(b.nombre)));
    setNuevoMiembro({ nombre: "", iniciales: "", rol: "Técnico", color: "purple" });
    setMostrarFormMiembro(false);
  };

  const añadirComunidad = async () => {
    if (!nuevaComunidad.nombre) return;
    const { data, error: err } = await supabase.from("comunidades").insert({ ...nuevaComunidad }).select().single();
    if (err) { setError("No se pudo guardar. Inténtalo de nuevo."); return; }
    setError(null);
    if (data) setComunidades([...comunidades, data].sort((a, b) => a.nombre.localeCompare(b.nombre)));
    setNuevaComunidad({ nombre: "", color: "#378ADD", prime: false, zonas_comunes: true, pisos: [] });
    setNuevaVivienda(""); setMostrarFormComunidad(false);
  };

  if (cargando) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 text-sm">Cargando...</p>
      </div>
    </AppLayout>
  );

  // Vista editar miembro
  if (editandoMiembro) {
    return (
      <AppLayout>
        <div className="p-6 max-w-lg">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-center gap-3">
              <button onClick={() => setEditandoMiembro(null)} className="text-gray-400 text-lg">←</button>
              <h1 className="text-base font-semibold text-gray-900 flex-1">Editar miembro</h1>
            </div>
            <div className="px-5 py-5 space-y-4">
              {error && (
                <div className="bg-[#FCEBEB] border border-[#F09595] text-[#A32D2D] text-xs rounded-xl px-4 py-2">{error}</div>
              )}
              <div className="flex flex-col items-center gap-2 mb-2">
                <div className={`w-14 h-14 rounded-full ${colorAvatar(editandoMiembro.color)} flex items-center justify-center text-lg font-semibold`}>{editandoMiembro.iniciales}</div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Nombre</label>
                <input type="text" value={editandoMiembro.nombre} onChange={(e) => setEditandoMiembro({ ...editandoMiembro, nombre: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-[#E8614A]" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Iniciales</label>
                <input type="text" value={editandoMiembro.iniciales} onChange={(e) => setEditandoMiembro({ ...editandoMiembro, iniciales: e.target.value.slice(0,2).toUpperCase() })} maxLength={2} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-[#E8614A]" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 block">Rol</label>
                <div className="flex gap-2 flex-wrap mb-2">
                  {["Director", "Técnico", "Datos"].map((r) => (
                    <button key={r} onClick={() => setEditandoMiembro({ ...editandoMiembro, rol: r })} className={`px-4 py-2 rounded-full text-xs border transition-all ${editandoMiembro.rol === r ? "bg-[#FDF0ED] border-[#E8614A] text-[#C44A35] font-medium" : "bg-gray-50 border-gray-200 text-gray-500"}`}>{r}</button>
                  ))}
                </div>
                <input type="text" value={editandoMiembro.rol} onChange={(e) => setEditandoMiembro({ ...editandoMiembro, rol: e.target.value })} placeholder="O escribe un rol nuevo…" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E8614A]" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 block">Color</label>
                <div className="flex gap-2">
                  {COLORES_MIEMBRO.map((c) => (
                    <button key={c.id} onClick={() => setEditandoMiembro({ ...editandoMiembro, color: c.id })} className={`w-8 h-8 rounded-full border-2 transition-all ${editandoMiembro.color === c.id ? "border-[#E8614A] scale-110" : "border-transparent"}`} style={{ background: c.dot }} />
                  ))}
                </div>
              </div>
              <button onClick={guardarMiembro} disabled={guardandoMiembro} className="w-full py-3 bg-[#E8614A] text-white rounded-xl text-sm font-semibold hover:bg-[#C44A35] transition-all disabled:opacity-40">
                {guardandoMiembro ? "Guardando..." : "Guardar cambios"}
              </button>
              <button onClick={() => { eliminarMiembro(editandoMiembro.id); setEditandoMiembro(null); }} className="w-full py-3 bg-white border border-[#F09595] text-[#A32D2D] rounded-xl text-sm hover:bg-red-50 transition-all">
                Eliminar miembro
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Vista editar comunidad
  if (editandoComunidad) {
    const pisos: string[] = Array.isArray(editandoComunidad.pisos) ? editandoComunidad.pisos : [];
    return (
      <AppLayout>
        <div className="p-6 max-w-lg">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-center gap-3">
              <button onClick={() => setEditandoComunidad(null)} className="text-gray-400 text-lg">←</button>
              <div className="flex-1 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: editandoComunidad.color }} />
                <h1 className="text-base font-semibold text-gray-900">{editandoComunidad.nombre}</h1>
                {editandoComunidad.prime && <span className="text-xs px-2 py-0.5 rounded-full bg-[#FAEEDA] border border-[#EF9F27] text-[#854F0B]">✦ prime</span>}
              </div>
            </div>
            <div className="px-5 py-5 space-y-4">
              {error && (
                <div className="bg-[#FCEBEB] border border-[#F09595] text-[#A32D2D] text-xs rounded-xl px-4 py-2">{error}</div>
              )}

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Nombre</label>
                <input type="text" value={editandoComunidad.nombre} onChange={(e) => setEditandoComunidad({ ...editandoComunidad, nombre: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E8614A]" />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Color</label>
                <input type="color" value={editandoComunidad.color} onChange={(e) => setEditandoComunidad({ ...editandoComunidad, color: e.target.value })} className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer" />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={editandoComunidad.zonas_comunes} onChange={(e) => setEditandoComunidad({ ...editandoComunidad, zonas_comunes: e.target.checked })} className="rounded" />
                  Zonas comunes
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={editandoComunidad.prime} onChange={(e) => setEditandoComunidad({ ...editandoComunidad, prime: e.target.checked })} className="rounded" />
                  ✦ Prime
                </label>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 block">Viviendas ({pisos.length})</label>
                <div className="flex gap-2 mb-3">
                  <input type="text" value={nuevaViviendaEdit} onChange={(e) => setNuevaViviendaEdit(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && nuevaViviendaEdit) { setEditandoComunidad({ ...editandoComunidad, pisos: [...pisos, nuevaViviendaEdit] }); setNuevaViviendaEdit(""); }}} placeholder="Ej: L1, Ático, 3ºB…" className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#E8614A]" />
                  <button onClick={() => { if (nuevaViviendaEdit) { setEditandoComunidad({ ...editandoComunidad, pisos: [...pisos, nuevaViviendaEdit] }); setNuevaViviendaEdit(""); }}} className="px-3 py-2 bg-[#E8614A] text-white rounded-xl text-sm hover:bg-[#C44A35] transition-all">+</button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {pisos.map((p, i) => (
                    <div key={i} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FDF0ED] border border-[#F5C4BB] text-xs text-[#C44A35]">
                      {p}
                      <button onClick={() => setEditandoComunidad({ ...editandoComunidad, pisos: pisos.filter((_, j) => j !== i) })} className="text-[#F5C4BB] hover:text-red-400 ml-1">×</button>
                    </div>
                  ))}
                  {pisos.length === 0 && <p className="text-xs text-gray-400">Sin viviendas aún</p>}
                </div>
              </div>

              <button onClick={async () => {
                const { error: err } = await supabase.from("comunidades").delete().eq("id", editandoComunidad.id);
                if (err) { setError("No se pudo eliminar. Inténtalo de nuevo."); return; }
                setError(null);
                setComunidades(comunidades.filter((c) => c.id !== editandoComunidad.id));
                setEditandoComunidad(null);
              }} className="w-full py-3 bg-white border border-[#F09595] text-[#A32D2D] rounded-xl text-sm hover:bg-red-50 transition-all">
                Eliminar comunidad
              </button>

              <button onClick={guardarComunidad} disabled={guardandoComunidad} className="w-full py-3 bg-[#E8614A] text-white rounded-xl text-sm font-semibold hover:bg-[#C44A35] transition-all disabled:opacity-40">
                {guardandoComunidad ? "Guardando..." : "Guardar cambios"}
              </button>
              <button onClick={() => setEditandoComunidad(null)} className="w-full py-3 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-100 transition-all">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Listas maestras</h1>
          <p className="text-sm text-gray-400">Configuración base</p>
        </div>

        {error && (
          <div className="mb-4 bg-[#FCEBEB] border border-[#F09595] text-[#A32D2D] text-xs rounded-xl px-4 py-2">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* EQUIPO */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-medium text-gray-900">👥 Equipo</p>
              <button onClick={() => setMostrarFormMiembro(!mostrarFormMiembro)} className="text-xs text-[#E8614A] border border-dashed border-[#F5C4BB] px-3 py-1 rounded-full hover:bg-[#FDF0ED] transition-all">+ Añadir</button>
            </div>
            {mostrarFormMiembro && (
              <div className="bg-[#FDF0ED] rounded-xl p-4 mb-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Nombre</label>
                    <input type="text" value={nuevoMiembro.nombre} onChange={(e) => setNuevoMiembro({ ...nuevoMiembro, nombre: e.target.value })} placeholder="Ej: María" className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#E8614A]" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Iniciales</label>
                    <input type="text" value={nuevoMiembro.iniciales} onChange={(e) => setNuevoMiembro({ ...nuevoMiembro, iniciales: e.target.value.slice(0, 2).toUpperCase() })} placeholder="MR" maxLength={2} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#E8614A]" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Rol</label>
                  <div className="flex gap-2 flex-wrap mb-2">
                    {["Director", "Técnico", "Datos"].map((r) => (
                      <button key={r} onClick={() => setNuevoMiembro({ ...nuevoMiembro, rol: r })} className={`px-3 py-1.5 rounded-full text-xs border transition-all ${nuevoMiembro.rol === r ? "bg-[#E8614A] text-white border-[#E8614A]" : "bg-white border-gray-200 text-gray-500"}`}>{r}</button>
                    ))}
                  </div>
                  <input type="text" value={nuevoMiembro.rol} onChange={(e) => setNuevoMiembro({ ...nuevoMiembro, rol: e.target.value })} placeholder="O escribe un rol nuevo…" className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#E8614A]" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Color</label>
                  <div className="flex gap-2">
                    {COLORES_MIEMBRO.map((c) => (
                      <button key={c.id} onClick={() => setNuevoMiembro({ ...nuevoMiembro, color: c.id })} className={`w-7 h-7 rounded-full border-2 transition-all ${nuevoMiembro.color === c.id ? "border-[#E8614A] scale-110" : "border-transparent"}`} style={{ background: c.dot }} />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={añadirMiembro} className="flex-1 py-2 bg-[#E8614A] text-white rounded-xl text-sm font-semibold hover:bg-[#C44A35] transition-all">Añadir</button>
                  <button onClick={() => setMostrarFormMiembro(false)} className="px-4 py-2 bg-white border border-gray-200 text-gray-500 rounded-xl text-sm">Cancelar</button>
                </div>
              </div>
            )}
            <div className="space-y-1">
              {miembros.map((m) => (
                <div key={m.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all">
                  <div className={`w-8 h-8 rounded-full ${colorAvatar(m.color)} flex items-center justify-center text-xs font-semibold flex-shrink-0`}>{m.iniciales}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{m.nombre}</p>
                    <p className="text-xs text-gray-400">{m.rol}</p>
                  </div>
                  <button onClick={() => setEditandoMiembro(m)} className="text-gray-300 hover:text-gray-500 text-sm">✎</button>
                  <button onClick={() => eliminarMiembro(m.id)} className="text-gray-300 hover:text-red-400 text-sm">✕</button>
                </div>
              ))}
            </div>
          </div>

          {/* COMUNIDADES */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-medium text-gray-900">🏢 Comunidades</p>
              <button onClick={() => setMostrarFormComunidad(!mostrarFormComunidad)} className="text-xs text-[#E8614A] border border-dashed border-[#F5C4BB] px-3 py-1 rounded-full hover:bg-[#FDF0ED] transition-all">+ Añadir</button>
            </div>
            {mostrarFormComunidad && (
              <div className="bg-[#FDF0ED] rounded-xl p-4 mb-4 space-y-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Nombre</label>
                  <input type="text" value={nuevaComunidad.nombre} onChange={(e) => setNuevaComunidad({ ...nuevaComunidad, nombre: e.target.value })} placeholder="Ej: Hortaleza" className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#E8614A]" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Color identificativo</label>
                  <input type="color" value={nuevaComunidad.color} onChange={(e) => setNuevaComunidad({ ...nuevaComunidad, color: e.target.value })} className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Viviendas</label>
                  <div className="flex gap-2 mb-2">
                    <input type="text" value={nuevaVivienda} onChange={(e) => setNuevaVivienda(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && nuevaVivienda) { setNuevaComunidad({ ...nuevaComunidad, pisos: [...nuevaComunidad.pisos, nuevaVivienda] }); setNuevaVivienda(""); }}} placeholder="Ej: L1, Ático…" className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#E8614A]" />
                    <button onClick={() => { if (nuevaVivienda) { setNuevaComunidad({ ...nuevaComunidad, pisos: [...nuevaComunidad.pisos, nuevaVivienda] }); setNuevaVivienda(""); }}} className="px-3 py-2 bg-[#E8614A] text-white rounded-xl text-sm">+</button>
                  </div>
                  {nuevaComunidad.pisos.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {nuevaComunidad.pisos.map((p, i) => (
                        <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-full bg-white border border-gray-200 text-xs text-gray-600">
                          {p}<button onClick={() => setNuevaComunidad({ ...nuevaComunidad, pisos: nuevaComunidad.pisos.filter((_, j) => j !== i) })} className="text-gray-300 hover:text-red-400 ml-0.5">×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={nuevaComunidad.zonas_comunes} onChange={(e) => setNuevaComunidad({ ...nuevaComunidad, zonas_comunes: e.target.checked })} className="rounded" />
                    Zonas comunes
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={nuevaComunidad.prime} onChange={(e) => setNuevaComunidad({ ...nuevaComunidad, prime: e.target.checked })} className="rounded" />
                    ✦ Prime
                  </label>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={añadirComunidad} className="flex-1 py-2 bg-[#E8614A] text-white rounded-xl text-sm font-semibold hover:bg-[#C44A35] transition-all">Añadir</button>
                  <button onClick={() => setMostrarFormComunidad(false)} className="px-4 py-2 bg-white border border-gray-200 text-gray-500 rounded-xl text-sm">Cancelar</button>
                </div>
              </div>
            )}
            <div className="space-y-1">
              {comunidades.map((c) => (
                <div key={c.id} onClick={() => setEditandoComunidad(c)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#FDF0ED] cursor-pointer transition-all">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-800">{c.nombre}</p>
                      {c.prime && <span className="text-xs px-2 py-0.5 rounded-full bg-[#FAEEDA] border border-[#EF9F27] text-[#854F0B] font-medium">✦ prime</span>}
                    </div>
                    <p className="text-xs text-gray-400">{c.pisos?.length || 0} viviendas{c.zonas_comunes ? " · zonas comunes" : ""}</p>
                  </div>
                  <span className="text-gray-300 text-sm">›</span>
                </div>
              ))}
            </div>
          </div>

          {/* ESPACIOS */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-medium text-gray-900">🚪 Espacios</p>
              <button onClick={() => setMostrarFormEspacio(!mostrarFormEspacio)} className="text-xs text-[#E8614A] border border-dashed border-[#F5C4BB] px-3 py-1 rounded-full hover:bg-[#FDF0ED] transition-all">+ Añadir</button>
            </div>
            {mostrarFormEspacio && (
              <div className="flex gap-2 mb-3">
                <input type="text" value={nuevoEspacio} onChange={(e) => setNuevoEspacio(e.target.value)} placeholder="Ej: Garaje" className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#E8614A]" />
                <button onClick={añadirEspacio} className="px-4 py-2 bg-[#E8614A] text-white rounded-xl text-sm hover:bg-[#C44A35] transition-all">✓</button>
              </div>
            )}
            <div className="flex gap-2 flex-wrap">
              {espacios.map((e) => (
                <div key={e.id} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-xs text-gray-600">
                  {e.nombre}
                  <button onClick={() => eliminarEspacio(e.id)} className="text-gray-300 hover:text-red-400 ml-1">×</button>
                </div>
              ))}
            </div>
          </div>

          {/* CATEGORÍAS */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-medium text-gray-900">🏷️ Categorías</p>
              <button onClick={() => setMostrarFormCategoria(!mostrarFormCategoria)} className="text-xs text-[#E8614A] border border-dashed border-[#F5C4BB] px-3 py-1 rounded-full hover:bg-[#FDF0ED] transition-all">+ Añadir</button>
            </div>
            {mostrarFormCategoria && (
              <div className="flex gap-2 mb-3">
                <input type="text" value={nuevaCategoria} onChange={(e) => setNuevaCategoria(e.target.value)} placeholder="Ej: Climatización" className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#E8614A]" />
                <button onClick={añadirCategoria} className="px-4 py-2 bg-[#E8614A] text-white rounded-xl text-sm hover:bg-[#C44A35] transition-all">✓</button>
              </div>
            )}
            <div className="flex gap-2 flex-wrap">
              {categorias.map((c) => (
                <div key={c.id} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FDF0ED] border border-[#F5C4BB] text-xs text-[#C44A35]">
                  {c.nombre}
                  <button onClick={() => eliminarCategoria(c.id)} className="text-[#F5C4BB] hover:text-red-400 ml-1">×</button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}