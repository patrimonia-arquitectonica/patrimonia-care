"use client";
import { useSearchParams } from "next/navigation";
import Sidebar from "./Sidebar";
import { Suspense, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const getLunes = (fecha: Date) => {
  const d = new Date(fecha);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Revisa las campañas activas y avanza fecha_instancia a la semana siguiente
// si la instancia actual ya está completa del todo. Antes esto solo vivía en
// app/campanas/page.tsx, así que si nadie abría esa página, el resto de la
// app (Calendario, Dashboard...) se quedaba viendo la semana vieja aunque la
// campaña ya estuviera terminada. Al ponerlo aquí, corre en cualquier página.
const revisarAvanceCampanas = async () => {
  const [{ data: campanas }, { data: comunidades }, { data: registros }] = await Promise.all([
    supabase.from("campanas").select("*").eq("activa", true),
    supabase.from("comunidades").select("*"),
    supabase.from("Registros").select("id, campana_id, area, comunidad, estado, fecha_creacion").not("campana_id", "is", null),
  ]);
  if (!campanas || !comunidades || !registros) return;

  for (const campana of campanas) {
    const targets: { comunidad: string; area: string }[] = [];
    for (const com of comunidades) {
      if (campana.aplica_a === "pisos" || campana.aplica_a === "todo") {
        for (const piso of (com.pisos || [])) targets.push({ comunidad: com.nombre, area: piso });
      }
      if ((campana.aplica_a === "zonas_comunes" || campana.aplica_a === "todo") && com.zonas_comunes) {
        targets.push({ comunidad: com.nombre, area: "Zonas comunes" });
      }
    }
    const lunes = getLunes(new Date(campana.fecha_instancia));
    const regsInstancia = registros.filter((r) => r.campana_id === campana.id && new Date(r.fecha_creacion) >= lunes);
    const todosHechos = targets.length > 0 && targets.every((t) =>
      regsInstancia.some((r) => r.area === t.area && r.comunidad?.includes(t.comunidad) && (r.estado === "Resuelto" || r.estado === "Hecho"))
    );
    if (todosHechos) {
      const nuevaFecha = new Date(campana.fecha_instancia);
      nuevaFecha.setDate(nuevaFecha.getDate() + campana.frecuencia_dias);
      // Realineamos siempre al lunes: si frecuencia_dias no es múltiplo de 7
      // (30 días, por ejemplo), sumar a secas va desplazando la instancia poco
      // a poco fuera del lunes, y cada pantalla termina "corrigiéndolo" a su manera.
      const nuevaFechaAlineada = getLunes(nuevaFecha);
      await supabase.from("campanas").update({
        fecha_instancia: nuevaFechaAlineada.toISOString().split("T")[0],
        completada: true,
      }).eq("id", campana.id);
    }
  }
};

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const [miembroLocal, setMiembroLocal] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const guardado = localStorage.getItem("miembro") || "";
    setMiembroLocal(guardado);
    revisarAvanceCampanas();
  }, []);

  const miembro = searchParams.get("miembro") || miembroLocal;
  const comunidad = searchParams.get("comunidad") || "";

  return (
    <div className="flex min-h-screen">
      <Sidebar
        miembro={miembro}
        comunidad={comunidad}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Barra superior móvil */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-40">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-all"
          >
            <i className="ti ti-menu-2 text-xl" aria-hidden="true"></i>
          </button>
          <div className="flex items-center gap-2">
            <img src="/arca-logo.png" alt="ARCA" className="h-6 w-auto object-contain" />
            <span style={{ fontFamily: "Georgia, serif", letterSpacing: "0.2em" }} className="text-sm font-medium text-gray-800 uppercase">Arca</span>
          </div>
          {miembro && (
            <div className="ml-auto w-7 h-7 rounded-full bg-[#FDF0ED] text-[#E8614A] flex items-center justify-center text-xs font-medium">
              {miembro.slice(0, 2).toUpperCase()}
            </div>
          )}
        </header>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <AppLayoutInner>{children}</AppLayoutInner>
    </Suspense>
  );
}
