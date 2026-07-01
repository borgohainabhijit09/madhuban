"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayoutShell({
  children,
  initials,
  userName
}: {
  children: React.ReactNode;
  initials: string;
  userName: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F7F5F0] overflow-hidden font-sans">
      {/* Sidebar for Desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <AdminSidebar initials={initials} userName={userName} />
      </div>

      {/* Sidebar Drawer for Mobile */}
      <div 
        className={`fixed inset-0 z-50 flex lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop overlay */}
        <div 
          className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ${
            sidebarOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setSidebarOpen(false)}
        />
        
        {/* Sidebar Container */}
        <div 
          className={`relative flex flex-col w-64 max-w-xs bg-[#21050A] text-white transition-transform duration-300 ease-in-out transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Close button inside sidebar drawer */}
          <div className="absolute top-5 right-4 z-50">
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-xl bg-black/20 hover:bg-black/40 text-gray-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <AdminSidebar initials={initials} userName={userName} onLinkClick={() => setSidebarOpen(false)} />
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header Bar */}
        <header className="lg:hidden flex items-center justify-between px-5 py-3.5 bg-[#21050A] text-white border-b border-white/5 flex-shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-xl hover:bg-[#3D141C] text-gray-300 hover:text-white transition-colors"
            >
              <Menu size={22} />
            </button>
            <span className="font-bold text-base tracking-wide text-[#C89F5F]">Madhuban Admin</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#C89F5F] flex items-center justify-center text-white font-bold text-xs">
            {initials}
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 md:p-8">
          {children}
        </div>
      </main>
      
      {/* Global custom scrollbars */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }
        aside .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
        }
      `}} />
    </div>
  );
}
