import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
      <div className="text-center">
        <span className="text-9xl block mb-6 animate-bounce-soft">🔍</span>
        <h1 className="font-bubble text-5xl text-primary mb-4">Oops!</h1>
        <p className="text-xl text-muted-foreground mb-8">
          We couldn't find this page. Let's go back home!
        </p>
        <Link to="/">
          <Button variant="hero" size="xl">
            🏠 Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
