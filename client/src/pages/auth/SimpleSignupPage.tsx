import React from 'react';
import { SignupForm } from '@/components/auth/SignupForm';
import { Trophy } from 'lucide-react';
import { Link } from 'wouter';

// Simplified signup page without authentication checks
export default function SimpleSignupPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Jamii Tourney v3</h1>
          </div>
          <Link href="/auth/login" className="text-primary hover:underline">
            Back to Login
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-4 text-center">
            <h2 className="text-2xl font-bold">Create Account</h2>
            <p className="text-muted-foreground">Join Jamii Tourney v3</p>
          </div>
          
          <SignupForm onSuccess={() => {
            // Simple success handler
            window.location.href = '/auth/login';
          }} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>© 2025 Jamii Tourney. Tournament Management Platform for Kenya.</p>
        </div>
      </footer>
    </div>
  );
}