import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Shield, 
  FileText, 
  Heart, 
  MapPin, 
  Calendar,
  User,
  Eye,
  AlertCircle
} from 'lucide-react';
import { 
  EligibilityCheckResult, 
  EligibilityViolation, 
  EligibilityWarning, 
  EligibilitySummary,
  usePlayerEligibility,
  useEligibilityHelpers 
} from '../hooks/usePlayerEligibility';
import { formatDistanceToNow } from 'date-fns';

interface EligibilityDashboardProps {
  playerId: string;
  tournamentId?: string;
}

export function EligibilityDashboard({ playerId, tournamentId }: EligibilityDashboardProps) {
  const { data: eligibilityResult, isLoading, error } = usePlayerEligibility(
    playerId, 
    tournamentId || 'general'
  );
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Checking eligibility...</span>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error || !eligibilityResult) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load eligibility information. Please try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <EligibilityOverview result={eligibilityResult} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EligibilityViolationsList violations={eligibilityResult.violations} />
        <EligibilityWarningsList warnings={eligibilityResult.warnings} />
      </div>
      <EligibilityDetailedSummary summary={eligibilityResult.summary} />
    </div>
  );
}

interface EligibilityOverviewProps {
  result: EligibilityCheckResult;
}

function EligibilityOverview({ result }: EligibilityOverviewProps) {
  const { getEligibilityStatusColor } = useEligibilityHelpers();
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ELIGIBLE':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'INELIGIBLE':
        return <XCircle className="h-6 w-6 text-red-600" />;
      case 'PENDING_REVIEW':
        return <Clock className="h-6 w-6 text-yellow-600" />;
      case 'NEEDS_ACTION':
        return <AlertTriangle className="h-6 w-6 text-orange-600" />;
      default:
        return <Shield className="h-6 w-6 text-gray-600" />;
    }
  };
  
  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'ELIGIBLE':
        return 'Player is eligible and ready to participate!';
      case 'INELIGIBLE':
        return 'Player is not eligible and cannot participate.';
      case 'PENDING_REVIEW':
        return 'Player eligibility is pending review.';
      case 'NEEDS_ACTION':
        return 'Player needs to complete some requirements.';
      default:
        return 'Eligibility status unknown.';
    }
  };

  const criticalViolations = result.violations.filter(v => v.severity === 'CRITICAL').length;
  const highViolations = result.violations.filter(v => v.severity === 'HIGH').length;
  const totalIssues = criticalViolations + highViolations + result.warnings.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon(result.summary.overallStatus)}
            <span>Eligibility Status</span>
          </div>
          <Badge 
            variant={result.isEligible ? "secondary" : "destructive"}
            className={`text-${getEligibilityStatusColor(result.summary.overallStatus)}-600 border-current`}
          >
            {result.summary.overallStatus.replace('_', ' ')}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-gray-700">
            {getStatusMessage(result.summary.overallStatus)}
          </p>
          
          {totalIssues > 0 && (
            <Alert variant={criticalViolations > 0 ? "destructive" : "default"}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Found {totalIssues} issue{totalIssues !== 1 ? 's' : ''}: 
                {criticalViolations > 0 && ` ${criticalViolations} critical`}
                {highViolations > 0 && ` ${highViolations} high priority`}
                {result.warnings.length > 0 && ` ${result.warnings.length} warnings`}
              </AlertDescription>
            </Alert>
          )}

          {result.isEligible && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                All eligibility requirements are satisfied. Player can participate in tournaments.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface EligibilityViolationsListProps {
  violations: EligibilityViolation[];
}

function EligibilityViolationsList({ violations }: EligibilityViolationsListProps) {
  const { getViolationSeverityColor } = useEligibilityHelpers();
  
  if (violations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            Eligibility Violations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-gray-600">No eligibility violations found!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <XCircle className="h-5 w-5 text-red-600 mr-2" />
          Eligibility Violations ({violations.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {violations.map((violation, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="destructive" 
                      className={`text-${getViolationSeverityColor(violation.severity)}-600 border-current`}
                    >
                      {violation.severity}
                    </Badge>
                    <span className="font-medium">{violation.ruleName}</span>
                  </div>
                  <p className="text-gray-600 mt-1">{violation.reason}</p>
                </div>
                {violation.canOverride && (
                  <Button variant="outline" size="sm">
                    Request Override
                  </Button>
                )}
              </div>
              
              {violation.suggestedAction && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Suggested Action:</strong> {violation.suggestedAction}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface EligibilityWarningsListProps {
  warnings: EligibilityWarning[];
}

function EligibilityWarningsList({ warnings }: EligibilityWarningsListProps) {
  if (warnings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            Eligibility Warnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-gray-600">No warnings found!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
          Eligibility Warnings ({warnings.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {warnings.map((warning, index) => (
            <div key={index} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-yellow-800">{warning.ruleName}</h4>
                  <p className="text-yellow-700 mt-1">{warning.message}</p>
                  {warning.suggestedAction && (
                    <p className="text-sm text-yellow-600 mt-2">
                      <strong>Recommendation:</strong> {warning.suggestedAction}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface EligibilityDetailedSummaryProps {
  summary: EligibilitySummary;
}

function EligibilityDetailedSummary({ summary }: EligibilityDetailedSummaryProps) {
  const getStatusIcon = (status: boolean) => 
    status ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />;

  const checks = [
    { label: 'Registration Status', status: summary.registrationStatus === 'APPROVED', icon: User, value: summary.registrationStatus },
    { label: 'Documents Verified', status: summary.documentsVerified, icon: FileText, value: summary.documentsVerified ? 'Complete' : 'Incomplete' },
    { label: 'Consents Granted', status: summary.consentsGranted, icon: Shield, value: summary.consentsGranted ? 'Complete' : 'Incomplete' },
    { label: 'Medical Clearance', status: summary.medicalClearanceValid, icon: Heart, value: summary.medicalClearanceValid ? 'Valid' : 'Invalid/Missing' },
    { label: 'Age Eligible', status: summary.ageEligible, icon: Calendar, value: summary.ageEligible ? 'Eligible' : 'Not Eligible' },
    { label: 'Geographic Eligible', status: summary.geographicEligible, icon: MapPin, value: summary.geographicEligible ? 'Eligible' : 'Not Eligible' },
  ];

  const completedChecks = checks.filter(check => check.status).length;
  const progressPercentage = Math.round((completedChecks / checks.length) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Detailed Summary
          </div>
          <Badge variant="outline">
            {completedChecks}/{checks.length} Complete
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-gray-500">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <Separator />

        {/* Detailed Checks */}
        <div className="space-y-4">
          <h4 className="font-medium">Eligibility Requirements</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {checks.map((check, index) => {
              const Icon = check.icon;
              return (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border">
                  <Icon className="h-5 w-5 text-gray-500" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{check.label}</span>
                      {getStatusIcon(check.status)}
                    </div>
                    <p className="text-xs text-gray-500">{check.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Next Steps */}
        {summary.nextSteps.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Next Steps</h4>
            <div className="space-y-2">
              {summary.nextSteps.map((step, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-sm text-gray-700">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface EligibilityQuickCheckProps {
  playerId: string;
  tournamentId: string;
  compact?: boolean;
}

export function EligibilityQuickCheck({ playerId, tournamentId, compact = false }: EligibilityQuickCheckProps) {
  const { data: result, isLoading } = usePlayerEligibility(playerId, tournamentId);
  
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Checking...</span>
      </div>
    );
  }
  
  if (!result) {
    return (
      <Badge variant="destructive">
        <AlertCircle className="h-3 w-3 mr-1" />
        Error
      </Badge>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ELIGIBLE':
        return { variant: 'secondary' as const, icon: CheckCircle, color: 'text-green-600' };
      case 'INELIGIBLE':
        return { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' };
      case 'PENDING_REVIEW':
        return { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' };
      case 'NEEDS_ACTION':
        return { variant: 'secondary' as const, icon: AlertTriangle, color: 'text-orange-600' };
      default:
        return { variant: 'secondary' as const, icon: Shield, color: 'text-gray-600' };
    }
  };

  const config = getStatusConfig(result.summary.overallStatus);
  const Icon = config.icon;

  if (compact) {
    return (
      <Badge variant={config.variant} className={`${config.color} border-current`}>
        <Icon className="h-3 w-3 mr-1" />
        {result.summary.overallStatus.replace('_', ' ')}
      </Badge>
    );
  }

  const criticalCount = result.violations.filter(v => v.severity === 'CRITICAL').length;
  const warningCount = result.warnings.length;

  return (
    <div className="flex items-center space-x-3">
      <Badge variant={config.variant} className={`${config.color} border-current`}>
        <Icon className="h-3 w-3 mr-1" />
        {result.summary.overallStatus.replace('_', ' ')}
      </Badge>
      {criticalCount > 0 && (
        <span className="text-xs text-red-600">{criticalCount} critical issues</span>
      )}
      {warningCount > 0 && (
        <span className="text-xs text-yellow-600">{warningCount} warnings</span>
      )}
    </div>
  );
}