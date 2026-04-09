import React, { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  timestamp: string;
}

interface TrustRatingProps {
  targetId: string;
  targetName: string;
  reviews?: Review[];
  onSubmit?: (rating: number, comment: string) => void;
  compact?: boolean;
}

const StarRating: React.FC<{ value: number; onChange?: (v: number) => void; readonly?: boolean }> = ({ value, onChange, readonly }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} className={`h-4 w-4 transition-colors ${i <= value ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'} ${!readonly ? 'cursor-pointer hover:text-yellow-300' : ''}`}
        onClick={() => !readonly && onChange?.(i)} />
    ))}
  </div>
);

const TrustRating: React.FC<TrustRatingProps> = ({ targetId, targetName, reviews = [], onSubmit, compact }) => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const avg = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  const handleSubmit = () => {
    onSubmit?.(rating, comment);
    setComment('');
    setRating(5);
    setOpen(false);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
        <span className="text-xs font-medium">{avg ?? 'New'}</span>
        <span className="text-xs text-muted-foreground">({reviews.length})</span>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-medium">{avg ?? 'No ratings'}</span>
          <span className="text-xs text-muted-foreground">({reviews.length} reviews)</span>
        </div>
        {onSubmit && (
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-xs h-6 px-2">Rate</Button>
          </DialogTrigger>
        )}
      </div>
      <DialogContent className="glass-strong max-w-sm">
        <DialogHeader><DialogTitle>Rate {targetName}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-center">
            <StarRating value={rating} onChange={setRating} />
          </div>
          <Textarea value={comment} onChange={e => setComment(e.target.value)}
            placeholder="Share your experience..." className="bg-secondary/50" rows={3} />
          {reviews.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              <p className="text-xs font-medium text-muted-foreground">Recent Reviews</p>
              {reviews.slice(0, 3).map(r => (
                <div key={r.id} className="p-2 rounded bg-secondary/30 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{r.reviewerName}</span>
                    <StarRating value={r.rating} readonly />
                  </div>
                  <p className="text-muted-foreground">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
          <Button onClick={handleSubmit} className="w-full" disabled={!comment.trim()}>Submit Review</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrustRating;
