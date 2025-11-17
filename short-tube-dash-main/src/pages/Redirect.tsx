import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getURL } from '@/lib/storage';
import { trackClick } from '@/lib/analytics';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const Redirect = () => {
  const { shortId } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(false);

  useEffect(() => {
    console.log('Redirect component loaded');
    console.log('Short ID from URL:', shortId);

    if (!shortId) {
      console.log('No short ID provided');
      setError(true);
      return;
    }

    // Get the URL data
    const urlData = getURL(shortId);
    console.log('URL data found:', urlData);

    if (!urlData) {
      console.log('URL not found in storage');
      setError(true);
      return;
    }

    console.log('Original URL:', urlData.originalUrl);

    // Track the click
    trackClick(shortId);

    // Ensure the original URL has a protocol
    let targetUrl = urlData.originalUrl;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    console.log('Redirecting to:', targetUrl);

    // Immediate redirect to the ORIGINAL URL
    setTimeout(() => {
      window.location.href = targetUrl;
    }, 1000);
  }, [shortId, navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-4">Short URL not found</p>
          <p className="text-sm text-muted-foreground mb-8">Short ID: {shortId}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-primary hover:underline"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
        <p className="text-xl text-muted-foreground">Redirecting to your destination...</p>
        <p className="text-sm text-muted-foreground mt-2">Short ID: {shortId}</p>
      </motion.div>
    </div>
  );
};

export default Redirect;
