import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  useStartPlayerRegistration,
  usePlayerByUpid,
  useSubmitRegistration,
  useReviewRegistration,
  useRecordConsent,
  usePlayerConsents,
  useUpdateMedicalClearance,
  useUpdatePlayerRegistration
} from '../hooks/usePlayerRegistration';
import { toast } from '../hooks/use-toast';

export default function PlayerRegistrationTest() {
  const [testUpid, setTestUpid] = useState('TEST-12345-KE');
  const [testOrgId, setTestOrgId] = useState('550e8400-e29b-41d4-a716-446655440000');
  const [reviewDecision, setReviewDecision] = useState<'approve' | 'reject' | 'request_changes'>('approve');
  const [consentType, setConsentType] = useState<'DATA_PROCESSING' | 'PLAYER_TERMS' | 'MEDIA_CONSENT' | 'GUARDIAN_CONSENT'>('DATA_PROCESSING');
  const [medicalStatus, setMedicalStatus] = useState<'VALID' | 'EXPIRED' | 'PENDING' | 'REJECTED'>('VALID');

  // Hook instances
  const startRegistrationMutation = useStartPlayerRegistration();
  const { data: playerData, isLoading: playerLoading, error: playerError, refetch: refetchPlayer } = usePlayerByUpid(testUpid);
  const submitRegistrationMutation = useSubmitRegistration();
  const reviewRegistrationMutation = useReviewRegistration();
  const recordConsentMutation = useRecordConsent();
  const { data: consentsData, isLoading: consentsLoading, refetch: refetchConsents } = usePlayerConsents(testUpid);
  const updateMedicalMutation = useUpdateMedicalClearance();
  const updatePlayerMutation = useUpdatePlayerRegistration();

  // Test data for starting registration
  const testPlayerData = {
    firstName: 'John',
    lastName: 'Doe',
    dob: '1995-05-15',
    nationality: 'Kenyan',
    phone: '+254712345678',
    email: 'john.doe@example.com',
    wardId: 1,
    sex: 'MALE' as const,
    orgId: testOrgId
  };

  const handleStartRegistration = async () => {
    try {
      await startRegistrationMutation.mutateAsync(testPlayerData);
      toast({
        title: "Success",
        description: "Player registration started successfully",
      });
      refetchPlayer();
    } catch (error) {
      console.error('Start registration error:', error);
    }
  };

  const handleSubmitRegistration = async () => {
    try {
      await submitRegistrationMutation.mutateAsync(testUpid);
      toast({
        title: "Success",
        description: "Registration submitted for review",
      });
      refetchPlayer();
    } catch (error) {
      console.error('Submit registration error:', error);
    }
  };

  const handleReviewRegistration = async () => {
    try {
      await reviewRegistrationMutation.mutateAsync({
        upid: testUpid,
        action: reviewDecision,
        comments: `${reviewDecision === 'approve' ? 'Approved' : reviewDecision === 'reject' ? 'Rejected' : 'Changes requested'} via test page`
      });
      toast({
        title: "Success",
        description: `Registration ${reviewDecision}d`,
      });
      refetchPlayer();
    } catch (error) {
      console.error('Review registration error:', error);
    }
  };

  const handleRecordConsent = async () => {
    try {
      await recordConsentMutation.mutateAsync({
        upid: testUpid,
        orgId: testOrgId.toString(),
        consentType: consentType,
        isConsented: true,
        consentVersion: '1.0'
      });
      toast({
        title: "Success",
        description: "Consent recorded successfully",
      });
      refetchConsents();
    } catch (error) {
      console.error('Record consent error:', error);
    }
  };

  const handleUpdateMedical = async () => {
    try {
      await updateMedicalMutation.mutateAsync({
        upid: testUpid,
        medicalData: {
          medicalClearanceStatus: medicalStatus,
          medicalClearanceDate: new Date().toISOString().split('T')[0]
        }
      });
      toast({
        title: "Success",
        description: "Medical clearance updated",
      });
      refetchPlayer();
    } catch (error) {
      console.error('Update medical error:', error);
    }
  };

  const handleUpdatePlayer = async () => {
    try {
      await updatePlayerMutation.mutateAsync({
        upid: testUpid,
        updates: {
          phone: '+254712999999',
          email: 'updated.email@example.com'
        }
      });
      toast({
        title: "Success",
        description: "Player details updated",
      });
      refetchPlayer();
    } catch (error) {
      console.error('Update player error:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Player Registration Hooks Test</h1>
        <Badge variant="outline">Testing Environment</Badge>
      </div>

      {/* Test Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="test-upid">Test UPID</Label>
              <Input
                id="test-upid"
                value={testUpid}
                onChange={(e) => setTestUpid(e.target.value)}
                placeholder="TEST-12345-KE"
              />
            </div>
            <div>
              <Label htmlFor="test-org-id">Test Org ID</Label>
              <Input
                id="test-org-id"
                value={testOrgId}
                onChange={(e) => setTestOrgId(e.target.value)}
                placeholder="550e8400-e29b-41d4-a716-446655440000"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Player Data Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Current Player Data
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetchPlayer()}
              disabled={playerLoading}
            >
              {playerLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {playerError && (
            <Alert className="mb-4">
              <AlertDescription>
                Error loading player: {playerError.message}
              </AlertDescription>
            </Alert>
          )}
          
          {playerData ? (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><strong>UPID:</strong> {playerData.upid}</div>
                <div><strong>Status:</strong> 
                  <Badge variant="secondary" className="ml-2">
                    {playerData.registrationStatus}
                  </Badge>
                </div>
                <div><strong>Medical:</strong> 
                  <Badge variant="outline" className="ml-2">
                    {playerData.medicalClearanceStatus || 'Not Set'}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Name:</strong> {playerData.firstName} {playerData.lastName}</div>
                <div><strong>Phone:</strong> {playerData.phone}</div>
                <div><strong>Email:</strong> {playerData.email}</div>
                <div><strong>DOB:</strong> {playerData.dob}</div>
              </div>
            </div>
          ) : !playerLoading && (
            <p className="text-gray-500">No player data found for UPID: {testUpid}</p>
          )}
        </CardContent>
      </Card>

      {/* Registration Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Registration Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={handleStartRegistration}
              disabled={startRegistrationMutation.isPending}
              className="w-full"
            >
              {startRegistrationMutation.isPending ? 'Starting...' : 'Start Registration'}
            </Button>
            
            <Button
              onClick={handleSubmitRegistration}
              disabled={submitRegistrationMutation.isPending || !playerData}
              variant="outline"
              className="w-full"
            >
              {submitRegistrationMutation.isPending ? 'Submitting...' : 'Submit for Review'}
            </Button>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Label>Review Decision:</Label>
              <select 
                value={reviewDecision} 
                onChange={(e) => setReviewDecision(e.target.value as 'approve' | 'reject' | 'request_changes')}
                className="border rounded px-3 py-1"
              >
                <option value="approve">Approve</option>
                <option value="reject">Reject</option>
                <option value="request_changes">Request Changes</option>
              </select>
              <Button
                onClick={handleReviewRegistration}
                disabled={reviewRegistrationMutation.isPending || !playerData}
                variant="secondary"
              >
                {reviewRegistrationMutation.isPending ? 'Reviewing...' : 'Review Registration'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consent Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Consent Management
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetchConsents()}
              disabled={consentsLoading}
            >
              {consentsLoading ? 'Loading...' : 'Refresh Consents'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Label>Consent Type:</Label>
            <select 
              value={consentType} 
              onChange={(e) => setConsentType(e.target.value as typeof consentType)}
              className="border rounded px-3 py-1"
            >
              <option value="DATA_PROCESSING">Data Processing</option>
              <option value="MARKETING">Marketing</option>
              <option value="PHOTO_VIDEO">Photo/Video</option>
            </select>
            <Button
              onClick={handleRecordConsent}
              disabled={recordConsentMutation.isPending}
              variant="secondary"
            >
              {recordConsentMutation.isPending ? 'Recording...' : 'Record Consent'}
            </Button>
          </div>

          {consentsData && consentsData.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Current Consents:</h4>
              {consentsData.map((consent, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <Badge variant={consent.isConsented ? "default" : "destructive"}>
                    {consent.consentType}
                  </Badge>
                  <span>{consent.isConsented ? 'Given' : 'Withdrawn'}</span>
                  <span className="text-gray-500">
                    v{consent.consentVersion} - {new Date(consent.consentTimestamp || consent.withdrawalTimestamp || '').toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medical & Updates */}
      <Card>
        <CardHeader>
          <CardTitle>Medical & Updates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Medical Status:</Label>
              <select 
                value={medicalStatus} 
                onChange={(e) => setMedicalStatus(e.target.value as typeof medicalStatus)}
                className="border rounded px-3 py-1 w-full"
              >
                <option value="CLEARED">Cleared</option>
                <option value="PENDING">Pending</option>
                <option value="REQUIRES_ATTENTION">Requires Attention</option>
              </select>
              <Button
                onClick={handleUpdateMedical}
                disabled={updateMedicalMutation.isPending || !playerData}
                variant="outline"
                className="w-full"
              >
                {updateMedicalMutation.isPending ? 'Updating...' : 'Update Medical'}
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Update Player Details:</Label>
              <p className="text-sm text-gray-600">
                Updates phone to +254712999999 and email to updated.email@example.com
              </p>
              <Button
                onClick={handleUpdatePlayer}
                disabled={updatePlayerMutation.isPending || !playerData}
                variant="outline"
                className="w-full"
              >
                {updatePlayerMutation.isPending ? 'Updating...' : 'Update Player Info'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Hook Status Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Mutations:</strong>
              <ul className="ml-4 space-y-1">
                <li>Start Registration: {startRegistrationMutation.isPending ? '⏳' : startRegistrationMutation.isSuccess ? '✅' : startRegistrationMutation.isError ? '❌' : '⚪'}</li>
                <li>Submit Registration: {submitRegistrationMutation.isPending ? '⏳' : submitRegistrationMutation.isSuccess ? '✅' : submitRegistrationMutation.isError ? '❌' : '⚪'}</li>
                <li>Review Registration: {reviewRegistrationMutation.isPending ? '⏳' : reviewRegistrationMutation.isSuccess ? '✅' : reviewRegistrationMutation.isError ? '❌' : '⚪'}</li>
                <li>Record Consent: {recordConsentMutation.isPending ? '⏳' : recordConsentMutation.isSuccess ? '✅' : recordConsentMutation.isError ? '❌' : '⚪'}</li>
              </ul>
            </div>
            <div>
              <strong>Queries:</strong>
              <ul className="ml-4 space-y-1">
                <li>Player Data: {playerLoading ? '⏳' : playerData ? '✅' : playerError ? '❌' : '⚪'}</li>
                <li>Consents Data: {consentsLoading ? '⏳' : consentsData ? '✅' : '⚪'}</li>
                <li>Update Medical: {updateMedicalMutation.isPending ? '⏳' : updateMedicalMutation.isSuccess ? '✅' : updateMedicalMutation.isError ? '❌' : '⚪'}</li>
                <li>Update Player: {updatePlayerMutation.isPending ? '⏳' : updatePlayerMutation.isSuccess ? '✅' : updatePlayerMutation.isError ? '❌' : '⚪'}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}