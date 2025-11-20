import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Eye,
  Users,
  Building,
  MapPin,
  Phone,
  Mail,
  User,
  Calendar,
  Hash,
  FileCheck
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useCreateTeamsBulk } from '../hooks/useTeams';

// Types for CSV import
interface TeamImportData {
  teamName: string;
  coachName: string;
  coachEmail: string;
  coachPhone: string;
  venue: string;
  region: string;
  division?: string;
  foundedYear?: string;
  description?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
}

interface ImportValidationError {
  row: number;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

interface ImportResult {
  successful: TeamImportData[];
  failed: Array<TeamImportData & { errors: ImportValidationError[] }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
    warnings: number;
  };
}

interface CSVTeamImportProps {
  tournamentId: string;
  orgId: string;
}

const CSVTeamImport: React.FC<CSVTeamImportProps> = ({ tournamentId, orgId }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<TeamImportData[]>([]);
  const [validationErrors, setValidationErrors] = useState<ImportValidationError[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'validate' | 'import' | 'complete'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const createTeamsBulk = useCreateTeamsBulk(tournamentId);

  // Sample CSV template data
  const sampleTeams: TeamImportData[] = [
    {
      teamName: "Nairobi Warriors FC",
      coachName: "John Kiprotich",
      coachEmail: "j.kiprotich@email.com",
      coachPhone: "+254701234567",
      venue: "Nyayo National Stadium",
      region: "Nairobi",
      division: "Premier League",
      foundedYear: "2015",
      description: "Professional football club based in Nairobi",
      contactPerson: "Mary Wanjiku",
      contactEmail: "info@nairobi-warriors.co.ke",
      contactPhone: "+254722345678"
    },
    {
      teamName: "Mombasa Sharks",
      coachName: "Ahmed Hassan",
      coachEmail: "a.hassan@email.com", 
      coachPhone: "+254703456789",
      venue: "Mombasa Municipal Stadium",
      region: "Mombasa",
      division: "Division One",
      foundedYear: "2018",
      description: "Coastal football team representing Mombasa",
      contactPerson: "Fatuma Ali",
      contactEmail: "contact@mombasa-sharks.co.ke",
      contactPhone: "+254734567890"
    },
    {
      teamName: "Kisumu Lakers",
      coachName: "Peter Ochieng",
      coachEmail: "p.ochieng@email.com",
      coachPhone: "+254705678901",
      venue: "Kisumu Sports Ground",
      region: "Kisumu",
      division: "Division Two",
      foundedYear: "2020",
      description: "Rising football club from Kisumu county",
      contactPerson: "Grace Akinyi",
      contactEmail: "admin@kisumu-Lakers.co.ke", 
      contactPhone: "+254756789012"
    }
  ];

  // Required CSV headers
  const requiredHeaders = [
    'teamName',
    'coachName', 
    'coachEmail',
    'coachPhone',
    'venue',
    'region'
  ];

  const optionalHeaders = [
    'division',
    'foundedYear',
    'description',
    'contactPerson',
    'contactEmail',
    'contactPhone'
  ];

  // Validation rules
  const validateTeamData = (teams: TeamImportData[]): ImportValidationError[] => {
    const errors: ImportValidationError[] = [];
    const seenTeamNames = new Set<string>();
    const seenEmails = new Set<string>();

    teams.forEach((team, index) => {
      const row = index + 2; // Account for header row

      // Required field validation
      if (!team.teamName?.trim()) {
        errors.push({
          row,
          field: 'teamName',
          message: 'Team name is required',
          severity: 'error'
        });
      } else if (seenTeamNames.has(team.teamName.toLowerCase().trim())) {
        errors.push({
          row,
          field: 'teamName',
          message: 'Duplicate team name found',
          severity: 'error'
        });
      } else {
        seenTeamNames.add(team.teamName.toLowerCase().trim());
      }

      if (!team.coachName?.trim()) {
        errors.push({
          row,
          field: 'coachName',
          message: 'Coach name is required',
          severity: 'error'
        });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!team.coachEmail?.trim()) {
        errors.push({
          row,
          field: 'coachEmail',
          message: 'Coach email is required',
          severity: 'error'
        });
      } else if (!emailRegex.test(team.coachEmail)) {
        errors.push({
          row,
          field: 'coachEmail',
          message: 'Invalid email format',
          severity: 'error'
        });
      } else if (seenEmails.has(team.coachEmail.toLowerCase())) {
        errors.push({
          row,
          field: 'coachEmail',
          message: 'Duplicate email address found',
          severity: 'warning'
        });
      } else {
        seenEmails.add(team.coachEmail.toLowerCase());
      }

      // Phone validation
      const phoneRegex = /^\+254[0-9]{9}$/;
      if (!team.coachPhone?.trim()) {
        errors.push({
          row,
          field: 'coachPhone',
          message: 'Coach phone is required',
          severity: 'error'
        });
      } else if (!phoneRegex.test(team.coachPhone)) {
        errors.push({
          row,
          field: 'coachPhone',
          message: 'Phone must be in format +254XXXXXXXXX',
          severity: 'error'
        });
      }

      if (!team.venue?.trim()) {
        errors.push({
          row,
          field: 'venue',
          message: 'Venue is required',
          severity: 'error'
        });
      }

      if (!team.region?.trim()) {
        errors.push({
          row,
          field: 'region',
          message: 'Region is required',
          severity: 'error'
        });
      }

      // Optional field warnings
      if (team.foundedYear && !/^\d{4}$/.test(team.foundedYear)) {
        errors.push({
          row,
          field: 'foundedYear',
          message: 'Founded year should be a 4-digit year',
          severity: 'warning'
        });
      }

      if (team.contactEmail && !emailRegex.test(team.contactEmail)) {
        errors.push({
          row,
          field: 'contactEmail',
          message: 'Invalid contact email format',
          severity: 'warning'
        });
      }

      if (team.contactPhone && !phoneRegex.test(team.contactPhone)) {
        errors.push({
          row,
          field: 'contactPhone',
          message: 'Contact phone should be in format +254XXXXXXXXX',
          severity: 'warning'
        });
      }
    });

    return errors;
  };

  // Improved CSV parsing function that handles quoted fields properly
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator outside quotes
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add the last field
    result.push(current.trim());
    return result;
  };

  // Parse CSV file
  const parseCSVFile = (file: File): Promise<TeamImportData[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csv = e.target?.result as string;
          
          // Split lines and clean them up
          const lines = csv.split(/\r?\n/).map(line => line.trim()).filter(line => line);
          
          console.log('CSV Debug - Total lines found:', lines.length);
          console.log('CSV Debug - First few lines:', lines.slice(0, 5));
          console.log('CSV Debug - Raw CSV content preview:', csv.substring(0, 500));
          
          if (lines.length < 2) {
            reject(new Error('CSV file must contain at least a header row and one data row'));
            return;
          }

          // Parse header row using improved parser
          const headers = parseCSVLine(lines[0]).map(h => h.trim());
          console.log('CSV Debug - Headers found:', headers);
          
          // Create header mapping (case insensitive)
          const headerMap = new Map<string, number>();
          headers.forEach((header, index) => {
            headerMap.set(header.toLowerCase(), index);
          });
          
          // Check required headers (case insensitive)
          const missingHeaders = requiredHeaders.filter(required => 
            !headerMap.has(required.toLowerCase())
          );
          
          if (missingHeaders.length > 0) {
            console.log('CSV Debug - Missing headers:', missingHeaders);
            console.log('CSV Debug - Available headers:', Array.from(headerMap.keys()));
            reject(new Error(`Missing required headers: ${missingHeaders.join(', ')}. Found headers: ${Array.from(headerMap.keys()).join(', ')}`));
            return;
          }

          const data: TeamImportData[] = [];
          
          // Parse data rows
          for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            console.log(`CSV Debug - Row ${i + 1} values:`, values);
            
            const team: any = {};
            
            // Map values to team object using header positions
            [...requiredHeaders, ...optionalHeaders].forEach(fieldName => {
              const headerIndex = headerMap.get(fieldName.toLowerCase());
              if (headerIndex !== undefined && values[headerIndex] !== undefined) {
                team[fieldName] = values[headerIndex].trim();
              } else {
                team[fieldName] = '';
              }
            });
            
            console.log(`CSV Debug - Parsed team ${i}:`, team);
            
            // Only add rows that have a team name (minimum requirement)
            if (team.teamName && team.teamName.trim()) {
              data.push(team as TeamImportData);
            }
          }
          
          console.log('CSV Debug - Final parsed data:', data);
          resolve(data);
        } catch (error) {
          console.error('CSV Debug - Parse error:', error);
          reject(new Error(`Failed to parse CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file, 'UTF-8');
    });
  };

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please select a CSV file.",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    setIsProcessing(true);
    setCurrentStep('preview');

    try {
      const data = await parseCSVFile(file);
      setImportData(data);
      
      const errors = validateTeamData(data);
      setValidationErrors(errors);
      
      setCurrentStep('validate');
      
      toast({
        title: "File Loaded Successfully",
        description: `Found ${data.length} teams to import.`
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to parse CSV file",
        variant: "destructive"
      });
      setCurrentStep('upload');
    } finally {
      setIsProcessing(false);
    }
  };

  // Process import
  const handleImport = async () => {
    if (!importData.length) return;

    setIsProcessing(true);
    setCurrentStep('import');
    setProcessingProgress(0);

    try {
      // Filter out teams with validation errors
      const validTeams = importData.filter((team, index) => {
        const teamErrors = validationErrors.filter(e => e.row === index + 2 && e.severity === 'error');
        return teamErrors.length === 0;
      });
      
      const failed: Array<TeamImportData & { errors: ImportValidationError[] }> = importData
        .map((team, index) => {
          const teamErrors = validationErrors.filter(e => e.row === index + 2 && e.severity === 'error');
          return teamErrors.length > 0 ? { ...team, errors: teamErrors } : null;
        })
        .filter(Boolean) as Array<TeamImportData & { errors: ImportValidationError[] }>;

      setProcessingProgress(50);

      // Create teams in Supabase - map CSV fields to database schema (snake_case)
      const teamsToCreate = validTeams.map(team => {
        const teamData = {
          name: team.teamName?.trim() || 'Unknown Team',
          org_id: orgId, // Use snake_case for database columns
          // Optional fields only included if they have values
          ...(team.teamName?.trim() && { club_name: team.teamName.trim() }),
          ...(team.coachEmail?.trim() || team.contactEmail?.trim()) && { 
            contact_email: team.coachEmail?.trim() || team.contactEmail?.trim() 
          },
          ...(team.coachPhone?.trim() || team.contactPhone?.trim()) && { 
            contact_phone: team.coachPhone?.trim() || team.contactPhone?.trim() 
          },
          ...(team.venue?.trim() && { home_venue: team.venue.trim() }),
          ...(team.foundedYear?.trim() && { founded_date: `${team.foundedYear.trim()}-01-01` }),
          ...(team.description?.trim() && { 
            description: team.description.trim() 
          }),
          max_players: 22,
        };
        
        return teamData;
      });

      console.log("CSV Debug - Teams to create:", teamsToCreate);
      console.log("CSV Debug - First team sample:", JSON.stringify(teamsToCreate[0], null, 2));
      console.log("CSV Debug - orgId being used:", orgId);
      
      // Validate orgId before creating teams
      if (!orgId || orgId.trim() === '') {
        throw new Error('Organization ID is required but not selected. Please select an organization first.');
      }
      
      const createdTeams = await createTeamsBulk.mutateAsync(teamsToCreate);
      setProcessingProgress(100);

      const successful = validTeams;

      const result: ImportResult = {
        successful,
        failed,
        summary: {
          total: importData.length,
          successful: successful.length,
          failed: failed.length,
          warnings: validationErrors.filter(e => e.severity === 'warning').length
        }
      };

      setImportResult(result);
      setCurrentStep('complete');

      toast({
        title: "Import Complete",
        description: `Successfully imported ${successful.length} of ${importData.length} teams.`
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "An error occurred during the import process.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Download CSV template
  const downloadTemplate = () => {
    const headers = [...requiredHeaders, ...optionalHeaders];
    const csvContent = [
      headers.join(','),
      ...sampleTeams.map(team => 
        headers.map(header => {
          const value = (team as any)[header] || '';
          return `"${value}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'team-import-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Reset import process
  const resetImport = () => {
    setSelectedFile(null);
    setImportData([]);
    setValidationErrors([]);
    setImportResult(null);
    setIsProcessing(false);
    setProcessingProgress(0);
    setCurrentStep('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const errorCount = validationErrors.filter(e => e.severity === 'error').length;
  const warningCount = validationErrors.filter(e => e.severity === 'warning').length;

  // Check if we have valid IDs
  const hasValidIds = orgId && orgId.trim() !== '' && tournamentId && tournamentId.trim() !== '';

  return (
    <div className="space-y-6">
      {/* Validation Alert */}
      {!hasValidIds && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Missing Required Selection:</strong><br />
            {!orgId || orgId.trim() === '' ? '• Please select an organization first' : ''}<br />
            {!tournamentId || tournamentId.trim() === '' ? '• Please select a tournament first' : ''}
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">CSV Team Import</h2>
          <p className="text-gray-600">
            Bulk import teams from CSV files
            {hasValidIds && <span className="text-green-600 ml-2">✓ Ready to import</span>}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={downloadTemplate}
            className="flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </Button>
          
          {currentStep !== 'upload' && (
            <Button variant="outline" onClick={resetImport}>
              <X className="w-4 h-4 mr-2" />
              Start Over
            </Button>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              {[
                { step: 'upload', label: 'Upload', icon: Upload },
                { step: 'preview', label: 'Preview', icon: Eye },
                { step: 'validate', label: 'Validate', icon: FileCheck },
                { step: 'import', label: 'Import', icon: Users },
                { step: 'complete', label: 'Complete', icon: CheckCircle }
              ].map(({ step, label, icon: Icon }, index) => (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 
                    ${currentStep === step ? 'border-blue-500 bg-blue-50 text-blue-600' : 
                      ['preview', 'validate', 'import', 'complete'].indexOf(currentStep) > 
                      ['preview', 'validate', 'import', 'complete'].indexOf(step) ? 
                      'border-green-500 bg-green-50 text-green-600' : 'border-gray-300 text-gray-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`ml-2 text-sm font-medium 
                    ${currentStep === step ? 'text-blue-600' : 
                      ['preview', 'validate', 'import', 'complete'].indexOf(currentStep) > 
                      ['preview', 'validate', 'import', 'complete'].indexOf(step) ? 
                      'text-green-600' : 'text-gray-400'}`}>
                    {label}
                  </span>
                  {index < 4 && (
                    <div className={`w-8 h-0.5 mx-4 
                      ${['preview', 'validate', 'import', 'complete'].indexOf(currentStep) > index ? 
                        'bg-green-500' : 'bg-gray-300'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {isProcessing && currentStep === 'import' && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Importing teams...</span>
                <span className="text-sm text-gray-500">{Math.round(processingProgress)}%</span>
              </div>
              <Progress value={processingProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Upload */}
      {currentStep === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload CSV File
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Choose a CSV file to import teams
                </p>
                <p className="text-gray-500 mb-4">
                  File must contain team information in the correct format
                </p>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  className="mr-2"
                  disabled={isProcessing || !hasValidIds}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {!hasValidIds ? "Select Organization & Tournament First" : "Select File"}
                </Button>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Required columns:</strong> {requiredHeaders.join(', ')}<br />
                  <strong>Optional columns:</strong> {optionalHeaders.join(', ')}<br />
                  <strong>CSV Format Tips:</strong>
                  <ul className="mt-2 text-sm space-y-1">
                    <li>• Column names are case-insensitive</li>
                    <li>• First row must contain column headers</li>
                    <li>• Use commas to separate columns</li>
                    <li>• Wrap values containing commas in quotes: "Team Name, LLC"</li>
                    <li>• Download the template for the exact format</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {/* File Processing Debug Info */}
              {selectedFile && (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Selected file:</strong> {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)<br />
                    {isProcessing ? (
                      <span>Processing file... Check browser console for debug information.</span>
                    ) : (
                      <span>File loaded successfully. {importData.length} teams found.</span>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview and Validation */}
      {(currentStep === 'validate' && importData.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5" />
                Import Preview & Validation
              </div>
              <div className="flex items-center space-x-2">
                {errorCount > 0 && (
                  <Badge variant="destructive">
                    {errorCount} Error{errorCount !== 1 ? 's' : ''}
                  </Badge>
                )}
                {warningCount > 0 && (
                  <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                    {warningCount} Warning{warningCount !== 1 ? 's' : ''}
                  </Badge>
                )}
                <Badge variant="outline">
                  {importData.length} Team{importData.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Validation Summary */}
              {validationErrors.length > 0 && (
                <Alert variant={errorCount > 0 ? "destructive" : "default"}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {errorCount > 0 ? (
                      <span>
                        <strong>{errorCount} error{errorCount !== 1 ? 's' : ''}</strong> must be fixed before importing.
                      </span>
                    ) : (
                      <span>
                        <strong>{warningCount} warning{warningCount !== 1 ? 's' : ''}</strong> found but import can continue.
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Data Preview */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <h4 className="font-medium">Data Preview</h4>
                </div>
                <div className="max-h-96 overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-900">Row</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-900">Team Name</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-900">Coach</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-900">Email</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-900">Region</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-900">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importData.map((team, index) => {
                        const rowErrors = validationErrors.filter(e => e.row === index + 2);
                        const hasErrors = rowErrors.some(e => e.severity === 'error');
                        const hasWarnings = rowErrors.some(e => e.severity === 'warning');
                        
                        return (
                          <tr key={index} className={`border-b ${hasErrors ? 'bg-red-50' : hasWarnings ? 'bg-yellow-50' : ''}`}>
                            <td className="px-3 py-2 text-gray-600">{index + 1}</td>
                            <td className="px-3 py-2 font-medium">{team.teamName}</td>
                            <td className="px-3 py-2">{team.coachName}</td>
                            <td className="px-3 py-2">{team.coachEmail}</td>
                            <td className="px-3 py-2">{team.region}</td>
                            <td className="px-3 py-2">
                              {hasErrors ? (
                                <Badge variant="destructive">Error</Badge>
                              ) : hasWarnings ? (
                                <Badge variant="outline" className="border-yellow-500 text-yellow-700">Warning</Badge>
                              ) : (
                                <Badge variant="outline" className="border-green-500 text-green-700">Valid</Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Validation Errors Detail */}
              {validationErrors.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b">
                    <h4 className="font-medium">Validation Issues</h4>
                  </div>
                  <div className="max-h-64 overflow-auto">
                    <div className="p-4 space-y-2">
                      {validationErrors.map((error, index) => (
                        <div key={index} className={`flex items-start space-x-2 p-2 rounded ${
                          error.severity === 'error' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'
                        }`}>
                          {error.severity === 'error' ? (
                            <X className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <span className="text-sm font-medium">Row {error.row}, {error.field}:</span>
                            <span className="text-sm ml-1">{error.message}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Import Actions */}
              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-gray-600">
                  Ready to import {importData.length - validationErrors.filter(e => e.severity === 'error').length} of {importData.length} teams
                </div>
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={resetImport}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleImport}
                    disabled={errorCount > 0 || isProcessing}
                    className="min-w-32"
                  >
                    {isProcessing ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Importing...
                      </div>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Import Teams
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Complete */}
      {currentStep === 'complete' && importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Import Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <Users className="h-8 w-8 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Teams</p>
                        <p className="text-2xl font-bold">{importResult.summary.total}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Successful</p>
                        <p className="text-2xl font-bold">{importResult.summary.successful}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <X className="h-8 w-8 text-red-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Failed</p>
                        <p className="text-2xl font-bold">{importResult.summary.failed}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <AlertTriangle className="h-8 w-8 text-yellow-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Warnings</p>
                        <p className="text-2xl font-bold">{importResult.summary.warnings}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Success Message */}
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Successfully imported <strong>{importResult.summary.successful}</strong> teams. 
                  {importResult.summary.failed > 0 && (
                    <span> {importResult.summary.failed} teams failed to import due to validation errors.</span>
                  )}
                </AlertDescription>
              </Alert>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={resetImport}>
                  Import More Teams
                </Button>
                <Button onClick={() => window.location.href = '/teams'}>
                  View Teams
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CSVTeamImport;