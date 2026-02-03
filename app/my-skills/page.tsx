'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import SkillCardNew from '@/components/SkillCardNew';
import { Skill } from '@/types/skill';
import {
  Package,
  Upload,
  MoreVertical,
  ExternalLink,
  Trash2,
  Edit,
  Eye,
  Users,
  Zap,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Plus,
  FileText,
  TrendingUp,
  Settings,
  ArrowUpRight,
  Heart,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatTimeAgo, formatTimeAgoVerbose } from '@/lib/time-utils';

interface InstalledSkillData {
  skillId: string;
  installedAt: string;
  lastUsed: string;
  isEnabled: boolean;
  usageCount: number;
  skill: any;
}

interface FavoriteSkillData {
  skillId: string;
  likedAt: string;
  skill: Skill;
}

interface UploadedSkillData {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  category: string;
  status: 'draft' | 'published' | 'under_review';
  publishedAt?: string;
  lastUpdated: string;
  totalInstalls: number;
  totalUsage: number;
  weeklyActiveUsers: number;
}

export default function MySkillsPage() {
  const router = useRouter();
  const { user, isCreator } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('installed');
  const [installedSkills, setInstalledSkills] = useState<InstalledSkillData[]>([]);
  const [favoriteSkills, setFavoriteSkills] = useState<FavoriteSkillData[]>([]);
  const [uploadedSkills, setUploadedSkills] = useState<UploadedSkillData[]>([]);
  const [loadingInstalled, setLoadingInstalled] = useState(true);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [loadingUploaded, setLoadingUploaded] = useState(true);
  const [updatingSkill, setUpdatingSkill] = useState<string | null>(null);

  useEffect(() => {
    fetchInstalledSkills();
    fetchFavoriteSkills();
    if (isCreator) {
      fetchUploadedSkills();
    }
  }, [isCreator]);

  // Refresh data when page gains focus or becomes visible
  useEffect(() => {
    const handleFocus = () => {
      // Refresh installed skills when page regains focus
      if (activeTab === 'installed') {
        fetchInstalledSkills();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Refresh when tab becomes visible
        if (activeTab === 'installed') {
          fetchInstalledSkills();
        }
      }
    };

    // Listen for storage events to sync between tabs/pages
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'skillsUpdated' && e.newValue === 'true') {
        // Refresh installed skills when another tab/page updates skills
        fetchInstalledSkills();
        // Reset the flag
        localStorage.setItem('skillsUpdated', 'false');
      }
    };

    // Add event listeners
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);

    // Also refresh on navigation
    const handlePopState = () => {
      if (activeTab === 'installed') {
        fetchInstalledSkills();
      }
    };
    window.addEventListener('popstate', handlePopState);

    // Check for updates when component mounts
    const skillsUpdated = localStorage.getItem('skillsUpdated');
    if (skillsUpdated === 'true') {
      fetchInstalledSkills();
      localStorage.setItem('skillsUpdated', 'false');
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [activeTab]);

  const fetchInstalledSkills = async () => {
    try {
      const response = await fetch('/api/me/installed');
      const data = await response.json();
      setInstalledSkills(data.installedSkills || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load installed skills',
        variant: 'destructive',
      });
    } finally {
      setLoadingInstalled(false);
    }
  };

  const fetchFavoriteSkills = async () => {
    try {
      // Get liked skills from localStorage
      const likedSkillIds = JSON.parse(localStorage.getItem('likedSkills') || '[]');

      // Fetch all skills from the API to get the full data
      const response = await fetch('/api/skills');
      const data = await response.json();
      const allSkills = data.skills || [];

      // Filter skills that are liked and create favorite entries
      const mockFavorites: FavoriteSkillData[] = likedSkillIds
        .map((skillId: string) => {
          const skill = allSkills.find((s: Skill) => s.id === skillId);
          if (skill) {
            return {
              skillId: skill.id,
              likedAt: new Date().toISOString(), // In production, store this when liked
              skill: skill
            };
          }
          return null;
        })
        .filter(Boolean);

      setFavoriteSkills(mockFavorites);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load favorite skills',
        variant: 'destructive',
      });
    } finally {
      setLoadingFavorites(false);
    }
  };

  const fetchUploadedSkills = async () => {
    try {
      const response = await fetch('/api/me/uploaded');
      const data = await response.json();
      setUploadedSkills(data.uploadedSkills || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load uploaded skills',
        variant: 'destructive',
      });
    } finally {
      setLoadingUploaded(false);
    }
  };

  const handleToggleEnabled = async (skillId: string, currentState: boolean) => {
    setUpdatingSkill(skillId);
    try {
      const response = await fetch('/api/me/installed', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillId, isEnabled: !currentState }),
      });

      if (response.ok) {
        setInstalledSkills(prev =>
          prev.map(item =>
            item.skillId === skillId ? { ...item, isEnabled: !currentState } : item
          )
        );
        toast({
          title: 'Success',
          description: `Skill ${!currentState ? 'enabled' : 'disabled'}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update skill',
        variant: 'destructive',
      });
    } finally {
      setUpdatingSkill(null);
    }
  };

  const handleUninstall = async (skillId: string, skillName: string) => {
    if (!confirm(`Are you sure you want to uninstall "${skillName}"?`)) return;

    setUpdatingSkill(skillId);
    try {
      const response = await fetch(`/api/me/installed?skillId=${skillId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setInstalledSkills(prev => prev.filter(item => item.skillId !== skillId));
        toast({
          title: 'Success',
          description: `${skillName} has been uninstalled`,
        });
        // Signal that skills have been updated for other pages
        localStorage.setItem('skillsUpdated', 'true');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to uninstall skill',
        variant: 'destructive',
      });
    } finally {
      setUpdatingSkill(null);
    }
  };

  const handleUnlike = async (skillId: string, skillName: string) => {
    // Don't set updating skill for card UI since it's handled by the card itself
    try {
      // In production, this would call an API to unlike
      setFavoriteSkills(prev => prev.filter(item => item.skillId !== skillId));

      // Update localStorage to persist the unlike state
      const likedSkills = JSON.parse(localStorage.getItem('likedSkills') || '[]');
      const updatedLikedSkills = likedSkills.filter((id: string) => id !== skillId);
      localStorage.setItem('likedSkills', JSON.stringify(updatedLikedSkills));

      toast({
        title: 'Removed from favorites',
        description: `${skillName} has been removed from your favorites`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove from favorites',
        variant: 'destructive',
      });
    }
  };

  const handlePublish = async (skillId: string) => {
    setUpdatingSkill(skillId);
    try {
      const response = await fetch('/api/me/uploaded', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillId, status: 'published' }),
      });

      if (response.ok) {
        setUploadedSkills(prev =>
          prev.map(skill =>
            skill.id === skillId
              ? { ...skill, status: 'published', publishedAt: new Date().toISOString() }
              : skill
          )
        );
        toast({
          title: 'Success',
          description: 'Skill published successfully',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to publish skill',
        variant: 'destructive',
      });
    } finally {
      setUpdatingSkill(null);
    }
  };

  const handleUseInKael = (slug: string) => {
    const kaelUrl = `${process.env.NEXT_PUBLIC_KAEL_CHAT_URL || 'https://kael.im/chat'}?skillSlug=${slug}`;
    window.open(kaelUrl, '_blank');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Published</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'under_review':
        return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Under Review</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Skills</h1>
        <p className="text-muted-foreground">
          Manage your installed skills, favorites{isCreator ? ', and uploaded creations' : ''}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={`grid w-full max-w-lg grid-cols-${isCreator ? '3' : '2'}`}>
          <TabsTrigger value="installed" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Installed
          </TabsTrigger>
          <TabsTrigger value="favorites" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Favorites
          </TabsTrigger>
          {isCreator && (
            <TabsTrigger value="uploaded" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Uploaded
            </TabsTrigger>
          )}
        </TabsList>

        {/* Installed Skills Tab */}
        <TabsContent value="installed" className="mt-6">
          {loadingInstalled ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : installedSkills.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No installed skills yet</h3>
                <p className="text-muted-foreground mb-4">
                  Browse the marketplace to discover and install skills
                </p>
                <Button onClick={() => router.push('/')}>
                  Browse Marketplace
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {installedSkills.map((item) => (
                <Card key={item.skillId} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">
                            {item.skill?.name || 'Unknown Skill'}
                          </CardTitle>
                          {item.skill?.author?.isOfficial && (
                            <Badge variant="outline" className="text-xs">Official</Badge>
                          )}
                        </div>
                        <CardDescription>
                          {item.skill?.shortDescription}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`enable-${item.skillId}`}
                            checked={item.isEnabled}
                            onCheckedChange={() => handleToggleEnabled(item.skillId, item.isEnabled)}
                            disabled={updatingSkill === item.skillId}
                          />
                          <Label htmlFor={`enable-${item.skillId}`} className="text-sm">
                            {item.isEnabled ? 'Enabled' : 'Disabled'}
                          </Label>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleUseInKael(item.skill?.slug)}>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Use in Kael
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/skills/${item.skill?.slug}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => handleUninstall(item.skillId, item.skill?.name)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Uninstall
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Installed</p>
                        <p className="font-medium" title={formatTimeAgoVerbose(item.installedAt)}>
                          {formatTimeAgo(item.installedAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Last Used</p>
                        <p className="font-medium" title={formatTimeAgoVerbose(item.lastUsed)}>
                          {formatTimeAgo(item.lastUsed)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Usage Count</p>
                        <p className="font-medium">{item.usageCount} times</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Category</p>
                        <Badge variant="outline">{item.skill?.category}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Favorite Skills Tab */}
        <TabsContent value="favorites" className="mt-6">
          {loadingFavorites ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : favoriteSkills.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No favorite skills yet</h3>
                <p className="text-muted-foreground mb-4">
                  Like skills in the marketplace to add them to your favorites
                </p>
                <Button onClick={() => router.push('/')}>
                  Browse Marketplace
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-3 lg:gap-4">
              {favoriteSkills.map((item) => (
                <SkillCardNew
                  key={item.skillId}
                  skill={item.skill}
                  initialLiked={true}
                  onLikeChange={(liked) => {
                    if (!liked) {
                      // Remove from favorites when unliked
                      handleUnlike(item.skillId, item.skill.name);
                    }
                  }}
                  onUseSkill={() => {
                    toast({
                      title: 'Opening in Kael',
                      description: `Loading ${item.skill.name} in Kael chat...`,
                    });
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Uploaded Skills Tab (Creator only) */}
        {isCreator && (
          <TabsContent value="uploaded" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-muted-foreground">
                {uploadedSkills.length} skill{uploadedSkills.length !== 1 ? 's' : ''} uploaded
              </p>
              <Button onClick={() => router.push('/create')}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Skill
              </Button>
            </div>

            {loadingUploaded ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : uploadedSkills.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No uploaded skills yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create and share your first skill with the community
                  </p>
                  <Button onClick={() => router.push('/create')} className="justify-between gap-3">
                    <span>Create</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {uploadedSkills.map((skill) => (
                  <Card key={skill.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-lg">{skill.name}</CardTitle>
                            {getStatusBadge(skill.status)}
                          </div>
                          <CardDescription>{skill.shortDescription}</CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/skills/${skill.slug}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Public Page
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <TrendingUp className="mr-2 h-4 w-4" />
                              View Analytics
                            </DropdownMenuItem>
                            {skill.status === 'draft' && (
                              <DropdownMenuItem onClick={() => handlePublish(skill.id)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Publish
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-red-600 focus:text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1 flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            Total Installs
                          </p>
                          <p className="font-medium">{skill.totalInstalls.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1 flex items-center gap-1">
                            <Zap className="h-3.5 w-3.5" />
                            Total Usage
                          </p>
                          <p className="font-medium">{skill.totalUsage.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1 flex items-center gap-1">
                            <TrendingUp className="h-3.5 w-3.5" />
                            Weekly Active
                          </p>
                          <p className="font-medium">{skill.weeklyActiveUsers.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1 flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            Last Updated
                          </p>
                          <p className="font-medium" title={formatTimeAgoVerbose(skill.lastUpdated)}>
                            {formatTimeAgo(skill.lastUpdated)}
                          </p>
                        </div>
                      </div>
                      {skill.publishedAt && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-muted-foreground" title={`Published ${formatTimeAgoVerbose(skill.publishedAt)}`}>
                            Published {formatTimeAgo(skill.publishedAt)}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}