import { ClickEvent, getURLs, saveURLs } from './storage';

// Device detection
export const detectDevice = (): string => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'Tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'Mobile';
  }
  return 'Desktop';
};

// Browser detection
export const detectBrowser = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  return 'Other';
};

// Fake location generator
const locations = [
  'New York, USA',
  'London, UK',
  'Tokyo, Japan',
  'Paris, France',
  'Berlin, Germany',
  'Sydney, Australia',
  'Toronto, Canada',
  'Mumbai, India',
  'Singapore',
  'Dubai, UAE',
];

export const getFakeLocation = (): string => {
  return locations[Math.floor(Math.random() * locations.length)];
};

// Track a click
export const trackClick = (shortId: string): void => {
  const urls = getURLs();
  const url = urls[shortId];
  
  if (!url) return;
  
  const clickEvent: ClickEvent = {
    timestamp: new Date().toISOString(),
    device: detectDevice(),
    browser: detectBrowser(),
    location: getFakeLocation(),
  };
  
  url.clicks += 1;
  url.history.push(clickEvent);
  
  saveURLs(urls);
};

// Get analytics summary
export const getAnalyticsSummary = (shortId: string) => {
  const urls = getURLs();
  const url = urls[shortId];
  
  if (!url) return null;
  
  const deviceCounts: { [key: string]: number } = {};
  const browserCounts: { [key: string]: number } = {};
  const locationCounts: { [key: string]: number } = {};
  
  url.history.forEach(event => {
    deviceCounts[event.device] = (deviceCounts[event.device] || 0) + 1;
    browserCounts[event.browser] = (browserCounts[event.browser] || 0) + 1;
    locationCounts[event.location] = (locationCounts[event.location] || 0) + 1;
  });
  
  return {
    totalClicks: url.clicks,
    devices: Object.entries(deviceCounts).map(([name, value]) => ({ name, value })),
    browsers: Object.entries(browserCounts).map(([name, value]) => ({ name, value })),
    locations: Object.entries(locationCounts).map(([name, value]) => ({ name, value })),
    history: url.history,
    originalUrl: url.originalUrl,
    createdAt: url.createdAt,
  };
};

// Get overall statistics
export const getOverallStats = () => {
  const urls = getURLs();
  const allUrls = Object.entries(urls);

  const totalUrls = allUrls.length;
  const totalClicks = allUrls.reduce((sum, [_, url]) => sum + url.clicks, 0);
  const totalQRs = allUrls.reduce((sum, [_, url]) => sum + url.qrCount, 0);

  // Most clicked
  const mostClicked = allUrls.reduce((max, [id, url]) => {
    return url.clicks > (max?.clicks || 0) ? { id, ...url } : max;
  }, null as any);

  // Today's traffic
  const today = new Date().toDateString();
  const todayClicks = allUrls.reduce((sum, [_, url]) => {
    const todayEvents = url.history.filter(event =>
      new Date(event.timestamp).toDateString() === today
    );
    return sum + todayEvents.length;
  }, 0);

  // Activity data for pie charts
  const activityData = [
    { name: 'URLs Shortened', value: totalUrls, color: '#8884d8' },
    { name: 'Total Clicks', value: totalClicks, color: '#82ca9d' },
    { name: 'QR Codes Generated', value: totalQRs, color: '#ffc658' },
  ];

  return {
    totalUrls,
    totalClicks,
    totalQRs,
    mostClicked,
    todayClicks,
    activityData,
  };
};
