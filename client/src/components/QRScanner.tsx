import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { 
  QrCode, 
  Camera, 
  Upload, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  User,
  Calendar,
  Shield,
  RefreshCw
} from 'lucide-react';
import { parsePlayerQRCode, type PlayerCardData } from '../lib/qrCodeUtils';
import { Avatar, AvatarFallback } from './ui/avatar';
import { format } from 'date-fns';

interface QRScannerProps {
  onScanResult?: (data: PlayerCardData | null, error?: string) => void;
  showResult?: boolean;
}

export default function QRScanner({ onScanResult, showResult = true }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<PlayerCardData | null>(null);
  const [error, setError] = useState<string>('');
  const [manualInput, setManualInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleManualScan = () => {
    try {
      setError('');
      const result = parsePlayerQRCode(manualInput);
      setScanResult(result);
      onScanResult?.(result, result ? undefined : 'Invalid QR code data');
      if (!result) {
        setError('Invalid QR code data format');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse QR code';
      setError(errorMessage);
      setScanResult(null);
      onScanResult?.(null, errorMessage);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // For demo purposes, we'll simulate QR code reading
    // In a real implementation, you'd use a library like jsQR
    setError('File-based QR scanning not implemented in demo. Use manual input instead.');
  };

  const handleCameraScan = () => {
    setIsScanning(true);
    // For demo purposes, we'll simulate camera scanning
    // In a real implementation, you'd use getUserMedia and jsQR
    setTimeout(() => {
      setIsScanning(false);
      setError('Camera-based QR scanning not implemented in demo. Use manual input instead.');
    }, 2000);
  };

  const clearResult = () => {
    setScanResult(null);
    setError('');
    setManualInput('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'IN_REVIEW':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'IN_REVIEW':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Scanner Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <QrCode className="h-5 w-5 mr-2" />
            QR Code Scanner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Scan Methods */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={handleCameraScan}
              disabled={isScanning}
              className="h-20 flex flex-col space-y-2"
            >
              {isScanning ? (
                <RefreshCw className="h-6 w-6 animate-spin" />
              ) : (
                <Camera className="h-6 w-6" />
              )}
              <span className="text-sm">Camera Scan</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="h-20 flex flex-col space-y-2"
            >
              <Upload className="h-6 w-6" />
              <span className="text-sm">Upload Image</span>
            </Button>

            <div className="flex flex-col space-y-2">
              <Input
                placeholder="Paste QR code data"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
              />
              <Button
                onClick={handleManualScan}
                disabled={!manualInput}
                size="sm"
              >
                Parse Data
              </Button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Scan Result */}
      {showResult && scanResult && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center text-green-800">
              <CheckCircle className="h-5 w-5 mr-2" />
              Player Verified
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={clearResult}>
              <XCircle className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Player Info */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16 border-2 border-green-200">
                <AvatarFallback className="text-lg font-bold text-green-700 bg-green-100">
                  {`${scanResult.firstName[0]}${scanResult.lastName[0]}`}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-green-900">
                  {scanResult.firstName} {scanResult.lastName}
                </h3>
                <p className="text-sm text-green-700 font-mono">
                  UPID: {scanResult.upid}
                </p>
                <div className="flex items-center mt-2">
                  {getStatusIcon(scanResult.registrationStatus)}
                  <Badge className={`ml-2 ${getStatusColor(scanResult.registrationStatus)}`}>
                    {scanResult.registrationStatus}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Player Details */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-green-200">
              <div className="space-y-2">
                <div className="flex items-center text-green-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="text-sm">Date of Birth</span>
                </div>
                <p className="font-medium">
                  {scanResult.dateOfBirth ? format(new Date(scanResult.dateOfBirth), 'MMM dd, yyyy') : 'N/A'}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-green-700">
                  <Shield className="h-4 w-4 mr-2" />
                  <span className="text-sm">National ID</span>
                </div>
                <p className="font-medium font-mono">
                  ***{scanResult.nationalId}
                </p>
              </div>
            </div>

            {/* Validity Info */}
            <div className="bg-white p-3 rounded-lg border border-green-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-green-600 font-medium">Issued</p>
                  <p>{format(new Date(scanResult.issuedAt), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <p className="text-green-600 font-medium">Expires</p>
                  <p className={isExpired(scanResult.validUntil) ? 'text-red-600 font-bold' : ''}>
                    {format(new Date(scanResult.validUntil), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              
              {isExpired(scanResult.validUntil) && (
                <Alert variant="destructive" className="mt-3">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This player card has expired. Please verify with current documentation.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sample QR Data for Testing */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">Demo QR Code Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-blue-700 mb-2">
            Copy this sample data to test the scanner:
          </p>
          <code 
            className="block p-2 bg-white border rounded text-xs break-all cursor-pointer hover:bg-gray-50"
            onClick={(e) => {
              navigator.clipboard?.writeText((e.target as HTMLElement).textContent || '');
              alert('Sample QR data copied to clipboard!');
            }}
            title="Click to copy sample data"
          >
            {JSON.stringify({
              v: '1',
              pid: '123',
              upid: 'UP001234',
              name: 'John Doe',
              dob: '1995-06-15',
              nid: '5678',
              org: '1',
              status: 'APPROVED',
              issued: new Date().toISOString(),
              expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            })}
          </code>
          <p className="text-xs text-blue-600 mt-1">💡 Click to copy to clipboard</p>
        </CardContent>
      </Card>
    </div>
  );
}