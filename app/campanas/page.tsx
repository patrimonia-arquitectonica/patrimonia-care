"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AppLayout from "@/components/AppLayout";

type Campana = {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  frecuencia_dias: number;
  aplica_a: string;
  activa: boolean;
  fecha_inicio: string;
  fecha_instancia: string;
  fecha_creacion: string;
  protocolo: { pasos: string[]; materiales: string[] } | null;
};

type Comunidad = {
  id: string;
  nombre: string;
  pisos: string[];
  zonas_comunes: boolean;
};

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

function CampanasInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");

  const [campanas, setCampanas] = useState<Campana[]>([]);
  const [comunidades, setComunidades] = useState<Comunidad[]>([]);
  const [miembros, setMiembros] = useState<any[]>([]);
  const [registros, setRegistros] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  const [vista, setVista] = useState<"lista" | "detalle" | "crear">("lista");
  const [campanaSeleccionada, setCampanaSeleccionada] = useState<Campana | null>(null);

  // Modal completar
  const [modalTarget, setModalTarget] = useState<{ comunidad: string; area: string } | null>(null);
  const [modalMiembro, setModalMiembro] = useState("");
  const [modalFotos, setModalFotos] = useState<File[]>([]);
  const [modalFacturas, setModalFacturas] = useState<File[]>([]);
  const [modalComentario, setModalComentario] = useState("");
  const [modalPasos, setModalPasos] = useState<boolean[]>([]);
  const [guardandoModal, setGuardandoModal] = useState(false);

  // Form crear
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [frecuenciaDias, setFrecuenciaDias] = useState(7);
  const [aplicaA, setAplicaA] = useState("pisos");
  const [fechaInicio, setFechaInicio] = useState("");
  const [protocolo, setProtocolo] = useState<{ pasos: string[]; materiales: string[] } | null>(null);
  const [cargandoIA, setCargandoIA] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const CATEGORIAS = ["Albañilería", "Carpintería", "Fontanería", "Limpieza", "Electricidad"];
  const hoy = new Date();

  const cargar = async () => {
    const [{ data: c }, { data: com }, { data: m }, { data: r }] = await Promise.all([
      supabase.from("campanas").select("*").order("fecha_creacion", { ascending: false }),
      supabase.from("comunidades").select("*").order("nombre"),
      supabase.from("miembros").select("*").order("nombre"),
      supabase.from("Registros").select("*").not("campana_id", "is", null),
    ]);
    if (c) setCampanas(c);
    if (com) setComunidades(com);
    if (m) setMiembros(m);
    if (r) setRegistros(r);
    setCargando(false);
  };

  useEffect(() => { cargar(); }, []);

  useEffect(() => {
    const avanzarInstancias = async () => {
        for (const campana of campanas) {
        const targets = getTargets(campana);
        const regsInstancia = getRegistrosInstancia(campana);
        const todosHechos = targets.length > 0 && targets.every(t =>
            regsInstancia.some(r => r.area === t.area && r.comunidad?.includes(t.comunidad) &&
            (r.estado === "Resuelto" || r.estado === "Hecho"))
        );
        if (todosHechos) {
            const nuevaFecha = new Date(campana.fecha_instancia);
            nuevaFecha.setDate(nuevaFecha.getDate() + campana.frecuencia_dias);
            await supabase.from("campanas").update({
            fecha_instancia: nuevaFecha.toISOString().split("T")[0],
            completada: true,
            }).eq("id", campana.id);
        }
        }
    };
    if (campanas.length > 0 && comunidades.length > 0) avanzarInstancias();
    }, [campanas, comunidades]);

    // Si viene id por URL, abrir detalle directamente
    useEffect(() => {
    if (idParam && campanas.length > 0) {
        const campana = campanas.find(c => c.id === idParam);
        if (campana) { setCampanaSeleccionada(campana); setVista("detalle"); }
    }
  }, [idParam, campanas]);

  // Sugerir protocolo con IA
  const sugerirProtocolo = async () => {
    if (!nombre && !descripcion) return;
    setCargandoIA(true);
    try {
      const res = await fetch("/api/ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descripcion: descripcion || nombre, categoria }),
      });
      const data = await res.json();
      // Construir protocolo desde subcategoria o usar protocolo de Supabase
      const { data: proto } = await supabase.from("protocolos").select("*").eq("subcategoria", data.subcategoria).single();
      if (proto) setProtocolo(proto);
      else setProtocolo({ pasos: [`Realizar ${nombre}`, "Verificar resultado", "Tomar foto"], materiales: [] });
    } catch (e) { console.error(e); }
    setCargandoIA(false);
  };

  const getTargets = (campana: Campana) => {
    const targets: { comunidad: string; area: string; key: string }[] = [];
    for (const com of comunidades) {
      if (campana.aplica_a === "pisos" || campana.aplica_a === "todo") {
        for (const piso of (com.pisos || [])) {
          targets.push({ comunidad: com.nombre, area: piso, key: `${com.nombre}·${piso}` });
        }
      }
      if ((campana.aplica_a === "zonas_comunes" || campana.aplica_a === "todo") && com.zonas_comunes) {
        targets.push({ comunidad: com.nombre, area: "Zonas comunes", key: `${com.nombre}·Zonas comunes` });
      }
    }
    return targets;
  };

  const getRegistrosInstancia = (campana: Campana) => {
    const lunes = getLunes(new Date(campana.fecha_instancia));
    const domingo = getDomingo(new Date(campana.fecha_instancia));
    return registros.filter(r =>
      r.campana_id === campana.id &&
      new Date(r.fecha_creacion) >= lunes &&
      new Date(r.fecha_creacion) <= domingo
    );
  };

  const getProgreso = (campana: Campana) => {
    const targets = getTargets(campana);
    const regsAnteriores = registros.filter(r =>
      r.campana_id === campana.id &&
      new Date(r.fecha_creacion) < getLunes(new Date(campana.fecha_instancia)) &&
      (r.estado === "Resuelto" || r.estado === "Hecho")
    );
    const targetsPendientes = targets.filter(t =>
      !regsAnteriores.some(r => r.area === t.area && r.comunidad?.includes(t.comunidad))
    );
    const regsInstancia = getRegistrosInstancia(campana);
    const hechos = targetsPendientes.filter(t =>
      regsInstancia.some(r => r.area === t.area && r.comunidad?.includes(t.comunidad) &&
        (r.estado === "Resuelto" || r.estado === "Hecho"))
    ).length;
    return { hechos, total: targetsPendientes.length };
  };

  const esInstanciaActiva = (campana: Campana) => {
    const lunes = getLunes(new Date(campana.fecha_instancia));
    const domingo = getDomingo(new Date(campana.fecha_instancia));
    return hoy >= lunes && hoy <= domingo;
  };

  const getSemanasFuturas = (campana: Campana, cantidad = 6) => {
    const semanas = [];
    let fecha = new Date(campana.fecha_instancia);
    for (let i = 0; i < cantidad; i++) {
      semanas.push(new Date(fecha));
      fecha = new Date(fecha);
      fecha.setDate(fecha.getDate() + campana.frecuencia_dias);
    }
    return semanas;
  };

  // Abrir modal completar
  const abrirModal = (target: { comunidad: string; area: string }, campana: Campana) => {
    setModalTarget(target);
    setModalMiembro("");
    setModalFotos([]);
    setModalFacturas([]);
    setModalComentario("");
    setModalPasos(campana.protocolo?.pasos ? new Array(campana.protocolo.pasos.length).fill(false) : []);
  };

  // Guardar completar
  const guardarCompletar = async () => {
    if (!modalTarget || !modalMiembro || !campanaSeleccionada) return;
    setGuardandoModal(true);

    const ref = `CMP-${Date.now()}`;
    let urlsFactura: string[] = [];
    let urlsFotos: string[] = [];

    for (const f of modalFacturas) {
      const fd = new FormData();
      fd.append("file", f); fd.append("bucket", "facturas"); fd.append("ref", ref);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) urlsFactura.push(data.url);
    }

    for (const f of modalFotos) {
      const fd = new FormData();
      fd.append("file", f); fd.append("bucket", "fotos"); fd.append("ref", ref);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) urlsFotos.push(data.url);
    }

    const proximaFecha = new Date(campanaSeleccionada.fecha_instancia);
    proximaFecha.setDate(proximaFecha.getDate() + campanaSeleccionada.frecuencia_dias);

    await supabase.from("Registros").insert({
      tipo: "mantenimiento",
      comunidad: `${modalTarget.comunidad} · ${modalTarget.area}`,
      area: modalTarget.area,
      persona: modalMiembro,
      categoria: campanaSeleccionada.categoria,
      descripcion: campanaSeleccionada.nombre,
      comentario: modalComentario,
      estado: "Resuelto",
      resuelto_por: modalMiembro,
      fecha_arreglo: new Date().toISOString().split("T")[0],
      fecha_revision: proximaFecha.toISOString().split("T")[0],
      foto_url: urlsFactura[0] || null,
      fotos_arreglo: urlsFotos,
      campana_id: campanaSeleccionada.id,
      fecha_creacion: new Date().toISOString(),
    });

    await cargar();
    setModalTarget(null);
    setGuardandoModal(false);
  };

  const crearCampana = async () => {
    if (!nombre || !fechaInicio) return;
    setGuardando(true);
    const { error } = await supabase.from("campanas").insert({
      nombre, categoria, descripcion,
      frecuencia_dias: frecuenciaDias,
      aplica_a: aplicaA,
      activa: true,
      fecha_inicio: fechaInicio,
      fecha_instancia: fechaInicio,
      protocolo: protocolo || null,
    });
    if (!error) {
      await cargar();
      setNombre(""); setCategoria(""); setDescripcion("");
      setFrecuenciaDias(7); setAplicaA("pisos"); setFechaInicio("");
      setProtocolo(null);
      setVista("lista");
    }
    setGuardando(false);
  };

  const badgeProgreso = (hechos: number, total: number) => {
    const pct = total === 0 ? 0 : Math.round((hechos / total) * 100);
    const color = pct === 100 ? "bg-[#E1F5EE] text-[#085041]" : pct > 50 ? "bg-[#FAEEDA] text-[#854F0B]" : "bg-[#FCEBEB] text-[#A32D2D]";
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>{hechos}/{total}</span>;
  };

  if (cargando) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 text-sm">Cargando campañas...</p>
      </div>
    </AppLayout>
  );

  // Vista crear
  if (vista === "crear") {
    return (
      <AppLayout>
        <div className="p-6 max-w-2xl">
          <div className="mb-6 flex items-center gap-3">
            <button onClick={() => setVista("lista")} className="text-gray-400 text-lg hover:text-gray-600">←</button>
            <h1 className="text-xl font-semibold text-gray-900">Nueva campaña</h1>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Nombre <span className="text-[#E8614A]">*</span></label>
                <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Limpieza de sofás" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-[#E8614A]" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Categoría</label>
                <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 appearance-none focus:outline-none focus:border-[#E8614A]">
                  <option value="">Selecciona categoría</option>
                  {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Descripción</label>
                <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={2} placeholder="Qué hay que hacer exactamente…" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 resize-none focus:outline-none focus:border-[#E8614A]" />
              </div>

              {/* Protocolo IA */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-400">Protocolo de pasos</label>
                  <button onClick={sugerirProtocolo} disabled={cargandoIA || (!nombre && !descripcion)} className="text-xs px-3 py-1.5 bg-[#FDF0ED] border border-[#E8614A] text-[#E8614A] rounded-lg hover:bg-[#F5C4BB] transition-all disabled:opacity-40">
                    {cargandoIA ? "✨ Generando..." : "✨ Sugerir con IA"}
                  </button>
                </div>
                {protocolo ? (
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2">
                    {protocolo.pasos.map((paso, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-[#E8614A] font-medium flex-shrink-0">{i + 1}.</span>
                        <input type="text" value={paso} onChange={(e) => {
                          const nuevos = [...protocolo.pasos];
                          nuevos[i] = e.target.value;
                          setProtocolo({ ...protocolo, pasos: nuevos });
                        }} className="flex-1 bg-transparent border-b border-gray-200 pb-1 text-sm text-gray-700 focus:outline-none focus:border-[#E8614A]" />
                      </div>
                    ))}
                    <button onClick={() => setProtocolo({ ...protocolo, pasos: [...protocolo.pasos, ""] })} className="text-xs text-[#E8614A] mt-2">+ Añadir paso</button>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4 text-center text-xs text-gray-400">
                    Pulsa "Sugerir con IA" para generar los pasos automáticamente
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 block">¿Dónde aplica?</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "pisos", label: "Solo pisos", icon: "🏠" },
                    { value: "zonas_comunes", label: "Zonas comunes", icon: "🏢" },
                    { value: "todo", label: "Todo", icon: "🌐" },
                  ].map((o) => (
                    <button key={o.value} onClick={() => setAplicaA(o.value)} className={`py-4 rounded-xl text-sm font-medium border transition-all flex flex-col items-center gap-2 ${aplicaA === o.value ? "bg-[#FDF0ED] border-[#E8614A] text-[#C44A35]" : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"}`}>
                      <span className="text-2xl">{o.icon}</span>
                      <span className="text-xs">{o.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Se repite cada (días)</label>
                <input type="number" value={frecuenciaDias} onChange={(e) => setFrecuenciaDias(parseInt(e.target.value) || 7)} min={1} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-[#E8614A]" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Fecha de inicio <span className="text-[#E8614A]">*</span></label>
                <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-[#E8614A]" />
              </div>
              <button onClick={crearCampana} disabled={!nombre || !fechaInicio || guardando} className="w-full py-3 bg-[#E8614A] text-white rounded-xl text-sm font-semibold hover:bg-[#C44A35] transition-all disabled:opacity-40">
                {guardando ? "Guardando..." : "Crear campaña"}
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Vista detalle campaña
  if (vista === "detalle" && campanaSeleccionada) {
    const targets = getTargets(campanaSeleccionada);
    const regsAnteriores = registros.filter(r =>
      r.campana_id === campanaSeleccionada.id &&
      new Date(r.fecha_creacion) < getLunes(new Date(campanaSeleccionada.fecha_instancia)) &&
      (r.estado === "Resuelto" || r.estado === "Hecho")
    );
    const targetsPendientes = targets.filter(t =>
      !regsAnteriores.some(r => r.area === t.area && r.comunidad?.includes(t.comunidad))
    );
    const regsInstancia = getRegistrosInstancia(campanaSeleccionada);
    const { hechos, total } = getProgreso(campanaSeleccionada);
    const activa = esInstanciaActiva(campanaSeleccionada);
    const semanasFuturas = getSemanasFuturas(campanaSeleccionada);

    const porComunidad: Record<string, typeof targetsPendientes> = {};
    for (const t of targetsPendientes) {
      if (!porComunidad[t.comunidad]) porComunidad[t.comunidad] = [];
      porComunidad[t.comunidad].push(t);
    }

    return (
      <AppLayout>
        <div className="p-6">
          {/* Modal completar */}
          {modalTarget && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Completar tarea</h2>
                    <p className="text-xs text-gray-400">{modalTarget.comunidad} · {modalTarget.area}</p>
                  </div>
                  <button onClick={() => setModalTarget(null)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
                </div>

                <div className="px-5 py-5 space-y-4">
                  {/* Protocolo */}
                  {campanaSeleccionada.protocolo?.pasos && campanaSeleccionada.protocolo.pasos.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">📋 Protocolo</p>
                      <div className="space-y-2">
                        {campanaSeleccionada.protocolo.pasos.map((paso, i) => (
                          <button key={i} onClick={() => {
                            const nuevo = [...modalPasos];
                            nuevo[i] = !nuevo[i];
                            setModalPasos(nuevo);
                          }} className={`w-full flex items-start gap-3 text-left p-2.5 rounded-xl transition-all ${modalPasos[i] ? "bg-[#E1F5EE]" : "bg-gray-50 border border-gray-100"}`}>
                            <span className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 flex items-center justify-center text-xs border ${modalPasos[i] ? "bg-[#1D9E75] border-[#1D9E75] text-white" : "border-gray-300"}`}>
                              {modalPasos[i] ? "✓" : ""}
                            </span>
                            <span className={`text-xs ${modalPasos[i] ? "line-through text-gray-400" : "text-gray-700"}`}>{paso}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quién lo hace */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">¿Quién lo hace? <span className="text-[#E8614A]">*</span></p>
                    <div className="space-y-1">
                      {miembros.map((m) => (
                        <button key={m.id} onClick={() => setModalMiembro(m.nombre)} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all text-left ${modalMiembro === m.nombre ? "bg-[#FDF0ED] border-[#E8614A]" : "bg-gray-50 border-gray-200"}`}>
                          <div className="w-7 h-7 rounded-full bg-[#FDF0ED] flex items-center justify-center text-xs font-medium text-[#E8614A]">{m.nombre.slice(0,2).toUpperCase()}</div>
                          <p className="text-sm font-medium text-gray-800">{m.nombre}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fotos */}
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Fotos del arreglo</label>
                    <label className="flex flex-col items-center gap-1 py-3 bg-gray-50 border border-dashed border-[#F5C4BB] rounded-xl text-xs text-gray-500 cursor-pointer hover:bg-[#FDF0ED] transition-all">
                      📷 <span className="text-[#E8614A] font-medium">Añadir fotos</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { if (e.target.files) setModalFotos(prev => [...prev, ...Array.from(e.target.files!)]); }} />
                    </label>
                    {modalFotos.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {modalFotos.map((f, i) => (
                          <span key={i} className="text-xs bg-[#FDF0ED] text-[#E8614A] px-2 py-1 rounded-lg">{f.name} <button onClick={() => setModalFotos(prev => prev.filter((_, j) => j !== i))}>✕</button></span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Factura */}
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Factura / ticket</label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex flex-col items-center gap-1 py-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-xs text-gray-500 cursor-pointer hover:bg-gray-100">
                        📷<span>Foto ticket</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files) setModalFacturas(prev => [...prev, ...Array.from(e.target.files!)]); }} />
                      </label>
                      <label className="flex flex-col items-center gap-1 py-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-xs text-gray-500 cursor-pointer hover:bg-gray-100">
                        📄<span>PDF</span>
                        <input type="file" accept=".pdf" className="hidden" onChange={(e) => { if (e.target.files) setModalFacturas(prev => [...prev, ...Array.from(e.target.files!)]); }} />
                      </label>
                    </div>
                  </div>

                  {/* Comentario */}
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Comentario para el siguiente</label>
                    <textarea value={modalComentario} onChange={(e) => setModalComentario(e.target.value)} rows={2} placeholder="Algo a tener en cuenta la próxima vez…" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 resize-none focus:outline-none focus:border-[#E8614A]" />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setModalTarget(null)} className="py-3 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl text-sm">Cancelar</button>
                    <button onClick={guardarCompletar} disabled={!modalMiembro || guardandoModal} className="py-3 bg-[#E8614A] text-white rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-[#C44A35] transition-all">
                      {guardandoModal ? "Guardando..." : "✓ Completar"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6 flex items-center gap-3">
            <button onClick={() => { setVista("lista"); setCampanaSeleccionada(null); }} className="text-gray-400 text-lg hover:text-gray-600">←</button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900">{campanaSeleccionada.nombre}</h1>
              <p className="text-sm text-gray-400">{campanaSeleccionada.categoria} · cada {campanaSeleccionada.frecuencia_dias} días</p>
            </div>
            {badgeProgreso(hechos, total)}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    {activa ? "Semana activa" : "Próxima semana"}
                  </p>
                  <p className="text-sm font-semibold text-gray-700">{hechos} de {total} completados</p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-[#E8614A] h-2 rounded-full transition-all" style={{ width: `${total === 0 ? 0 : (hechos / total) * 100}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Semana del {getLunes(new Date(campanaSeleccionada.fecha_instancia)).toLocaleDateString("es-ES", { day: "numeric", month: "short" })} al {getDomingo(new Date(campanaSeleccionada.fecha_instancia)).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                </p>
              </div>

              {Object.entries(porComunidad).map(([com, items]) => (
                <div key={com} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800">{com}</p>
                    {badgeProgreso(
                      items.filter(t => regsInstancia.some(r => r.area === t.area && r.comunidad?.includes(t.comunidad) && (r.estado === "Resuelto" || r.estado === "Hecho"))).length,
                      items.length
                    )}
                  </div>
                  <div className="divide-y divide-gray-50">
                    {items.map((t) => {
                      const reg = regsInstancia.find(r => r.area === t.area && r.comunidad?.includes(t.comunidad));
                      const hecho = reg && (reg.estado === "Resuelto" || reg.estado === "Hecho");
                      return (
                        <div key={t.key} className="flex items-center gap-4 px-5 py-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${hecho ? "bg-[#E1F5EE]" : "bg-gray-100"}`}>
                            {hecho ? <span className="text-xs text-[#085041]">✓</span> : <span className="text-xs text-gray-300">—</span>}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-800">{t.area}</p>
                            {reg?.persona && <p className="text-xs text-gray-400">{reg.persona}</p>}
                          </div>
                          {hecho ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[#E1F5EE] text-[#085041] font-medium">✓ Hecho</span>
                          ) : activa ? (
                            <button onClick={() => abrirModal(t, campanaSeleccionada)} className="text-xs px-3 py-1.5 rounded-lg bg-[#E8614A] text-white hover:bg-[#C44A35] transition-all font-medium">Completar</button>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">Pendiente</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Próximas semanas</p>
              <div className="space-y-2">
                {semanasFuturas.map((fecha, i) => {
                  const lunes = getLunes(fecha);
                  const domingo = getDomingo(fecha);
                  const esActual = hoy >= lunes && hoy <= domingo;
                  return (
                    <div key={i} className={`px-3 py-2.5 rounded-xl text-xs ${esActual ? "bg-[#FDF0ED] border border-[#E8614A] text-[#C44A35] font-medium" : "bg-gray-50 text-gray-500"}`}>
                      {esActual && <span className="text-[#E8614A] mr-1">▶</span>}
                      {lunes.toLocaleDateString("es-ES", { day: "numeric", month: "short" })} — {domingo.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Vista lista
  return (
    <AppLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Campañas</h1>
            <p className="text-sm text-gray-400">{campanas.filter(c => c.activa).length} activas</p>
          </div>
          <button onClick={() => setVista("crear")} className="px-4 py-2 bg-[#E8614A] text-white rounded-xl text-sm font-semibold hover:bg-[#C44A35] transition-all">
            + Nueva campaña
          </button>
        </div>

        {campanas.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-gray-400 text-sm mb-4">No hay campañas todavía</p>
            <button onClick={() => setVista("crear")} className="px-4 py-2 bg-[#FDF0ED] border border-[#E8614A] text-[#E8614A] rounded-xl text-sm font-semibold">Crear la primera</button>
          </div>
        ) : (
          <div className="space-y-3">
            {campanas.map((c) => {
              const { hechos, total } = getProgreso(c);
              const pct = total === 0 ? 0 : Math.round((hechos / total) * 100);
              const activa = esInstanciaActiva(c);
              const lunes = getLunes(new Date(c.fecha_instancia));
              const domingo = getDomingo(new Date(c.fecha_instancia));
              return (
                <div key={c.id} onClick={() => { setCampanaSeleccionada(c); setVista("detalle"); }} className="bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer hover:bg-[#FDF0ED] hover:border-[#F5C4BB] transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-gray-900">{c.nombre}</p>
                        {activa && <span className="text-xs px-2 py-0.5 rounded-full bg-[#E8614A] text-white font-medium">Esta semana</span>}
                      </div>
                      <p className="text-xs text-gray-400">{c.categoria} · cada {c.frecuencia_dias} días · {lunes.toLocaleDateString("es-ES", { day: "numeric", month: "short" })} — {domingo.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</p>
                    </div>
                    {badgeProgreso(hechos, total)}
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-[#E8614A] h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default function Campanas() {
  return (
    <Suspense>
      <CampanasInner />
    </Suspense>
  );
}