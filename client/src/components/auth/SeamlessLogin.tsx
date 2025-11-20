import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Eye, EyeOff, Mail, Key, CheckCircle } from 'lucide-react';
import { Link } from 'wouter';

interface SeamlessLoginProps {
  onSuccess?: () => void;
}

export function SeamlessLogin({ onSuccess }: SeamlessLoginProps) {
  // Password login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Magic link state
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [magicLinkError, setMagicLinkError] = useState('');

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please confirm your email address before signing in.');
        } else {
          setError(error.message);
        }
      } else if (data.user) {
        // Success - redirect will be handled by auth state change
        onSuccess?.();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsMagicLinkLoading(true);
    setMagicLinkError('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: magicLinkEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (error) {
        if (error.message.includes('Email address') && error.message.includes('invalid')) {
          setMagicLinkError('Please enter a valid email address.');
        } else {
          setMagicLinkError(error.message);
        }
      } else {
        setMagicLinkSent(true);
      }
    } catch (err) {
      setMagicLinkError('An unexpected error occurred. Please try again.');
    } finally {
      setIsMagicLinkLoading(false);
    }
  };

  if (magicLinkSent) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-xl">Check Your Email</CardTitle>
          <CardDescription>
            We've sent a login link to {magicLinkEmail}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Click the link in your email to sign in. The link will expire in 1 hour.
            </AlertDescription>
          </Alert>
          <div className="mt-4 space-y-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setMagicLinkSent(false);
                setMagicLinkEmail('');
              }}
            >
              Send Another Link
            </Button>
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => {
                setMagicLinkSent(false);
                setMagicLinkEmail('');
              }}
            >
              Try Password Login Instead
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
        <CardDescription className="text-center">
          Sign in to your Jamii Tourney account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="password" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="password" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Password
            </TabsTrigger>
            <TabsTrigger value="magic-link" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Magic Link
            </TabsTrigger>
          </TabsList>

          <TabsContent value="password" className="space-y-4 mt-4">
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password-email">Email</Label>
                <Input
                  id="password-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password-field">Password</Label>
                <div className="relative">
                  <Input
                    id="password-field"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In with Password
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="magic-link" className="space-y-4 mt-4">
            <form onSubmit={handleMagicLinkLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="magic-email">Email</Label>
                <Input
                  id="magic-email"
                  type="email"
                  placeholder="Enter your email"
                  value={magicLinkEmail}
                  onChange={(e) => setMagicLinkEmail(e.target.value)}
                  required
                  disabled={isMagicLinkLoading}
                  autoComplete="email"
                />
              </div>

              {magicLinkError && (
                <Alert variant="destructive">
                  <AlertDescription>{magicLinkError}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isMagicLinkLoading}>
                {isMagicLinkLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Mail className="mr-2 h-4 w-4" />
                Send Login Link
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                We'll send you a secure link to sign in instantly
              </div>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center space-y-2">
          <div className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/auth/magic-signup" className="text-primary hover:underline font-medium">
              Sign up with Magic Link
            </Link>
          </div>
          <div className="text-sm text-muted-foreground">
            <Link href="/" className="text-primary hover:underline font-medium">
              ← Back to Homepage
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}