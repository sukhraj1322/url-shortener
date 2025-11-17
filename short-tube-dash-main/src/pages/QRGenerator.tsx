import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser, addURL, incrementQRCount } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { QrCode, Link2, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const QRGenerator = () => {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [originalUrl, setOriginalUrl] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Check if URL is passed via query param
    const urlParam = searchParams.get('url');
    if (urlParam) {
      setShortUrl(urlParam);
    }
  }, [user, navigate, searchParams]);

  const handleGenerate = (e: React.FormEvent) => {
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

    const shortId = nanoid(8);
    addURL(shortId, cleanUrl, user.id);
    incrementQRCount(shortId);
    const newShortUrl = `${window.location.origin}/go/${shortId}`;
    setShortUrl(newShortUrl);
    setOriginalUrl(cleanUrl);

    toast({
      title: 'QR Code generated!',
      description: `QR code links directly to: ${cleanUrl}`,
    });
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = 'qr-code.png';
      downloadLink.href = pngFile;
      downloadLink.click();

      toast({
        title: 'Downloaded!',
        description: 'QR code has been saved',
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  // Clean URL display function
  const getDisplayUrl = () => {
    return shortUrl.replace(/^https?:\/\//, '');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-2xl mx-auto space-y-8"
        >
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <QrCode className="h-8 w-8 text-primary" />
              QR Code Generator
            </h1>
            <p className="text-muted-foreground mt-2">
              Generate QR codes that link directly to your destination
            </p>
          </div>

          {!shortUrl ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-primary" />
                  Enter URL
                </CardTitle>
                <CardDescription>
                  We'll shorten it and generate a QR code
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerate} className="space-y-4">
                  <Input
                    type="text"
                    placeholder="youtube.com/watch?v=... or https://example.com"
                    value={longUrl}
                    onChange={(e) => setLongUrl(e.target.value)}
                    required
                  />
                  <Button type="submit" className="w-full">
                    Generate QR Code
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Your QR Code</CardTitle>
                <CardDescription>Scan to go directly to your destination</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-6">
                <div className="p-8 bg-white rounded-lg">
                  <QRCodeSVG
                    id="qr-code"
                    value={originalUrl}
                    size={256}
                    level="H"
                    includeMargin
                  />
                </div>
                
                <div className="w-full space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Short URL</p>
                    <a
                      href={shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline break-all"
                    >
                      {getDisplayUrl()}
                    </a>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Destination (QR links here)</p>
                    <p className="text-foreground break-all text-sm">
                      {originalUrl}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleDownloadQR} className="flex-1">
                      <Download className="mr-2 h-4 w-4" />
                      Download QR Code
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShortUrl('');
                        setLongUrl('');
                        setOriginalUrl('');
                      }}
                      className="flex-1"
                    >
                      Generate Another
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default QRGenerator;
