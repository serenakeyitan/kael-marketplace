'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import SkillCardNew from '@/components/SkillCardNew';
import { Skill } from '@/types/skill';
import {
  Users,
  UserPlus,
  TrendingUp,
  Grid,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserProfile {
  id: string;
  username: string;
  name: string;
  avatar: string;
  description: string;
  followers: number;
  following: number;
  totalUsers: number;
  popularity: number;
  isFollowing: boolean;
  skills: Skill[];
}

const skillCategories = [
  'All',
  'productivity',
  'creative',
  'development',
  'research',
  'communication',
  'education',
  'entertainment',
  'other'
];

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { toast } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'popular' | 'newest'>('popular');
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, [username]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/users/${username}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const data = await response.json();
      setProfile(data.profile);
      setIsFollowing(data.profile.isFollowing);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast({
      title: isFollowing ? 'Unfollowed' : 'Followed',
      description: isFollowing
        ? `You unfollowed ${profile?.name}`
        : `You are now following ${profile?.name}`,
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}k`;
    }
    return num.toString();
  };

  const filteredSkills = profile?.skills.filter(skill => {
    if (selectedCategory === 'All') return true;
    return skill.category === selectedCategory;
  }) || [];

  const sortedSkills = [...filteredSkills].sort((a, b) => {
    if (sortBy === 'popular') {
      return b.stats.installs - a.stats.installs;
    } else {
      return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">User not found</h2>
          <p className="text-gray-500">The user you're looking for doesn't exist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 xl:px-8 py-8">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <Avatar className="h-24 w-24 border-4 border-gray-100">
              <AvatarImage src={profile.avatar} />
              <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {profile.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            {/* User Info */}
            <div className="flex-1">
              <div className="mb-3">
                <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                <p className="text-gray-500 text-sm">@{profile.username}</p>
              </div>

              <p className="text-gray-700 mb-4">{profile.description}</p>

              {/* Stats */}
              <div className="flex items-center gap-6 mb-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{formatNumber(profile.followers)}</div>
                  <div className="text-xs text-gray-500">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{profile.following}</div>
                  <div className="text-xs text-gray-500">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{formatNumber(profile.totalUsers)}</div>
                  <div className="text-xs text-gray-500">Users</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{formatNumber(profile.popularity)}</div>
                  <div className="text-xs text-gray-500">Popularity</div>
                </div>
              </div>

              {/* Follow Button */}
              <Button
                onClick={handleFollow}
                variant={isFollowing ? "outline" : "default"}
                className="min-w-[120px]"
              >
                {isFollowing ? (
                  <>
                    <Users className="h-4 w-4 mr-2" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Follow
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Creations Header */}
          <div className="mt-8 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{profile.name}'s Creations</h2>

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {sortBy === 'popular' ? 'Most Used' : 'Newest'}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy('popular')}>
                  Most Used
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('newest')}>
                  Newest
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Category Tabs */}
          <div className="mt-6">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="h-auto p-0 bg-transparent border-b rounded-none w-full justify-start">
                {skillCategories.map(category => {
                  const count = category === 'All'
                    ? profile.skills.length
                    : profile.skills.filter(s => s.category === category).length;

                  return (
                    <TabsTrigger
                      key={category}
                      value={category}
                      className="relative px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
                    >
                      <div className="flex items-center gap-2">
                        {category === 'All' && <Grid className="h-4 w-4" />}
                        {category}
                        <Badge variant="secondary" className="ml-1 text-xs">
                          {count}
                        </Badge>
                      </div>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 xl:px-8 py-8">
        {sortedSkills.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4">
            {sortedSkills.map(skill => (
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
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No skills found in this category</p>
          </div>
        )}

        {/* Load More / End Message */}
        {sortedSkills.length > 0 && (
          <div className="text-center mt-12 py-8">
            <p className="text-gray-500 font-medium">You have seen it all!</p>
          </div>
        )}
      </div>
    </div>
  );
}