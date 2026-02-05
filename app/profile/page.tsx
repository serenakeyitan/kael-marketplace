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
import AddNewSkillModal from '@/components/AddNewSkillModal';
import {
  User,
  Users,
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
  ArrowUpRight,
  Sparkles,
  Play,
  Flame,
  MessageSquare
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
  followers: number;
  following: number;
  achievements: {
    id: string;
    title: string;
    description: string;
    icon: any;
    unlocked: boolean;
    progress?: number;
  }[];
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
    followers: 0,
    following: 0,
    achievements: []
  });
  const [createdSkills, setCreatedSkills] = useState<any[]>([]);
  const [installedSkills, setInstalledSkills] = useState<any[]>([]);
  const [followingList, setFollowingList] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);

    try {
      // Fetch profile data from API
      const response = await fetch('/api/me/profile');

      if (response.ok) {
        const data = await response.json();

        // Map icon strings to actual components
        const iconMap: { [key: string]: any } = {
          'Trophy': Trophy,
          'Sparkles': Sparkles,
          'Zap': Zap,
          'Code': Code,
          'Star': Star,
          'Users': Users,
          'TrendingUp': TrendingUp,
          'Award': Award,
          'Play': Play,
          'Activity': Activity,
          'Flame': Flame,
          'Package': Package,
          'MessageSquare': MessageSquare,
          'Heart': Heart
        };

        // Set user stats with proper icon mapping
        setUserStats({
          ...data.stats,
          achievements: data.stats.achievements.map((achievement: any) => ({
            ...achievement,
            icon: iconMap[achievement.icon] || Trophy
          }))
        });

        // Set created skills if available
        if (data.createdSkills) {
          setCreatedSkills(data.createdSkills);
        }
      } else {
        // Use default mock data if API fails
        console.log('Using mock data - API returned:', response.status);
        setUserStats({
          skillsCreated: 0,
          skillsInstalled: 0,
          totalUsage: 0,
          totalInstalls: 0,
          averageRating: 0,
          followers: 0,
          following: 0,
          achievements: [
            {
              id: '1',
              title: 'First Steps',
              description: 'Install your first skill',
              icon: Trophy,
              unlocked: false,
              progress: 0
            },
            {
              id: '2',
              title: 'Skill Explorer',
              description: 'Install 3 skills',
              icon: Sparkles,
              unlocked: false,
              progress: 0
            }
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      // Set default empty state on error
      setUserStats({
        skillsCreated: 0,
        skillsInstalled: 0,
        totalUsage: 0,
        totalInstalls: 0,
        averageRating: 0,
        followers: 0,
        following: 0,
        achievements: []
      });
    }

    // Fetch installed skills
    try {
      const installedResponse = await fetch('/api/me/installed');
      if (installedResponse.ok) {
        const installedData = await installedResponse.json();
        if (installedData.installedSkills) {
          setInstalledSkills(installedData.installedSkills.map((item: any) => item.skill));
        }
      }
    } catch (error) {
      console.error('Error fetching installed skills:', error);
    }

    // Mock following list
    setFollowingList([
      {
        id: '1',
        username: 'the-glitch',
        name: 'The Glitch',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=the-glitch',
        description: 'Independent researcher on AI skills and prompt engineering',
        followers: 626,
        skillsCreated: 8,
        isFollowing: true
      },
      {
        id: '2',
        username: 'code-wizard',
        name: 'Code Wizard',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=code-wizard',
        description: 'Building developer tools and automation skills',
        followers: 1250,
        skillsCreated: 15,
        isFollowing: true
      },
      {
        id: '3',
        username: 'data-ninja',
        name: 'Data Ninja',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=data-ninja',
        description: 'Data analysis and visualization expert',
        followers: 890,
        skillsCreated: 12,
        isFollowing: true
      },
      {
        id: '4',
        username: 'ai-artist',
        name: 'AI Artist',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ai-artist',
        description: 'Creating beautiful AI-powered creative tools',
        followers: 2340,
        skillsCreated: 23,
        isFollowing: true
      }
    ]);

    // Activity removed as per user request

    setLoading(false);
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
                <p className="text-white/90 mb-2">@{user?.email?.split('@')[0] || 'username'}</p>
                <div className="flex items-center gap-4 text-white/90 mb-3">
                  <span className="font-semibold">{userStats.followers || 0} <span className="font-normal">followers</span></span>
                  <span className="font-semibold">{userStats.following || 0} <span className="font-normal">following</span></span>
                </div>
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

      {/* Stats Cards - Separated into User and Creator Stats */}
      <div className="px-6 -mt-12 relative z-10 max-w-7xl mx-auto">
        <div className="space-y-6 mb-8">
          {/* User Stats */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-3">Your Activity</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white/95 backdrop-blur">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Package className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{userStats.skillsInstalled}</p>
                      <p className="text-sm text-muted-foreground">Skills You Installed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/95 backdrop-blur">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Activity className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {userStats.totalUsage >= 1000
                          ? `${(userStats.totalUsage / 1000).toFixed(1)}k`
                          : userStats.totalUsage}
                      </p>
                      <p className="text-sm text-muted-foreground">Your Total Usage</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/95 backdrop-blur">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Heart className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{favorites.length}</p>
                      <p className="text-sm text-muted-foreground">Favorite Skills</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Creator Stats - Only show if user has created skills */}
          {isCreator && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-3">Creator Stats</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                      <div className="p-2 bg-green-100 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{(userStats.totalInstalls / 1000).toFixed(1)}k</p>
                        <p className="text-sm text-muted-foreground">People Installed Your Skills</p>
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
                        <p className="text-sm text-muted-foreground">Your Avg Rating</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/95 backdrop-blur">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-pink-100 rounded-lg">
                        <Users className="h-4 w-4 text-pink-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">2.3k</p>
                        <p className="text-sm text-muted-foreground">Followers</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-12 max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-lg grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="created">Created</TabsTrigger>
            <TabsTrigger value="installed">Installed</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 gap-6">
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
                  <Button onClick={() => setIsAddSkillModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Skill
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {(createdSkills || []).map((skill) => (
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
                  <Button
                    onClick={() => setIsAddSkillModalOpen(true)}
                    className="justify-between gap-3"
                  >
                    <span>Create</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="installed" className="mt-6">
            <div>
              <h2 className="text-xl font-semibold mb-6">Installed Skills</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {(installedSkills || []).map((skill) => (
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

          <TabsContent value="following" className="mt-6">
            <div>
              <h2 className="text-xl font-semibold mb-6">Following</h2>
              {followingList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {followingList.map((creator) => (
                    <Card key={creator.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <Link href={`/users/${creator.username}`} className="flex items-center gap-3 flex-1">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={creator.avatar} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                {creator.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate">{creator.name}</h3>
                              <p className="text-sm text-gray-500">@{creator.username}</p>
                            </div>
                          </Link>
                        </div>

                        <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                          {creator.description}
                        </p>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {creator.followers} followers
                            </span>
                            <span className="flex items-center gap-1">
                              <Code className="h-3.5 w-3.5" />
                              {creator.skillsCreated} skills
                            </span>
                          </div>
                        </div>

                        <Link href={`/users/${creator.username}`} className="block mt-4">
                          <Button variant="outline" size="sm" className="w-full">
                            View Profile
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-muted rounded-full">
                        <Users className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Following Yet</h3>
                    <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                      Start following creators to see their latest skills here
                    </p>
                    <Link href="/">
                      <Button>
                        Explore Creators
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add New Skill Modal */}
      <AddNewSkillModal
        open={isAddSkillModalOpen}
        onOpenChange={setIsAddSkillModalOpen}
      />
    </div>
  );
}
