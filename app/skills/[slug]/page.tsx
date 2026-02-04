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
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import SkillCardNew from '@/components/SkillCardNew';
import { Skill } from '@/types/skill';
import {
  ArrowLeft,
  ExternalLink,
  Users,
  MessageCircle,
  Flame,
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
  Copy,
  TrendingUp,
  Clock,
  PlayCircle,
  Image as ImageIcon,
  Zap,
  ThumbsUp,
  ThumbsDown,
  X,
  Reply,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface ReviewReply {
  id: string;
  userName: string;
  userAvatar?: string;
  comment: string;
  timestamp: Date;
  helpful: number;
  notHelpful: number;
  userVote?: 'helpful' | 'notHelpful' | null;
}

interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  timestamp: Date;
  helpful: number;
  notHelpful: number;
  isRecommended?: boolean;
  userVote?: 'helpful' | 'notHelpful' | null;
  replies?: ReviewReply[];
  showReplies?: boolean;
  showReplyForm?: boolean;
}

export default function SkillDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [skill, setSkill] = useState<Skill | null>(null);
  const [relatedSkills, setRelatedSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [replyTexts, setReplyTexts] = useState<{ [key: string]: string }>({});
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [readmeContent, setReadmeContent] = useState<string>('');

  // Refs for sections
  const overviewRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const examplesRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSkillDetails();
    fetchReviews();
  }, [params.slug]);

  // Check install and like status when skill is loaded
  useEffect(() => {
    if (skill && skill.id) {
      checkInstallStatus();
      checkLikeStatus();
    }
  }, [skill]);

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

  const fetchReviews = () => {
    // Mock reviews data with replies - sorted by latest first
    const mockReviews: Review[] = [
      {
        id: '4',
        userName: 'TechEnthusiast',
        rating: 5,
        comment: 'Just started using this today and I\'m blown away by the capabilities!',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        helpful: 0,
        notHelpful: 0,
        isRecommended: true,
        userVote: null,
        replies: [],
        showReplies: false,
        showReplyForm: false,
      },
      {
        id: '1',
        userName: 'zhuD',
        rating: 5,
        comment: '这个AI编程辅助技能太棒了。可门控内容更新！我不通晓！值得推荐！！！🎯',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        helpful: 12,
        notHelpful: 1,
        isRecommended: true,
        userVote: null,
        replies: [
          {
            id: '1-1',
            userName: 'DevUser',
            comment: 'Totally agree! This skill has saved me hours of work.',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            helpful: 3,
            notHelpful: 0,
            userVote: null,
          },
          {
            id: '1-2',
            userName: 'CodeMaster',
            comment: 'Yes, the AI suggestions are incredibly accurate!',
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
            helpful: 2,
            notHelpful: 0,
            userVote: null,
          },
        ],
        showReplies: false,
        showReplyForm: false,
      },
      {
        id: '5',
        userName: 'DataScientist',
        rating: 3,
        comment: 'Works well but could use better documentation.',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        helpful: 4,
        notHelpful: 1,
        isRecommended: false,
        userVote: null,
        replies: [],
        showReplies: false,
        showReplyForm: false,
      },
      {
        id: '2',
        userName: 'NurtleBoiy',
        rating: 5,
        comment: 'Nowadays, the supervision is so strict that it can no longer be generated.',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        helpful: 8,
        notHelpful: 2,
        isRecommended: true,
        userVote: null,
        replies: [],
        showReplies: false,
        showReplyForm: false,
      },
      {
        id: '3',
        userName: 'YahoOo',
        rating: 4,
        comment: 'Bad? Good?',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        helpful: 5,
        notHelpful: 3,
        isRecommended: true,
        userVote: null,
        replies: [
          {
            id: '3-1',
            userName: 'HelpfulUser',
            comment: 'It\'s definitely good! Just needs some getting used to.',
            timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
            helpful: 1,
            notHelpful: 0,
            userVote: null,
          },
        ],
        showReplies: false,
        showReplyForm: false,
      },
      {
        id: '6',
        userName: 'BeginnersGuide',
        rating: 2,
        comment: 'Too complex for beginners. Needs a simpler interface.',
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        helpful: 6,
        notHelpful: 8,
        isRecommended: false,
        userVote: null,
        replies: [],
        showReplies: false,
        showReplyForm: false,
      },
    ];
    // Sort by timestamp, latest first
    mockReviews.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    setReviews(mockReviews);
  };

  const checkInstallStatus = async () => {
    try {
      const response = await fetch('/api/me/installed');
      if (!response.ok) {
        console.error('Failed to fetch installed skills:', response.status);
        return;
      }
      const data = await response.json();
      if (data.installedSkills && Array.isArray(data.installedSkills)) {
        // Check both by slug and by ID to be safe
        const installed = data.installedSkills.some((item: any) =>
          item.skill?.slug === params.slug || (skill?.id && item.skill?.id === skill.id)
        );
        setIsInstalled(installed);
      }
    } catch (error) {
      console.error('Failed to check install status:', error);
    }
  };

  const checkLikeStatus = () => {
    // Check if skill is liked
    if (!skill) return;
    const likedSkills = localStorage.getItem('likedSkills');
    if (likedSkills) {
      const liked = JSON.parse(likedSkills);
      setIsLiked(liked.includes(skill.id));
    }
  };

  const handleInstall = async () => {
    if (!skill) {
      toast({
        title: 'Error',
        description: 'Skill data not loaded yet',
        variant: 'destructive',
      });
      return;
    }

    if (!isInstalled) {
      // Install skill
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
            description: 'Skill added to your collection',
          });
          // Signal that skills have been updated
          localStorage.setItem('skillsUpdated', 'true');
          // Re-check install status to sync
          setTimeout(checkInstallStatus, 100);
        } else {
          const error = await response.json();
          toast({
            title: 'Error',
            description: error.error || 'Failed to install skill',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to install skill',
          variant: 'destructive',
        });
      } finally {
        setInstalling(false);
      }
    } else {
      // Uninstall skill
      setInstalling(true);
      try {
        const response = await fetch('/api/me/installed', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skillId: skill.id, action: 'uninstall' }),
        });

        if (response.ok) {
          setIsInstalled(false);
          toast({
            title: 'Success',
            description: 'Skill removed from your collection',
          });
          // Signal that skills have been updated
          localStorage.setItem('skillsUpdated', 'true');
          // Re-check install status to sync
          setTimeout(checkInstallStatus, 100);
        } else {
          const error = await response.json();
          toast({
            title: 'Error',
            description: error.error || 'Failed to uninstall skill',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to uninstall skill',
          variant: 'destructive',
        });
      } finally {
        setInstalling(false);
      }
    }
  };

  const handleLike = () => {
    if (!skill) return;

    const likedSkills = JSON.parse(localStorage.getItem('likedSkills') || '[]');
    if (!isLiked) {
      // Add skill ID to liked skills
      if (!likedSkills.includes(skill.id)) {
        likedSkills.push(skill.id);
      }
      setIsLiked(true);
      toast({
        title: 'Success',
        description: 'Added to your liked skills',
      });
    } else {
      // Remove skill ID from liked skills
      const index = likedSkills.indexOf(skill.id);
      if (index > -1) {
        likedSkills.splice(index, 1);
      }
      setIsLiked(false);
      toast({
        title: 'Success',
        description: 'Removed from your liked skills',
      });
    }
    localStorage.setItem('likedSkills', JSON.stringify(likedSkills));
    // Signal that skills have been updated for favorites sync
    localStorage.setItem('skillsUpdated', 'true');
  };

  const handleUseInKael = () => {
    toast({
      title: 'Opening in Kael',
      description: `Loading ${skill?.name} in Kael chat...`,
    });
    // In a real app, this would open the Kael chat with this skill
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: 'Link copied!',
      description: 'Share link has been copied to clipboard',
    });
  };

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleVoteReview = (reviewId: string, voteType: 'helpful' | 'notHelpful') => {
    setReviews(prevReviews =>
      prevReviews.map(review => {
        if (review.id === reviewId) {
          // Remove previous vote if exists
          let newHelpful = review.helpful;
          let newNotHelpful = review.notHelpful;

          if (review.userVote === 'helpful') {
            newHelpful--;
          } else if (review.userVote === 'notHelpful') {
            newNotHelpful--;
          }

          // Add new vote if different from previous
          let newUserVote: 'helpful' | 'notHelpful' | null = null;
          if (review.userVote !== voteType) {
            if (voteType === 'helpful') {
              newHelpful++;
            } else {
              newNotHelpful++;
            }
            newUserVote = voteType;
          }

          return {
            ...review,
            helpful: newHelpful,
            notHelpful: newNotHelpful,
            userVote: newUserVote,
          };
        }
        return review;
      })
    );
  };

  const handleVoteReply = (reviewId: string, replyId: string, voteType: 'helpful' | 'notHelpful') => {
    setReviews(prevReviews =>
      prevReviews.map(review => {
        if (review.id === reviewId && review.replies) {
          const updatedReplies = review.replies.map(reply => {
            if (reply.id === replyId) {
              let newHelpful = reply.helpful;
              let newNotHelpful = reply.notHelpful;

              if (reply.userVote === 'helpful') {
                newHelpful--;
              } else if (reply.userVote === 'notHelpful') {
                newNotHelpful--;
              }

              let newUserVote: 'helpful' | 'notHelpful' | null = null;
              if (reply.userVote !== voteType) {
                if (voteType === 'helpful') {
                  newHelpful++;
                } else {
                  newNotHelpful++;
                }
                newUserVote = voteType;
              }

              return {
                ...reply,
                helpful: newHelpful,
                notHelpful: newNotHelpful,
                userVote: newUserVote,
              };
            }
            return reply;
          });

          return {
            ...review,
            replies: updatedReplies,
          };
        }
        return review;
      })
    );
  };

  const handleToggleReplies = (reviewId: string) => {
    setReviews(prevReviews =>
      prevReviews.map(review => {
        if (review.id === reviewId) {
          return {
            ...review,
            showReplies: !review.showReplies,
          };
        }
        return review;
      })
    );
  };

  const handleToggleReplyForm = (reviewId: string) => {
    setReviews(prevReviews =>
      prevReviews.map(review => {
        if (review.id === reviewId) {
          return {
            ...review,
            showReplyForm: !review.showReplyForm,
            showReplies: true, // Auto-show replies when replying
          };
        }
        return review;
      })
    );
  };

  const handleSubmitReply = (reviewId: string) => {
    const replyText = replyTexts[reviewId];
    if (!replyText?.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a reply',
        variant: 'destructive',
      });
      return;
    }

    const newReply: ReviewReply = {
      id: `${reviewId}-${Date.now()}`,
      userName: user?.name || 'Anonymous',
      comment: replyText,
      timestamp: new Date(),
      helpful: 0,
      notHelpful: 0,
      userVote: null,
    };

    setReviews(prevReviews =>
      prevReviews.map(review => {
        if (review.id === reviewId) {
          return {
            ...review,
            replies: [...(review.replies || []), newReply],
            showReplyForm: false,
          };
        }
        return review;
      })
    );

    // Clear reply text
    setReplyTexts(prev => ({
      ...prev,
      [reviewId]: '',
    }));

    toast({
      title: 'Success',
      description: 'Reply posted successfully',
    });
  };

  const handleSubmitReview = () => {
    if (!reviewText.trim() || userRating === 0) {
      toast({
        title: 'Error',
        description: 'Please provide both rating and review text',
        variant: 'destructive',
      });
      return;
    }

    setSubmittingReview(true);

    // Mock submit review
    setTimeout(() => {
      const newReview: Review = {
        id: Date.now().toString(),
        userName: user?.name || 'Anonymous',
        rating: userRating,
        comment: reviewText,
        timestamp: new Date(),
        helpful: 0,
        notHelpful: 0,
        isRecommended: userRating >= 4,
        userVote: null,
        replies: [],
        showReplies: false,
        showReplyForm: false,
      };

      // Add new review at the beginning (latest first)
      setReviews([newReview, ...reviews].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
      setShowReviewForm(false);
      setReviewText('');
      setUserRating(0);
      setSubmittingReview(false);

      toast({
        title: 'Success',
        description: 'Your review has been submitted',
      });
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-2">Skill not found</h2>
        <p className="text-muted-foreground mb-4">The skill you're looking for doesn't exist.</p>
        <Button onClick={() => router.push('/')}>Go to Home</Button>
      </div>
    );
  }

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : skill.stats.rating || 0;

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
              <Link
                href={`/users/${skill.author.username || skill.author.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <Avatar className="h-12 w-12 border-2 border-white/20">
                  <AvatarImage src={skill.author.avatar} />
                  <AvatarFallback className="bg-white/20 text-white">
                    {skill.author.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg hover:underline">{skill.author.name}</p>
                  <p className="text-sm text-white/70">
                    Updated {formatDistanceToNow(new Date(skill.lastUpdated), { addSuffix: true })}
                  </p>
                </div>
              </Link>

              {/* Quick Stats */}
              <div className="flex items-center gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span className="font-semibold">{(skill.stats.installs / 1000).toFixed(1)}k</span>
                  <span className="text-sm text-white/70">installs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5" />
                  <span className="font-semibold">{(skill.stats.totalConversations / 1000).toFixed(0)}k</span>
                  <span className="text-sm text-white/70">conversations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{averageRating.toFixed(1)}</span>
                  <span className="text-sm text-white/70">({reviews.length} reviews)</span>
                </div>
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
              <Button
                size="lg"
                variant="secondary"
                onClick={handleInstall}
                disabled={installing}
                className={cn(
                  "bg-white/20 text-white border-white/30 hover:bg-white/30",
                  isInstalled && "hover:bg-red-500/20 hover:border-red-500/30"
                )}
              >
                {installing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {isInstalled ? 'Uninstalling...' : 'Installing...'}
                  </>
                ) : isInstalled ? (
                  <>
                    <X className="mr-2 h-5 w-5" />
                    Uninstall
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-5 w-5" />
                    Add to My Skills
                  </>
                )}
              </Button>
              {skill.githubUrl && (
                <Button
                  size="lg"
                  variant="ghost"
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                  asChild
                >
                  <a href={skill.githubUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-5 w-5" />
                    View on GitHub
                  </a>
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
                onClick={handleLike}
                className={cn(
                  "text-white hover:bg-white/20",
                  isLiked && "text-red-400"
                )}
              >
                <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Audience Tags */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-muted-foreground mr-2">Perfect for:</span>
              {skill.audienceTags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-sm">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* README Section - Single Card for All Documentation */}
            <div ref={overviewRef}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Documentation
                  </CardTitle>
                  <CardDescription>
                    Complete guide and documentation for {skill.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    {/* In production, this would render the actual README.md content */}
                    {readmeContent ? (
                      <div dangerouslySetInnerHTML={{ __html: readmeContent }} />
                    ) : (
                      <div className="space-y-6">
                        <section>
                          <h3 className="text-lg font-semibold mb-3">Overview</h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {skill.longDescription}
                          </p>
                        </section>

                        <section>
                          <h3 className="text-lg font-semibold mb-3">Key Features</h3>
                          <ul className="space-y-2 list-disc pl-5 text-muted-foreground">
                            <li>Advanced AI-powered analysis and generation</li>
                            <li>Customizable workflows and templates</li>
                            <li>Real-time collaboration features</li>
                            <li>Export to multiple formats</li>
                            <li>Integration with popular tools</li>
                          </ul>
                        </section>

                        <section>
                          <h3 className="text-lg font-semibold mb-3">Getting Started</h3>
                          <div className="space-y-3">
                            <p className="text-muted-foreground">
                              To get started with {skill.name}, simply click the "Start Chat" button above.
                            </p>
                            <div className="bg-muted p-4 rounded-lg">
                              <p className="text-sm font-medium mb-2">Example Usage:</p>
                              <code className="text-sm text-muted-foreground">
                                {skill.examples?.[0] || 'Ask me to help with your specific task'}
                              </code>
                            </div>
                          </div>
                        </section>

                        <section>
                          <h3 className="text-lg font-semibold mb-3">Version History</h3>
                          <div className="text-muted-foreground">
                            <p>Version {skill.version || '1.0.0'}</p>
                            <p className="text-sm">Last updated: {formatDistanceToNow(new Date(skill.lastUpdated), { addSuffix: true })}</p>
                          </div>
                        </section>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Reviews and Stats */}
          <div className="space-y-6">
            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Reviews ({reviews.length})
                  </CardTitle>
                  <div className="text-2xl font-bold flex items-center gap-1">
                    {averageRating.toFixed(1)}
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  </div>
                </div>
                <CardDescription>
                  {averageRating >= 4 ? '4.0 Rating' : 'Share your experience'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Rating Distribution - Clickable */}
                <div className="space-y-2">
                  {selectedRating && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        Showing {selectedRating}-star reviews
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRating(null)}
                      >
                        Clear filter
                      </Button>
                    </div>
                  )}
                  {[5, 4, 3, 2, 1].map(rating => {
                    const count = reviews.filter(r => r.rating === rating).length;
                    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div
                        key={rating}
                        className={cn(
                          "flex items-center gap-2 cursor-pointer rounded-md px-2 py-1 transition-colors",
                          selectedRating === rating ? "bg-muted" : "hover:bg-muted/50"
                        )}
                        onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
                      >
                        <span className="text-sm w-3">{rating}</span>
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <Progress value={percentage} className="flex-1 h-2" />
                        <span className="text-sm text-muted-foreground w-10 text-right">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Write Review Button */}
                {!showReviewForm ? (
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => setShowReviewForm(true)}
                  >
                    Post Review
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => setUserRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={cn(
                              "h-5 w-5",
                              star <= userRating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            )}
                          />
                        </button>
                      ))}
                    </div>
                    <Textarea
                      placeholder="Write your review..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSubmitReview}
                        disabled={submittingReview}
                      >
                        {submittingReview ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          'Submit Review'
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowReviewForm(false);
                          setReviewText('');
                          setUserRating(0);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Reviews List - Fixed height and scrollable */}
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {reviews
                    .filter(review => selectedRating === null || review.rating === selectedRating)
                    .map(review => (
                    <div key={review.id} className="space-y-2">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={review.userAvatar} />
                          <AvatarFallback>
                            {review.userName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Link
                              href={`/users/${review.userName.toLowerCase().replace(/\s+/g, '-')}`}
                              className="font-medium text-sm hover:underline"
                            >
                              {review.userName}
                            </Link>
                            {review.isRecommended && (
                              <Badge variant="secondary" className="text-xs">
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                Recommended
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    "h-3 w-3",
                                    i < review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  )}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(review.timestamp, { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {review.comment}
                          </p>

                          {/* Review Actions */}
                          <div className="flex items-center gap-3 mt-2">
                            <button
                              className={cn(
                                "flex items-center gap-1 text-xs hover:text-foreground transition-colors",
                                review.userVote === 'helpful'
                                  ? "text-blue-600"
                                  : "text-muted-foreground"
                              )}
                              onClick={() => handleVoteReview(review.id, 'helpful')}
                            >
                              <ThumbsUp className="h-3 w-3" />
                              {review.helpful}
                            </button>
                            <button
                              className={cn(
                                "flex items-center gap-1 text-xs hover:text-foreground transition-colors",
                                review.userVote === 'notHelpful'
                                  ? "text-red-600"
                                  : "text-muted-foreground"
                              )}
                              onClick={() => handleVoteReview(review.id, 'notHelpful')}
                            >
                              <ThumbsDown className="h-3 w-3" />
                              {review.notHelpful}
                            </button>
                            <button
                              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                              onClick={() => handleToggleReplyForm(review.id)}
                            >
                              <Reply className="h-3 w-3" />
                              Reply
                            </button>
                            {review.replies && review.replies.length > 0 && (
                              <button
                                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                                onClick={() => handleToggleReplies(review.id)}
                              >
                                {review.showReplies ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                {review.replies.length} {review.replies.length === 1 ? 'reply' : 'replies'}
                              </button>
                            )}
                          </div>

                          {/* Reply Form */}
                          {review.showReplyForm && (
                            <div className="mt-3 space-y-2">
                              <Textarea
                                placeholder="Write your reply..."
                                value={replyTexts[review.id] || ''}
                                onChange={(e) => setReplyTexts(prev => ({
                                  ...prev,
                                  [review.id]: e.target.value
                                }))}
                                className="min-h-[60px] text-sm"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSubmitReply(review.id)}
                                >
                                  Submit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    handleToggleReplyForm(review.id);
                                    setReplyTexts(prev => ({
                                      ...prev,
                                      [review.id]: ''
                                    }));
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Replies */}
                          {review.showReplies && review.replies && review.replies.length > 0 && (
                            <div className="mt-3 space-y-3 pl-6 border-l-2 border-muted">
                              {review.replies.map(reply => (
                                <div key={reply.id} className="space-y-1">
                                  <div className="flex items-start gap-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={reply.userAvatar} />
                                      <AvatarFallback className="text-xs">
                                        {reply.userName.charAt(0).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <Link
                                          href={`/users/${reply.userName.toLowerCase().replace(/\s+/g, '-')}`}
                                          className="font-medium text-xs hover:underline"
                                        >
                                          {reply.userName}
                                        </Link>
                                        <span className="text-xs text-muted-foreground">
                                          {formatDistanceToNow(reply.timestamp, { addSuffix: true })}
                                        </span>
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {reply.comment}
                                      </p>
                                      <div className="flex items-center gap-3 mt-1">
                                        <button
                                          className={cn(
                                            "flex items-center gap-1 text-xs hover:text-foreground transition-colors",
                                            reply.userVote === 'helpful'
                                              ? "text-blue-600"
                                              : "text-muted-foreground"
                                          )}
                                          onClick={() => handleVoteReply(review.id, reply.id, 'helpful')}
                                        >
                                          <ThumbsUp className="h-3 w-3" />
                                          {reply.helpful}
                                        </button>
                                        <button
                                          className={cn(
                                            "flex items-center gap-1 text-xs hover:text-foreground transition-colors",
                                            reply.userVote === 'notHelpful'
                                              ? "text-red-600"
                                              : "text-muted-foreground"
                                          )}
                                          onClick={() => handleVoteReply(review.id, reply.id, 'notHelpful')}
                                        >
                                          <ThumbsDown className="h-3 w-3" />
                                          {reply.notHelpful}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {reviews.filter(review => selectedRating === null || review.rating === selectedRating).length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-4">
                      {selectedRating
                        ? `No ${selectedRating}-star reviews yet.`
                        : 'No reviews yet. Be the first to review!'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Installs</span>
                  <span className="font-semibold">{skill.stats.installs.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Conversations</span>
                  <span className="font-semibold">{skill.stats.totalConversations.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Version</span>
                  <span className="font-semibold">{skill.version}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Updated</span>
                  <span className="font-semibold">
                    {formatDistanceToNow(new Date(skill.lastUpdated), { addSuffix: true })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Skills */}
        {relatedSkills.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedSkills.slice(0, 4).map((relatedSkill) => (
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