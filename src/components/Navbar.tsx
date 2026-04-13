import React from 'react';
import { useAuth } from '@/src/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/src/lib/firebase';
import { Camera, LogIn, LogOut, Trophy, LayoutDashboard, User } from 'lucide-react';

import { toast } from 'sonner';

export function Navbar() {
  const { user, profile, isAdmin, signOut } = useAuth();

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      toast.success('Login realizado com sucesso!');
    } catch (error: any) {
      console.error('Login failed', error);
      if (error.code === 'auth/popup-blocked') {
        toast.error('O popup de login foi bloqueado pelo navegador.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        // Ignore this one, user closed the popup
      } else {
        toast.error('Falha ao entrar: ' + (error.message || 'Erro desconhecido'));
      }
    }
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <Camera className="w-6 h-6 text-primary" />
          <span>PhotoComp</span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <a href="/" className="hover:text-primary transition-colors">Competições</a>
          <a href="/hall-of-fame" className="hover:text-primary transition-colors">Hall da Fama</a>
          {isAdmin && (
            <a href="/admin" className="hover:text-primary transition-colors flex items-center gap-1">
              <LayoutDashboard className="w-4 h-4" />
              Admin
            </a>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium leading-none">{profile?.name || user.displayName}</span>
                <span className="text-xs text-muted-foreground">{profile?.role}</span>
              </div>
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
              )}
              <Button variant="ghost" size="icon" onClick={() => signOut()} title="Sair">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button onClick={handleLogin} className="gap-2">
              <LogIn className="w-4 h-4" />
              Entrar com Google
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
