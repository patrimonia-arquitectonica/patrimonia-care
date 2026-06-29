"use client";
import { useSearchParams } from "next/navigation";
import Sidebar from "./Sidebar";
import { Suspense, useState, useEffect } from "react";

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const [miembroLocal, setMiembroLocal] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const guardado = localStorage.getItem("miembro") || "";
    setMiembroLocal(guardado);
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
