"use client";
import { useRouter, usePathname } from "next/navigation";

// sidebar
const NAV = [
  { section: "General", items: [
    { label: "Dashboard", icon: "ti-layout-dashboard", href: "/dashboard" },
    { label: "Inicio", icon: "ti-home", href: "/inicio" },
    { label: "Calendario", icon: "ti-calendar", href: "/calendario" },
    { label: "Campañas", icon: "ti-refresh", href: "/campanas" },
    { label: "Historial", icon: "ti-history", href: "/historial" },
    { label: "Maestras", icon: "ti-settings", href: "/maestras" },

  ]},
];

export default function Sidebar({ miembro, comunidad }: { miembro?: string; comunidad?: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-white border-r border-gray-100 flex flex-col flex-shrink-0 h-screen sticky top-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-100 flex flex-col items-center gap-2">
        <img src="/arca-logo.png" alt="ARCA" className="h-10 w-auto object-contain" />
        <span style={{ fontFamily: "Georgia, serif", letterSpacing: "0.25em" }} className="text-base font-medium text-gray-800 uppercase">Arca</span>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-3 px-3">
        {NAV.map((section) => (
          <div key={section.section} className="mb-4">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest px-2 mb-1">{section.section}</p>
            {section.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "?");
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm mb-0.5 transition-all text-left ${active ? "bg-[#FDF0ED] text-[#E8614A] font-medium" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`}
                >
                  <i className={`ti ${item.icon} text-base`} aria-hidden="true"></i>
                  {item.label}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Usuario */}
      <div className="border-t border-gray-100 p-3">
        <button
          onClick={() => router.push("/inicio")}
          className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg transition-all ${miembro ? "hover:bg-gray-50" : "bg-[#FDF0ED] hover:bg-[#F5C4BB]"}`}
        >
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${miembro ? "bg-[#FDF0ED] text-[#E8614A]" : "bg-[#E8614A] text-white"}`}>
            {miembro ? miembro.slice(0,2).toUpperCase() : "👋"}
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className={`text-sm font-medium truncate ${miembro ? "text-gray-800" : "text-[#E8614A]"}`}>
            {miembro || "¿Quién eres?"}
            </p>
            <p className="text-xs text-gray-400 truncate">
            {comunidad || "Pulsa para identificarte"}
            </p>
          </div>
          <i className="ti ti-chevron-up text-gray-300 text-sm" aria-hidden="true"></i>
        </button>
    </div>
    </aside>
  );
}