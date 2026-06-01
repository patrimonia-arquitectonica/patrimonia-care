"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

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

export default function Permanente() {
  const router = useRouter();
  const [paso, setPaso] = useState<1 | 2 | 3 | 4>(1);
  const [tipo, setTipo] = useState("");
  const [modo, setModo] = useState<"cambio" | "añadir">("cambio");
  const [objetoSeleccionado, setObjetoSeleccionado] = useState<{ nombre: string; proveedor: string } | null>(null);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoProveedor, setNuevoProveedor] = useState("");
  const [nuevoPrecio, setNuevoPrecio] = useState("");
  const [comentario, setComentario] = useState("");

  const objetos = tipo ? INVENTARIO[tipo] || [] : [];

  if (paso === 4) {
    return (
      <div className="min-h-screen bg-[#F5F4F0] flex flex-col items-center justify-start p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="px-5 py-10 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-[#E1F5EE] flex items-center justify-center text-2xl">✅</div>
            <h2 className="text-lg font-semibold text-gray-900">Cambio registrado</h2>
            <p className="text-sm text-gray-400">Ref. <span className="text-[#1D9E75] font-semibold">#PRM-0024</span></p>
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
            <button onClick={() => { setPaso(1); setTipo(""); setObjetoSeleccionado(null); setNuevoNombre(""); setNuevoProveedor(""); setNuevoPrecio(""); setComentario(""); }} className="w-full py-3 bg-[#E1F5EE] border border-[#1D9E75] text-[#085041] rounded-xl text-sm font-semibold">
              + Crear otro cambio
            </button>
            <button onClick={() => router.push("/")} className="w-full py-3 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl text-sm">
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F4F0] flex flex-col items-center justify-start p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-center gap-3">
          <button onClick={() => paso === 1 ? router.push("/") : setPaso((paso - 1) as 1 | 2 | 3)} className="text-gray-400 hover:text-gray-600 text-lg">←</button>
          <div className="flex-1">
            <h1 className="text-base font-semibold text-gray-900">
              {paso === 1 ? "Cambio permanente" : paso === 2 ? "Elige qué cambiaste" : "Objeto nuevo"}
            </h1>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-[#1D9E75] text-white font-medium">Permanente</span>
        </div>

        {/* Barra de progreso */}
        <div className="px-5 pt-4">
          <div className="flex gap-1 mb-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`flex-1 h-1 rounded-full ${s < paso ? "bg-[#1D9E75]" : s === paso ? "bg-[#9FE1CB]" : "bg-gray-100"}`} />
            ))}
          </div>
        </div>

        <div className="px-5 pb-5 space-y-4">
          {/* PASO 1 */}
          {paso === 1 && (
            <>
              <div className="bg-[#E1F5EE] rounded-2xl p-4 space-y-2">
                <div className="flex gap-2 text-sm"><span className="text-[#0F6E56] font-medium w-20">Persona</span><span className="text-[#085041]">Sara García</span></div>
                <div className="flex gap-2 text-sm"><span className="text-[#0F6E56] font-medium w-20">Comunidad</span><span className="text-[#085041]">Fuencarral 29C ✦</span></div>
                <div className="flex gap-2 text-sm"><span className="text-[#0F6E56] font-medium w-20">Espacio</span><span className="text-[#085041]">Salón</span></div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 block">¿Qué tipo de objeto?</label>
                <div className="grid grid-cols-2 gap-2">
                  {TIPOS.map((t) => (
                    <button key={t} onClick={() => setTipo(t)} className={`py-3 rounded-xl text-sm font-medium border transition-all ${tipo === t ? "bg-[#E1F5EE] border-[#1D9E75] text-[#085041]" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
                      {t === "Mobiliario" ? "🪑" : t === "Iluminación" ? "💡" : t === "Electrodoméstico" ? "🫧" : "🌿"} {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 block">¿Se trata de…?</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setModo("cambio")} className={`py-3 rounded-xl text-sm font-medium border transition-all ${modo === "cambio" ? "bg-[#E1F5EE] border-[#1D9E75] text-[#085041]" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
                    🔄 Cambio<div className="text-xs font-normal mt-1">sustituyes algo</div>
                  </button>
                  <button onClick={() => setModo("añadir")} className={`py-3 rounded-xl text-sm font-medium border transition-all ${modo === "añadir" ? "bg-[#E1F5EE] border-[#1D9E75] text-[#085041]" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
                    ➕ Añadir<div className="text-xs font-normal mt-1">algo nuevo</div>
                  </button>
                </div>
              </div>

              <button onClick={() => setPaso(modo === "cambio" ? 2 : 3)} disabled={!tipo} className="w-full py-3 bg-[#1D9E75] text-white rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-[#0F6E56] transition-all">
                Siguiente →
              </button>
            </>
          )}

          {/* PASO 2 — inventario */}
          {paso === 2 && (
            <>
              <p className="text-xs text-gray-400">Inventario de <span className="text-[#085041] font-medium">Fuencarral 29C · Salón · {tipo}</span></p>
              <div className="space-y-2">
                {objetos.map((obj) => (
                  <button key={obj.nombre} onClick={() => setObjetoSeleccionado(obj)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${objetoSeleccionado?.nombre === obj.nombre ? "bg-[#E1F5EE] border-[#1D9E75]" : "bg-gray-50 border-gray-200"}`}>
                    <span className="text-lg">{tipo === "Mobiliario" ? "🪑" : tipo === "Iluminación" ? "💡" : tipo === "Electrodoméstico" ? "🫧" : "🌿"}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">{obj.nombre}</div>
                      <div className="text-xs text-gray-400">{obj.proveedor}</div>
                    </div>
                    {objetoSeleccionado?.nombre === obj.nombre && <span className="text-[#1D9E75] text-lg">✓</span>}
                  </button>
                ))}
              </div>
              <button onClick={() => setPaso(3)} disabled={!objetoSeleccionado} className="w-full py-3 bg-[#1D9E75] text-white rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-[#0F6E56] transition-all">
                Siguiente → Añadir nuevo
              </button>
            </>
          )}

          {/* PASO 3 — nuevo objeto */}
          {paso === 3 && (
            <>
              {objetoSeleccionado && (
                <div className="flex items-center gap-2 bg-[#FCEBEB] border border-[#F09595] rounded-xl px-3 py-2">
                  <span className="text-sm">🔄</span>
                  <span className="text-xs text-[#791F1F]">Sustituye: <span className="font-medium">{objetoSeleccionado.nombre}</span> ({objetoSeleccionado.proveedor})</span>
                </div>
              )}

              <div className="border border-dashed border-[#5DCAA5] rounded-2xl p-4 space-y-3">
                <p className="text-xs font-semibold text-[#0F6E56] flex items-center gap-1">➕ Datos del nuevo objeto</p>
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
                  <input type="text" value={nuevoPrecio} onChange={(e) => setNuevoPrecio(e.target.value)} placeholder="Ej: 650 €" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Factura / ticket</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button className="flex flex-col items-center gap-1 py-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-xs text-gray-500">📷<span>Foto ticket</span></button>
                  <button className="flex flex-col items-center gap-1 py-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-xs text-gray-500">📄<span>Subir PDF</span></button>
                </div>
                <div className="flex items-center gap-2 bg-[#E1F5EE] border border-[#5DCAA5] rounded-xl px-3 py-2">
                  <span className="text-sm">📧</span>
                  <span className="text-xs text-[#085041]">Se enviará a facturas@patrimoniacare.com con ref. #PRM-0024</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Comentario</label>
                <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} rows={2} placeholder="Ej: el anterior estaba deteriorado…" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 resize-none" />
              </div>

              <button onClick={() => setPaso(4)} disabled={!nuevoNombre} className="w-full py-3 bg-[#1D9E75] text-white rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-[#0F6E56] transition-all">
                Guardar cambio
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}