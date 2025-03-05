'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, Share2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShareModalProps {
  noteId: string;
  className?: string;
}

export function ShareModal({ noteId, className }: ShareModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [expiresInDays, setExpiresInDays] = useState<number>(7);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateLink = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/notes/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          noteId,
          expiresInDays,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate share link');
      }
      
      const data = await response.json();
      setShareLink(data.shareLink);
    } catch (err) {
      console.error('Error generating share link:', err);
      setError((err as Error).message || 'Failed to generate share link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const toggleModal = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setShareLink(null);
      setError(null);
    }
  };

  return (
    <div className="relative">
      <Button 
        variant="outline" 
        size="sm" 
        className={cn("gap-2", className)}
        onClick={toggleModal}
      >
        <Share2 className="size-4" />
        Share
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-md border bg-background p-4 shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Share Note</h3>
            <Button variant="ghost" size="icon" onClick={toggleModal}>
              <X className="size-4" />
            </Button>
          </div>
          
          <div className="mt-4 space-y-4">
            {shareLink ? (
              <div className="space-y-2">
                <label htmlFor="share-link" className="text-xs font-medium">Share link</label>
                <div className="flex items-center gap-2">
                  <Input
                    id="share-link"
                    value={shareLink}
                    readOnly
                    className="flex-1 text-xs"
                  />
                  <Button 
                    size="icon" 
                    onClick={handleCopyLink}
                    variant="outline"
                  >
                    {isCopied ? (
                      <Check className="size-4" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This link will expire in {expiresInDays} days
                </p>
              </div>
            ) : (
              <Button 
                onClick={handleGenerateLink} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Generating...' : 'Generate Share Link'}
              </Button>
            )}
            
            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 