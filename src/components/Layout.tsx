import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Heart, MessageCircle, User, Menu, Info, Shield, FileText, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';

export function Layout() {
  const { user, profile } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
      <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 relative">
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" title="হোমপেজে ফিরে যান">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            </Button>
          </Link>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-pink-500 to-blue-500 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-white fill-current" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-blue-500">
              PremerBazar
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6 mr-4">
            <Link to="/" className={`text-sm font-medium flex items-center gap-1 ${location.pathname === '/' ? 'text-pink-500' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'}`}>
              <Heart className="w-4 h-4" /> হোম
            </Link>
            <Link to="/app/matches" className={`text-sm font-medium flex items-center gap-1 ${location.pathname.startsWith('/app/matches') ? 'text-pink-500' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'}`}>
              <MessageCircle className="w-4 h-4" /> কথা
            </Link>
            <Link to="/app/profile" className={`text-sm font-medium flex items-center gap-1 ${location.pathname === '/app/profile' ? 'text-pink-500' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'}`}>
              <User className="w-4 h-4" /> প্রোফাইল
            </Link>
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-2"></div>
            <Link to="/about" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white flex items-center gap-1">
              <Info className="w-4 h-4" /> আমাদের সম্পর্কে
            </Link>
            <Link to="/privacy" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white flex items-center gap-1">
              <Shield className="w-4 h-4" /> প্রাইভেসি পলিসি
            </Link>
            <Link to="/blog" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white flex items-center gap-1">
              <FileText className="w-4 h-4" /> ব্লগ
            </Link>
            <Link to="/report" className="text-sm font-medium text-red-500 hover:text-red-700 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" /> রিপোর্ট করুন
            </Link>
          </div>
          {profile && user?.email !== 'mdmahbubsite@gmail.com' && (
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300 hidden sm:block">
              {profile.name}
            </span>
          )}
          {user?.email === 'mdmahbubsite@gmail.com' && (
            <Link to="/admin" className="hidden sm:flex text-sm font-bold text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full items-center gap-1 shadow-sm">
              <Shield className="w-4 h-4" /> Admin
            </Link>
          )}
          <div className="relative md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)} title="মেনু">
              <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </Button>
            
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50 overflow-hidden py-1">
                  <Link to="/about" className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                    <Info className="w-4 h-4 text-blue-500" /> আমাদের সম্পর্কে
                  </Link>
                  <Link to="/privacy" className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                    <Shield className="w-4 h-4 text-green-500" /> প্রাইভেসি পলিসি
                  </Link>
                  <Link to="/blog" className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                    <FileText className="w-4 h-4 text-purple-500" /> ব্লগ
                  </Link>
                  <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                  <Link to="/report" className="w-full text-left px-4 py-3 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                    <AlertTriangle className="w-4 h-4" /> রিপোর্ট করুন
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto h-full">
          <Outlet />
        </div>
      </main>

      <nav className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe md:hidden">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          <NavItem to="/" icon={<Heart />} label="হোম" active={location.pathname === '/'} />
          <NavItem to="/app/matches" icon={<MessageCircle />} label="কথা" active={location.pathname.startsWith('/app/matches')} />
          <NavItem to="/app/profile" icon={<User />} label="প্রোফাইল" active={location.pathname === '/app/profile'} />
        </div>
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label, active }: { to: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
        active ? 'text-pink-500' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
      }`}
    >
      <div className={`[&>svg]:w-6 [&>svg]:h-6 ${active ? '[&>svg]:fill-pink-100 dark:[&>svg]:fill-pink-900/30' : ''}`}>
        {icon}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
