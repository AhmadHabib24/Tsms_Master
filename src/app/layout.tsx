'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import { LayoutDashboard, Users, Activity, LogOut, Package, ShieldAlert, BookOpen, Blocks, Settings } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import api from "@/lib/api";

const inter = Inter({ subsets: ["latin"] });

import { Menu, X } from 'lucide-react';
import PwaInstallPrompt from '@/components/PwaInstallPrompt';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isAuthPage = pathname === '/login' || pathname === '/forgot-password' || pathname === '/reset-password';

  useEffect(() => {
    setIsMounted(true);
    const token = localStorage.getItem('token');
    if (!token && !isAuthPage) {
      router.push('/login');
    }
  }, [pathname, isAuthPage, router]);

  const handleLogout = async () => {
    try {
      await api.post('/api/logout');
    } catch (e) {}
    localStorage.removeItem('token');
    router.push('/login');
  };

  const NavLink = ({ href, icon: Icon, children }: { href: string, icon: any, children: React.ReactNode }) => (
    <Link 
      href={href} 
      onClick={() => setIsSidebarOpen(false)}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#333333] transition-colors ${pathname === href ? 'bg-[#333333] text-white' : 'text-gray-400 hover:text-white'}`}
    >
      <Icon size={20} className="text-yellow-500" />
      <span>{children}</span>
    </Link>
  );

  if (!isMounted) {
    return (
      <html lang="en">
        <body suppressHydrationWarning className={`${inter.className} bg-[#121212] text-white`}>
          <div className="min-h-screen flex items-center justify-center bg-[#121212]"></div>
        </body>
      </html>
    );
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token && !isAuthPage) {
    return (
      <html lang="en">
        <body suppressHydrationWarning className={`${inter.className} bg-[#121212] text-white`}>
          <div className="min-h-screen flex items-center justify-center bg-[#121212]"></div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#121212" />
        <link rel="apple-touch-icon" href="/tecveq_logo.png" />
      </head>
      <body suppressHydrationWarning className={`${inter.className} bg-[#121212] text-white`}>
        <Toaster position="top-right" />
        <PwaInstallPrompt />
        {isAuthPage ? (
          <main className="min-h-screen flex items-center justify-center bg-[#121212]">
            {children}
          </main>
        ) : (
          <div className="flex h-screen overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
              <div 
                className="fixed inset-0 bg-black/60 z-40 md:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}

            {/* Sidebar */}
            <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#1e1e1e] border-r border-[#333333] flex flex-col transform transition-transform duration-200 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
              <div className="h-16 flex items-center justify-between md:justify-center px-4 md:px-0 border-b border-[#333333]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center font-bold text-black">T</div>
                  <h1 className="text-xl font-bold text-yellow-500">TSMS Master</h1>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <nav className="flex-1 px-4 py-6 space-y-2">
                <NavLink href="/" icon={LayoutDashboard}>Dashboard</NavLink>
                <NavLink href="/clients" icon={Users}>Clients</NavLink>
                <NavLink href="/plans" icon={Package}>Plans</NavLink>
                <NavLink href="/addon-plans" icon={Blocks}>Addon Packages</NavLink>
                <NavLink href="/addon-approvals" icon={Activity}>Addon Approvals</NavLink>
                <NavLink href="/password-change-requests" icon={ShieldAlert}>Password Requests</NavLink>
                <NavLink href="/settings" icon={Settings}>Settings</NavLink>
                <NavLink href="/activity" icon={Activity}>Activity Logs</NavLink>
                <NavLink href="/tracker" icon={ShieldAlert}>Piracy Logs</NavLink>
                <NavLink href="/admin-guide" icon={BookOpen}>Admin Guide</NavLink>
              </nav>
              <div className="p-4 border-t border-[#333333]">
                <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors text-red-500 font-medium">
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
              
              {/* Mobile Header */}
              <div className="md:hidden h-16 bg-[#1e1e1e] border-b border-[#333333] flex items-center justify-between px-4 z-30 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center font-bold text-black">T</div>
                  <h1 className="text-lg font-bold text-yellow-500">Master</h1>
                </div>
                <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Logout">
                  <LogOut size={20} />
                </button>
              </div>

              <main className="flex-1 overflow-y-auto bg-[#121212] pb-20 md:pb-0">
                {children}
              </main>

              {/* Mobile Bottom Navigation */}
              <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#1e1e1e] border-t border-[#333333] flex justify-around items-center z-40 px-2">
                <button onClick={() => setIsSidebarOpen(true)} className="flex flex-col items-center gap-1 text-gray-400 hover:text-yellow-500 transition-colors p-2">
                  <Menu size={20} />
                  <span className="text-[10px] font-medium">Menu</span>
                </button>
                <Link href="/" className={`flex flex-col items-center gap-1 transition-colors p-2 ${pathname === '/' ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}>
                  <LayoutDashboard size={20} />
                  <span className="text-[10px] font-medium">Dashboard</span>
                </Link>
                <Link href="/clients" className={`flex flex-col items-center gap-1 transition-colors p-2 ${pathname === '/clients' ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}>
                  <Users size={20} />
                  <span className="text-[10px] font-medium">Clients</span>
                </Link>
                <Link href="/plans" className={`flex flex-col items-center gap-1 transition-colors p-2 ${pathname === '/plans' ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}>
                  <Package size={20} />
                  <span className="text-[10px] font-medium">Plans</span>
                </Link>
                <Link href="/activity" className={`flex flex-col items-center gap-1 transition-colors p-2 ${pathname === '/activity' ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}>
                  <Activity size={20} />
                  <span className="text-[10px] font-medium">Activity</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
