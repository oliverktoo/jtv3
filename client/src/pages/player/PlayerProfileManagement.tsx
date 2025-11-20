import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PlayerProfile {
  id: string;
  personalInfo: {
    fullName: string;
    dateOfBirth: string;
    nationality: string;
    placeOfBirth: string;
    height: string;
    weight: string;
    preferredFoot: 'Left' | 'Right' | 'Both';
  };
  contactInfo: {
    email: string;
    phone: string;
    address: string;
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
  footballInfo: {
    position: string;
    shirtNumber: number;
    joinedDate: string;
    contractUntil: string;
    previousClubs: string[];
    achievements: string[];
  };
}

interface Document {
  id: string;
  type: 'ID Card' | 'Birth Certificate' | 'Passport' | 'Medical Certificate' | 'Contract' | 'Photo';
  name: string;
  uploadDate: string;
  status: 'Verified' | 'Pending' | 'Rejected' | 'Expired';
  expiryDate?: string;
  size: string;
}

interface SocialMedia {
  id: string;
  platform: string;
  username: string;
  followers: number;
  visibility: 'Public' | 'Team Only' | 'Private';
}

export default function PlayerProfileManagement() {
  const playerProfile: PlayerProfile = {
    id: '1',
    personalInfo: {
      fullName: 'Samuel Ochieng Mwangi',
      dateOfBirth: '2001-03-15',
      nationality: 'Kenyan',
      placeOfBirth: 'Nairobi, Kenya',
      height: '180 cm',
      weight: '75 kg',
      preferredFoot: 'Right'
    },
    contactInfo: {
      email: 'samuel.ochieng@email.com',
      phone: '+254701234567',
      address: '123 Kasarani Road, Nairobi, Kenya',
      emergencyContact: {
        name: 'Grace Mwangi',
        relationship: 'Mother',
        phone: '+254701234568'
      }
    },
    footballInfo: {
      position: 'Striker',
      shirtNumber: 9,
      joinedDate: '2023-01-15',
      contractUntil: '2026-12-31',
      previousClubs: ['Nairobi Youth FC', 'Kasarani Academy'],
      achievements: ['Top Scorer 2023', 'Player of the Month (March 2024)', 'Governor\'s Cup Winner']
    }
  };

  const documents: Document[] = [
    { id: '1', type: 'ID Card', name: 'National_ID_Copy.pdf', uploadDate: '2024-01-15', status: 'Verified', size: '2.1 MB' },
    { id: '2', type: 'Birth Certificate', name: 'Birth_Certificate.pdf', uploadDate: '2024-01-15', status: 'Verified', size: '1.8 MB' },
    { id: '3', type: 'Medical Certificate', name: 'Medical_Clearance_2024.pdf', uploadDate: '2024-11-01', status: 'Verified', expiryDate: '2025-11-01', size: '950 KB' },
    { id: '4', type: 'Passport', name: 'Passport_Copy.pdf', uploadDate: '2024-02-10', status: 'Pending', expiryDate: '2029-02-10', size: '3.2 MB' },
    { id: '5', type: 'Photo', name: 'Player_Photo_2024.jpg', uploadDate: '2024-01-20', status: 'Verified', size: '445 KB' }
  ];

  const socialMedia: SocialMedia[] = [
    { id: '1', platform: 'Instagram', username: '@samuel_ochieng9', followers: 15200, visibility: 'Public' },
    { id: '2', platform: 'Twitter/X', username: '@SamuelO_9', followers: 8500, visibility: 'Public' },
    { id: '3', platform: 'Facebook', username: 'Samuel Ochieng', followers: 3200, visibility: 'Team Only' },
    { id: '4', platform: 'TikTok', username: '@samgoals9', followers: 22100, visibility: 'Public' }
  ];

  const getDocumentStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'Verified': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVisibilityColor = (visibility: SocialMedia['visibility']) => {
    switch (visibility) {
      case 'Public': return 'bg-green-100 text-green-800';
      case 'Team Only': return 'bg-yellow-100 text-yellow-800';
      case 'Private': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold">
            {playerProfile.footballInfo.shirtNumber}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{playerProfile.personalInfo.fullName}</h1>
            <p className="text-muted-foreground">{playerProfile.footballInfo.position} • Nairobi FC</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">📄 Export Profile</Button>
          <Button>✏️ Edit Profile</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={playerProfile.personalInfo.fullName}
                      className="w-full p-2 border rounded text-sm"
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Date of Birth</label>
                    <input 
                      type="date" 
                      value={playerProfile.personalInfo.dateOfBirth}
                      className="w-full p-2 border rounded text-sm"
                      readOnly
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      Age: {calculateAge(playerProfile.personalInfo.dateOfBirth)} years
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Nationality</label>
                    <input 
                      type="text" 
                      value={playerProfile.personalInfo.nationality}
                      className="w-full p-2 border rounded text-sm"
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Place of Birth</label>
                    <input 
                      type="text" 
                      value={playerProfile.personalInfo.placeOfBirth}
                      className="w-full p-2 border rounded text-sm"
                      readOnly
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Height</label>
                    <input 
                      type="text" 
                      value={playerProfile.personalInfo.height}
                      className="w-full p-2 border rounded text-sm"
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Weight</label>
                    <input 
                      type="text" 
                      value={playerProfile.personalInfo.weight}
                      className="w-full p-2 border rounded text-sm"
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Preferred Foot</label>
                    <select 
                      value={playerProfile.personalInfo.preferredFoot}
                      className="w-full p-2 border rounded text-sm"
                      disabled
                    >
                      <option value="Right">Right</option>
                      <option value="Left">Left</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
                    <input 
                      type="email" 
                      value={playerProfile.contactInfo.email}
                      className="w-full p-2 border rounded text-sm"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      value={playerProfile.contactInfo.phone}
                      className="w-full p-2 border rounded text-sm"
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Address</label>
                    <textarea 
                      value={playerProfile.contactInfo.address}
                      className="w-full p-2 border rounded text-sm h-20"
                      readOnly
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">Emergency Contact</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Name</label>
                    <input 
                      type="text" 
                      value={playerProfile.contactInfo.emergencyContact.name}
                      className="w-full p-2 border rounded text-sm"
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Relationship</label>
                    <input 
                      type="text" 
                      value={playerProfile.contactInfo.emergencyContact.relationship}
                      className="w-full p-2 border rounded text-sm"
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Phone</label>
                    <input 
                      type="tel" 
                      value={playerProfile.contactInfo.emergencyContact.phone}
                      className="w-full p-2 border rounded text-sm"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Football Information */}
          <Card>
            <CardHeader>
              <CardTitle>Football Career</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Playing Position</label>
                    <input 
                      type="text" 
                      value={playerProfile.footballInfo.position}
                      className="w-full p-2 border rounded text-sm"
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Shirt Number</label>
                    <input 
                      type="number" 
                      value={playerProfile.footballInfo.shirtNumber}
                      className="w-full p-2 border rounded text-sm"
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Joined Date</label>
                    <input 
                      type="date" 
                      value={playerProfile.footballInfo.joinedDate}
                      className="w-full p-2 border rounded text-sm"
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Contract Until</label>
                    <input 
                      type="date" 
                      value={playerProfile.footballInfo.contractUntil}
                      className="w-full p-2 border rounded text-sm"
                      readOnly
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Previous Clubs</label>
                    <div className="space-y-2">
                      {playerProfile.footballInfo.previousClubs.map((club, index) => (
                        <div key={index} className="p-2 bg-gray-50 border rounded text-sm">
                          {club}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Achievements</label>
                    <div className="space-y-2">
                      {playerProfile.footballInfo.achievements.map((achievement, index) => (
                        <div key={index} className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                          🏆 {achievement}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Documents</CardTitle>
                <Button variant="outline" size="sm">📁 Upload Document</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                        📄
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{doc.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {doc.type} • {doc.size} • Uploaded: {doc.uploadDate}
                          {doc.expiryDate && ` • Expires: ${doc.expiryDate}`}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getDocumentStatusColor(doc.status)} variant="secondary">
                        {doc.status}
                      </Badge>
                      <Button variant="outline" size="sm">👁️</Button>
                      <Button variant="outline" size="sm">⬇️</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Picture */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                  <div className="text-gray-400 text-4xl">👤</div>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">📷 Update Photo</Button>
                  <div className="text-xs text-muted-foreground">
                    JPG, PNG up to 5MB
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Age:</span>
                  <span className="font-bold">{calculateAge(playerProfile.personalInfo.dateOfBirth)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Years at Club:</span>
                  <span className="font-bold">2</span>
                </div>
                <div className="flex justify-between">
                  <span>Contract Expires:</span>
                  <span className="font-bold">Dec 2026</span>
                </div>
                <div className="flex justify-between">
                  <span>Documents:</span>
                  <span className="font-bold text-green-600">5/5 ✓</span>
                </div>
                <div className="flex justify-between">
                  <span>Profile Complete:</span>
                  <span className="font-bold text-green-600">100%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {socialMedia.map(social => (
                  <div key={social.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-semibold text-sm">{social.platform}</div>
                      <div className="text-xs text-muted-foreground">
                        {social.username} • {social.followers.toLocaleString()} followers
                      </div>
                    </div>
                    <Badge className={getVisibilityColor(social.visibility)} variant="secondary">
                      {social.visibility}
                    </Badge>
                  </div>
                ))}
              </div>
              
              <Button variant="outline" className="w-full mt-3">
                ➕ Add Platform
              </Button>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Profile Visibility</span>
                  <select className="p-1 border rounded text-sm">
                    <option>Public</option>
                    <option>Team Only</option>
                    <option>Private</option>
                  </select>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Statistics Sharing</span>
                  <input type="checkbox" defaultChecked />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Contact Information</span>
                  <input type="checkbox" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Performance Data</span>
                  <input type="checkbox" defaultChecked />
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
                📧 Update Email
              </Button>
              <Button variant="outline" className="w-full justify-start">
                🔒 Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📱 Update Phone
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📄 Export Data
              </Button>
              <Button variant="outline" className="w-full justify-start">
                ⚙️ Account Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}