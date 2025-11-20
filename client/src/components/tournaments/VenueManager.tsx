import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCounties, useSubCounties, useWards } from '@/hooks/useReferenceData';
import { MapPin, Plus, Edit, Trash2, Building2, Users as UsersIcon } from 'lucide-react';

interface Venue {
  id: string;
  name: string;
  location: string;
  countyId?: string;
  county?: string;
  subCountyId?: string;
  subCounty?: string;
  wardId?: string;
  ward?: string;
  constituency?: string;
  pitchCount?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  facilities?: string[];
}

interface VenueManagerProps {
  tournamentId: string;
}

export const VenueManager: React.FC<VenueManagerProps> = ({ tournamentId }) => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    countyId: '',
    subCountyId: '',
    wardId: '',
    constituency: '',
    pitchCount: 1
  });

  const { toast } = useToast();
  
  // Fetch geographic data
  const { data: counties = [] } = useCounties();
  const { data: subCounties = [] } = useSubCounties(formData.countyId || '');
  const { data: wards = [] } = useWards(formData.subCountyId || '');

  // Fetch venues
  useEffect(() => {
    fetchVenues();
  }, [tournamentId, searchQuery]);

  const fetchVenues = async () => {
    setLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams();
      if (tournamentId) params.append('tournamentId', tournamentId);
      if (searchQuery) params.append('search', searchQuery);
      
      const url = `/api/fixtures/venues${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success && data.venues) {
        setVenues(data.venues);
      }
    } catch (error) {
      console.error('Failed to fetch venues:', error);
      toast({
        title: "Error",
        description: "Failed to load venues. Make sure the backend server is running.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    console.log('Creating venue:', formData);
    
    try {
      const response = await fetch('/api/fixtures/venues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tournamentId: tournamentId // Associate with current tournament
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create venue');
      }
      
      if (data.success && data.venue) {
        // Refresh venues list
        await fetchVenues();
        setIsCreateDialogOpen(false);
        resetForm();
        
        toast({
          title: "Success",
          description: "Venue created successfully"
        });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Failed to create venue:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create venue",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (venue: Venue) => {
    setSelectedVenue(venue);
    setFormData({
      name: venue.name,
      location: venue.location,
      countyId: venue.countyId || '',
      subCountyId: venue.subCountyId || '',
      wardId: venue.wardId || '',
      constituency: venue.constituency || '',
      pitchCount: venue.pitchCount || 1
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedVenue) return;
    
    console.log('Updating venue:', selectedVenue.id, formData);
    
    try {
      const response = await fetch(`/api/fixtures/venues?id=${selectedVenue.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update venue');
      }
      
      if (data.success) {
        // Refresh venues list
        await fetchVenues();
        setIsEditDialogOpen(false);
        setSelectedVenue(null);
        resetForm();
        
        toast({
          title: "Success",
          description: "Venue updated successfully"
        });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Failed to update venue:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update venue",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (venueId: string) => {
    if (!confirm('Are you sure you want to delete this venue?')) return;
    
    console.log('Deleting venue:', venueId);
    
    try {
      const response = await fetch(`/api/fixtures/venues?id=${venueId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete venue');
      }
      
      if (data.success) {
        // Refresh venues list
        await fetchVenues();
        
        toast({
          title: "Success",
          description: "Venue deleted successfully"
        });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Failed to delete venue:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete venue",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      countyId: '',
      subCountyId: '',
      wardId: '',
      constituency: '',
      pitchCount: 1
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Venue Management</h2>
          <p className="text-muted-foreground">Manage venues and locations for your tournament</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Venue
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search venues by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading venues...</div>
      ) : venues.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No venues yet. Add your first venue to get started.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {venues.map((venue) => (
            <Card key={venue.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {venue.name}
                    </CardTitle>
                    <CardDescription>{venue.location}</CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(venue)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(venue.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {venue.county && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">County: </span>
                    <span className="font-medium">{venue.county}</span>
                  </div>
                )}
                {venue.subCounty && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Sub-County: </span>
                    <span className="font-medium">{venue.subCounty}</span>
                  </div>
                )}
                {venue.ward && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Ward: </span>
                    <span className="font-medium">{venue.ward}</span>
                  </div>
                )}
                {venue.constituency && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Constituency: </span>
                    <span className="font-medium">{venue.constituency}</span>
                  </div>
                )}
                {venue.pitchCount && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {venue.pitchCount} {venue.pitchCount === 1 ? 'Pitch' : 'Pitches'}
                    </Badge>
                  </div>
                )}
                {venue.facilities && venue.facilities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {venue.facilities.map((facility, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {facility}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Venue Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Venue</DialogTitle>
            <DialogDescription>
              Create a new venue for your tournament matches
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="venue-name">Venue Name *</Label>
              <Input
                id="venue-name"
                placeholder="e.g., Nairobi City Stadium"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="venue-location">Location *</Label>
              <Input
                id="venue-location"
                placeholder="e.g., Nairobi CBD"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="venue-county">County</Label>
              <Select 
                value={formData.countyId} 
                onValueChange={(value) => setFormData({ ...formData, countyId: value, subCountyId: '', wardId: '' })}
              >
                <SelectTrigger id="venue-county">
                  <SelectValue placeholder="Select county..." />
                </SelectTrigger>
                <SelectContent>
                  {counties.map((county) => (
                    <SelectItem key={county.id} value={county.id}>
                      {county.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formData.countyId && (
              <div>
                <Label htmlFor="venue-subcounty">Sub-County</Label>
                <Select 
                  value={formData.subCountyId} 
                  onValueChange={(value) => setFormData({ ...formData, subCountyId: value, wardId: '' })}
                >
                  <SelectTrigger id="venue-subcounty">
                    <SelectValue placeholder="Select sub-county..." />
                  </SelectTrigger>
                  <SelectContent>
                    {subCounties.map((subCounty) => (
                      <SelectItem key={subCounty.id} value={subCounty.id}>
                        {subCounty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {formData.subCountyId && (
              <div>
                <Label htmlFor="venue-ward">Ward</Label>
                <Select 
                  value={formData.wardId} 
                  onValueChange={(value) => setFormData({ ...formData, wardId: value })}
                >
                  <SelectTrigger id="venue-ward">
                    <SelectValue placeholder="Select ward..." />
                  </SelectTrigger>
                  <SelectContent>
                    {wards.map((ward) => (
                      <SelectItem key={ward.id} value={ward.id}>
                        {ward.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor="venue-constituency">Constituency (Optional)</Label>
              <Input
                id="venue-constituency"
                placeholder="e.g., Starehe"
                value={formData.constituency}
                onChange={(e) => setFormData({ ...formData, constituency: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="venue-pitches">Number of Pitches</Label>
              <Input
                id="venue-pitches"
                type="number"
                min="1"
                value={formData.pitchCount}
                onChange={(e) => setFormData({ ...formData, pitchCount: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsCreateDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!formData.name || !formData.location}
            >
              Create Venue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Venue Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Venue</DialogTitle>
            <DialogDescription>
              Update venue information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-venue-name">Venue Name *</Label>
              <Input
                id="edit-venue-name"
                placeholder="e.g., Nairobi City Stadium"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-venue-location">Location *</Label>
              <Input
                id="edit-venue-location"
                placeholder="e.g., Nairobi CBD"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-venue-county">County</Label>
              <Select 
                value={formData.countyId} 
                onValueChange={(value) => setFormData({ ...formData, countyId: value, subCountyId: '', wardId: '' })}
              >
                <SelectTrigger id="edit-venue-county">
                  <SelectValue placeholder="Select county..." />
                </SelectTrigger>
                <SelectContent>
                  {counties.map((county) => (
                    <SelectItem key={county.id} value={county.id}>
                      {county.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formData.countyId && (
              <div>
                <Label htmlFor="edit-venue-subcounty">Sub-County</Label>
                <Select 
                  value={formData.subCountyId} 
                  onValueChange={(value) => setFormData({ ...formData, subCountyId: value, wardId: '' })}
                >
                  <SelectTrigger id="edit-venue-subcounty">
                    <SelectValue placeholder="Select sub-county..." />
                  </SelectTrigger>
                  <SelectContent>
                    {subCounties.map((subCounty) => (
                      <SelectItem key={subCounty.id} value={subCounty.id}>
                        {subCounty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {formData.subCountyId && (
              <div>
                <Label htmlFor="edit-venue-ward">Ward</Label>
                <Select 
                  value={formData.wardId} 
                  onValueChange={(value) => setFormData({ ...formData, wardId: value })}
                >
                  <SelectTrigger id="edit-venue-ward">
                    <SelectValue placeholder="Select ward..." />
                  </SelectTrigger>
                  <SelectContent>
                    {wards.map((ward) => (
                      <SelectItem key={ward.id} value={ward.id}>
                        {ward.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor="edit-venue-constituency">Constituency (Optional)</Label>
              <Input
                id="edit-venue-constituency"
                placeholder="e.g., Starehe"
                value={formData.constituency}
                onChange={(e) => setFormData({ ...formData, constituency: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-venue-pitches">Number of Pitches</Label>
              <Input
                id="edit-venue-pitches"
                type="number"
                min="1"
                value={formData.pitchCount}
                onChange={(e) => setFormData({ ...formData, pitchCount: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); setSelectedVenue(null); resetForm(); }}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={!formData.name || !formData.location}
            >
              Update Venue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VenueManager;
