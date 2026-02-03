'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skill } from '@/types/skill';
import {
  Users,
  MessageCircle,
  Star,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SkillCardProps {
  skill: Skill;
  onUseInKael?: () => void;
}

const categoryColors: Record<string, string> = {
  'Job Hunting': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Health & Lifestyle': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Academic': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  'Business': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  'Programming': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Marketing': 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400',
  'Image Generator': 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  'Prompt Generator': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
};

export default function SkillCard({ skill, onUseInKael }: SkillCardProps) {
  const handleUseInKael = () => {
    const kaelUrl = `${process.env.NEXT_PUBLIC_KAEL_CHAT_URL || 'https://kael.im/chat'}?skillSlug=${skill.slug}`;
    window.open(kaelUrl, '_blank');
    onUseInKael?.();
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:border-purple-200 dark:hover:border-purple-800 flex flex-col h-full">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <Badge
            variant="secondary"
            className={categoryColors[skill.category] || 'bg-gray-100 text-gray-700'}
          >
            {skill.category}
          </Badge>
          {skill.author.isOfficial && (
            <Badge variant="outline" className="text-xs">
              Official
            </Badge>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold group-hover:text-purple-600 transition-colors line-clamp-1">
            {skill.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {skill.shortDescription}
          </p>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        {/* Audience Tags */}
        <div className="flex flex-wrap gap-1.5">
          {skill.audienceTags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {skill.audienceTags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{skill.audienceTags.length - 3}
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {skill.stats.installs.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              {(skill.stats.totalConversations / 1000).toFixed(1)}k
            </span>
            {skill.stats.rating && (
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                {skill.stats.rating}
              </span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 pt-0">
        <Button
          onClick={handleUseInKael}
          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
        >
          Use in Kael
          <ExternalLink className="ml-2 h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/skills/${skill.slug}`}>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
