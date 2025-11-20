import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MediaAsset {
  id: string;
  title: string;
  type: 'Photo' | 'Video' | 'Audio' | 'Document' | 'Graphic';
  category: 'Match Coverage' | 'Team Photos' | 'Player Portraits' | 'Training' | 'Events' | 'Marketing' | 'Press';
  fileSize: string;
  dimensions?: string;
  duration?: string;
  uploadDate: string;
  photographer?: string;
  tags: string[];
  usage: 'Public' | 'Internal' | 'Restricted' | 'Archive';
  downloadCount: number;
  thumbnail: string;
  status: 'Published' | 'Draft' | 'Under Review' | 'Archived';
}

interface PressRelease {
  id: string;
  title: string;
  summary: string;
  content: string;
  publishDate: string;
  author: string;
  category: 'Match Results' | 'Player News' | 'Club Updates' | 'Tournament Info' | 'Announcements';
  status: 'Published' | 'Scheduled' | 'Draft';
  views: number;
  downloads: number;
  mediaContacts: string[];
}

interface MediaContact {
  id: string;
  name: string;
  organization: string;
  role: string;
  email: string;
  phone: string;
  specialization: string[];
  preferredContact: 'Email' | 'Phone' | 'WhatsApp';
  lastContact: string;
  status: 'Active' | 'Inactive';
}

interface SocialMediaPost {
  id: string;
  platform: 'Facebook' | 'Twitter' | 'Instagram' | 'YouTube' | 'LinkedIn' | 'TikTok';
  content: string;
  mediaAttached: string[];
  scheduledTime: string;
  actualPostTime?: string;
  status: 'Scheduled' | 'Published' | 'Failed' | 'Draft';
  engagement: {
    likes: number;
    shares: number;
    comments: number;
    views: number;
  };
  hashtags: string[];
  mentions: string[];
}

export default function MediaCenter() {
  const mediaAssets: MediaAsset[] = [
    {
      id: '1',
      title: 'Championship Final Highlights',
      type: 'Video',
      category: 'Match Coverage',
      fileSize: '1.2 GB',
      duration: '15:30',
      uploadDate: '2024-11-28',
      photographer: 'John Kamau',
      tags: ['Championship', 'Final', 'Highlights', 'Goals', 'Celebration'],
      usage: 'Public',
      downloadCount: 156,
      thumbnail: '/thumbnails/championship-final.jpg',
      status: 'Published'
    },
    {
      id: '2',
      title: 'Team Photo Session 2024',
      type: 'Photo',
      category: 'Team Photos',
      fileSize: '45 MB',
      dimensions: '4032x3024',
      uploadDate: '2024-11-25',
      photographer: 'Mary Wanjiku',
      tags: ['Team', 'Official', '2024', 'Squad', 'Professional'],
      usage: 'Public',
      downloadCount: 89,
      thumbnail: '/thumbnails/team-photo-2024.jpg',
      status: 'Published'
    },
    {
      id: '3',
      title: 'Player Interview - Samuel Ochieng',
      type: 'Audio',
      category: 'Press',
      fileSize: '25 MB',
      duration: '18:45',
      uploadDate: '2024-11-22',
      tags: ['Interview', 'Player', 'Samuel', 'Post Match', 'Exclusive'],
      usage: 'Public',
      downloadCount: 34,
      thumbnail: '/thumbnails/audio-interview.jpg',
      status: 'Published'
    },
    {
      id: '4',
      title: 'Training Session Documentary',
      type: 'Video',
      category: 'Training',
      fileSize: '890 MB',
      duration: '25:12',
      uploadDate: '2024-11-20',
      photographer: 'David Njoroge',
      tags: ['Training', 'Documentary', 'Behind Scenes', 'Preparation'],
      usage: 'Internal',
      downloadCount: 12,
      thumbnail: '/thumbnails/training-doc.jpg',
      status: 'Under Review'
    },
    {
      id: '5',
      title: 'Club Logo Variations',
      type: 'Graphic',
      category: 'Marketing',
      fileSize: '15 MB',
      uploadDate: '2024-11-18',
      tags: ['Logo', 'Branding', 'Official', 'Variations', 'Vector'],
      usage: 'Restricted',
      downloadCount: 45,
      thumbnail: '/thumbnails/logo-variations.jpg',
      status: 'Published'
    }
  ];

  const pressReleases: PressRelease[] = [
    {
      id: '1',
      title: 'Nairobi FC Wins County Championship 2024',
      summary: 'Historic victory as Nairobi FC claims their third consecutive county championship title',
      content: 'In a thrilling final match that kept fans on the edge of their seats...',
      publishDate: '2024-11-28',
      author: 'Communications Team',
      category: 'Match Results',
      status: 'Published',
      views: 2847,
      downloads: 156,
      mediaContacts: ['press@nationalmedia.com', 'sports@standardmedia.co.ke']
    },
    {
      id: '2',
      title: 'New Youth Academy Program Launch',
      summary: 'Nairobi FC announces comprehensive youth development program for 2025',
      content: 'Building on our commitment to nurturing young talent...',
      publishDate: '2024-12-01',
      author: 'Youth Development Team',
      category: 'Club Updates',
      status: 'Scheduled',
      views: 0,
      downloads: 0,
      mediaContacts: ['sports@citizentv.co.ke', 'news@ktn.co.ke']
    },
    {
      id: '3',
      title: 'Player Transfer Update - December Window',
      summary: 'Official statement on player movements during the December transfer period',
      content: 'As we approach the December transfer window...',
      publishDate: '2024-11-25',
      author: 'Management Team',
      category: 'Player News',
      status: 'Published',
      views: 1523,
      downloads: 89,
      mediaContacts: ['sports@nationalmedia.com', 'football@standardmedia.co.ke']
    }
  ];

  const mediaContacts: MediaContact[] = [
    {
      id: '1',
      name: 'Jane Mutiso',
      organization: 'Nation Media Group',
      role: 'Sports Editor',
      email: 'j.mutiso@nationalmedia.com',
      phone: '+254 701 234 567',
      specialization: ['Football', 'Local Sports', 'Youth Development'],
      preferredContact: 'Email',
      lastContact: '2024-11-25',
      status: 'Active'
    },
    {
      id: '2',
      name: 'Peter Kiprotich',
      organization: 'Standard Media',
      role: 'Football Correspondent',
      email: 'p.kiprotich@standardmedia.co.ke',
      phone: '+254 702 345 678',
      specialization: ['Match Coverage', 'Player Interviews', 'Transfer News'],
      preferredContact: 'WhatsApp',
      lastContact: '2024-11-28',
      status: 'Active'
    },
    {
      id: '3',
      name: 'Grace Wanjiku',
      organization: 'Citizen TV',
      role: 'Sports Producer',
      email: 'g.wanjiku@citizentv.co.ke',
      phone: '+254 703 456 789',
      specialization: ['Live Coverage', 'Documentary', 'Youth Sports'],
      preferredContact: 'Phone',
      lastContact: '2024-11-20',
      status: 'Active'
    }
  ];

  const socialMediaPosts: SocialMediaPost[] = [
    {
      id: '1',
      platform: 'Instagram',
      content: '🏆 CHAMPIONS! What a journey! Thank you to all our amazing fans for your unwavering support throughout the championship! #NairobiFC #Champions2024 #ThankYouFans',
      mediaAttached: ['championship-celebration.jpg', 'trophy-lift.jpg'],
      scheduledTime: '2024-11-28T20:00:00',
      actualPostTime: '2024-11-28T20:02:00',
      status: 'Published',
      engagement: {
        likes: 3456,
        shares: 892,
        comments: 245,
        views: 15678
      },
      hashtags: ['#NairobiFC', '#Champions2024', '#ThankYouFans', '#CountyChamps'],
      mentions: ['@nairobicounty', '@footballkenya']
    },
    {
      id: '2',
      platform: 'Twitter',
      content: '⚽ Match day! Our boys are ready to give everything on the pitch today. Come out and support! #MatchDay #NairobiFC #Together',
      mediaAttached: ['team-warmup.jpg'],
      scheduledTime: '2024-12-01T14:00:00',
      status: 'Scheduled',
      engagement: {
        likes: 0,
        shares: 0,
        comments: 0,
        views: 0
      },
      hashtags: ['#MatchDay', '#NairobiFC', '#Together', '#Support'],
      mentions: ['@OfficialFKF']
    },
    {
      id: '3',
      platform: 'Facebook',
      content: 'Exciting news! Our youth academy program is expanding in 2025. We\'re looking for talented young players aged 10-18 to join our development program. Applications open December 5th!',
      mediaAttached: ['youth-academy-poster.jpg'],
      scheduledTime: '2024-12-01T10:00:00',
      status: 'Scheduled',
      engagement: {
        likes: 0,
        shares: 0,
        comments: 0,
        views: 0
      },
      hashtags: ['#YouthAcademy', '#NairobiFC', '#TalentDevelopment', '#Applications'],
      mentions: []
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published': return 'bg-green-100 text-green-800';
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'Draft': return 'bg-yellow-100 text-yellow-800';
      case 'Under Review': return 'bg-orange-100 text-orange-800';
      case 'Archived': return 'bg-gray-100 text-gray-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUsageColor = (usage: MediaAsset['usage']) => {
    switch (usage) {
      case 'Public': return 'bg-green-100 text-green-800';
      case 'Internal': return 'bg-blue-100 text-blue-800';
      case 'Restricted': return 'bg-red-100 text-red-800';
      case 'Archive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlatformIcon = (platform: SocialMediaPost['platform']) => {
    switch (platform) {
      case 'Facebook': return '📘';
      case 'Twitter': return '🐦';
      case 'Instagram': return '📷';
      case 'YouTube': return '📺';
      case 'LinkedIn': return '💼';
      case 'TikTok': return '🎵';
      default: return '📱';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Media Center</h1>
          <p className="text-muted-foreground">Comprehensive media asset and communications management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">📤 Upload Media</Button>
          <Button variant="outline">📝 New Press Release</Button>
          <Button>📊 Media Dashboard</Button>
        </div>
      </div>

      {/* Media Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{mediaAssets.length}</div>
            <div className="text-sm text-muted-foreground">Media Assets</div>
            <div className="text-xs text-blue-600 mt-1">Total library</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{pressReleases.filter(pr => pr.status === 'Published').length}</div>
            <div className="text-sm text-muted-foreground">Press Releases</div>
            <div className="text-xs text-green-600 mt-1">Published this month</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{mediaContacts.filter(mc => mc.status === 'Active').length}</div>
            <div className="text-sm text-muted-foreground">Active Contacts</div>
            <div className="text-xs text-purple-600 mt-1">Media partners</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{socialMediaPosts.filter(smp => smp.status === 'Scheduled').length}</div>
            <div className="text-sm text-muted-foreground">Scheduled Posts</div>
            <div className="text-xs text-orange-600 mt-1">Ready to publish</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Media Assets */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Media Assets</CardTitle>
                  <CardDescription>Photo, video, and media file management</CardDescription>
                </div>
                <Button variant="outline" size="sm">📁 Browse All</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mediaAssets.map(asset => (
                  <div key={asset.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                          {asset.type === 'Photo' && '🖼️'}
                          {asset.type === 'Video' && '🎥'}
                          {asset.type === 'Audio' && '🎵'}
                          {asset.type === 'Document' && '📄'}
                          {asset.type === 'Graphic' && '🎨'}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{asset.title}</div>
                          <div className="text-xs text-muted-foreground">{asset.category}</div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge className={getStatusColor(asset.status)} variant="secondary">
                          {asset.status}
                        </Badge>
                        <Badge className={getUsageColor(asset.usage)} variant="secondary">
                          {asset.usage}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground space-y-1 mb-3">
                      <div className="flex justify-between">
                        <span>Size:</span>
                        <span>{asset.fileSize}</span>
                      </div>
                      {asset.dimensions && (
                        <div className="flex justify-between">
                          <span>Dimensions:</span>
                          <span>{asset.dimensions}</span>
                        </div>
                      )}
                      {asset.duration && (
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span>{asset.duration}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Downloads:</span>
                        <span>{asset.downloadCount}</span>
                      </div>
                      {asset.photographer && (
                        <div className="flex justify-between">
                          <span>By:</span>
                          <span>{asset.photographer}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {asset.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {asset.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{asset.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">👁️</Button>
                      <Button variant="outline" size="sm">⬇️</Button>
                      <Button variant="outline" size="sm">✏️</Button>
                      <Button variant="outline" size="sm">🔗</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Press Releases */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Press Releases</CardTitle>
                  <CardDescription>Official club communications and announcements</CardDescription>
                </div>
                <Button variant="outline" size="sm">📝 New Release</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pressReleases.map(release => (
                  <div key={release.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{release.title}</h3>
                          <Badge className={getStatusColor(release.status)} variant="secondary">
                            {release.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{release.summary}</p>
                        <div className="text-xs text-muted-foreground">
                          {release.publishDate} • by {release.author} • {release.category}
                        </div>
                      </div>
                    </div>
                    
                    {release.status === 'Published' && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 p-3 bg-gray-50 rounded">
                        <div className="text-center">
                          <div className="font-bold text-sm">{release.views}</div>
                          <div className="text-xs text-muted-foreground">Views</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-sm">{release.downloads}</div>
                          <div className="text-xs text-muted-foreground">Downloads</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-sm">{release.mediaContacts.length}</div>
                          <div className="text-xs text-muted-foreground">Media Sent</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-sm text-green-600">Active</div>
                          <div className="text-xs text-muted-foreground">Status</div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">👁️ View</Button>
                      <Button variant="outline" size="sm">✏️ Edit</Button>
                      <Button variant="outline" size="sm">📤 Send</Button>
                      <Button variant="outline" size="sm">📊 Analytics</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Social Media Scheduler */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Social Media Scheduler</CardTitle>
                  <CardDescription>Manage and schedule social media content</CardDescription>
                </div>
                <Button variant="outline" size="sm">➕ New Post</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {socialMediaPosts.map(post => (
                  <div key={post.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{getPlatformIcon(post.platform)}</div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{post.platform}</Badge>
                            <Badge className={getStatusColor(post.status)} variant="secondary">
                              {post.status}
                            </Badge>
                          </div>
                          <div className="text-sm font-medium mb-1">
                            Scheduled: {new Date(post.scheduledTime).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-sm mb-3 p-3 bg-gray-50 rounded">
                      {post.content}
                    </div>
                    
                    {post.mediaAttached.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs text-muted-foreground mb-1">Attached Media:</div>
                        <div className="flex flex-wrap gap-1">
                          {post.mediaAttached.map((media, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              📎 {media}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {post.status === 'Published' && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 p-3 bg-blue-50 rounded">
                        <div className="text-center">
                          <div className="font-bold text-sm">{post.engagement.likes}</div>
                          <div className="text-xs text-muted-foreground">Likes</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-sm">{post.engagement.shares}</div>
                          <div className="text-xs text-muted-foreground">Shares</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-sm">{post.engagement.comments}</div>
                          <div className="text-xs text-muted-foreground">Comments</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-sm">{post.engagement.views}</div>
                          <div className="text-xs text-muted-foreground">Views</div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">✏️ Edit</Button>
                      {post.status === 'Scheduled' && (
                        <Button variant="outline" size="sm">📤 Post Now</Button>
                      )}
                      {post.status === 'Published' && (
                        <Button variant="outline" size="sm">📊 Analytics</Button>
                      )}
                      <Button variant="outline" size="sm">🗑️ Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Media Contacts */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Media Contacts</CardTitle>
                <Button variant="outline" size="sm">➕ Add</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mediaContacts.map(contact => (
                  <div key={contact.id} className="border rounded p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold text-sm">{contact.name}</div>
                        <div className="text-xs text-muted-foreground">{contact.role}</div>
                        <div className="text-xs text-muted-foreground">{contact.organization}</div>
                      </div>
                      <Badge className={contact.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} variant="secondary">
                        {contact.status}
                      </Badge>
                    </div>
                    
                    <div className="text-xs space-y-1 mb-2">
                      <div>📧 {contact.email}</div>
                      <div>📞 {contact.phone}</div>
                      <div>🏷️ {contact.specialization.join(', ')}</div>
                      <div>📅 Last: {contact.lastContact}</div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm">📧</Button>
                      <Button variant="outline" size="sm">📞</Button>
                      <Button variant="outline" size="sm">✏️</Button>
                    </div>
                  </div>
                ))}
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
                📤 Upload Media
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📝 Write Press Release
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📱 Schedule Social Post
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📞 Contact Media
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📊 Media Analytics
              </Button>
            </CardContent>
          </Card>

          {/* Media Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Media Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Storage Used</span>
                    <span className="text-sm font-semibold">2.8GB / 10GB</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '28%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Monthly Downloads</span>
                    <span className="text-sm font-semibold">1,247</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '82%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Social Engagement</span>
                    <span className="text-sm font-semibold">4.2K</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Press Coverage</span>
                    <span className="text-sm font-semibold">12 articles</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 border rounded">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-semibold">Media Uploaded</div>
                    <div className="text-xs text-muted-foreground">Championship highlights video</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 border rounded">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-semibold">Press Release Sent</div>
                    <div className="text-xs text-muted-foreground">Championship victory announcement</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 border rounded">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-semibold">Social Post Published</div>
                    <div className="text-xs text-muted-foreground">Instagram celebration post</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}