import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DocumentCategory {
  id: string;
  name: string;
  description: string;
  required: boolean;
  icon: string;
  documents: DocumentFile[];
}

interface DocumentFile {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  expiryDate?: string;
  status: 'Approved' | 'Pending Review' | 'Rejected' | 'Expired' | 'Resubmission Required';
  size: string;
  version: number;
  approvedBy?: string;
  rejectionReason?: string;
  notes?: string;
}

interface DocumentSubmission {
  id: string;
  categoryId: string;
  submissionDate: string;
  status: 'In Review' | 'Approved' | 'Rejected';
  reviewerId?: string;
  reviewDate?: string;
  feedback?: string;
}

export default function PlayerDocumentCenter() {
  const documentCategories: DocumentCategory[] = [
    {
      id: '1',
      name: 'Identity Documents',
      description: 'Official identification documents required for player registration',
      required: true,
      icon: '🆔',
      documents: [
        {
          id: '1',
          name: 'National_ID_Card_Front.pdf',
          type: 'National ID',
          uploadDate: '2024-01-15',
          status: 'Approved',
          size: '1.2 MB',
          version: 2,
          approvedBy: 'Admin Team',
          notes: 'Clear, high quality scan'
        },
        {
          id: '2',
          name: 'National_ID_Card_Back.pdf',
          type: 'National ID',
          uploadDate: '2024-01-15',
          status: 'Approved',
          size: '1.1 MB',
          version: 2,
          approvedBy: 'Admin Team'
        }
      ]
    },
    {
      id: '2',
      name: 'Birth Documentation',
      description: 'Official birth records for age verification',
      required: true,
      icon: '📋',
      documents: [
        {
          id: '3',
          name: 'Birth_Certificate_Official.pdf',
          type: 'Birth Certificate',
          uploadDate: '2024-01-15',
          status: 'Approved',
          size: '1.8 MB',
          version: 1,
          approvedBy: 'Legal Team',
          notes: 'Government issued, authenticated'
        }
      ]
    },
    {
      id: '3',
      name: 'Medical Clearance',
      description: 'Health and fitness certificates for sports participation',
      required: true,
      icon: '⚕️',
      documents: [
        {
          id: '4',
          name: 'Medical_Fitness_Certificate_2024.pdf',
          type: 'Medical Certificate',
          uploadDate: '2024-11-01',
          expiryDate: '2025-11-01',
          status: 'Approved',
          size: '950 KB',
          version: 1,
          approvedBy: 'Medical Team',
          notes: 'Valid for competitive sports'
        },
        {
          id: '5',
          name: 'COVID_Vaccination_Record.pdf',
          type: 'Vaccination Record',
          uploadDate: '2024-01-20',
          status: 'Approved',
          size: '420 KB',
          version: 1,
          approvedBy: 'Medical Team'
        }
      ]
    },
    {
      id: '4',
      name: 'Educational Certificates',
      description: 'Academic qualifications and school records',
      required: false,
      icon: '🎓',
      documents: [
        {
          id: '6',
          name: 'KCSE_Certificate.pdf',
          type: 'KCSE Certificate',
          uploadDate: '2024-02-10',
          status: 'Approved',
          size: '2.1 MB',
          version: 1,
          approvedBy: 'Admin Team'
        },
        {
          id: '7',
          name: 'University_Diploma.pdf',
          type: 'University Diploma',
          uploadDate: '2024-09-15',
          status: 'Pending Review',
          size: '3.2 MB',
          version: 1
        }
      ]
    },
    {
      id: '5',
      name: 'Professional Photos',
      description: 'Official player photographs for registration and marketing',
      required: true,
      icon: '📷',
      documents: [
        {
          id: '8',
          name: 'Player_Headshot_2024.jpg',
          type: 'Headshot Photo',
          uploadDate: '2024-01-20',
          status: 'Approved',
          size: '445 KB',
          version: 3,
          approvedBy: 'Media Team',
          notes: 'Professional quality, good lighting'
        },
        {
          id: '9',
          name: 'Full_Body_Action_Shot.jpg',
          type: 'Action Photo',
          uploadDate: '2024-03-05',
          status: 'Resubmission Required',
          size: '1.8 MB',
          version: 1,
          rejectionReason: 'Image quality insufficient for marketing use'
        }
      ]
    },
    {
      id: '6',
      name: 'Contract Documents',
      description: 'Player contracts and legal agreements',
      required: true,
      icon: '📄',
      documents: [
        {
          id: '10',
          name: 'Player_Contract_2024_Signed.pdf',
          type: 'Player Contract',
          uploadDate: '2024-01-10',
          expiryDate: '2026-12-31',
          status: 'Approved',
          size: '4.2 MB',
          version: 1,
          approvedBy: 'Legal Team',
          notes: 'Fully executed contract'
        }
      ]
    }
  ];

  const recentSubmissions: DocumentSubmission[] = [
    {
      id: '1',
      categoryId: '4',
      submissionDate: '2024-11-28',
      status: 'In Review',
      reviewerId: 'admin@nairobifc.com'
    },
    {
      id: '2',
      categoryId: '5',
      submissionDate: '2024-11-25',
      status: 'Rejected',
      reviewerId: 'media@nairobifc.com',
      reviewDate: '2024-11-26',
      feedback: 'Photo quality needs improvement. Please submit a higher resolution image with better lighting.'
    },
    {
      id: '3',
      categoryId: '3',
      submissionDate: '2024-11-01',
      status: 'Approved',
      reviewerId: 'medical@nairobifc.com',
      reviewDate: '2024-11-02',
      feedback: 'All medical requirements met. Certificate valid for one year.'
    }
  ];

  const getStatusColor = (status: DocumentFile['status']) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Pending Review': return 'bg-yellow-100 text-yellow-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Expired': return 'bg-gray-100 text-gray-800';
      case 'Resubmission Required': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubmissionStatusColor = (status: DocumentSubmission['status']) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'In Review': return 'bg-blue-100 text-blue-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateCompletionRate = () => {
    const requiredCategories = documentCategories.filter(cat => cat.required);
    const completedCategories = requiredCategories.filter(cat => 
      cat.documents.some(doc => doc.status === 'Approved')
    );
    return Math.round((completedCategories.length / requiredCategories.length) * 100);
  };

  const getTotalDocuments = () => {
    return documentCategories.reduce((total, category) => total + category.documents.length, 0);
  };

  const getApprovedDocuments = () => {
    return documentCategories.reduce((total, category) => 
      total + category.documents.filter(doc => doc.status === 'Approved').length, 0
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Document Center</h1>
          <p className="text-muted-foreground">Manage your player registration and verification documents</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">📁 Bulk Upload</Button>
          <Button variant="outline">📄 Download All</Button>
          <Button>📤 Submit for Review</Button>
        </div>
      </div>

      {/* Document Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{calculateCompletionRate()}%</div>
            <div className="text-sm text-muted-foreground">Completion Rate</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${calculateCompletionRate()}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{getApprovedDocuments()}/{getTotalDocuments()}</div>
            <div className="text-sm text-muted-foreground">Documents Approved</div>
            <div className="text-xs text-green-600 mt-1">
              {getTotalDocuments() - getApprovedDocuments()} pending
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">3</div>
            <div className="text-sm text-muted-foreground">In Review</div>
            <div className="text-xs text-blue-600 mt-1">Awaiting approval</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">1</div>
            <div className="text-sm text-muted-foreground">Action Required</div>
            <div className="text-xs text-orange-600 mt-1">Resubmission needed</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Document Categories */}
        <div className="lg:col-span-2 space-y-6">
          {documentCategories.map(category => (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{category.icon}</div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {category.name}
                        {category.required && (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    📤 Upload
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {category.documents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="text-4xl mb-2">📁</div>
                    <div>No documents uploaded yet</div>
                    <Button variant="outline" className="mt-4">
                      Upload First Document
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {category.documents.map(doc => (
                      <div key={doc.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="font-semibold">{doc.name}</div>
                              <Badge className={getStatusColor(doc.status)} variant="secondary">
                                {doc.status}
                              </Badge>
                              {doc.version > 1 && (
                                <Badge variant="outline">v{doc.version}</Badge>
                              )}
                            </div>
                            
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div>Type: {doc.type} • Size: {doc.size}</div>
                              <div>Uploaded: {doc.uploadDate}</div>
                              {doc.expiryDate && (
                                <div>Expires: {doc.expiryDate}</div>
                              )}
                              {doc.approvedBy && (
                                <div>Approved by: {doc.approvedBy}</div>
                              )}
                              {doc.notes && (
                                <div className="text-green-600">Note: {doc.notes}</div>
                              )}
                              {doc.rejectionReason && (
                                <div className="text-red-600">Reason: {doc.rejectionReason}</div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-2 ml-4">
                            <Button variant="outline" size="sm">👁️</Button>
                            <Button variant="outline" size="sm">⬇️</Button>
                            {doc.status === 'Rejected' || doc.status === 'Resubmission Required' ? (
                              <Button size="sm">🔄 Resubmit</Button>
                            ) : (
                              <Button variant="outline" size="sm">✏️</Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Submission History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentSubmissions.map(submission => (
                  <div key={submission.id} className="border rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-semibold">
                        {documentCategories.find(cat => cat.id === submission.categoryId)?.name || 'Document'}
                      </div>
                      <Badge className={getSubmissionStatusColor(submission.status)} variant="secondary">
                        {submission.status}
                      </Badge>
                    </div>
                    
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>Submitted: {submission.submissionDate}</div>
                      {submission.reviewDate && (
                        <div>Reviewed: {submission.reviewDate}</div>
                      )}
                      {submission.reviewerId && (
                        <div>Reviewer: {submission.reviewerId}</div>
                      )}
                      {submission.feedback && (
                        <div className="text-blue-600 mt-2">
                          Feedback: {submission.feedback}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <Button variant="outline" className="w-full mt-3">
                📋 View All History
              </Button>
            </CardContent>
          </Card>

          {/* Document Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documentCategories.filter(cat => cat.required).map(category => {
                  const hasApprovedDoc = category.documents.some(doc => doc.status === 'Approved');
                  return (
                    <div key={category.id} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs ${
                        hasApprovedDoc ? 'bg-green-100 border-green-500 text-green-600' : 'border-gray-300'
                      }`}>
                        {hasApprovedDoc && '✓'}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{category.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {hasApprovedDoc ? 'Complete' : 'Required'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Upload Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-3">
                <div>
                  <div className="font-semibold mb-1">📷 Photo Requirements</div>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                    <li>• High resolution (min 300 DPI)</li>
                    <li>• Clear, professional lighting</li>
                    <li>• Plain background preferred</li>
                    <li>• JPG, PNG formats only</li>
                  </ul>
                </div>
                
                <div>
                  <div className="font-semibold mb-1">📄 Document Requirements</div>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                    <li>• Clear, legible scans</li>
                    <li>• All text must be readable</li>
                    <li>• PDF format preferred</li>
                    <li>• Max file size: 5MB</li>
                  </ul>
                </div>
                
                <div>
                  <div className="font-semibold mb-1">⚕️ Medical Documents</div>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                    <li>• Must be recent (within 1 year)</li>
                    <li>• Doctor's signature required</li>
                    <li>• Hospital/clinic letterhead</li>
                    <li>• Valid license number visible</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                📤 Upload Multiple Files
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📋 Check Requirements
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📞 Contact Support
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📧 Request Review
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📄 Generate Report
              </Button>
            </CardContent>
          </Card>

          {/* Help & Support */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-3">
                <div>
                  <div className="font-semibold">📞 Support Hotline</div>
                  <div className="text-muted-foreground">+254 700 123 456</div>
                </div>
                
                <div>
                  <div className="font-semibold">📧 Email Support</div>
                  <div className="text-muted-foreground">docs@nairobifc.com</div>
                </div>
                
                <div>
                  <div className="font-semibold">🕒 Office Hours</div>
                  <div className="text-muted-foreground">Mon-Fri: 9AM-5PM</div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-4">
                📚 View FAQ
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}