'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  ThumbsUp,
  ThumbsDown,
  Reply,
  ChevronDown,
  ChevronUp,
  Star,
  MessageCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface ReviewReply {
  id: string;
  userName: string;
  userAvatar?: string;
  comment: string;
  timestamp: string | Date;
  helpful: number;
  notHelpful: number;
  userVote?: 'helpful' | 'notHelpful' | null;
}

interface Review {
  id: string;
  skillId?: string;
  skillName?: string;
  skillSlug?: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  timestamp: string | Date;
  helpful: number;
  notHelpful: number;
  isRecommended?: boolean;
  userVote?: 'helpful' | 'notHelpful' | null;
  replies?: ReviewReply[];
  showReplies?: boolean;
  showReplyForm?: boolean;
}

interface ReviewsListProps {
  reviews: Review[];
  showSkillInfo?: boolean;
  onVoteReview?: (reviewId: string, voteType: 'helpful' | 'notHelpful') => void;
  onVoteReply?: (reviewId: string, replyId: string, voteType: 'helpful' | 'notHelpful') => void;
  onSubmitReply?: (reviewId: string, replyText: string) => void;
  currentUser?: { name: string; avatar?: string };
}

export default function ReviewsList({
  reviews,
  showSkillInfo = false,
  onVoteReview,
  onVoteReply,
  onSubmitReply,
  currentUser
}: ReviewsListProps) {
  const { toast } = useToast();
  const [localReviews, setLocalReviews] = useState(reviews);
  const [replyTexts, setReplyTexts] = useState<{ [key: string]: string }>({});

  const handleVoteReview = (reviewId: string, voteType: 'helpful' | 'notHelpful') => {
    if (onVoteReview) {
      onVoteReview(reviewId, voteType);
    } else {
      // Local state update
      setLocalReviews(prevReviews =>
        prevReviews.map(review => {
          if (review.id === reviewId) {
            let newHelpful = review.helpful;
            let newNotHelpful = review.notHelpful;

            if (review.userVote === 'helpful') {
              newHelpful--;
            } else if (review.userVote === 'notHelpful') {
              newNotHelpful--;
            }

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
    }
  };

  const handleVoteReply = (reviewId: string, replyId: string, voteType: 'helpful' | 'notHelpful') => {
    if (onVoteReply) {
      onVoteReply(reviewId, replyId, voteType);
    } else {
      // Local state update
      setLocalReviews(prevReviews =>
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
    }
  };

  const handleToggleReplies = (reviewId: string) => {
    setLocalReviews(prevReviews =>
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
    setLocalReviews(prevReviews =>
      prevReviews.map(review => {
        if (review.id === reviewId) {
          return {
            ...review,
            showReplyForm: !review.showReplyForm,
            showReplies: true,
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

    if (onSubmitReply) {
      onSubmitReply(reviewId, replyText);
    } else {
      // Local state update
      const newReply: ReviewReply = {
        id: `${reviewId}-${Date.now()}`,
        userName: currentUser?.name || 'Anonymous',
        comment: replyText,
        timestamp: new Date(),
        helpful: 0,
        notHelpful: 0,
        userVote: null,
      };

      setLocalReviews(prevReviews =>
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

      toast({
        title: 'Success',
        description: 'Reply posted successfully',
      });
    }

    setReplyTexts(prev => ({
      ...prev,
      [reviewId]: '',
    }));
  };

  return (
    <div className="space-y-4">
      {localReviews.map(review => (
        <div key={review.id} className="p-4 border rounded-lg space-y-2">
          {/* Skill Info (if showing on profile page) */}
          {showSkillInfo && review.skillName && review.skillSlug && (
            <div className="mb-2">
              <Link
                href={`/skills/${review.skillSlug}`}
                className="text-sm font-medium text-primary hover:underline"
              >
                {review.skillName}
              </Link>
            </div>
          )}

          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={review.userAvatar} />
              <AvatarFallback>
                {review.userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{review.userName}</span>
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
                  {formatDistanceToNow(new Date(review.timestamp), { addSuffix: true })}
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
                            <span className="font-medium text-xs">{reply.userName}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(reply.timestamp), { addSuffix: true })}
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

      {localReviews.length === 0 && (
        <div className="text-center py-8">
          <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No reviews yet</p>
        </div>
      )}
    </div>
  );
}