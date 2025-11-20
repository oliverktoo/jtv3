import React, { useState } from 'react';
import GeographicSelector from '../components/GeographicSelector';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { MapPin, Users, Trophy, Building } from 'lucide-react';

interface Location {
  countyId?: string;
  subCountyId?: string;
  wardId?: string;
  county?: string;
  subCounty?: string;
  ward?: string;
}

export default function GeographyDemo() {
  const [selectedLocation, setSelectedLocation] = useState<Location>({});
  const [tournamentLevel, setTournamentLevel] = useState<'ward' | 'sub-county' | 'county' | 'national'>('ward');

  const handleLocationChange = (location: Location) => {
    setSelectedLocation(location);
    console.log('Location selected:', location);
  };

  const getTournamentDescription = () => {
    switch (tournamentLevel) {
      case 'ward':
        return 'Teams compete within their ward boundaries. Perfect for grassroots community tournaments.';
      case 'sub-county':
        return 'Teams from multiple wards within a constituency compete. Regional championship level.';
      case 'county':
        return 'County-wide tournament with teams from all constituencies. High-level competitive tournament.';
      case 'national':
        return 'National tournament with teams from across Kenya. Premier championship level.';
    }
  };

  const getEligibilityInfo = () => {
    if (!selectedLocation.county) return null;

    const locations = [];
    if (selectedLocation.ward && tournamentLevel === 'ward') {
      locations.push(`${selectedLocation.ward} Ward`);
    }
    if (selectedLocation.subCounty && (tournamentLevel === 'sub-county' || tournamentLevel === 'ward')) {
      locations.push(`${selectedLocation.subCounty} Constituency`);
    }
    if (selectedLocation.county) {
      locations.push(`${selectedLocation.county} County`);
    }

    return locations;
  };

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <MapPin className="w-8 h-8 text-primary" />
          Kenya Geographic Integration
        </h1>
        <p className="text-muted-foreground mt-2">
          Complete administrative hierarchy: 47 Counties → 290 Constituencies → 1,450 Wards
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Geographic Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Location Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GeographicSelector
              onLocationChange={handleLocationChange}
              value={selectedLocation}
              level="ward"
              required
            />
          </CardContent>
        </Card>

        {/* Tournament Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Tournament Level
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {(['ward', 'sub-county', 'county', 'national'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setTournamentLevel(level)}
                  className={`p-3 text-left rounded-lg border transition-colors ${
                    tournamentLevel === level
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-medium capitalize">{level.replace('-', ' ')}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {level === 'ward' && 'Grassroots'}
                    {level === 'sub-county' && 'Regional'}
                    {level === 'county' && 'County-wide'}
                    {level === 'national' && 'National'}
                  </div>
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {getTournamentDescription()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Eligibility Information */}
      {selectedLocation.county && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Tournament Eligibility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Selected Location</h4>
                <div className="space-y-2">
                  {selectedLocation.ward && (
                    <Badge variant="outline" className="block w-fit">
                      📍 {selectedLocation.ward} Ward
                    </Badge>
                  )}
                  {selectedLocation.subCounty && (
                    <Badge variant="outline" className="block w-fit">
                      🏛️ {selectedLocation.subCounty} Constituency
                    </Badge>
                  )}
                  <Badge variant="outline" className="block w-fit">
                    🌍 {selectedLocation.county} County
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Player Eligibility Rules</h4>
                <div className="text-sm space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Players registered in {getEligibilityInfo()?.join(', ')}</span>
                  </div>
                  {tournamentLevel !== 'national' && (
                    <div className="flex items-start gap-2">
                      <span className="text-red-600">✗</span>
                      <span>Players from outside the {tournamentLevel.replace('-', ' ')} boundary</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600">ℹ</span>
                    <span>All players must have valid ID documents linking to their ward</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">🏆 Tournament Models</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Administrative (Ward → Sub-County → County → National)</li>
                <li>• Inter-County competitions</li>
                <li>• Geographic eligibility validation</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">👤 Player Registration</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Ward-based registration</li>
                <li>• ID document verification</li>
                <li>• Eligibility engine validation</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">📊 Team Management</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Geographic team categorization</li>
                <li>• Home venue assignment</li>
                <li>• Regional statistics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}