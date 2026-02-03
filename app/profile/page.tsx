'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import SkillCardNew from '@/components/SkillCardNew';
import {
  User,
  Settings,
  Trophy,
  Zap,
  Star,
  Package,
  Code,
  Calendar,
  TrendingUp,
  Heart,
  MessageCircle,
  Share2,
  Edit,
  Award,
  Target,
  Activity,
  Clock,
  CheckCircle,
  ExternalLink,
  Plus,
  MoreHorizontal,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface UserStats {
  skillsCreated: number;
  skillsInstalled: number;
  totalUsage: number;
  totalInstalls: number;
  averageRating: number;
  achievements: {
    id: string;
    title: string;
    description: string;
    icon: any;
    unlocked: boolean;
    progress?: number;
  }[];
}

interface ActivityItem {
  id: string;
  type: 'created' | 'installed' | 'reviewed' | 'achievement';
  title: string;
  description: string;
  timestamp: Date;
  icon: any;
}

export default function ProfilePage() {
  const { user, isCreator } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [userStats, setUserStats] = useState<UserStats>({
    skillsCreated: 5,
    skillsInstalled: 23,
    totalUsage: 45230,
    totalInstalls: 12500,
    averageRating: 4.7,
    achievements: []
  });
  const [createdSkills, setCreatedSkills] = useState<any[]>([]);
  const [installedSkills, setInstalledSkills] = useState<any[]>([]);
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);

    // Mock data
    setUserStats({
      skillsCreated: 5,
      skillsInstalled: 23,
      totalUsage: 45230,
      totalInstalls: 12500,
      averageRating: 4.7,
      achievements: [
        {
          id: '1',
          title: 'Early Adopter',
          description: 'Joined in the first month',
          icon: Trophy,
          unlocked: true
        },
        {
          id: '2',
          title: 'Skill Creator',
          description: 'Created your first skill',
          icon: Code,
          unlocked: true
        },
        {
          id: '3',
          title: 'Popular Creator',
          description: 'Get 10,000+ installs',
          icon: TrendingUp,
          unlocked: true
        },
        {
          id: '4',
          title: 'Bounty Hunter',
          description: 'Win a bounty challenge',
          icon: Award,
          unlocked: false,
          progress: 75
        },
        {
          id: '5',
          title: 'Community Star',
          description: 'Get 100+ reviews',
          icon: Star,
          unlocked: false,
          progress: 45
        }
      ]
    });

    // Mock created skills
    setCreatedSkills([
      {
        id: '1',
        name: 'Literature Review Assistant',
        slug: 'literature-review',
        shortDescription: 'Comprehensive literature review with citation management',
        category: 'Academic',
        stats: {
          installs: 5230,
          weeklyUsage: 12850,
          rating: 4.9
        },
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      {
        id: '2',
        name: 'Smart Flashcards',
        slug: 'smart-flashcards',
        shortDescription: 'AI-powered flashcard generation',
        category: 'Academic',
        stats: {
          installs: 3890,
          weeklyUsage: 11500,
          rating: 4.8
        },
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
      },
      {
        id: '3',
        name: 'Code Review Pro',
        slug: 'code-review',
        shortDescription: 'Automated code review assistant',
        category: 'Programming',
        stats: {
          installs: 3210,
          weeklyUsage: 9800,
          rating: 4.7
        },
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
      }
    ]);

    // Mock installed skills
    setInstalledSkills([
      {
        id: '4',
        name: 'Data Analysis Wizard',
        slug: 'data-analysis',
        shortDescription: 'Statistical analysis from datasets',
        category: 'Programming',
        stats: {
          installs: 2870,
          weeklyUsage: 8900,
          rating: 4.8
        }
      },
      {
        id: '5',
        name: 'Mind Map Generator',
        slug: 'mind-mapper',
        shortDescription: 'Visual mind maps from content',
        category: 'Academic',
        stats: {
          installs: 2560,
          weeklyUsage: 7800,
          rating: 4.6
        }
      }
    ]);

    // Mock activity
    setActivityItems([
      {
        id: '1',
        type: 'created',
        title: 'Created Literature Review Assistant',
        description: 'New skill published to marketplace',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        icon: Plus
      },
      {
        id: '2',
        type: 'installed',
        title: 'Installed Data Analysis Wizard',
        description: 'Added to your skills collection',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        icon: Package
      },
      {
        id: '3',
        type: 'achievement',
        title: 'Unlocked Popular Creator',
        description: 'Reached 10,000+ total installs',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        icon: Award
      },
      {
        id: '4',
        type: 'reviewed',
        title: 'Reviewed Mind Map Generator',
        description: 'Left a 5-star review',
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        icon: Star
      }
    ]);

    setLoading(false);
  };

  const getActivityIcon = (item: ActivityItem) => {
    const Icon = item.icon;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Profile Header with Background */}
      <div className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 h-64 bg-gradient-to-br from-purple-400 to-blue-600" />

        {/* Pattern Overlay */}
        <div className="absolute inset-0 h-64 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Profile Content */}
        <div className="relative px-6 pt-8 pb-20 max-w-7xl mx-auto">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-white text-2xl font-bold text-purple-600">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="text-white">
                <h1 className="text-3xl font-bold mb-1">{user?.name || 'User'}</h1>
                <p className="text-white/90 mb-3">@{user?.username || 'username'}</p>
                <div className="flex items-center gap-4">
                  {isCreator && (
                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified Creator
                    </Badge>
                  )}
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur">
                    <Calendar className="h-3 w-3 mr-1" />
                    Joined {formatDistanceToNow(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), { addSuffix: true })}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 -mt-12 relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-white/95 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Code className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userStats.skillsCreated}</p>
                  <p className="text-sm text-muted-foreground">Skills Created</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/95 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userStats.skillsInstalled}</p>
                  <p className="text-sm text-muted-foreground">Installed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/95 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{(userStats.totalInstalls / 1000).toFixed(1)}k</p>
                  <p className="text-sm text-muted-foreground">Total Installs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/95 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Zap className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{(userStats.totalUsage / 1000).toFixed(0)}k</p>
                  <p className="text-sm text-muted-foreground">Total Usage</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/95 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userStats.averageRating}</p>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-12 max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="created">Created</TabsTrigger>
            <TabsTrigger value="installed">Installed</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your latest actions and achievements</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activityItems.map((item) => (
                        <div key={item.id} className="flex items-start gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            item.type === 'created' && "bg-purple-100",
                            item.type === 'installed' && "bg-blue-100",
                            item.type === 'achievement' && "bg-yellow-100",
                            item.type === 'reviewed' && "bg-green-100"
                          )}>
                            {getActivityIcon(item)}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Achievements */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Achievements</CardTitle>
                    <CardDescription>Your progress and milestones</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {userStats.achievements.slice(0, 3).map((achievement) => {
                      const Icon = achievement.icon;
                      return (
                        <div key={achievement.id} className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-2 rounded-lg",
                              achievement.unlocked ? "bg-yellow-100" : "bg-gray-100"
                            )}>
                              <Icon className={cn(
                                "h-4 w-4",
                                achievement.unlocked ? "text-yellow-600" : "text-gray-400"
                              )} />
                            </div>
                            <div className="flex-1">
                              <p className={cn(
                                "text-sm font-medium",
                                !achievement.unlocked && "text-muted-foreground"
                              )}>
                                {achievement.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {achievement.description}
                              </p>
                            </div>
                          </div>
                          {achievement.progress !== undefined && !achievement.unlocked && (
                            <Progress value={achievement.progress} className="h-2" />
                          )}
                        </div>
                      );
                    })}
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab('achievements')}>
                      View All Achievements
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="created" className="mt-6">
            {isCreator ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Your Created Skills</h2>
                  <Link href="/create">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Skill
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {createdSkills.map((skill) => (
                    <SkillCardNew
                      key={skill.id}
                      skill={skill}
                      onUseSkill={() => {
                        toast({
                          title: 'Opening in Kael',
                          description: `Loading ${skill.name} in Kael chat...`,
                        });
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-muted rounded-full">
                      <Code className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Become a Creator</h3>
                  <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                    Start creating your own AI skills and share them with the community
                  </p>
                  <Link href="/create">
                    <Button className="justify-between gap-3">
                      <span>Create</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="installed" className="mt-6">
            <div>
              <h2 className="text-xl font-semibold mb-6">Installed Skills</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {installedSkills.map((skill) => (
                  <SkillCardNew
                    key={skill.id}
                    skill={skill}
                    onUseSkill={() => {
                      toast({
                        title: 'Opening in Kael',
                        description: `Loading ${skill.name} in Kael chat...`,
                      });
                    }}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="mt-6">
            <div>
              <h2 className="text-xl font-semibold mb-6">All Achievements</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userStats.achievements.map((achievement) => {
                  const Icon = achievement.icon;
                  return (
                    <Card key={achievement.id} className={cn(
                      "transition-all",
                      !achievement.unlocked && "opacity-60"
                    )}>
                      <CardContent className="flex items-center gap-4 pt-6">
                        <div className={cn(
                          "p-3 rounded-lg",
                          achievement.unlocked ? "bg-gradient-to-br from-yellow-400 to-orange-500" : "bg-gray-100"
                        )}>
                          <Icon className={cn(
                            "h-6 w-6",
                            achievement.unlocked ? "text-white" : "text-gray-400"
                          )} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{achievement.title}</h3>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          {achievement.progress !== undefined && !achievement.unlocked && (
                            <div className="mt-2">
                              <Progress value={achievement.progress} className="h-2" />
                              <p className="text-xs text-muted-foreground mt-1">{achievement.progress}% complete</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
