import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function NewsMedia() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">News & Media</h1>
        <p className="text-muted-foreground">
          Latest updates, match reports, and media resources
        </p>
      </div>

      {/* Categories */}
      <section className="mb-8">
        <div className="flex flex-wrap gap-2">
          <Badge variant="default" className="cursor-pointer">All News</Badge>
          <Badge variant="outline" className="cursor-pointer">Match Reports</Badge>
          <Badge variant="outline" className="cursor-pointer">Player Features</Badge>
          <Badge variant="outline" className="cursor-pointer">Announcements</Badge>
          <Badge variant="outline" className="cursor-pointer">Galleries</Badge>
          <Badge variant="outline" className="cursor-pointer">Press Releases</Badge>
        </div>
      </section>

      {/* Featured Story */}
      <section className="mb-12">
        <Card className="overflow-hidden border-primary bg-primary/5">
          <div className="md:flex">
            <div className="md:w-1/2 h-64 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Featured Story</h3>
                <p className="text-blue-100">Championship Final Preview</p>
              </div>
            </div>
            <div className="md:w-1/2 p-6">
              <Badge variant="default" className="mb-3">Featured</Badge>
              <h2 className="text-2xl font-bold mb-3">
                Governor's Cup Final: A Battle for Glory
              </h2>
              <p className="text-muted-foreground mb-4">
                Nairobi FC and Kiambu United are set to clash in what promises to be 
                an electrifying final at Kasarani Stadium. Both teams have shown 
                exceptional form throughout the tournament, setting up a perfect 
                showdown for the championship title.
              </p>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">By Sports Desk • 2 hours ago</span>
                <button className="text-primary hover:underline">Read More →</button>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Latest News */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Latest News</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Badge variant="secondary" className="w-fit mb-2">Match Report</Badge>
              <CardTitle className="text-lg leading-tight">
                Thrilling Semi-Final Sees Late Drama
              </CardTitle>
              <CardDescription>
                A 94th-minute winner secured Nairobi FC's place in the final
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-3">
                The Kasarani Stadium witnessed incredible scenes as David Ochieng's 
                last-gasp header sent Nairobi FC through to the Governor's Cup final...
              </div>
              <div className="flex justify-between items-center text-xs">
                <span>By John Kamau • 6 hours ago</span>
                <span className="text-primary">3 min read</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Badge variant="outline" className="w-fit mb-2 border-green-200 text-green-700">Player Feature</Badge>
              <CardTitle className="text-lg leading-tight">
                Rising Star: Sarah Wanjiku's Journey
              </CardTitle>
              <CardDescription>
                From school football to leading scorer in women's league
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-3">
                At just 19 years old, Sarah Wanjiku has taken the women's premier 
                league by storm with her exceptional goal-scoring ability...
              </div>
              <div className="flex justify-between items-center text-xs">
                <span>By Mary Njeri • 1 day ago</span>
                <span className="text-primary">5 min read</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Badge variant="outline" className="w-fit mb-2 border-blue-200 text-blue-700">Announcement</Badge>
              <CardTitle className="text-lg leading-tight">
                New Youth Development Program Launched
              </CardTitle>
              <CardDescription>
                Initiative to identify and nurture young talent across Kenya
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-3">
                The Kenya Football Association announces a comprehensive youth 
                development program targeting players aged 13-17...
              </div>
              <div className="flex justify-between items-center text-xs">
                <span>By Official Communications • 2 days ago</span>
                <span className="text-primary">4 min read</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Badge variant="outline" className="w-fit mb-2 border-purple-200 text-purple-700">Gallery</Badge>
              <CardTitle className="text-lg leading-tight">
                Best Photos from Weekend Matches
              </CardTitle>
              <CardDescription>
                Capturing the emotion and action from across the country
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-3">
                Our photographers were positioned at venues across Kenya to capture 
                the best moments from this weekend's crucial fixtures...
              </div>
              <div className="flex justify-between items-center text-xs">
                <span>Photo Gallery • 3 days ago</span>
                <span className="text-primary">24 photos</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Badge variant="outline" className="w-fit mb-2 border-red-200 text-red-700">Press Release</Badge>
              <CardTitle className="text-lg leading-tight">
                Disciplinary Committee Decisions
              </CardTitle>
              <CardDescription>
                Official sanctions following weekend incidents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-3">
                The Disciplinary Committee has reviewed incidents from recent matches 
                and issued the following sanctions and warnings...
              </div>
              <div className="flex justify-between items-center text-xs">
                <span>Official Statement • 4 days ago</span>
                <span className="text-primary">2 min read</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Badge variant="secondary" className="w-fit mb-2">Match Report</Badge>
              <CardTitle className="text-lg leading-tight">
                Women's League Sets New Attendance Record
              </CardTitle>
              <CardDescription>
                Over 8,000 fans witness thrilling championship decider
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-3">
                The Nakuru Athletic Club was packed to capacity as fans turned out 
                in record numbers to support their teams in the title race...
              </div>
              <div className="flex justify-between items-center text-xs">
                <span>By Peter Mwangi • 5 days ago</span>
                <span className="text-primary">3 min read</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Media Resources */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Media Resources</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Press Kit</CardTitle>
              <CardDescription>
                Official logos, team photos, and media assets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Tournament Logos</div>
                    <div className="text-xs text-muted-foreground">High-resolution PNG & SVG formats</div>
                  </div>
                  <button className="text-primary text-sm hover:underline">Download</button>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Team Photos</div>
                    <div className="text-xs text-muted-foreground">Official team portraits and action shots</div>
                  </div>
                  <button className="text-primary text-sm hover:underline">Download</button>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Venue Images</div>
                    <div className="text-xs text-muted-foreground">Stadium photos and facility shots</div>
                  </div>
                  <button className="text-primary text-sm hover:underline">Download</button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media Contacts</CardTitle>
              <CardDescription>
                Get in touch with our communications team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Press Inquiries</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>📧 press@jamiitourney.co.ke</div>
                    <div>📱 +254 700 123 456</div>
                    <div>🕘 Mon-Fri, 9:00 AM - 6:00 PM EAT</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Media Accreditation</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>📧 accreditation@jamiitourney.co.ke</div>
                    <div>Apply 48 hours before match day</div>
                  </div>
                </div>
                
                <button className="w-full bg-primary text-primary-foreground py-2 rounded-lg text-sm">
                  Request Media Pass
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="bg-gray-50 rounded-lg p-6">
        <div className="max-w-md mx-auto text-center">
          <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Subscribe to our newsletter for the latest news and match updates
          </p>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="Enter your email"
              className="flex-1 px-3 py-2 border rounded-lg text-sm"
            />
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm">
              Subscribe
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </section>
    </div>
  );
}