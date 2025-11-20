import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Progress } from '../components/ui/progress';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Camera, Upload, Check, X, AlertCircle, User, Phone, Mail, Calendar, MapPin, FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '../hooks/use-toast';
import { 
  useStartPlayerRegistration, 
  useSubmitRegistration,
  useUploadPlayerDocument,
  usePlayerDocuments,
  useRecordConsent 
} from '../hooks/usePlayerRegistration';
import { SelfieUpload } from '../components/SelfieUpload';

// Create a base schema and then refine it based on age
const createRegistrationSchema = (isMinor: boolean) => {
  const baseSchema = z.object({
    // Identity Information
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    sex: z.enum(['MALE', 'FEMALE', 'OTHER'], { required_error: 'Gender is required' }),
    nationality: z.string().min(2, 'Nationality is required'),
    
    // Contact Information  
    email: z.string().email('Valid email is required'),
    phone: z.string().min(10, 'Valid phone number is required'),
    
    // Optional Information (no residency gating as per blueprint)
    wardId: z.number().optional(),
    affinityTag: z.string().optional(), // School/employer/academy - non-gating
    
    // Guardian Information (required for minors)
    guardianName: isMinor ? z.string().min(2, 'Guardian name is required for minors') : z.string().optional(),
    guardianPhone: isMinor ? z.string().min(10, 'Guardian phone is required for minors') : z.string().optional(),
    guardianRelationship: isMinor ? z.string().min(1, 'Guardian relationship is required for minors') : z.string().optional(),
    
    // Consents (required as per blueprint)
    playerTermsConsent: z.boolean().refine(val => val === true, 'You must accept the player terms'),
    dataProcessingConsent: z.boolean().refine(val => val === true, 'You must consent to data processing'),
    mediaConsent: z.boolean().optional(), // Optional
    guardianConsent: isMinor ? z.boolean().refine(val => val === true, 'Guardian consent is required for minors') : z.boolean().optional(),
  });

  return baseSchema;
};

// Initial schema (will be updated when age is determined)
const registrationSchema = createRegistrationSchema(false);

type RegistrationFormData = z.infer<typeof registrationSchema>;

// Registration steps based on blueprint flow
const REGISTRATION_STEPS = [
  { id: 'identity', label: 'Identity', icon: User },
  { id: 'contact', label: 'Contact', icon: Phone },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'selfie', label: 'Selfie', icon: Camera },
  { id: 'consents', label: 'Consents', icon: Check },
] as const;

export default function PlayerRegistration() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);
  const [selfieUploaded, setSelfieUploaded] = useState(false);
  const [selfieUrl, setSelfieUrl] = useState<string>('');
  const [selfiePath, setSelfiePath] = useState<string>('');
  const [isMinor, setIsMinor] = useState(false);
  const [currentSchema, setCurrentSchema] = useState(() => createRegistrationSchema(false));
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registeredUpid, setRegisteredUpid] = useState<string>('');
  const [documentUploadProgress, setDocumentUploadProgress] = useState<{[key: string]: number}>({});
  
  const startRegistrationMutation = useStartPlayerRegistration();
  const submitRegistrationMutation = useSubmitRegistration();
  const uploadDocumentMutation = useUploadPlayerDocument();
  const { data: playerDocuments, refetch: refetchDocuments } = usePlayerDocuments(registeredUpid);

  // Consent recording hook
  const recordConsentMutation = useRecordConsent();

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(currentSchema),
    mode: 'onChange'
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isValid }
  } = form;

  // Calculate if player is a minor (under 18) based on DOB
  const dateOfBirth = watch('dateOfBirth');
  React.useEffect(() => {
    if (dateOfBirth) {
      const birth = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birth.getFullYear();
      const minorStatus = age < 18;
      
      // Update schema if minor status changes
      if (minorStatus !== isMinor) {
        setIsMinor(minorStatus);
        const newSchema = createRegistrationSchema(minorStatus);
        setCurrentSchema(newSchema);
        
        // Reset form with new schema
        form.clearErrors();
        
        // Set default values for guardian consent
        if (minorStatus) {
          setValue('guardianConsent', false);
        }
      }
    }
  }, [dateOfBirth, isMinor, setValue, form]);

  // Sync uploaded documents from backend
  React.useEffect(() => {
    if (playerDocuments && playerDocuments.length > 0) {
      const docTypes: string[] = [];
      playerDocuments.forEach((doc: any) => {
        // Check if this is a guardian document using hash prefix
        const isGuardianDoc = doc.doc_number_hash?.startsWith('GUARDIAN_');
        
        // Use doc_type field that matches the database schema
        switch (doc.doc_type) {
          case 'NATIONAL_ID':
          case 'PASSPORT':
            if (isGuardianDoc) {
              docTypes.push('guardian_id');
            } else {
              docTypes.push('id');
            }
            break;
          case 'BIRTH_CERTIFICATE':
            docTypes.push('id'); // Birth certificate can serve as ID for minors
            break;
          case 'OTHER':
            // For medical certificates and other documents
            docTypes.push('medical');
            break;
        }
      });
      
      // Remove duplicates and set the state
      const uniqueDocTypes = [...new Set(docTypes)];
      setUploadedDocuments(uniqueDocTypes);
    }
  }, [playerDocuments]);

  // Check if registration can be completed
  const canCompleteRegistration = () => {
    // Check required consents
    const playerTerms = watch('playerTermsConsent');
    const dataProcessing = watch('dataProcessingConsent');
    const guardianConsent = watch('guardianConsent');
    
    const requiredConsentsValid = playerTerms && dataProcessing && (!isMinor || guardianConsent);
    
    // Check basic required fields
    const firstName = watch('firstName');
    const lastName = watch('lastName');
    const dateOfBirth = watch('dateOfBirth');
    const sex = watch('sex');
    const nationality = watch('nationality');
    const email = watch('email');
    const phone = watch('phone');
    
    const basicFieldsValid = firstName && lastName && dateOfBirth && sex && nationality && email && phone;
    
    // Check guardian fields for minors
    const guardianFieldsValid = !isMinor || (
      watch('guardianName') && 
      watch('guardianPhone') && 
      watch('guardianRelationship')
    );
    
    // Debug logging
    console.log('Debug - canCompleteRegistration:', {
      playerTerms,
      dataProcessing,
      guardianConsent,
      isMinor,
      requiredConsentsValid,
      basicFieldsValid,
      guardianFieldsValid,
      firstName,
      lastName,
      dateOfBirth,
      sex,
      nationality,
      email,
      phone
    });
    
    return basicFieldsValid && guardianFieldsValid && requiredConsentsValid;
  };

  // Calculate overall progress
  const calculateProgress = () => {
    let completed = 0;
    const total = REGISTRATION_STEPS.length;
    
    // If registration was successful, show 100%
    if (registrationComplete) {
      return 100;
    }
    
    // Check completion of each step
    if (completedSteps.includes(0)) completed++; // Identity
    if (completedSteps.includes(1)) completed++; // Contact  
    
    // Documents step - check actual document requirements (medical is now optional)
    const requiredDocs = ['id', ...(isMinor ? ['guardian_id'] : [])];
    const hasAllRequiredDocs = requiredDocs.every(doc => uploadedDocuments.includes(doc));
    const hasAnyDoc = uploadedDocuments.length > 0 || (playerDocuments && playerDocuments.length > 0);
    if (hasAllRequiredDocs || hasAnyDoc) completed++; // Documents
    
    if (selfieUploaded && selfieUrl) completed++; // Selfie with actual upload
    if (completedSteps.includes(4)) completed++; // Consents
    
    return (completed / total) * 100;
  };

  const startRegistration = async (data: RegistrationFormData) => {
    if (registeredUpid) return; // Already started
    
    try {
      // Start registration to get UPID
      const result = await startRegistrationMutation.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
        dob: data.dateOfBirth,
        sex: data.sex,
        email: data.email,
        phone: data.phone,
        nationality: data.nationality,
        wardId: data.wardId,
        orgId: '550e8400-e29b-41d4-a716-446655440001', // Jamii Sports Federation
      });

      setRegisteredUpid(result.upid);
      
      toast({
        title: 'Registration Started!',
        description: `Your Player ID is: ${result.upid}. Continue with document uploads.`,
      });
    } catch (error) {
      console.error('Registration start error:', error);
      toast({
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'An error occurred starting registration.',
        variant: 'destructive',
      });
    }
  };

  const onSubmit = async (data: RegistrationFormData) => {
    try {
      // First, ensure registration is started
      if (!registeredUpid) {
        await startRegistration(data);
        return; // Let user continue with documents
      }

      // Submit final registration
      const result = await submitRegistrationMutation.mutateAsync(registeredUpid);

      // Mark all steps as completed and set completion state
      setCompletedSteps([0, 1, 2, 3, 4]);
      setRegistrationComplete(true);
      
      toast({
        title: 'Registration Complete!',
        description: `Player registration submitted successfully! Your status: ${result.status}`,
      });
      
      // Show welcome message
      setTimeout(() => {
        toast({
          title: 'Welcome to Jamii Tourney!',
          description: 'You can now participate in tournaments. Check your profile for next steps.',
        });
      }, 2000);
    } catch (error) {
      console.error('Registration submission error:', error);
      toast({
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'An error occurred during registration.',
        variant: 'destructive',
      });
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const nextStep = async () => {
    // Define which fields to validate for each step
    const stepFields = {
      0: ['firstName', 'lastName', 'dateOfBirth', 'sex', 'nationality'] as (keyof RegistrationFormData)[], // Identity
      1: ['email', 'phone', ...(isMinor ? ['guardianName', 'guardianPhone', 'guardianRelationship'] : [])] as (keyof RegistrationFormData)[], // Contact
      2: [] as (keyof RegistrationFormData)[], // Documents - handled by upload state
      3: [] as (keyof RegistrationFormData)[], // Selfie - handled by selfie state
      4: ['playerTermsConsent', 'dataProcessingConsent', ...(isMinor ? ['guardianConsent'] : [])] as (keyof RegistrationFormData)[], // Consents
    };
    
    const fieldsToValidate = stepFields[currentStep as keyof typeof stepFields] || [];
    
    // For steps without form validation (documents, selfie), check their completion states
    let isStepValid = true;
    
    if (fieldsToValidate.length > 0) {
      isStepValid = await trigger(fieldsToValidate);
    } else {
      // For document and selfie steps, check their specific requirements
      if (currentStep === 2) {
        // Documents step - require only ID (medical clearance is now optional)
        const requiredDocs = ['id', ...(isMinor ? ['guardian_id'] : [])];
        isStepValid = requiredDocs.every(doc => uploadedDocuments.includes(doc));
        if (!isStepValid) {
          toast({
            title: 'Missing Required Documents',
            description: 'Please upload your ID document before continuing. Medical clearance is optional.',
            variant: 'destructive',
          });
        }
      } else if (currentStep === 3) {
        // Selfie step
        isStepValid = selfieUploaded;
        if (!isStepValid) {
          toast({
            title: 'Selfie Required',
            description: 'Please take or upload a selfie before continuing.',
            variant: 'destructive',
          });
        }
      }
    }
    
    if (isStepValid) {
      // Mark current step as completed
      setCompletedSteps(prev => [...prev, currentStep]);
      
      // Start registration after contact step (step 1) to get UPID for document uploads
      if (currentStep === 1 && !registeredUpid) {
        const formData = form.getValues();
        await startRegistration(formData);
      }
      
      if (currentStep < REGISTRATION_STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Identity
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  placeholder="John"
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  {...register('lastName')}
                  placeholder="Doe"
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register('dateOfBirth')}
                className={errors.dateOfBirth ? 'border-red-500' : ''}
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-red-500 mt-1">{errors.dateOfBirth.message}</p>
              )}
              {isMinor && (
                <p className="text-sm text-blue-600 mt-1">
                  <AlertCircle className="inline h-4 w-4 mr-1" />
                  Guardian consent will be required (player under 18)
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="sex">Gender *</Label>
              <Select onValueChange={(value) => setValue('sex', value as 'MALE' | 'FEMALE' | 'OTHER')}>
                <SelectTrigger className={errors.sex ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.sex && (
                <p className="text-sm text-red-500 mt-1">{errors.sex.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="nationality">Nationality *</Label>
              <Input
                id="nationality"
                {...register('nationality')}
                placeholder="Kenyan"
                className={errors.nationality ? 'border-red-500' : ''}
              />
              {errors.nationality && (
                <p className="text-sm text-red-500 mt-1">{errors.nationality.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="affinityTag">Affinity (Optional)</Label>
              <Input
                id="affinityTag"
                {...register('affinityTag')}
                placeholder="School, Academy, or Employer"
              />
              <p className="text-xs text-gray-500 mt-1">
                For analytics only - does not affect eligibility
              </p>
            </div>
          </div>
        );

      case 1: // Contact
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="john.doe@example.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                placeholder="+254 712 345 678"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
              )}
            </div>

            {isMinor && (
              <>
                <Separator />
                <h4 className="text-md font-semibold">Guardian Information</h4>
                <div>
                  <Label htmlFor="guardianName">Guardian Name *</Label>
                  <Input
                    id="guardianName"
                    {...register('guardianName')}
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="guardianPhone">Guardian Phone *</Label>
                  <Input
                    id="guardianPhone"
                    type="tel"
                    {...register('guardianPhone')}
                    placeholder="+254 712 345 679"
                  />
                </div>
                <div>
                  <Label htmlFor="guardianRelationship">Relationship *</Label>
                  <Select onValueChange={(value) => setValue('guardianRelationship', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="legal_guardian">Legal Guardian</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        );

      case 2: // Documents
        return (
          <div className="space-y-4">
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                Upload clear photos of required documents. Supported formats: JPG, PNG, PDF
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <DocumentUploadCard
                title="Government ID"
                description="National ID, Passport, or Birth Certificate (for minors)"
                required={true}
                uploaded={uploadedDocuments.includes('id')}
                onUpload={() => {
                  setUploadedDocuments(prev => [...prev, 'id']);
                  refetchDocuments();
                }}
                docType="ID_CARD"
                upid={registeredUpid}
                uploadMutation={uploadDocumentMutation}
                isUploading={uploadDocumentMutation.isPending}
                uploadProgress={documentUploadProgress['id'] || 0}
              />
              
              <DocumentUploadCard
                title="Medical Clearance (Optional)"
                description="Valid medical fitness certificate - can be uploaded later"
                required={false}
                uploaded={uploadedDocuments.includes('medical')}
                onUpload={() => {
                  setUploadedDocuments(prev => [...prev, 'medical']);
                  refetchDocuments();
                }}
                docType="MEDICAL_CERTIFICATE"
                upid={registeredUpid}
                uploadMutation={uploadDocumentMutation}
                isUploading={uploadDocumentMutation.isPending}
                uploadProgress={documentUploadProgress['medical'] || 0}
              />

              {isMinor && (
                <DocumentUploadCard
                  title="Guardian ID"
                  description="Guardian's government-issued identification"
                  required={true}
                  uploaded={uploadedDocuments.includes('guardian_id')}
                  onUpload={() => {
                    setUploadedDocuments(prev => [...prev, 'guardian_id']);
                    refetchDocuments();
                  }}
                  docType="GUARDIAN_ID"
                  upid={registeredUpid}
                  uploadMutation={uploadDocumentMutation}
                  isUploading={uploadDocumentMutation.isPending}
                  uploadProgress={documentUploadProgress['guardian_id'] || 0}
                />
              )}
            </div>
          </div>
        );

      case 3: // Selfie
        return (
          <div className="space-y-4">
            <Alert>
              <Camera className="h-4 w-4" />
              <AlertDescription>
                Take a clear selfie for identity verification. Ensure good lighting and face the camera directly.
              </AlertDescription>
            </Alert>

            <SelfieUpload
              currentImageUrl={selfieUrl}
              onUploadComplete={(url, path) => {
                setSelfieUrl(url);
                setSelfiePath(path);
                setSelfieUploaded(true);
                toast({
                  title: 'Selfie Uploaded!',
                  description: 'Your selfie has been uploaded successfully.',
                });
              }}
              onUploadStart={() => {
                toast({
                  title: 'Uploading...',
                  description: 'Please wait while we upload your selfie.',
                });
              }}
              onError={(error) => {
                setSelfieUploaded(false);
                toast({
                  title: 'Upload Failed',
                  description: error,
                  variant: 'destructive',
                });
              }}
              disabled={registrationComplete}
            />
          </div>
        );

      case 4: // Consents
        return (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please review and provide your consent for the following:
              </AlertDescription>
            </Alert>

            {/* Privacy Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2">Privacy Notice</h4>
              <p className="text-sm text-blue-800 mb-2">
                We collect and process your personal data in accordance with Kenya's Data Protection Act 2019 
                and GDPR principles. Your data will be used for:
              </p>
              <ul className="text-sm text-blue-800 list-disc list-inside space-y-1 mb-2">
                <li>Tournament registration and management</li>
                <li>Player eligibility verification</li>
                <li>Communication about events and results</li>
                <li>Statistical analysis and reporting</li>
              </ul>
              <p className="text-xs text-blue-700">
                You can withdraw consent at any time by contacting us. For our full privacy policy, 
                visit our website or contact privacy@jamiitourney.co.ke
              </p>
            </div>

            <div className="space-y-4">
              <ConsentCheckbox
                id="playerTermsConsent"
                label="Player Terms and Conditions"
                description="I agree to the player terms, competition rules, and code of conduct"
                required={true}
                register={register}
                error={errors.playerTermsConsent}
                watch={watch}
                setValue={setValue}
                upid={registeredUpid}
                recordConsentMutation={recordConsentMutation}
              />

              <ConsentCheckbox
                id="dataProcessingConsent"
                label="Data Processing"
                description="I consent to the processing of my personal data for tournament management (GDPR compliant)"
                required={true}
                register={register}
                error={errors.dataProcessingConsent}
                watch={watch}
                setValue={setValue}
                upid={registeredUpid}
                recordConsentMutation={recordConsentMutation}
              />

              <ConsentCheckbox
                id="mediaConsent"
                label="Media and Photography (Optional)"
                description="I consent to photography/videography during matches for promotional purposes"
                required={false}
                register={register}
                error={errors.mediaConsent}
                watch={watch}
                setValue={setValue}
                upid={registeredUpid}
                recordConsentMutation={recordConsentMutation}
              />

              {isMinor && (
                <ConsentCheckbox
                  id="guardianConsent"
                  label="Guardian Consent"
                  description="As guardian, I provide consent for this minor to participate and process their data"
                  required={true}
                  register={register}
                  error={errors.guardianConsent}
                  watch={watch}
                  setValue={setValue}
                  upid={registeredUpid}
                  recordConsentMutation={recordConsentMutation}
                />
              )}

              {/* Consent Summary */}
              {registeredUpid && (
                <div className="mt-6 p-4 bg-gray-50 border rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Consent Summary</h5>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Player ID:</span>
                      <span className="font-mono">{registeredUpid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Registration Date:</span>
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Data Controller:</span>
                      <span>Jamii Sports Federation</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Legal Basis:</span>
                      <span>Contract Performance + Explicit Consent</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      <AlertCircle className="inline h-3 w-3 mr-1" />
                      You can withdraw any optional consent later from your profile settings.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-center mb-2">Player Registration</h1>
          <p className="text-gray-600 text-center">Complete your profile to join tournaments</p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-600">{Math.round(calculateProgress())}%</span>
            </div>
            <Progress value={calculateProgress()} className="mb-4" />
            
            {/* Registration Status */}
            {registeredUpid && !registrationComplete && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Player ID: {registeredUpid}
                  </span>
                  <Badge variant="secondary" className="text-xs">Draft</Badge>
                </div>
              </div>
            )}
            
            {/* Step Indicators */}
            <div className="flex justify-between">
              {REGISTRATION_STEPS.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = completedSteps.includes(index);
                const isCurrent = currentStep === index;
                
                return (
                  <div
                    key={step.id}
                    className={`flex flex-col items-center cursor-pointer ${
                      isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                    }`}
                    onClick={() => goToStep(index)}
                  >
                    <div className={`rounded-full p-2 mb-1 ${
                      isCurrent 
                        ? 'bg-blue-100' 
                        : isCompleted 
                          ? 'bg-green-100' 
                          : 'bg-gray-100'
                    }`}>
                      {isCompleted ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>
                    <span className="text-xs">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Main Form or Completion View */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {registrationComplete ? (
                <>
                  <Check className="h-5 w-5 text-green-600" />
                  Registration Complete
                </>
              ) : (
                <>
                  {React.createElement(REGISTRATION_STEPS[currentStep].icon, { className: "h-5 w-5" })}
                  {REGISTRATION_STEPS[currentStep].label}
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {registrationComplete ? (
              // Completion View
              <div className="text-center py-8">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-800 mb-2">
                    Welcome to Jamii Tourney!
                  </h3>
                  <p className="text-gray-600">
                    Your player registration has been successfully completed.
                  </p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-green-800 mb-2">What's Next?</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Your profile is being reviewed by administrators</li>
                    <li>• You'll receive an email confirmation shortly</li>
                    <li>• You can now browse and join tournaments</li>
                    <li>• Upload additional documents anytime in your profile</li>
                  </ul>
                </div>
                
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => window.location.href = '/'} variant="outline">
                    Browse Tournaments
                  </Button>
                  <Button onClick={() => window.location.href = '/profile'}>
                    View My Profile
                  </Button>
                </div>
              </div>
            ) : (
              // Registration Form
              <form onSubmit={handleSubmit(onSubmit)}>
                {renderStepContent()}
                
                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                  >
                    Previous
                  </Button>
                  
                  {currentStep === REGISTRATION_STEPS.length - 1 ? (
                    <Button
                      type="submit"
                      disabled={!canCompleteRegistration() || startRegistrationMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      {startRegistrationMutation.isPending ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Complete Registration'
                      )}
                    </Button>
                  ) : (
                    <Button type="button" onClick={nextStep}>
                      Next
                    </Button>
                  )}
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper Components
interface DocumentUploadCardProps {
  title: string;
  description: string;
  required: boolean;
  uploaded: boolean;
  onUpload: () => void;
  docType?: string;
  upid?: string;
  uploadMutation?: any;
  isUploading?: boolean;
  uploadProgress?: number;
}

function DocumentUploadCard({ 
  title, 
  description, 
  required, 
  uploaded, 
  onUpload,
  docType,
  upid,
  uploadMutation,
  isUploading,
  uploadProgress 
}: DocumentUploadCardProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !upid || !uploadMutation) return;
    
    try {
      await uploadMutation.mutateAsync({
        upid,
        docType: docType,
        file
      });
      onUpload();
    } catch (error) {
      console.error('Document upload failed:', error);
    }
  };
  
  return (
    <div className={`border rounded-lg p-4 ${uploaded ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h4 className="font-medium flex items-center gap-2">
            {title}
            {required && <span className="text-red-500">*</span>}
          </h4>
          <p className="text-sm text-gray-600">{description}</p>
          {uploadProgress && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mt-2">
              <Progress value={uploadProgress || 0} className="w-full h-2" />
              <p className="text-xs text-gray-500 mt-1">{uploadProgress || 0}% uploaded</p>
            </div>
          )}
        </div>
        <div className="ml-4">
          {uploaded ? (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Check className="h-3 w-3 mr-1" />
              Uploaded
            </Badge>
          ) : (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading || !upid}
              />
              <Button 
                size="sm" 
                onClick={() => fileInputRef.current?.click()} 
                className="flex items-center gap-2"
                disabled={isUploading || !upid}
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-3 w-3" />
                    Upload
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface ConsentCheckboxProps {
  id: string;
  label: string;
  description: string;
  required: boolean;
  register: any;
  error: any;
  watch: any;
  setValue: any;
  upid?: string;
  recordConsentMutation?: any;
}

function ConsentCheckbox({ 
  id, 
  label, 
  description, 
  required, 
  register, 
  error, 
  watch, 
  setValue, 
  upid, 
  recordConsentMutation 
}: ConsentCheckboxProps) {
  const isChecked = watch(id) || false;
  
  const handleCheckedChange = async (checked: boolean) => {
    setValue(id, checked, { shouldValidate: true });
    
    // Record consent with backend if checked and upid exists
    if (checked && upid && recordConsentMutation) {
      try {
        await recordConsentMutation.mutateAsync({
          upid,
          consentType: id,
          isConsented: true
        });
        
        console.log(`Consent recorded: ${id} for player ${upid}`);
      } catch (error) {
        console.error(`Failed to record consent ${id}:`, error);
        // Don't prevent UI update, just log the error
      }
    }
  };
  
  const getConsentLegalBasis = (consentType: string): string => {
    switch (consentType) {
      case 'playerTermsConsent':
        return 'CONTRACT_PERFORMANCE'; // Required for participation
      case 'dataProcessingConsent':
        return 'GDPR_ARTICLE_6_1_A'; // Explicit consent for data processing
      case 'mediaConsent':
        return 'GDPR_ARTICLE_6_1_A'; // Optional explicit consent
      case 'guardianConsent':
        return 'PARENTAL_CONSENT'; // Required for minors
      default:
        return 'GDPR_ARTICLE_6_1_A';
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <Checkbox
          id={id}
          checked={isChecked}
          onCheckedChange={handleCheckedChange}
          className={error ? 'border-red-500' : ''}
        />
        <div className="flex-1">
          <Label htmlFor={id} className="font-medium cursor-pointer">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
          {error && (
            <p className="text-sm text-red-500 mt-1">{error.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}