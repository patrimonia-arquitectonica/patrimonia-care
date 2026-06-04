"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AppLayout from "@/components/AppLayout";

const TIPOS = ["Mobiliario", "Iluminación", "Electrodoméstico", "Decoración"];
const INVENTARIO: Record<string, { nombre: string; proveedor: string }[]> = {
  Mobiliario: [
    { nombre: "Sofá 3 plazas", proveedor: "Ikea" },
    { nombre: "Mesa salón elevable", proveedor: "Ikea" },
    { nombre: "Mueble salón", proveedor: "Ikea" },
    { nombre: "Sofá cama 2 plazas", proveedor: "Ikea" },
  ],
  Iluminación: [
    { nombre: "Lámpara techo salón", proveedor: "Leroy Merlin" },
    { nombre: "Aplique baño", proveedor: "Leroy Merlin" },
  ],
  Electrodoméstico: [
    { nombre: "Lavadora", proveedor: "Balay" },
    { nombre: "Frigorífico", proveedor: "Samsung" },
    { nombre: "Microondas", proveedor: "LG" },
  ],
  Decoración: [
    { nombre: "Cortinas salón", proveedor: "Zara Home" },
    { nombre: "Espejo entrada", proveedor: "Ikea" },
  ],
};

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
  const [objetoSeleccionado, setObjetoSeleccionado] = useState<{ nombre: string; proveedor: string } | null>(null);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoProveedor, setNuevoProveedor] = useState("");
  const [nuevoPrecio, setNuevoPrecio] = useState("");
  const [comentario, setComentario] = useState("");
  const [foto, setFoto] = useState<File | null>(null);

  const objetos = tipo ? INVENTARIO[tipo] || [] : [];
  const comunidadCompleta = `${comunidad}${area ? ` · ${area}` : ""}`;

  if (paso === 4) {
    return (
      <AppLayout>
        <div className="p-6 max-w-lg">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-[#E1F5EE] flex items-center justify-center text-2xl">✅</div>
            <h2 className="text-lg font-semibold text-gray-900">Cambio registrado</h2>
            <div className="w-full bg-gray-50 rounded-2xl p-4 text-left space-y-3 border border-gray-100">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Inventario actualizado</p>
              {objetoSeleccionado && (
                <div className="flex items-center gap-2 text-sm text-gray-700">❌ <span className="line-through text-gray-400">{objetoSeleccionado.nombre} ({objetoSeleccionado.proveedor})</span> → archivado</div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-700">✅ {nuevoNombre} ({nuevoProveedor}) → activo</div>
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">📧 Factura enviada a facturas@patrimoniacare.com</div>
                <div className="flex items-center gap-2 text-sm text-gray-700">🗄️ Registro guardado en historial</div>
              </div>
            </div>
            <button onClick={() => router.push("/")} className="w-full py-3 bg-[#E1F5EE] border border-[#1D9E75] text-[#085041] rounded-xl text-sm font-semibold">
              + Crear otro cambio
            </button>
            <button onClick={() => router.push("/historial")} className="w-full py-3 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl text-sm">
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
          <span className="text-xs px-3 py-1 rounded-full bg-[#1D9E75] text-white font-medium">Permanente</span>
        </div>

        {/* Barra de progreso */}
        <div className="flex gap-1 mb-6 max-w-xs">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`flex-1 h-1 rounded-full ${s < paso ? "bg-[#1D9E75]" : s === paso ? "bg-[#9FE1CB]" : "bg-gray-100"}`} />
          ))}
        </div>

        <div className="max-w-2xl space-y-4">
          {paso === 1 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              <div className="bg-[#E1F5EE] rounded-xl p-4 space-y-2">
                <div className="flex gap-2 text-sm"><span className="text-[#0F6E56] font-medium w-20">Persona</span><span className="text-[#085041]">{miembro || "—"}</span></div>
                <div className="flex gap-2 text-sm"><span className="text-[#0F6E56] font-medium w-20">Comunidad</span><span className="text-[#085041]">{comunidadCompleta || "—"}</span></div>
                <div className="flex gap-2 text-sm"><span className="text-[#0F6E56] font-medium w-20">Espacio</span><span className="text-[#085041]">{espacio || "—"}</span></div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 block">¿Qué tipo de objeto?</label>
                <div className="grid grid-cols-4 gap-2">
                  {TIPOS.map((t) => (
                    <button key={t} onClick={() => setTipo(t)} className={`py-4 rounded-xl text-sm font-medium border transition-all flex flex-col items-center gap-2 ${tipo === t ? "bg-[#E1F5EE] border-[#1D9E75] text-[#085041]" : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"}`}>
                      <span className="text-2xl">{t === "Mobiliario" ? "🪑" : t === "Iluminación" ? "💡" : t === "Electrodoméstico" ? "🫧" : "🌿"}</span>
                      <span className="text-xs">{t}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 block">¿Se trata de…?</label>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setModo("cambio")} className={`py-4 rounded-xl text-sm font-medium border transition-all flex flex-col items-center gap-1 ${modo === "cambio" ? "bg-[#E1F5EE] border-[#1D9E75] text-[#085041]" : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"}`}>
                    <span className="text-2xl">🔄</span>
                    <span>Cambio</span>
                    <span className="text-xs font-normal">sustituyes algo</span>
                  </button>
                  <button onClick={() => setModo("añadir")} className={`py-4 rounded-xl text-sm font-medium border transition-all flex flex-col items-center gap-1 ${modo === "añadir" ? "bg-[#E1F5EE] border-[#1D9E75] text-[#085041]" : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"}`}>
                    <span className="text-2xl">➕</span>
                    <span>Añadir</span>
                    <span className="text-xs font-normal">algo nuevo</span>
                  </button>
                </div>
              </div>

              <button onClick={() => setPaso(modo === "cambio" ? 2 : 3)} disabled={!tipo} className="w-full py-3 bg-[#1D9E75] text-white rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-[#0F6E56] transition-all">
                Siguiente →
              </button>
            </div>
          )}

          {paso === 2 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <p className="text-xs text-gray-400">Inventario de <span className="text-[#085041] font-medium">{comunidadCompleta} · {espacio} · {tipo}</span></p>
              <div className="grid grid-cols-1 gap-2">
                {objetos.map((obj) => (
                  <button key={obj.nombre} onClick={() => setObjetoSeleccionado(obj)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${objetoSeleccionado?.nombre === obj.nombre ? "bg-[#E1F5EE] border-[#1D9E75]" : "bg-gray-50 border-gray-200 hover:border-[#1D9E75]"}`}>
                    <span className="text-lg">{tipo === "Mobiliario" ? "🪑" : tipo === "Iluminación" ? "💡" : tipo === "Electrodoméstico" ? "🫧" : "🌿"}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">{obj.nombre}</div>
                      <div className="text-xs text-gray-400">{obj.proveedor}</div>
                    </div>
                    {objetoSeleccionado?.nombre === obj.nombre && <span className="text-[#1D9E75] text-lg">✓</span>}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setPaso(1)} className="px-4 py-3 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl text-sm">← Atrás</button>
                <button onClick={() => setPaso(3)} disabled={!objetoSeleccionado} className="flex-1 py-3 bg-[#1D9E75] text-white rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-[#0F6E56] transition-all">
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
                <div className="border border-dashed border-[#5DCAA5] rounded-xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-[#0F6E56]">➕ Datos del nuevo objeto</p>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Nombre</label>
                    <input type="text" value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} placeholder="Ej: Sofá 3 plazas esquinero" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Proveedor</label>
                    <input type="text" value={nuevoProveedor} onChange={(e) => setNuevoProveedor(e.target.value)} placeholder="Ej: Westwing" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Precio aprox.</label>
                    <input type="text" value={nuevoPrecio} onChange={(e) => setNuevoPrecio(e.target.value)} placeholder="Ej: 650" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Comentario</label>
                  <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} rows={2} placeholder="Ej: el anterior estaba deteriorado…" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 resize-none" />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Factura / ticket</label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <label className="flex flex-col items-center gap-1 py-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-xs text-gray-500 cursor-pointer">
                      📷<span>Foto ticket</span>
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { if (e.target.files?.[0]) setFoto(e.target.files[0]); }} />
                    </label>
                    <label className="flex flex-col items-center gap-1 py-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-xs text-gray-500 cursor-pointer">
                      📄<span>Subir PDF</span>
                      <input type="file" accept=".pdf" className="hidden" onChange={(e) => { if (e.target.files?.[0]) setFoto(e.target.files[0]); }} />
                    </label>
                  </div>
                  {foto && (
                    <div className="flex items-center gap-2 bg-[#E1F5EE] border border-[#5DCAA5] rounded-xl px-3 py-2 mb-2">
                      <span className="text-sm">📎</span>
                      <span className="text-xs text-[#085041] flex-1 truncate">{foto.name}</span>
                      <button onClick={() => setFoto(null)} className="text-xs text-gray-400">✕</button>
                    </div>
                  )}
                  <div className="flex items-center gap-2 bg-[#E1F5EE] border border-[#5DCAA5] rounded-xl px-3 py-2">
                    <span className="text-sm">📧</span>
                    <span className="text-xs text-[#085041]">Se enviará a facturas@patrimoniacare.com</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setPaso(modo === "cambio" ? 2 : 1)} className="px-4 py-3 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl text-sm">← Atrás</button>
                  <button onClick={async () => {
                    let urlFoto = null;
                    if (foto) {
                      const ref = `PRM-${Date.now()}`;
                      const fd = new FormData();
                      fd.append("file", foto);
                      fd.append("bucket", "facturas");
                      fd.append("ref", ref);
                      const res = await fetch("/api/upload", { method: "POST", body: fd });
                      const data = await res.json();
                      urlFoto = data.url;
                    }
                    const { error } = await supabase.from("Registros").insert({
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
                    if (!error) setPaso(4);
                    else console.error(error);
                  }} disabled={!nuevoNombre} className="flex-1 py-3 bg-[#1D9E75] text-white rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-[#0F6E56] transition-all">
                    Guardar cambio
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