import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Trash2, BarChart3, QrCode, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { deleteURL } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { motion } from 'framer-motion';

interface URLCardProps {
  shortId: string;
  originalUrl: string;
  clicks: number;
  createdAt: string;
  onDelete: () => void;
}

const URLCard = ({ shortId, originalUrl, clicks, createdAt, onDelete }: URLCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Clean short URL display
  const getDisplayUrl = () => {
    return `${window.location.origin.replace(/^https?:\/\//, '')}/go/${shortId}`;
  };
  
  const shortUrl = `${window.location.origin}/go/${shortId}`;
  const displayUrl = getDisplayUrl();

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    toast({
      title: 'Copied!',
      description: 'Short URL copied to clipboard',
    });
  };

  const handleDelete = () => {
    deleteURL(shortId);
    onDelete();
    toast({
      title: 'Deleted',
      description: 'URL has been deleted',
      variant: 'destructive',
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-4 hover-lift">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <a
                  href={shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-primary hover:underline"
                >
                  {displayUrl}
                </a>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground truncate">{originalUrl}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{clicks} clicks</span>
                <span>Created {new Date(createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" onClick={handleCopy}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => navigate(`/analytics/${shortId}`)}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => navigate(`/qr?url=${encodeURIComponent(shortUrl)}`)}
              >
                <QrCode className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your short URL and all its analytics data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default URLCard;
