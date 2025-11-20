import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  useStartPlayerRegistration,
  usePlayerByUpid,
  useSubmitRegistration,
  useReviewRegistration,
  useRecordConsent,
  usePlayerConsents,
  useUpdateMedicalClearance,
  type NewPlayerRegistration 
} from "@/hooks/usePlayerRegistration";

export function PlayerRegistrationDemo() {
  const [upid, setUpid] = useState<string>('');
  const [formData, setFormData] = useState<NewPlayerRegistration>({
    orgId: 1,
    firstName: '',
    lastName: '',
    dob: '',
    sex: 'MALE',
    email: '',
    phone: '',
  });

  // Hooks
  const startRegistration = useStartPlayerRegistration();
  const { data: player, isLoading: loadingPlayer } = usePlayerByUpid(upid);
  const submitRegistration = useSubmitRegistration();
  const reviewRegistration = useReviewRegistration();
  const recordConsent = useRecordConsent();
  const { data: consents } = usePlayerConsents(upid);
  const updateMedical = useUpdateMedicalClearance();

  const handleStartRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await startRegistration.mutateAsync(formData);
      setUpid(result.upid);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleSubmit = () => {
    if (upid) {
      submitRegistration.mutate(upid);
    }
  };

  const handleApprove = () => {
    if (upid) {
      reviewRegistration.mutate({
        upid,
        action: 'approve',
        comments: 'All requirements met'
      });
    }
  };

  const handleGiveConsent = () => {
    if (upid) {
      recordConsent.mutate({
        upid,
        orgId: '1',
        consentType: 'PLAYER_TERMS',
        isConsented: true,
        consentVersion: '1.0',
        ipAddress: '127.0.0.1',
        userAgent: navigator.userAgent
      });
    }
  };

  const handleMedicalClearance = () => {
    if (upid) {
      updateMedical.mutate({
        upid,
        medicalData: {
          medicalClearanceStatus: 'VALID',
          medicalClearanceDate: new Date().toISOString().split('T')[0],
          medicalExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🏃‍♂️ Player Registration Demo</CardTitle>
          <CardDescription>
            Testing Supabase-based player registration hooks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Start Registration Form */}
          <form onSubmit={handleStartRegistration} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="dob">Date of Birth</Label>
                <Input 
                  id="dob"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({...formData, dob: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="sex">Sex</Label>
                <Select onValueChange={(value: any) => setFormData({...formData, sex: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="email">Email (Optional)</Label>
                <Input 
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input 
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={startRegistration.isPending}
              className="w-full"
            >
              {startRegistration.isPending ? 'Starting Registration...' : 'Start Registration'}
            </Button>
          </form>

          {/* UPID Display */}
          {upid && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-medium text-green-800">
                ✅ Registration Started! UPID: <code>{upid}</code>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Player Details */}
      {player && (
        <Card>
          <CardHeader>
            <CardTitle>Player Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Name:</strong> {player.firstName} {player.lastName}
              </div>
              <div>
                <strong>UPID:</strong> <code>{player.upid}</code>
              </div>
              <div>
                <strong>Status:</strong> 
                <Badge className="ml-2" variant={
                  player.registrationStatus === 'APPROVED' ? 'default' :
                  player.registrationStatus === 'SUBMITTED' ? 'secondary' :
                  player.registrationStatus === 'DRAFT' ? 'outline' : 'destructive'
                }>
                  {player.registrationStatus}
                </Badge>
              </div>
              <div>
                <strong>Medical:</strong>
                <Badge className="ml-2" variant={
                  player.medicalClearanceStatus === 'VALID' ? 'default' : 'outline'
                }>
                  {player.medicalClearanceStatus || 'PENDING'}
                </Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              {player.registrationStatus === 'DRAFT' && (
                <Button onClick={handleSubmit} disabled={submitRegistration.isPending}>
                  Submit for Review
                </Button>
              )}
              
              {player.registrationStatus === 'SUBMITTED' && (
                <Button onClick={handleApprove} disabled={reviewRegistration.isPending}>
                  Approve Registration
                </Button>
              )}
              
              <Button 
                onClick={handleGiveConsent} 
                variant="outline"
                disabled={recordConsent.isPending}
              >
                Give Consent
              </Button>
              
              <Button 
                onClick={handleMedicalClearance}
                variant="outline" 
                disabled={updateMedical.isPending}
              >
                Medical Clearance
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Consents */}
      {consents && consents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Consent Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {consents.map((consent) => (
                <div key={consent.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{consent.consentType}</span>
                    <Badge variant={consent.isConsented ? 'default' : 'destructive'}>
                      {consent.isConsented ? 'GIVEN' : 'WITHDRAWN'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Version: {consent.consentVersion} | 
                    {consent.isConsented && consent.consentTimestamp && 
                      ` Given: ${new Date(consent.consentTimestamp).toLocaleDateString()}`
                    }
                    {!consent.isConsented && consent.withdrawalTimestamp && 
                      ` Withdrawn: ${new Date(consent.withdrawalTimestamp).toLocaleDateString()}`
                    }
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}