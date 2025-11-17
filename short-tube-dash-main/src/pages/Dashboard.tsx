import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser, addURL, getUserURLs } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import URLCard from '@/components/URLCard';
import { Link2, Plus, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [longUrl, setLongUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [urls, setUrls] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadUrls();
  }, [user, navigate]);

  const loadUrls = () => {
    if (user) {
      const userUrls = getUserURLs(user.id);
      setUrls(userUrls);
    }
  };

  const handleShorten = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    // Clean and validate URL
    let cleanUrl = longUrl.trim();
    
    // Add https:// if no protocol specified
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }
    
    // Validate URL format
    try {
      new URL(cleanUrl);
    } catch {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid URL (e.g., youtube.com/watch?v=...)',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const shortId = nanoid(8);
      addURL(shortId, cleanUrl, user.id);
      
      toast({
        title: 'URL shortened!',
        description: `Now redirects to: ${cleanUrl}`,
      });
      
      setLongUrl('');
      loadUrls();
      setIsLoading(false);
    }, 500);
  };

  const filteredUrls = Object.entries(urls).filter(([shortId, data]: any) => 
    data.originalUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shortId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Link2 className="h-6 w-6 text-primary" />
                Shorten URL
              </CardTitle>
              <CardDescription>
                Enter a long URL and get a short, shareable link
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleShorten} className="flex gap-4">
                <Input
                  type="text"
                  placeholder="youtube.com/watch?v=... or https://example.com"
                  value={longUrl}
                  onChange={(e) => setLongUrl(e.target.value)}
                  className="flex-1"
                  required
                />
                <Button type="submit" disabled={isLoading}>
                  <Plus className="mr-2 h-4 w-4" />
                  {isLoading ? 'Shortening...' : 'Shorten'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Your URLs</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search URLs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredUrls.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">
                  {searchQuery ? 'No URLs match your search' : 'No URLs yet. Create your first short URL above!'}
                </p>
              </Card>
            ) : (
              filteredUrls.map(([shortId, data]: any) => (
                <URLCard
                  key={shortId}
                  shortId={shortId}
                  originalUrl={data.originalUrl}
                  clicks={data.clicks}
                  createdAt={data.createdAt}
                  onDelete={loadUrls}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
