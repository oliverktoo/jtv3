import React, { useState } from 'react';
import { useCounties, useSubCounties, useWards } from '../hooks/useReferenceData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Label } from './ui/label';
import { MapPin } from 'lucide-react';

interface GeographicSelectorProps {
  onLocationChange?: (location: {
    countyId?: string;
    subCountyId?: string;
    wardId?: string;
    county?: string;
    subCounty?: string;
    ward?: string;
  }) => void;
  value?: {
    countyId?: string;
    subCountyId?: string;
    wardId?: string;
  };
  level?: 'county' | 'sub-county' | 'ward';
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function GeographicSelector({
  onLocationChange,
  value = {},
  level = 'ward',
  required = false,
  disabled = false,
  className = ''
}: GeographicSelectorProps) {
  const [selectedCounty, setSelectedCounty] = useState(value.countyId || '');
  const [selectedSubCounty, setSelectedSubCounty] = useState(value.subCountyId || '');
  const [selectedWard, setSelectedWard] = useState(value.wardId || '');

  const { data: counties = [], isLoading: countiesLoading } = useCounties();
  const { data: subCounties = [], isLoading: subCountiesLoading } = useSubCounties(selectedCounty);
  const { data: wards = [], isLoading: wardsLoading } = useWards(selectedSubCounty);

  const handleCountyChange = (countyId: string) => {
    setSelectedCounty(countyId);
    setSelectedSubCounty('');
    setSelectedWard('');

    const county = counties.find(c => c.id === countyId);
    onLocationChange?.({
      countyId,
      county: county?.name,
      subCountyId: '',
      wardId: '',
      subCounty: '',
      ward: ''
    });
  };

  const handleSubCountyChange = (subCountyId: string) => {
    setSelectedSubCounty(subCountyId);
    setSelectedWard('');

    const county = counties.find(c => c.id === selectedCounty);
    const subCounty = subCounties.find(sc => sc.id === subCountyId);
    
    onLocationChange?.({
      countyId: selectedCounty,
      subCountyId,
      county: county?.name,
      subCounty: subCounty?.name,
      wardId: '',
      ward: ''
    });
  };

  const handleWardChange = (wardId: string) => {
    setSelectedWard(wardId);

    const county = counties.find(c => c.id === selectedCounty);
    const subCounty = subCounties.find(sc => sc.id === selectedSubCounty);
    const ward = wards.find(w => w.id === wardId);

    onLocationChange?.({
      countyId: selectedCounty,
      subCountyId: selectedSubCounty,
      wardId,
      county: county?.name,
      subCounty: subCounty?.name,
      ward: ward?.name
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Kenya Location</h3>
      </div>

      {/* County Selection */}
      <div>
        <Label htmlFor="county">
          County {required && <span className="text-red-500">*</span>}
        </Label>
        <Select 
          value={selectedCounty} 
          onValueChange={handleCountyChange}
          disabled={disabled || countiesLoading}
          required={required}
        >
          <SelectTrigger id="county">
            <SelectValue 
              placeholder={countiesLoading ? "Loading counties..." : "Select county"} 
            />
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

      {/* Sub-County Selection */}
      {(level === 'sub-county' || level === 'ward') && (
        <div>
          <Label htmlFor="sub-county">
            Constituency/Sub-County {required && <span className="text-red-500">*</span>}
          </Label>
          <Select
            value={selectedSubCounty}
            onValueChange={handleSubCountyChange}
            disabled={disabled || !selectedCounty || subCountiesLoading}
            required={required}
          >
            <SelectTrigger id="sub-county">
              <SelectValue
                placeholder={
                  !selectedCounty
                    ? "Select county first"
                    : subCountiesLoading
                    ? "Loading constituencies..."
                    : "Select constituency"
                }
              />
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

      {/* Ward Selection */}
      {level === 'ward' && (
        <div>
          <Label htmlFor="ward">
            Ward {required && <span className="text-red-500">*</span>}
          </Label>
          <Select
            value={selectedWard}
            onValueChange={handleWardChange}
            disabled={disabled || !selectedSubCounty || wardsLoading}
            required={required}
          >
            <SelectTrigger id="ward">
              <SelectValue
                placeholder={
                  !selectedSubCounty
                    ? "Select constituency first"
                    : wardsLoading
                    ? "Loading wards..."
                    : "Select ward"
                }
              />
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

      {/* Location Summary */}
      {(selectedCounty || selectedSubCounty || selectedWard) && (
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Selected Location:</p>
          <div className="text-sm">
            {selectedWard && wards.find(w => w.id === selectedWard)?.name && (
              <span className="font-medium">
                {wards.find(w => w.id === selectedWard)?.name} Ward
              </span>
            )}
            {selectedSubCounty && subCounties.find(sc => sc.id === selectedSubCounty)?.name && (
              <span>
                {selectedWard ? ', ' : ''}
                {subCounties.find(sc => sc.id === selectedSubCounty)?.name} Constituency
              </span>
            )}
            {selectedCounty && counties.find(c => c.id === selectedCounty)?.name && (
              <span>
                {(selectedWard || selectedSubCounty) ? ', ' : ''}
                {counties.find(c => c.id === selectedCounty)?.name} County
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}