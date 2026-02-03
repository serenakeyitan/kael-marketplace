'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import SkillCardNew from '@/components/SkillCardNew';
import { Skill } from '@/types/skill';
import {
  ArrowLeft,
  ExternalLink,
  Users,
  Zap,
  Star,
  Calendar,
  Tag,
  Code,
  BookOpen,
  CheckCircle,
  Play,
  Plus,
  Loader2,
  Share2,
  Heart,
  Flag,
  MessageCircle,
  MoreHorizontal,
  Copy,
  TrendingUp,
  Clock,
  PlayCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export default function SkillDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [skill, setSkill] = useState<Skill | null>(null);
  const [relatedSkills, setRelatedSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  // Refs for sections
  const overviewRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const examplesRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSkillDetails();
    checkInstallStatus();
  }, [params.slug]);

  // Scroll observer for active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: 'overview', ref: overviewRef },
        { id: 'features', ref: featuresRef },
        { id: 'examples', ref: examplesRef },
        { id: 'demo', ref: demoRef },
      ];

      const scrollPosition = window.scrollY + 200; // Offset for better detection

      for (const section of sections) {
        if (section.ref.current) {
          const { offsetTop, offsetHeight } = section.ref.current;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchSkillDetails = async () => {
    try {
      const response = await fetch(`/api/skills/${params.slug}`);
      if (!response.ok) {
        throw new Error('Skill not found');
      }
      const data = await response.json();
      setSkill(data.skill);
      setRelatedSkills(data.relatedSkills || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load skill details',
        variant: 'destructive',
      });
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const checkInstallStatus = async () => {
    try {
      const response = await fetch('/api/me/installed');
      const data = await response.json();
      const installed = data.installedSkills.some((item: any) => item.skill?.slug === params.slug);
      setIsInstalled(installed);
    } catch (error) {
      console.error('Failed to check install status');
    }
  };

  const handleUseInKael = () => {
    if (!skill) return;
    const kaelUrl = `${process.env.NEXT_PUBLIC_KAEL_CHAT_URL || 'https://kael.im/chat'}?skillSlug=${skill.slug}`;
    window.open(kaelUrl, '_blank');
    toast({
      title: 'Opening in Kael',
      description: `Loading ${skill.name} in Kael chat...`,
    });
  };

  const handleInstall = async () => {
    if (!skill) return;
    setInstalling(true);
    try {
      const response = await fetch('/api/me/installed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillId: skill.id }),
      });

      if (response.ok) {
        setIsInstalled(true);
        toast({
          title: 'Success',
          description: `${skill.name} has been installed to your skills`,
        });
      } else {
        throw new Error('Failed to install');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to install skill. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setInstalling(false);
    }
  };

  const handleShare = () => {
    if (!skill) return;
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: 'Link copied',
      description: 'Skill link has been copied to clipboard',
    });
  };

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <h2 className="text-2xl font-bold mb-4">Skill not found</h2>
        <Button onClick={() => router.push('/')}>
          Back to marketplace
        </Button>
      </div>
    );
  }

  // Generate gradient based on skill category
  const gradientColors = {
    'Career': 'from-amber-400 to-orange-600',
    'Health': 'from-emerald-400 to-teal-600',
    'Academic': 'from-indigo-400 to-purple-600',
    'Business': 'from-rose-400 to-pink-600',
    'Programming': 'from-blue-400 to-indigo-600',
    'Marketing': 'from-fuchsia-400 to-pink-600',
    'Image': 'from-violet-400 to-fuchsia-600',
    'Prompt': 'from-cyan-400 to-sky-600',
  };
  const gradient = gradientColors[skill.category as keyof typeof gradientColors] || 'from-blue-400 to-purple-600';

  // Demo images/videos (in real app, these would come from skill data)
  const demoMedia = [
    { type: 'image', url: 'https://via.placeholder.com/800x450', caption: 'Main interface' },
    { type: 'image', url: 'https://via.placeholder.com/800x450', caption: 'Results view' },
    { type: 'video', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', caption: 'How it works' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section with Background */}
      <div className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className={cn(
          "absolute inset-0 h-96 bg-gradient-to-br",
          gradient
        )} />

        {/* Pattern Overlay */}
        <div className="absolute inset-0 h-96 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Content */}
        <div className="relative px-6 py-8 max-w-7xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-6 text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {/* Skill Header Info */}
          <div className="text-white mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur">
                {skill.category}
              </Badge>
              {skill.author.isOfficial && (
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur">
                  Official
                </Badge>
              )}
            </div>

            <h1 className="text-5xl font-bold mb-4">{skill.name}</h1>
            <p className="text-xl text-white/90 mb-6 max-w-3xl">
              {skill.shortDescription}
            </p>

            {/* Author and Stats Row */}
            <div className="flex flex-wrap items-center gap-6 mb-8">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-white/20">
                  <AvatarImage src={skill.author.avatar} />
                  <AvatarFallback className="bg-white/20 text-white">
                    {skill.author.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">{skill.author.name}</p>
                  <p className="text-sm text-white/70">
                    Updated {formatDistanceToNow(new Date(skill.lastUpdated), { addSuffix: true })}
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span className="font-semibold">{(skill.stats.installs / 1000).toFixed(1)}k</span>
                  <span className="text-sm text-white/70">installs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  <span className="font-semibold">{(skill.stats.weeklyUsage / 1000).toFixed(0)}k</span>
                  <span className="text-sm text-white/70">/week</span>
                </div>
                {skill.stats.rating && (
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{skill.stats.rating}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={handleUseInKael}
                className="bg-white text-gray-900 hover:bg-gray-100"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Start Chat
              </Button>
              {!isInstalled ? (
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={handleInstall}
                  disabled={installing}
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                >
                  {installing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Installing...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-5 w-5" />
                      Add to My Skills
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="secondary"
                  disabled
                  className="bg-white/20 text-white border-white/30"
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Installed
                </Button>
              )}
              <Button
                size="lg"
                variant="ghost"
                onClick={handleShare}
                className="text-white hover:bg-white/20"
              >
                <Share2 className="h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <Heart className="h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8 max-w-7xl mx-auto">
        {/* Audience Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          <span className="text-sm font-medium text-muted-foreground mr-2">Perfect for:</span>
          {skill.audienceTags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-sm">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Sticky Navigation Tabs */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md -mx-6 px-6 py-4 mb-8 border-b">
          <Tabs value={activeSection} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-4">
              <TabsTrigger
                value="overview"
                onClick={() => scrollToSection(overviewRef)}
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="features"
                onClick={() => scrollToSection(featuresRef)}
              >
                Features
              </TabsTrigger>
              <TabsTrigger
                value="examples"
                onClick={() => scrollToSection(examplesRef)}
              >
                Examples
              </TabsTrigger>
              <TabsTrigger
                value="demo"
                onClick={() => scrollToSection(demoRef)}
              >
                Try it
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Overview Section */}
        <div ref={overviewRef} className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About this Skill</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {skill.longDescription}
                  </p>

                  {/* Demo Media Section */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">See it in action</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {demoMedia.map((media, index) => (
                        <div key={index} className="space-y-2">
                          {media.type === 'image' ? (
                            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                              <img
                                src={media.url}
                                alt={media.caption}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                                <p className="text-white text-sm">{media.caption}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                              <iframe
                                src={media.url}
                                title={media.caption}
                                className="w-full h-full"
                                allowFullScreen
                              />
                              <div className="absolute top-2 right-2">
                                <Badge className="bg-red-600 text-white">
                                  <PlayCircle className="h-3 w-3 mr-1" />
                                  Video
                                </Badge>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {skill.requirements && skill.requirements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Prerequisites</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {skill.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Code className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Side Stats Card */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Response Time</span>
                      <span className="font-medium">Fast</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: '85%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Accuracy</span>
                      <span className="font-medium">High</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '92%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Complexity</span>
                      <span className="font-medium">Medium</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: '60%' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Version</span>
                    <span className="text-sm font-medium">v{skill.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="text-sm font-medium">{new Date(skill.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">License</span>
                    <span className="text-sm font-medium">MIT</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div ref={featuresRef} className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skill.features && skill.features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="flex items-start gap-3 pt-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium mb-1">{feature}</p>
                    <p className="text-sm text-muted-foreground">
                      Enhance your workflow with this powerful capability
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Examples Section */}
        <div ref={examplesRef} className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Examples</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {skill.examples.map((example, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-purple-400 to-blue-600 flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">Use Case #{index + 1}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {example}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Demo Section */}
        <div ref={demoRef} className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Try it</h2>
          <Card className="border-2 border-dashed">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg">
                  <Zap className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Try it Now</CardTitle>
                  <CardDescription>
                    Copy this prompt and try {skill.name} in action
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4 mb-4 relative group">
                <code className="text-sm block pr-10">{skill.demoPrompt}</code>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    navigator.clipboard.writeText(skill.demoPrompt);
                    toast({
                      title: 'Copied!',
                      description: 'Prompt copied to clipboard',
                    });
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleUseInKael} className="flex-1 sm:flex-none">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Try in Kael Chat
                </Button>
                <Button variant="outline" onClick={() => {
                  navigator.clipboard.writeText(skill.demoPrompt);
                  toast({
                    title: 'Copied!',
                    description: 'Prompt copied to clipboard',
                  });
                }}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Prompt
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Related Skills */}
        {relatedSkills.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">You might also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {relatedSkills.map((relatedSkill: any) => (
                <SkillCardNew
                  key={relatedSkill.id}
                  skill={relatedSkill}
                  onUseSkill={() => {
                    toast({
                      title: 'Opening in Kael',
                      description: `Loading ${relatedSkill.name} in Kael chat...`,
                    });
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}