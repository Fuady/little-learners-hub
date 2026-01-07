import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'parent' | 'educator'>('parent');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let result;
      if (isRegistering) {
        result = await register(email, password, name, role);
      } else {
        result = await login(email, password);
      }

      if (result.success) {
        onClose();
        resetForm();
      } else {
        setError(result.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setRole('parent');
    setError('');
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-3xl border-2 border-primary/20">
        <DialogHeader>
          <DialogTitle className="font-bubble text-3xl text-center text-primary flex items-center justify-center gap-3">
            <span className="text-4xl">{isRegistering ? '🎉' : '👋'}</span>
            {isRegistering ? 'Join Us!' : 'Welcome Back!'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {isRegistering && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name" className="font-bold">Your Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="font-bold">I am a...</Label>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant={role === 'parent' ? 'default' : 'outline'}
                    className="flex-1 gap-2"
                    onClick={() => setRole('parent')}
                  >
                    👨‍👩‍👧 Parent
                  </Button>
                  <Button
                    type="button"
                    variant={role === 'educator' ? 'default' : 'outline'}
                    className="flex-1 gap-2"
                    onClick={() => setRole('educator')}
                  >
                    👨‍🏫 Educator
                  </Button>
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="font-bold">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="font-bold">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="hero"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? '⏳ Loading...' : isRegistering ? '🚀 Create Account' : '🔓 Login'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-primary hover:underline font-semibold"
            >
              {isRegistering
                ? 'Already have an account? Login'
                : "Don't have an account? Register"}
            </button>
          </div>

          {!isRegistering && (
            <div className="bg-muted p-4 rounded-2xl text-sm">
              <p className="font-bold mb-2">🧪 Test Accounts:</p>
              <p><strong>Parent:</strong> parent@example.com</p>
              <p><strong>Educator:</strong> teacher@example.com</p>
              <p><strong>Password:</strong> password123</p>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
