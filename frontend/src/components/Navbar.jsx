import React, { useState } from 'react';
import { Menu, X, ArrowRight, UserCheck } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ onNavigate, currentPath, user, onLogout, theme, onToggleTheme }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  const navLinks = [
    { id: 'home', label: 'Home', href: '#top' },
    { id: 'about', label: 'About', href: '#about' },
    { id: 'features', label: 'Features', href: '#features' },
    { id: 'training', label: 'Training', href: '#training' },
    { id: 'ai', label: 'AI & Analytics', href: '#ai-pipeline' },
    { id: 'contact', label: 'Contact', href: '#contact' }
  ];

  const handleNavClick = (id, href) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    if (currentPath !== '/') {
      onNavigate('/');
      setTimeout(() => {
        const elem = document.querySelector(href);
        if (elem) elem.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const elem = document.querySelector(href);
      if (elem) elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogoClick = () => {
    setActiveTab('home');
    setMobileMenuOpen(false);
    onNavigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Left: Brand Logo & Tagline */}
        <div 
          onClick={handleLogoClick}
          className="flex items-center gap-3 cursor-pointer group select-none"
          title="Go to ResQVerse Home"
        >
          <div className="w-11 h-11 shrink-0 overflow-hidden rounded-xl shadow-md shadow-slate-900/10 group-hover:scale-105 transition-transform">
            <img src="/images/VRlogo.jpeg" alt="ResQVerse logo" className="h-full w-full object-cover" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1">
              ResQVerse
            </span>
            <span className="block text-[10px] font-semibold text-slate-500 tracking-wider uppercase">
              Train Today, Save Tomorrow
            </span>
          </div>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id && currentPath === '/';
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id, link.href)}
                className={`relative text-sm font-semibold transition-colors py-1 ${
                  isActive ? 'text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f95738] rounded-full animate-fadeIn" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('/login')}
                className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors shadow-sm"
              >
                Login
              </button>
              <button
                onClick={() => onNavigate('/dashboard')}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs tracking-wide shadow-md flex items-center gap-2 transition-all"
              >
                <UserCheck className="w-4 h-4 text-orange-400" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={onLogout}
                className="px-3 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => onNavigate('/login')}
                className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors shadow-sm"
              >
                Login
              </button>

            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id, link.href)}
                className="text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <>
                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigate('/login'); }}
                  className="w-full py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs"
                >
                  Login
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigate('/dashboard'); }}
                  className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4 text-orange-400" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                  className="w-full py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigate('/login'); }}
                  className="w-full py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs"
                >
                  Login
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigate('/signup'); }}
                  className="w-full py-2.5 rounded-xl bg-[#f95738] text-white font-semibold text-xs shadow-md"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
