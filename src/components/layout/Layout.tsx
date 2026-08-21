import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout() {
  return (
    <div className="flex h-screen bg-slate-50">
      <div className="sticky top-0 h-screen">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 relative overflow-y-auto">
          {/* Fondo de cuadrícula, casi imperceptible, con fade hacia los bordes */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(15, 23, 42, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(15, 23, 42, 0.06) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              WebkitMaskImage: "radial-gradient(ellipse 90% 70% at 50% 0%, black 50%, transparent 100%)",
              maskImage: "radial-gradient(ellipse 90% 70% at 50% 0%, black 50%, transparent 100%)",
            }}
          />
          <div className="relative p-8 h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}