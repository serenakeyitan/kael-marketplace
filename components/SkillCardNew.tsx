'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skill } from '@/types/skill';
import { Heart, Users, MessageCircle, Eye, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SkillCardNewProps {
  skill: Skill;
  onUseSkill?: () => void;
}

export default function SkillCardNew({ skill, onUseSkill }: SkillCardNewProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showRedirectDialog, setShowRedirectDialog] = useState(false);
  const router = useRouter();

  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if not clicking on a button or link
    if (!(e.target as HTMLElement).closest('button')) {
      router.push(`/skills/${skill.slug}`);
    }
  };

  const handleTryNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowRedirectDialog(true);
  };

  const handleConfirmRedirect = () => {
    const kaelUrl = `${process.env.NEXT_PUBLIC_KAEL_CHAT_URL || 'https://kael.im/chat'}?skillSlug=${skill.slug}`;
    window.open(kaelUrl, '_blank');
    setShowRedirectDialog(false);
    onUseSkill?.();
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  // Generate a gradient background for the card based on category
  const gradientMap: Record<string, string> = {
    'Career': 'from-amber-500 to-orange-600',
    'Health': 'from-emerald-500 to-teal-600',
    'Academic': 'from-indigo-500 to-purple-600',
    'Business': 'from-rose-500 to-pink-600',
    'Programming': 'from-blue-500 to-indigo-600',
    'Marketing': 'from-fuchsia-500 to-pink-600',
    'Image': 'from-violet-500 to-fuchsia-600',
    'Prompt': 'from-cyan-500 to-sky-600',
  };
  const gradient = gradientMap[skill.category] || 'from-blue-500 to-purple-600';

  // Extended description for demo (in real app, this would come from skill data)
  const extendedDescription = skill.shortDescription + " This skill leverages advanced AI capabilities to streamline your workflow and boost productivity. Perfect for professionals and enthusiasts looking to automate repetitive tasks and achieve better results in less time.";

  return (
    <>
      <div
        className="relative h-[280px] cursor-pointer group overflow-hidden"
        onClick={handleCardClick}
      >
        <Card className="border border-gray-200 bg-white h-full flex flex-col relative transition-shadow duration-300 hover:shadow-lg overflow-hidden">
          {/* Card Image/Gradient Header - Fixed */}
          <div className={cn(
            "h-32 bg-gradient-to-br relative flex-shrink-0",
            gradient
          )}>
            {/* Overlay Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 1px)`,
                backgroundSize: '20px 20px'
              }} />
            </div>

            {/* Top Bar with Category and Stats - Responsive positioning */}
            <div className="absolute top-2 sm:top-2.5 lg:top-3 left-2 sm:left-2.5 lg:left-3 right-2 sm:right-2.5 lg:right-3 flex items-center justify-between z-10">
              {/* Category Badge with responsive sizing */}
              <Badge className="bg-white/20 text-white backdrop-blur border-0 text-[10px] sm:text-[11px] lg:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1">
                {skill.category}
              </Badge>

              {/* Stats - Centered in remaining space with responsive sizing */}
              <div className="flex-1 flex items-center justify-center text-[8px] sm:text-[9px] lg:text-[10px] text-white/85">
                <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-2.5">
                  <span className="flex items-center gap-0.5">
                    <Eye className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-3.5 lg:w-3.5" />
                    {(skill.stats.installs / 1000).toFixed(1)}k
                  </span>
                  <span className="flex items-center gap-0.5">
                    <MessageCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-3.5 lg:w-3.5" />
                    {(skill.stats.weeklyUsage / 1000).toFixed(0)}k
                  </span>
                </div>
              </div>

              {/* Like Button with responsive sizing */}
              <button
                onClick={handleLike}
                className="p-1 sm:p-1.5 rounded-full bg-white/20 backdrop-blur hover:bg-white/30 transition-colors"
              >
                <Heart className={cn(
                  "h-2.5 w-2.5 sm:h-3 sm:w-3 text-white transition-colors",
                  isLiked && "fill-white"
                )} />
              </button>
            </div>
          </div>

          {/* White Content Section - Slides up on hover */}
          <div className={cn(
            "absolute left-0 right-0 bg-white/65 backdrop-blur-sm",
            "transition-all duration-500 ease-out",
            "bottom-0 h-[148px]",
            "group-hover:-translate-y-[80px]"
          )}>
            <div className="p-4 pt-4">
              {/* Author Info */}
              <div className="flex items-center gap-1.5 mb-1">
                <Avatar className="h-4 w-4">
                  <AvatarImage src={skill.author?.avatar} />
                  <AvatarFallback className="text-xs bg-gray-100">
                    {skill.author?.name?.charAt(0) || 'A'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-gray-600">{skill.author?.name || 'Anonymous'}</span>
              </div>

              {/* Title */}
              <h3 className="font-semibold text-gray-900 mb-1 text-base line-clamp-1">
                {skill.name}
              </h3>

              {/* Description - Shows more lines on hover */}
              <p className={cn(
                "text-gray-600 text-sm transition-all duration-500",
                "group-hover:line-clamp-5",
                "line-clamp-3"
              )}>
                {extendedDescription}
              </p>

              {/* Action Button - Appears on hover */}
              <div className={cn(
                "mt-3 transition-all duration-500",
                "opacity-0 group-hover:opacity-100",
                "transform translate-y-2 group-hover:translate-y-0"
              )}>
                <Button
                  onClick={handleTryNow}
                  size="sm"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                >
                  Try Now
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
          </div>

        </Card>
      </div>

      {/* Redirect Dialog */}
      <Dialog open={showRedirectDialog} onOpenChange={setShowRedirectDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Try {skill.name}</DialogTitle>
            <DialogDescription className="pt-2">
              You will be redirected to Kael.im to try this skill. Kael.im provides an AI-powered chat environment where you can interact with skills.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <p className="text-sm text-blue-900">
              Experience AI-powered automation with {skill.name}!
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowRedirectDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmRedirect}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Continue to Kael.im
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}