import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Eye, EyeOff, Mail, Key, CheckCircle, Zap } from 'lucide-react';
import { useLocation } from 'wouter';

export function FastSignup() {
  const [, setLocation] = useLocation();
  
  // Fast password signup state
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Magic link state
  const [magicEmail, setMagicEmail] = useState('');
  const [magicFirstName, setMagicFirstName] = useState('');
  const [magicLastName, setMagicLastName] = useState('');
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  const [magicMessage, setMagicMessage] = useState('');
  const [magicSuccess, setMagicSuccess] = useState(false);

  const handleFastSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // Fast password signup - immediate authentication
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

      if (error) {
        setMessage(error.message);
        setIsSuccess(false);
      } else if (data.user) {
        setMessage('Account created successfully! Redirecting to dashboard...');
        setIsSuccess(true);
        
        // Redirect after a short delay
        setTimeout(() => {
          setLocation('/dashboard');
        }, 1500);
      }
    } catch (error) {
      setMessage('An unexpected error occurred. Please try again.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLinkSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsMagicLoading(true);
    setMagicMessage('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: magicEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: magicFirstName,
            last_name: magicLastName,
          }
        }
      });

      if (error) {
        setMagicMessage(error.message);
        setMagicSuccess(false);
      } else {
        setMagicMessage(`Magic link sent to ${magicEmail}! Check your inbox and click the link to complete signup.`);
        setMagicSuccess(true);
      }
    } catch (error) {
      setMagicMessage('An unexpected error occurred. Please try again.');
      setMagicSuccess(false);
    } finally {
      setIsMagicLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Tabs defaultValue="fast" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="fast" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Instant Signup
          </TabsTrigger>
          <TabsTrigger value="magic" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Magic Link
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fast">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-500" />
                Instant Signup
              </CardTitle>
              <CardDescription>
                Create your account instantly with email and password
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSuccess ? (
                <div className="text-center py-4">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                </div>
              ) : (
                <form onSubmit={handleFastSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="Oliver"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Kiplagat"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {message && (
                    <Alert variant={isSuccess ? "default" : "destructive"}>
                      <AlertDescription>{message}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Create Account Instantly
                      </>
                    )}
                  </Button>
                  
                  <div className="text-xs text-muted-foreground text-center">
                    ⚡ Instant access - no email verification needed
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="magic">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-500" />
                Magic Link Signup
              </CardTitle>
              <CardDescription>
                Sign up without a password using a magic link sent to your email
              </CardDescription>
            </CardHeader>
            <CardContent>
              {magicSuccess ? (
                <div className="text-center py-4">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <Alert>
                    <Mail className="h-4 w-4" />
                    <AlertDescription>{magicMessage}</AlertDescription>
                  </Alert>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setMagicSuccess(false);
                      setMagicEmail('');
                      setMagicFirstName('');
                      setMagicLastName('');
                      setMagicMessage('');
                    }}
                  >
                    Send Another Link
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleMagicLinkSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="magicEmail">Email Address</Label>
                    <Input
                      id="magicEmail"
                      type="email"
                      placeholder="your.email@example.com"
                      value={magicEmail}
                      onChange={(e) => setMagicEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="magicFirstName">First Name</Label>
                      <Input
                        id="magicFirstName"
                        placeholder="Oliver"
                        value={magicFirstName}
                        onChange={(e) => setMagicFirstName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="magicLastName">Last Name</Label>
                      <Input
                        id="magicLastName"
                        placeholder="Kiplagat"
                        value={magicLastName}
                        onChange={(e) => setMagicLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {magicMessage && (
                    <Alert variant={magicSuccess ? "default" : "destructive"}>
                      <AlertDescription>{magicMessage}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={isMagicLoading}>
                    {isMagicLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending Magic Link...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Magic Link
                      </>
                    )}
                  </Button>
                  
                  <div className="text-xs text-muted-foreground text-center">
                    📧 Check your email for the magic link (may take 1-2 minutes)
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <a href="/auth/login" className="text-primary hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}