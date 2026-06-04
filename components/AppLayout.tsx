"use client";
import { useSearchParams } from "next/navigation";
import Sidebar from "./Sidebar";
import { Suspense } from "react";

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const miembro = searchParams.get("miembro") || "";
  const comunidad = searchParams.get("comunidad") || "";

  return (
    <div className="flex min-h-screen">
      <Sidebar miembro={miembro} comunidad={comunidad} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
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