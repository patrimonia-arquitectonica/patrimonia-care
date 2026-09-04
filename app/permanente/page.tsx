"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AppLayout from "@/components/AppLayout";

const TIPOS = [
  "Mobiliario",
  "Iluminación",
  "Electrodoméstico",
  "Decoración",
  "Menaje",
  "Herrajes y Accesorios",
  "Textil Hogar",
  "Equipamiento Fijo",
];

const ICONOS: Record<string, string> = {
  Mobiliario: "🪑",
  Iluminación: "💡",
  Electrodoméstico: "🫧",
  Decoración: "🌿",
  Menaje: "🍽️",
  "Herrajes y Accesorios": "🔩",
  "Textil Hogar": "🧵",
  "Equipamiento Fijo": "⚙️",
};

type ObjetoInventario = { id: number; nombre: string; proveedor: string };

function PermanenteInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const miembro = searchParams.get("miembro") || "";
  const comunidad = searchParams.get("comunidad") || "";
  const area = searchParams.get("area") || "";
  const espacio = searchParams.get("espacio") || "";

  const [paso, setPaso] = useState<1 | 2 | 3 | 4>(1);
  const [tipo, setTipo] = useState("");
  const [modo, setModo] = useState<"cambio" | "añadir">("cambio");
  const [objetos, setObjetos] = useState<ObjetoInventario[]>([]);
  const [cargandoInventario, setCargandoInventario] = useState(false);
  const [objetoSeleccionado, setObjetoSeleccionado] = useState<ObjetoInventario | null>(null);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoProveedor, setNuevoProveedor] = useState("");
  const [nuevoPrecio, setNuevoPrecio] = useState("");
  const [comentario, setComentario] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const comunidadCompleta = `${comunidad}${area ? ` · ${area}` : ""}`;

  // Trae el inventario real del piso/espacio/categoría desde Supabase
  // en lugar de usar la lista hardcoded.
  useEffect(() => {
    if (!tipo) {
      setObjetos([]);
      return;
    }
    let cancelado = false;
    setCargandoInventario(true);
    supabase
      .from("PermanentesInventario")
      .select("id, nombre, proveedor")
      .eq("comunidad", comunidad)
      .eq("area", area)
      .eq("espacio", espacio)
      .eq("categoria", tipo)
      .eq("activo", true)
      .order("nombre")
      .then(({ data, error }) => {
        if (cancelado) return;
        if (error) {
          console.error(error);
          setObjetos([]);
        } else {
          setObjetos(data || []);
        }
        setCargandoInventario(false);
      });
    return () => {
      cancelado = true;
    };
  }, [tipo, comunidad, area, espacio]);

  if (paso === 4) {
    return (
      <AppLayout>
        <div className="p-6 max-w-lg">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-[#FDF0ED] flex items-center justify-center text-2xl">✅</div>
            <h2 className="text-lg font-semibold text-gray-900">Cambio registrado</h2>
            <div className="w-full bg-gray-50 rounded-2xl p-4 text-left space-y-3 border border-gray-100">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Inventario actualizado</p>
              {objetoSeleccionado && (
                <div className="flex items-center gap-2 text-sm text-gray-700">❌ <span className="line-through text-gray-400">{objetoSeleccionado.nombre} ({objetoSeleccionado.proveedor})</span> → archivado</div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-700">✅ {nuevoNombre} ({nuevoProveedor}) → activo</div>
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">📧 Factura enviada a facturas@arca.com</div>
                <div className="flex items-center gap-2 text-sm text-gray-700">🗄️ Registro guardado en historial</div>
              </div>
            </div>
            <button onClick={() => router.push("/")} className="w-full py-3 bg-[#FDF0ED] border border-[#E8614A] text-[#E8614A] rounded-xl text-sm font-semibold hover:bg-[#F5C4BB] transition-all">
              + Crear otro cambio
            </button>
            <button onClick={() => router.push("/historial")} className="w-full py-3 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-100 transition-all">
              Ver en historial
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {paso === 1 ? "Cambio permanente" : paso === 2 ? "Elige qué cambiaste" : "Objeto nuevo"}
            </h1>
            {(miembro || comunidad) && <p className="text-sm text-gray-400">{miembro}{comunidad ? ` · ${comunidadCompleta}` : ""}{espacio ? ` · ${espacio}` : ""}</p>}
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-[#E8614A] text-white font-medium">Permanente</span>
        </div>

        {/* Barra de progreso */}
        <div className="flex gap-1 mb-6 max-w-xs">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`flex-1 h-1 rounded-full ${s < paso ? "bg-[#E8614A]" : s === paso ? "bg-[#F5C4BB]" : "bg-gray-100"}`} />
          ))}
        </div>

        <div className="max-w-2xl space-y-4">
          {paso === 1 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              <div className="bg-[#FDF0ED] rounded-xl p-4 space-y-2">
                <div className="flex gap-2 text-sm"><span className="text-[#E8614A] font-medium w-20">Persona</span><span className="text-[#C44A35]">{miembro || "—"}</span></div>
                <div className="flex gap-2 text-sm"><span className="text-[#E8614A] font-medium w-20">Comunidad</span><span className="text-[#C44A35]">{comunidadCompleta || "—"}</span></div>
                <div className="flex gap-2 text-sm"><span className="text-[#E8614A] font-medium w-20">Espacio</span><span className="text-[#C44A35]">{espacio || "—"}</span></div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 block">¿Qué tipo de objeto?</label>
                <div className="grid grid-cols-4 gap-2">
                  {TIPOS.map((t) => (
                    <button key={t} onClick={() => setTipo(t)} className={`py-4 rounded-xl text-sm font-medium border transition-all flex flex-col items-center gap-2 ${tipo === t ? "bg-[#FDF0ED] border-[#E8614A] text-[#C44A35]" : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"}`}>
                      <span className="text-2xl">{ICONOS[t]}</span>
                      <span className="text-xs text-center leading-tight">{t}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 block">¿Se trata de…?</label>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setModo("cambio")} className={`py-4 rounded-xl text-sm font-medium border transition-all flex flex-col items-center gap-1 ${modo === "cambio" ? "bg-[#FDF0ED] border-[#E8614A] text-[#C44A35]" : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"}`}>
                    <span className="text-2xl">🔄</span>
                    <span>Cambio</span>
                    <span className="text-xs font-normal">sustituyes algo</span>
                  </button>
                  <button onClick={() => setModo("añadir")} className={`py-4 rounded-xl text-sm font-medium border transition-all flex flex-col items-center gap-1 ${modo === "añadir" ? "bg-[#FDF0ED] border-[#E8614A] text-[#C44A35]" : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"}`}>
                    <span className="text-2xl">➕</span>
                    <span>Añadir</span>
                    <span className="text-xs font-normal">algo nuevo</span>
                  </button>
                </div>
              </div>

              <button onClick={() => setPaso(modo === "cambio" ? 2 : 3)} disabled={!tipo} className="w-full py-3 bg-[#E8614A] text-white rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-[#C44A35] transition-all">
                Siguiente →
              </button>
            </div>
          )}

          {paso === 2 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <p className="text-xs text-gray-400">Inventario de <span className="text-[#C44A35] font-medium">{comunidadCompleta} · {espacio} · {tipo}</span></p>
              {cargandoInventario ? (
                <div className="py-8 text-center text-sm text-gray-400">Cargando inventario…</div>
              ) : objetos.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">
                  No hay objetos registrados en esta categoría para este espacio todavía.
                  <br />
                  Puedes volver atrás y usar &quot;Añadir&quot; para darlo de alta.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {objetos.map((obj) => (
                    <button key={obj.id} onClick={() => setObjetoSeleccionado(obj)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${objetoSeleccionado?.id === obj.id ? "bg-[#FDF0ED] border-[#E8614A]" : "bg-gray-50 border-gray-200 hover:border-[#E8614A]"}`}>
                      <span className="text-lg">{ICONOS[tipo]}</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-800">{obj.nombre}</div>
                        <div className="text-xs text-gray-400">{obj.proveedor}</div>
                      </div>
                      {objetoSeleccionado?.id === obj.id && <span className="text-[#E8614A] text-lg">✓</span>}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => setPaso(1)} className="px-4 py-3 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl text-sm">← Atrás</button>
                <button onClick={() => setPaso(3)} disabled={!objetoSeleccionado} className="flex-1 py-3 bg-[#E8614A] text-white rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-[#C44A35] transition-all">
                  Siguiente → Añadir nuevo
                </button>
              </div>
            </div>
          )}

          {paso === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                {objetoSeleccionado && (
                  <div className="flex items-center gap-2 bg-[#FCEBEB] border border-[#F09595] rounded-xl px-3 py-2">
                    <span className="text-sm">🔄</span>
                    <span className="text-xs text-[#791F1F]">Sustituye: <span className="font-medium">{objetoSeleccionado.nombre}</span> ({objetoSeleccionado.proveedor})</span>
                  </div>
                )}
                <div className="border border-dashed border-[#F5C4BB] rounded-xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-[#E8614A]">➕ Datos del nuevo objeto</p>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Nombre</label>
                    <input type="text" value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} placeholder="Ej: Sofá 3 plazas esquinero" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-[#E8614A]" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Proveedor</label>
                    <input type="text" value={nuevoProveedor} onChange={(e) => setNuevoProveedor(e.target.value)} placeholder="Ej: Westwing" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-[#E8614A]" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Precio aprox.</label>
                    <input type="text" value={nuevoPrecio} onChange={(e) => setNuevoPrecio(e.target.value)} placeholder="Ej: 650" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-[#E8614A]" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Comentario</label>
                  <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} rows={2} placeholder="Ej: el anterior estaba deteriorado…" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 resize-none focus:outline-none focus:border-[#E8614A]" />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Factura / ticket</label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <label className="flex flex-col items-center gap-1 py-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-xs text-gray-500 cursor-pointer hover:bg-gray-100 transition-all">
                      📷<span>Foto ticket</span>
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { if (e.target.files?.[0]) setFoto(e.target.files[0]); }} />
                    </label>
                    <label className="flex flex-col items-center gap-1 py-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-xs text-gray-500 cursor-pointer hover:bg-gray-100 transition-all">
                      📄<span>Subir PDF</span>
                      <input type="file" accept=".pdf" className="hidden" onChange={(e) => { if (e.target.files?.[0]) setFoto(e.target.files[0]); }} />
                    </label>
                  </div>
                  {foto && (
                    <div className="flex items-center gap-2 bg-[#FDF0ED] border border-[#F5C4BB] rounded-xl px-3 py-2 mb-2">
                      <span className="text-sm">📎</span>
                      <span className="text-xs text-[#C44A35] flex-1 truncate">{foto.name}</span>
                      <button onClick={() => setFoto(null)} className="text-xs text-gray-400">✕</button>
                    </div>
                  )}
                  <div className="flex items-center gap-2 bg-[#E1F5EE] border border-[#5DCAA5] rounded-xl px-3 py-2">
                    <span className="text-sm">📧</span>
                    <span className="text-xs text-[#085041]">Se enviará a facturas@arca.com</span>
                  </div>
                </div>

                {error && (
                  <div className="bg-[#FCEBEB] border border-[#F09595] text-[#A32D2D] text-xs rounded-xl px-4 py-2">{error}</div>
                )}

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setPaso(modo === "cambio" ? 2 : 1)} className="px-4 py-3 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl text-sm">← Atrás</button>
                  <button
                    onClick={async () => {
                      setGuardando(true);
                      setError(null);
                      let urlFoto = null;
                      if (foto) {
                        const ref = `PRM-${Date.now()}`;
                        const fd = new FormData();
                        fd.append("file", foto);
                        fd.append("bucket", "facturas");
                        fd.append("ref", ref);
                        const res = await fetch("/api/upload", { method: "POST", body: fd });
                        const data = await res.json();
                        if (data.url) urlFoto = data.url;
                        else {
                          setError("No se pudo subir la factura. Comprueba tu conexión e inténtalo de nuevo.");
                          setGuardando(false);
                          return;
                        }
                      }

                      // 1) Registro en historial (igual que antes)
                      const { error: errInsert } = await supabase.from("Registros").insert({
                        tipo: "permanente",
                        comunidad: comunidadCompleta,
                        area, espacio, persona: miembro,
                        categoria: tipo,
                        subcategoria: objetoSeleccionado?.nombre || "",
                        descripcion: nuevoNombre,
                        comentario,
                        estado: "Hecho",
                        gasto: nuevoPrecio ? parseFloat(nuevoPrecio) : null,
                        foto_url: urlFoto,
                        fecha_creacion: new Date().toISOString(),
                      });

                      if (errInsert) {
                        setError("No se pudo guardar el registro. Inténtalo de nuevo.");
                        setGuardando(false);
                        return;
                      }

                      // 2) Si sustituye un objeto, se archiva en la tabla maestra
                      if (modo === "cambio" && objetoSeleccionado) {
                        const { error: errorBaja } = await supabase
                          .from("PermanentesInventario")
                          .update({ activo: false, fecha_baja: new Date().toISOString() })
                          .eq("id", objetoSeleccionado.id);
                        if (errorBaja) {
                          setError("No se pudo archivar el objeto anterior. Revísalo en Maestras.");
                          setGuardando(false);
                          return;
                        }
                      }

                      // 3) El objeto nuevo se da de alta en la tabla maestra
                      const { error: errorAlta } = await supabase.from("PermanentesInventario").insert({
                        comunidad, area, espacio,
                        categoria: tipo,
                        nombre: nuevoNombre,
                        proveedor: nuevoProveedor,
                        precio: nuevoPrecio ? parseFloat(nuevoPrecio) : null,
                        activo: true,
                      });
                      if (errorAlta) {
                        setError("El registro se guardó, pero no se pudo dar de alta en el inventario. Revísalo en Maestras.");
                        setGuardando(false);
                        return;
                      }

                      setGuardando(false);
                      setPaso(4);
                    }}
                    disabled={!nuevoNombre || guardando}
                    className="flex-1 py-3 bg-[#E8614A] text-white rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-[#C44A35] transition-all"
                  >
                    {guardando ? "Guardando…" : "Guardar cambio"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default function Permanente() {
  return (
    <Suspense>
      <PermanenteInner />
    </Suspense>
  );
}
