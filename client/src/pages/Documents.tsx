import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useOrganizations } from "@/hooks/useReferenceData";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Organization } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type DocumentWithPlayer = {
  id: string;
  upid: string;
  docType: string;
  docNumberHash: string;
  documentPath: string | null;
  verified: boolean;
  verifiedAt: Date | null;
  uploadedBy: string | null;
  createdAt: Date;
  playerFirstName: string;
  playerLastName: string;
};

export default function Documents() {
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [verificationFilter, setVerificationFilter] = useState<string>("all");
  const { toast } = useToast();

  const { data: organizations = [] } = useOrganizations();

  const { data: documents = [], isLoading } = useQuery<DocumentWithPlayer[]>({
    queryKey: ["/api/organizations", selectedOrgId, "documents", verificationFilter],
    enabled: !!selectedOrgId,
    queryFn: async () => {
      if (!selectedOrgId) return [];
      const verifiedParam = verificationFilter === "all" 
        ? "" 
        : `?verified=${verificationFilter === "verified"}`;
      const response = await fetch(`/api/organizations/${selectedOrgId}/documents${verifiedParam}`);
      if (!response.ok) throw new Error("Failed to fetch documents");
      return response.json();
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ id, verified }: { id: string; verified: boolean }) => {
      return await apiRequest("PATCH", `/api/player-documents/${id}`, {
        verified,
        verifiedAt: verified ? new Date().toISOString() : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/organizations", selectedOrgId, "documents"] 
      });
      toast({
        title: "Success",
        description: "Document verification status updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getDocumentTypeLabel = (docType: string) => {
    return docType.split("_").map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(" ");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Document Verification</h1>
        <p className="text-muted-foreground mt-2">Review and verify player identity documents</p>
      </div>

      <div className="flex gap-4">
        <div className="w-64">
          <label className="text-sm font-medium mb-2 block">Organization</label>
          <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
            <SelectTrigger data-testid="select-organization">
              <SelectValue placeholder="Select organization" />
            </SelectTrigger>
            <SelectContent>
              {organizations.map((org: Organization) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-64">
          <label className="text-sm font-medium mb-2 block">Status Filter</label>
          <Select value={verificationFilter} onValueChange={setVerificationFilter}>
            <SelectTrigger data-testid="select-status-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Documents</SelectItem>
              <SelectItem value="pending">Pending Verification</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedOrgId && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select an organization to view documents</p>
          </CardContent>
        </Card>
      )}

      {selectedOrgId && isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground">Loading documents...</p>
          </CardContent>
        </Card>
      )}

      {selectedOrgId && !isLoading && documents.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No documents found</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {documents.map((doc) => (
          <Card key={doc.id} data-testid={`card-document-${doc.id}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {doc.playerFirstName} {doc.playerLastName}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {getDocumentTypeLabel(doc.docType)}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {doc.verified ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      Pending
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-muted-foreground">Uploaded:</span>
                  <div className="font-medium">
                    {format(new Date(doc.createdAt), "PPP")}
                  </div>
                </div>
                {doc.verified && doc.verifiedAt && (
                  <div>
                    <span className="text-muted-foreground">Verified:</span>
                    <div className="font-medium">
                      {format(new Date(doc.verifiedAt), "PPP")}
                    </div>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Document Hash:</span>
                  <div className="font-mono text-xs truncate">
                    {doc.docNumberHash.substring(0, 16)}...
                  </div>
                </div>
              </div>

              {!doc.verified && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => verifyMutation.mutate({ id: doc.id, verified: true })}
                    disabled={verifyMutation.isPending}
                    data-testid={`button-verify-${doc.id}`}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Verify Document
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => verifyMutation.mutate({ id: doc.id, verified: false })}
                    disabled={verifyMutation.isPending}
                    data-testid={`button-reject-${doc.id}`}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              )}

              {doc.verified && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => verifyMutation.mutate({ id: doc.id, verified: false })}
                  disabled={verifyMutation.isPending}
                  data-testid={`button-unverify-${doc.id}`}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Revoke Verification
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
