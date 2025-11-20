import React from 'react';
import { useLocation, Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Debug component to test routing
export function AuthNavigationDebug() {
  const [location, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>🧭 Authentication Navigation Debug</CardTitle>
          <CardDescription>
            Test authentication routing and navigation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <strong>Current Location:</strong> {location}
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Navigation Tests:</h3>
            
            <div className="flex gap-2 flex-wrap">
              <Link href="/auth/login">
                <Button variant="outline" size="sm">
                  Go to Login
                </Button>
              </Link>
              
              <Link href="/auth/signup">
                <Button variant="outline" size="sm">
                  Go to Signup
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setLocation('/auth/login')}
              >
                Navigate to Login (JS)
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setLocation('/auth/signup')}
              >
                Navigate to Signup (JS)
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Manual Navigation:</h3>
            <p className="text-sm text-muted-foreground">
              Try these URLs directly in your browser:
            </p>
            <div className="space-y-1 text-sm">
              <div>• <code>http://localhost:5173/auth/login</code></div>
              <div>• <code>http://localhost:5173/auth/signup</code></div>
            </div>
          </div>
          
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm">
              <strong>💡 Debugging Tips:</strong><br/>
              1. Check browser console for errors<br/>
              2. Verify both login and signup pages load<br/>
              3. Test if the signup link in LoginForm works<br/>
              4. Make sure authentication isn't redirecting
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}