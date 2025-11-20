import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { getPlayerImageProps, getEnhancedPlayerImageProps } from '../lib/imageUtils';
import { useEnhancedPlayerImage } from '../hooks/useEnhancedPlayerImage';
import { 
  User, 
  FileText, 
  Shield, 
  Trophy, 
  Calendar,
  MapPin,
  Phone,
  Mail,
  Camera,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface PlayerProfileCardProps {
  profile: {
    id: string;
    first_name: string;
    last_name: string;
    dob: string;
    sex: string;
    nationality: string;
    photo_path?: string;
    status: string;
    created_at: string;
  };
  stats: {
    totalTournaments: number;
    activeTournaments: number;
    documentsUploaded: number;
    documentsVerified: number;
    registrationStatus: string;
  };
}

export function PlayerProfileCard({ profile, stats }: PlayerProfileCardProps) {
  // Use enhanced image loading that checks documents table
  const playerImage = useEnhancedPlayerImage(
    profile.id, 
    profile.photo_path, 
    profile.first_name, 
    profile.last_name
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'SUSPENDED': return 'bg-red-100 text-red-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const profileCompleteness = () => {
    let completed = 0;
    const total = 5;
    
    if (profile.first_name && profile.last_name) completed++;
    if (profile.dob) completed++;
    if (profile.photo_path) completed++;
    if (stats.documentsUploaded > 0) completed++;
    if (stats.documentsVerified > 0) completed++;
    
    return Math.round((completed / total) * 100);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage 
              src={playerImage.src} 
              alt={playerImage.alt} 
            />
            <AvatarFallback className="text-lg">
              {playerImage.isLoading ? '⏳' : playerImage.fallbackText}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <CardTitle className="text-xl">
              {profile.first_name} {profile.last_name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={getStatusColor(profile.status)}>
                {profile.status}
              </Badge>
              <span className="text-sm text-gray-600">
                Age {calculateAge(profile.dob)} • {profile.nationality}
              </span>
            </div>
          </div>
          
          <Button variant="outline" size="sm">
            <Camera className="h-4 w-4 mr-2" />
            Update Photo
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Profile Completeness */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Profile Completeness</span>
            <span className="text-sm text-gray-600">{profileCompleteness()}%</span>
          </div>
          <Progress value={profileCompleteness()} className="h-2" />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalTournaments}</div>
            <div className="text-xs text-gray-600">Tournaments</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.activeTournaments}</div>
            <div className="text-xs text-gray-600">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.documentsUploaded}</div>
            <div className="text-xs text-gray-600">Documents</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.documentsVerified}</div>
            <div className="text-xs text-gray-600">Verified</div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <User className="h-4 w-4 mr-2 text-gray-500" />
              <span className="font-medium">Player ID:</span>
              <span className="ml-2 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                {profile.id.slice(0, 8)}...
              </span>
            </div>
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <span className="font-medium">Registered:</span>
              <span className="ml-2">
                {new Date(profile.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Shield className="h-4 w-4 mr-2 text-gray-500" />
              <span className="font-medium">Gender:</span>
              <span className="ml-2">{profile.sex}</span>
            </div>
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
              <span className="font-medium">Nationality:</span>
              <span className="ml-2">{profile.nationality}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface DocumentListProps {
  documents: Array<{
    id: string;
    document_type: string;
    file_path: string;
    verification_status: 'PENDING' | 'VERIFIED' | 'REJECTED';
    uploaded_at: string;
    rejection_reason?: string;
  }>;
}

export function DocumentList({ documents }: DocumentListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VERIFIED': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'REJECTED': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'PENDING': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documents ({documents.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No documents uploaded yet</p>
            <Button className="mt-4" size="sm">
              Upload First Document
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(doc.verification_status)}
                  <div>
                    <div className="font-medium">
                      {doc.document_type.replace(/_/g, ' ')}
                    </div>
                    <div className="text-sm text-gray-600">
                      Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                    </div>
                    {doc.rejection_reason && (
                      <div className="text-sm text-red-600 mt-1">
                        Rejected: {doc.rejection_reason}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(doc.verification_status)}>
                    {doc.verification_status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </div>
            ))}
            
            <Button className="w-full" variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Upload New Document
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface TournamentHistoryProps {
  tournaments: Array<{
    id: string;
    tournament_name: string;
    tournament_status: string;
    registration_date: string;
    player_status: string;
    team_name?: string;
  }>;
}

export function TournamentHistory({ tournaments }: TournamentHistoryProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'REGISTERED': return 'bg-blue-100 text-blue-800';
      case 'WITHDRAWN': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Tournament History ({tournaments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tournaments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No tournament participation yet</p>
            <Button className="mt-4" size="sm">
              Browse Tournaments
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {tournaments.map((tournament) => (
              <div key={tournament.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{tournament.tournament_name}</div>
                  <div className="text-sm text-gray-600">
                    {tournament.team_name && (
                      <span className="mr-2">Team: {tournament.team_name}</span>
                    )}
                    <span>Registered: {new Date(tournament.registration_date).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <Badge className={getStatusColor(tournament.player_status)}>
                  {tournament.player_status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}