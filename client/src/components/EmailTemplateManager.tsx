import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { 
  Plus, 
  Edit2, 
  Copy, 
  Trash2, 
  Star, 
  StarOff, 
  Eye,
  Send,
  FileText,
  Download,
  Upload,
  Palette
} from 'lucide-react';
import { 
  useInvitationTemplates, 
  useCreateInvitationTemplate,
  useUpdateInvitationTemplate,
  useDeleteInvitationTemplate,
  useSetDefaultTemplate,
  useDuplicateTemplate,
  useTemplatePreview 
} from '../../hooks/useInvitationTemplates';
import { useAuth } from '../../hooks/useAuth';
import { toast } from '../../hooks/use-toast';
import type { InvitationTemplate, InsertInvitationTemplate } from '@shared/schema';

interface EmailTemplateManagerProps {
  managerId: string;
  orgId: string;
}

export default function EmailTemplateManager({ managerId, orgId }: EmailTemplateManagerProps) {
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<InvitationTemplate | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewData, setPreviewData] = useState<{ subject: string; body: string } | null>(null);

  // Form state for template creation/editing
  const [templateForm, setTemplateForm] = useState<Partial<InsertInvitationTemplate>>({
    name: '',
    templateType: 'INITIAL_INVITE',
    subjectTemplate: '',
    bodyTemplate: '',
  });

  // Hooks
  const { data: templates = [], isLoading } = useInvitationTemplates(orgId, managerId);
  const createTemplate = useCreateInvitationTemplate();
  const updateTemplate = useUpdateInvitationTemplate();
  const deleteTemplate = useDeleteInvitationTemplate();
  const setDefaultTemplate = useSetDefaultTemplate();
  const duplicateTemplate = useDuplicateTemplate();
  const previewTemplate = useTemplatePreview();

  // Sample variables for preview
  const sampleVariables = {
    team_name: 'Nairobi Eagles FC',
    position: 'Midfielder',
    player_name: 'John Doe',
    custom_message: 'We believe you would be a great addition to our team!',
    registration_link: 'https://jamiitourney.com/register/sample123',
    expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    manager_name: `${user?.firstName} ${user?.lastName}`,
    tournament_name: 'County Championship',
    organization_name: 'Jamii Tourney'
  };

  const handleCreateTemplate = async () => {
    try {
      if (!templateForm.name || !templateForm.subjectTemplate || !templateForm.bodyTemplate) {
        toast({
          title: "Missing fields",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      await createTemplate.mutateAsync({
        orgId,
        managerId,
        name: templateForm.name,
        templateType: templateForm.templateType || 'INITIAL_INVITE',
        subjectTemplate: templateForm.subjectTemplate,
        bodyTemplate: templateForm.bodyTemplate,
        isDefault: false,
        variables: null,
      });

      toast({
        title: "Template created",
        description: "Your email template has been created successfully"
      });

      setShowCreateDialog(false);
      setTemplateForm({
        name: '',
        templateType: 'INITIAL_INVITE',
        subjectTemplate: '',
        bodyTemplate: '',
      });
    } catch (error) {
      toast({
        title: "Error creating template",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };

  const handlePreviewTemplate = async (template: InvitationTemplate) => {
    try {
      const preview = await previewTemplate.mutateAsync({
        template: {
          subjectTemplate: template.subjectTemplate,
          bodyTemplate: template.bodyTemplate
        },
        variables: sampleVariables
      });

      setPreviewData(preview);
      setSelectedTemplate(template);
      setShowPreviewDialog(true);
    } catch (error) {
      toast({
        title: "Error generating preview",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };

  const handleSetDefault = async (templateId: string, templateType: string) => {
    try {
      await setDefaultTemplate.mutateAsync({
        templateId,
        orgId,
        templateType
      });

      toast({
        title: "Default template set",
        description: "This template is now the default for this type"
      });
    } catch (error) {
      toast({
        title: "Error setting default",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };

  const handleDuplicate = async (templateId: string) => {
    try {
      await duplicateTemplate.mutateAsync(templateId);
      
      toast({
        title: "Template duplicated",
        description: "A copy of the template has been created"
      });
    } catch (error) {
      toast({
        title: "Error duplicating template",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (templateId: string) => {
    try {
      await deleteTemplate.mutateAsync(templateId);
      
      toast({
        title: "Template deleted",
        description: "The template has been deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error deleting template",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };

  const getTemplateTypeColor = (type: string) => {
    switch (type) {
      case 'INITIAL_INVITE': return 'bg-blue-100 text-blue-700';
      case 'REMINDER': return 'bg-yellow-100 text-yellow-700';
      case 'FOLLOW_UP': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading email templates...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Email Templates</h3>
          <p className="text-sm text-gray-600">Manage your invitation email templates</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-sm font-medium">{template.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getTemplateTypeColor(template.templateType)}>
                      {template.templateType.replace('_', ' ')}
                    </Badge>
                    {template.isDefault && (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                        <Star className="w-3 h-3 mr-1" />
                        Default
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Subject</p>
                  <p className="text-sm truncate">{template.subjectTemplate}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Body Preview</p>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {template.bodyTemplate.substring(0, 80)}...
                  </p>
                </div>

                <Separator />

                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handlePreviewTemplate(template)}
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleDuplicate(template.id)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>

                  {!template.isDefault && (
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleSetDefault(template.id, template.templateType)}
                    >
                      <StarOff className="w-3 h-3" />
                    </Button>
                  )}

                  {!template.isDefault && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {templates.length === 0 && (
          <div className="col-span-full text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No templates yet</h3>
            <p className="text-gray-500 mb-6">Create your first email template to get started</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Template
            </Button>
          </div>
        )}
      </div>

      {/* Create Template Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Email Template</DialogTitle>
            <DialogDescription>
              Create a new email template for player invitations
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  placeholder="e.g., Welcome Email"
                  value={templateForm.name || ''}
                  onChange={(e) => setTemplateForm(prev => ({...prev, name: e.target.value}))}
                />
              </div>
              
              <div>
                <Label htmlFor="template-type">Template Type</Label>
                <Select 
                  value={templateForm.templateType || 'INITIAL_INVITE'}
                  onValueChange={(value) => setTemplateForm(prev => ({...prev, templateType: value as any}))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INITIAL_INVITE">Initial Invitation</SelectItem>
                    <SelectItem value="REMINDER">Reminder Email</SelectItem>
                    <SelectItem value="FOLLOW_UP">Follow-up Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="subject-template">Email Subject Template</Label>
              <Input
                id="subject-template"
                placeholder="e.g., Invitation to Join {{team_name}} - {{position}} Position"
                value={templateForm.subjectTemplate || ''}
                onChange={(e) => setTemplateForm(prev => ({...prev, subjectTemplate: e.target.value}))}
              />
            </div>

            <div>
              <Label htmlFor="body-template">Email Body Template</Label>
              <Textarea
                id="body-template"
                placeholder={`Dear {{player_name}},

You have been invited to join {{team_name}} for the {{position}} position.

{{custom_message}}

To complete your registration, please click the link below:
{{registration_link}}

Best regards,
{{manager_name}}`}
                value={templateForm.bodyTemplate || ''}
                onChange={(e) => setTemplateForm(prev => ({...prev, bodyTemplate: e.target.value}))}
                rows={12}
              />
            </div>

            <Alert>
              <Palette className="h-4 w-4" />
              <AlertDescription>
                <strong>Available Variables:</strong> {'{'}{'{'}{'}'}team_name{'{'}{'}'}{'}'}
                , {'{'}{'{'}{'}'}player_name{'{'}{'}'}{'}'}
                , {'{'}{'{'}{'}'}position{'{'}{'}'}{'}'}
                , {'{'}{'{'}{'}'}custom_message{'{'}{'}'}{'}'}
                , {'{'}{'{'}{'}'}registration_link{'{'}{'}'}{'}'}
                , {'{'}{'{'}{'}'}expiry_date{'{'}{'}'}{'}'}
                , {'{'}{'{'}{'}'}manager_name{'{'}{'}'}{'}'}
              </AlertDescription>
            </Alert>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateTemplate}
                disabled={createTemplate.isPending}
              >
                {createTemplate.isPending ? 'Creating...' : 'Create Template'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Preview: {selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              Preview of how the email will look with sample data
            </DialogDescription>
          </DialogHeader>

          {previewData && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Subject</Label>
                <div className="mt-1 p-3 bg-gray-50 border rounded">
                  {previewData.subject}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Body</Label>
                <div className="mt-1 p-4 bg-gray-50 border rounded whitespace-pre-wrap">
                  {previewData.body}
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
                  Close Preview
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}