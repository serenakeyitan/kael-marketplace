'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Trophy,
  Medal,
  Award,
  Gift,
  Zap,
  Calendar,
  Users,
  ChevronRight,
  Clock,
  DollarSign,
  Target,
  Sparkles,
  Rocket,
  Brain,
  Code,
  Palette,
  TrendingUp,
  Star,
  ArrowRight,
  Coins,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface BountyTrack {
  id: string;
  title: string;
  description: string;
  icon: any;
  gradient: string;
  totalPrize: number;
  participants: number;
  submissions: number;
  deadline: Date;
  status: 'active' | 'upcoming' | 'ended';
  winners?: {
    rank: number;
    name: string;
    avatar: string;
    skillName: string;
    prize: number;
  }[];
  tags: string[];
}

export default function BountyPage() {
  const [selectedTrack, setSelectedTrack] = useState<BountyTrack | null>(null);
  const [bountyTracks, setBountyTracks] = useState<BountyTrack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBountyTracks();
  }, []);

  const fetchBountyTracks = () => {
    setLoading(true);
    // Mock bounty tracks data
    const mockTracks: BountyTrack[] = [
      {
        id: '1',
        title: 'AI Research Assistant',
        description: 'Build the most innovative AI-powered research tool that helps academics and students',
        icon: Brain,
        gradient: 'from-purple-400 to-pink-600',
        totalPrize: 5000,
        participants: 234,
        submissions: 89,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: 'active',
        tags: ['Research', 'AI', 'Academic'],
        winners: undefined
      },
      {
        id: '2',
        title: 'Code Generation Challenge',
        description: 'Create skills that generate high-quality code across multiple programming languages',
        icon: Code,
        gradient: 'from-blue-400 to-purple-600',
        totalPrize: 4000,
        participants: 189,
        submissions: 67,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'active',
        tags: ['Development', 'Automation', 'Code']
      },
      {
        id: '3',
        title: 'Creative Content Tools',
        description: 'Design skills for content creators, artists, and creative professionals',
        icon: Palette,
        gradient: 'from-pink-400 to-purple-600',
        totalPrize: 3500,
        participants: 156,
        submissions: 45,
        deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        status: 'active',
        tags: ['Creative', 'Content', 'Design']
      },
      {
        id: '4',
        title: 'Data Analysis Wizardry',
        description: 'Build powerful data analysis and visualization skills',
        icon: TrendingUp,
        gradient: 'from-green-400 to-blue-600',
        totalPrize: 4500,
        participants: 298,
        submissions: 112,
        deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Ended 2 days ago
        status: 'ended',
        tags: ['Data', 'Analytics', 'Visualization'],
        winners: [
          {
            rank: 1,
            name: 'DataLab Team',
            avatar: '',
            skillName: 'Advanced Data Pipeline',
            prize: 2000
          },
          {
            rank: 2,
            name: 'Analytics Pro',
            avatar: '',
            skillName: 'Real-time Dashboard',
            prize: 1500
          },
          {
            rank: 3,
            name: 'VizMaster',
            avatar: '',
            skillName: 'Interactive Charts',
            prize: 1000
          }
        ]
      },
      {
        id: '5',
        title: 'Education Innovation',
        description: 'Create next-generation educational tools and learning assistants',
        icon: Sparkles,
        gradient: 'from-orange-400 to-red-600',
        totalPrize: 6000,
        participants: 0,
        submissions: 0,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'upcoming',
        tags: ['Education', 'Learning', 'Students']
      }
    ];

    setBountyTracks(mockTracks);
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-700">Upcoming</Badge>;
      case 'ended':
        return <Badge className="bg-gray-100 text-gray-700">Ended</Badge>;
      default:
        return null;
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-orange-600" />;
      default:
        return null;
    }
  };

  if (selectedTrack) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => setSelectedTrack(null)}
            className="mb-6"
          >
            <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
            Back to Bounties
          </Button>

          {/* Track Hero */}
          <div className={cn(
            "relative overflow-hidden rounded-2xl p-8 text-white mb-8",
            "bg-gradient-to-br",
            selectedTrack.gradient
          )}>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                {React.createElement(selectedTrack.icon, { className: "h-12 w-12" })}
                <div>
                  <h1 className="text-3xl font-bold">{selectedTrack.title}</h1>
                  <p className="text-white/90">{selectedTrack.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                <div>
                  <p className="text-white/70 text-sm">Total Prize Pool</p>
                  <p className="text-2xl font-bold">${selectedTrack.totalPrize}</p>
                </div>
                <div>
                  <p className="text-white/70 text-sm">Participants</p>
                  <p className="text-2xl font-bold">{selectedTrack.participants}</p>
                </div>
                <div>
                  <p className="text-white/70 text-sm">Submissions</p>
                  <p className="text-2xl font-bold">{selectedTrack.submissions}</p>
                </div>
                <div>
                  <p className="text-white/70 text-sm">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedTrack.status)}</div>
                </div>
              </div>
            </div>

            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
              }} />
            </div>
          </div>

          {/* Track Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Winners/Leaderboard */}
              {selectedTrack.status === 'ended' && selectedTrack.winners ? (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Winners</CardTitle>
                    <CardDescription>Top submissions for this bounty track</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedTrack.winners.map((winner) => (
                        <div key={winner.rank} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-4">
                            {getRankIcon(winner.rank)}
                            <Avatar>
                              <AvatarImage src={winner.avatar} />
                              <AvatarFallback>{winner.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{winner.name}</p>
                              <p className="text-sm text-muted-foreground">{winner.skillName}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">${winner.prize}</p>
                            <p className="text-sm text-muted-foreground">Prize</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>How to Participate</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        1
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Create Your Skill</h4>
                        <p className="text-sm text-muted-foreground">
                          Build a skill that fits the track requirements and showcases innovation
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        2
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Submit Your Entry</h4>
                        <p className="text-sm text-muted-foreground">
                          Click "Create Skill for This Bounty" to submit your entry with bounty participation
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        3
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Get Evaluated</h4>
                        <p className="text-sm text-muted-foreground">
                          Our judges will review submissions based on creativity, utility, and quality
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Submissions */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Submissions</CardTitle>
                  <CardDescription>Latest skills submitted to this track</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { id: 1, name: 'Essay Assistant', slug: 'essay-assistant', author: 'John D.' },
                      { id: 2, name: 'SQL Optimizer', slug: 'sql-optimizer', author: 'Sarah M.' },
                      { id: 3, name: 'Literature Review', slug: 'literature-review', author: 'Mike L.' },
                      { id: 4, name: 'Data Analysis', slug: 'data-analysis', author: 'Emma K.' },
                      { id: 5, name: 'Creative Writing', slug: 'creative-writing', author: 'Alex P.' }
                    ].map((submission) => (
                      <Link
                        key={submission.id}
                        href={`/skills/${submission.slug}`}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{submission.author.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium group-hover:text-primary transition-colors">
                              {submission.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              by {submission.author} • Submitted {submission.id} hours ago
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Rules */}
              <Card>
                <CardHeader>
                  <CardTitle>Track Rules</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <p className="text-sm">Must be original work</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <p className="text-sm">Follow Kael skill guidelines</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <p className="text-sm">Include documentation</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <p className="text-sm">Respect intellectual property</p>
                  </div>
                </CardContent>
              </Card>

              {/* Deadline */}
              <Card>
                <CardHeader>
                  <CardTitle>Deadline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-lg font-medium">
                    <Clock className="h-5 w-5" />
                    {selectedTrack.status === 'ended' ? (
                      <span className="text-muted-foreground">Ended</span>
                    ) : (
                      <span>
                        {formatDistanceToNow(selectedTrack.deadline, { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              {selectedTrack.status === 'active' && (
                <Link href={`/create?bountyId=${selectedTrack.id}&bountyName=${encodeURIComponent(selectedTrack.title)}`}>
                  <Button className="w-full" size="lg">
                    <Rocket className="h-5 w-5 mr-2" />
                    Create Skill for This Bounty
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Section */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative px-4 lg:px-6 xl:px-8 py-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-white/20 backdrop-blur rounded-full">
              <Gift className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Skill Bounties</h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Compete in hackathon-style challenges, build innovative skills, and win prizes
          </p>
        </div>
        {/* Decorative wave - responsive */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none">
          <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="relative block w-full h-12">
            <path fill="rgb(249 250 251)" fillOpacity="1" d="M0,30 C400,60 800,0 1200,30 L1200,60 L0,60 Z"></path>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 lg:px-6 xl:px-8 py-8 max-w-7xl mx-auto">
        {/* Total Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">$22,500</p>
                <p className="text-sm text-muted-foreground">Total Prize Pool</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">5</p>
                <p className="text-sm text-muted-foreground">Active Tracks</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">877</p>
                <p className="text-sm text-muted-foreground">Participants</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Zap className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">313</p>
                <p className="text-sm text-muted-foreground">Submissions</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="ended">Ended</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bountyTracks
                .filter(track => track.status === 'active')
                .map(track => (
                  <Card
                    key={track.id}
                    className="cursor-pointer hover:shadow-xl transition-all"
                    onClick={() => setSelectedTrack(track)}
                  >
                    <div className={cn(
                      "h-32 rounded-t-lg bg-gradient-to-br flex items-center justify-center",
                      track.gradient
                    )}>
                      {React.createElement(track.icon, { className: "h-12 w-12 text-white" })}
                    </div>
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-xl">{track.title}</CardTitle>
                        {getStatusBadge(track.status)}
                      </div>
                      <CardDescription className="line-clamp-2">
                        {track.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Prize Pool</p>
                          <p className="font-bold text-lg">${track.totalPrize}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Deadline</p>
                          <p className="font-medium text-sm">
                            {formatDistanceToNow(track.deadline, { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {track.participants} participants
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="h-4 w-4" />
                          {track.submissions} submissions
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {track.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        className="w-full mt-4"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Navigate to selected track to see details
                          setSelectedTrack(track);
                        }}
                      >
                        View Details & Submit
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="upcoming" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bountyTracks
                .filter(track => track.status === 'upcoming')
                .map(track => (
                  <Card
                    key={track.id}
                    className="cursor-pointer hover:shadow-xl transition-all opacity-75"
                    onClick={() => setSelectedTrack(track)}
                  >
                    <div className={cn(
                      "h-32 rounded-t-lg bg-gradient-to-br flex items-center justify-center",
                      track.gradient
                    )}>
                      {React.createElement(track.icon, { className: "h-12 w-12 text-white" })}
                    </div>
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-xl">{track.title}</CardTitle>
                        {getStatusBadge(track.status)}
                      </div>
                      <CardDescription className="line-clamp-2">
                        {track.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Prize Pool</p>
                          <p className="font-bold text-lg">${track.totalPrize}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Starts in</p>
                          <p className="font-medium text-sm">
                            {formatDistanceToNow(track.deadline, { addSuffix: false })}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full" disabled>
                        Coming Soon
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="ended" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bountyTracks
                .filter(track => track.status === 'ended')
                .map(track => (
                  <Card
                    key={track.id}
                    className="cursor-pointer hover:shadow-xl transition-all"
                    onClick={() => setSelectedTrack(track)}
                  >
                    <div className={cn(
                      "h-32 rounded-t-lg bg-gradient-to-br flex items-center justify-center relative",
                      track.gradient
                    )}>
                      {React.createElement(track.icon, { className: "h-12 w-12 text-white" })}
                      <div className="absolute top-2 right-2">
                        <Trophy className="h-6 w-6 text-yellow-400" />
                      </div>
                    </div>
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-xl">{track.title}</CardTitle>
                        {getStatusBadge(track.status)}
                      </div>
                      <CardDescription className="line-clamp-2">
                        {track.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {track.winners && track.winners.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium mb-2">Winners</p>
                          <div className="space-y-2">
                            {track.winners.slice(0, 3).map(winner => (
                              <div key={winner.rank} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  {getRankIcon(winner.rank)}
                                  <span>{winner.name}</span>
                                </div>
                                <span className="font-medium">${winner.prize}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <Button variant="outline" className="w-full">
                        View Results
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
