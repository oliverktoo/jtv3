import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Settings } from "lucide-react";

export default function Fixtures() {
  const [, setLocation] = useLocation();

  // Auto-redirect after a short delay for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setLocation('/tournament-hub?tab=jamii-fixtures');
    }, 2000);

    return () => clearTimeout(timer);
  }, [setLocation]);

  const handleManualRedirect = () => {
    setLocation('/tournament-hub?tab=jamii-fixtures');
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Fixtures Management</h1>
        <p className="text-muted-foreground text-lg">
          Fixture management has been consolidated into the Tournament Hub for a better experience.
        </p>
      </div>

      <div className="flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Settings className="h-5 w-5" />
              Redirecting to Tournament Hub
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              You'll be automatically redirected to the Tournament Hub where you can manage all fixtures with advanced features.
            </p>
            
            <Button 
              onClick={handleManualRedirect}
              className="w-full"
              size="lg"
            >
              Go to Tournament Hub
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            
            <div className="text-xs text-center text-muted-foreground">
              Auto-redirecting in a moment...
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center space-y-2">
        <h3 className="font-semibold">Why the change?</h3>
        <div className="text-sm text-muted-foreground max-w-2xl mx-auto space-y-1">
          <p>• All fixture management features are now centralized in one place</p>
          <p>• Better integration with tournament settings and team management</p>
          <p>• Consistent user experience across all tournament operations</p>
          <p>• Advanced fixture generation and scheduling capabilities</p>
        </div>
      </div>
    </div>
  );
}