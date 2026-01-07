import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LoginModal } from './LoginModal';
import { Link, useLocation } from 'react-router-dom';

export function Header() {
  const { user, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', emoji: '🏠' },
    { path: '/materials', label: 'Materials', emoji: '📚' },
    { path: '/games', label: 'Games', emoji: '🎮' },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b-2 border-primary/20 shadow-soft">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <span className="text-4xl animate-bounce-soft">⭐</span>
              <span className="font-bubble text-2xl md:text-3xl text-primary group-hover:text-primary/80 transition-colors">
                KidLearn
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={location.pathname === item.path ? 'default' : 'ghost'}
                    size="sm"
                    className="gap-2"
                  >
                    <span>{item.emoji}</span>
                    {item.label}
                  </Button>
                </Link>
              ))}
              {user?.role === 'educator' && (
                <Link to="/submit">
                  <Button variant="mint" size="sm" className="gap-2">
                    <span>➕</span>
                    Submit
                  </Button>
                </Link>
              )}
            </nav>

            {/* Auth Section */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 bg-muted px-4 py-2 rounded-2xl">
                    <span className="text-2xl">{user.avatar}</span>
                    <div className="text-sm">
                      <p className="font-bold">{user.name}</p>
                      <p className="text-muted-foreground capitalize">{user.role}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={logout}>
                    Logout
                  </Button>
                </div>
              ) : (
                <Button variant="hero" size="sm" onClick={() => setShowLoginModal(true)}>
                  🔐 Login
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="md:hidden flex items-center gap-2 mt-3 overflow-x-auto pb-2">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={location.pathname === item.path ? 'default' : 'ghost'}
                  size="sm"
                  className="gap-1 whitespace-nowrap"
                >
                  <span>{item.emoji}</span>
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
}
