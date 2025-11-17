import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/storage';
import { getAnalyticsSummary, getOverallStats } from '@/lib/analytics';
import Navbar from '@/components/Navbar';
import { BarChart3, ExternalLink, PieChartIcon, Activity, Link, QrCode } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Analytics = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [overallStats, setOverallStats] = useState<any>(null);
  const [viewType, setViewType] = useState<'bar' | 'pie'>('pie');
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    
    const stats = getOverallStats();
    setOverallStats(stats);

    if (id) {
      const data = getAnalyticsSummary(id);
      if (data) {
        setAnalytics(data);
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, id, navigate]);

  if (!analytics) return null;

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))', 'hsl(var(--muted))', 'hsl(var(--card))'];

  const shortUrl = `${window.location.origin}/go/${id}`;

  return (
    <div className="min-h-screen bg-background">  
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <BarChart3 className="h-8 w-8 text-primary" />
                Analytics
              </h1>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-muted-foreground">
                  Short URL: <a href={shortUrl} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                    {shortUrl} <ExternalLink className="inline h-3 w-3" />
                  </a>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex gap-1 bg-card rounded-lg p-1">
                <Button
                  variant={viewType === 'pie' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewType('pie')}
                >
                  <PieChartIcon className="h-4 w-4 mr-2" />
                  Pie
                </Button>
                <Button
                  variant={viewType === 'bar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewType('bar')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Bar
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Total Clicks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalClicks}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  URLs Shortened
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overallStats?.totalUrls || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  QR Codes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overallStats?.totalQRs || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Desktop</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.devices.find((d: any) => d.name === 'Desktop')?.value || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="activity">Activity Overview</TabsTrigger>
              <TabsTrigger value="devices">Devices</TabsTrigger>
              <TabsTrigger value="browsers">Browsers</TabsTrigger>
              <TabsTrigger value="locations">Locations</TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Activity Overview
                  </CardTitle>
                  <CardDescription>Your overall platform activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-end mb-4">
                    <div className="flex gap-1 bg-card rounded-lg p-1">
                      <Button
                        variant={viewType === 'pie' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewType('pie')}
                      >
                        <PieChartIcon className="h-4 w-4 mr-2" />
                        Pie
                      </Button>
                      <Button
                        variant={viewType === 'bar' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewType('bar')}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Bar
                      </Button>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={400}>
                    {viewType === 'pie' ? (
                      <PieChart>
                        <Pie
                          data={overallStats?.activityData || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          animationBegin={0}
                          animationDuration={1000}
                        >
                          {overallStats?.activityData?.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                      </PieChart>
                    ) : (
                      <BarChart data={overallStats?.activityData || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="value" fill="hsl(var(--primary))" animationBegin={0} animationDuration={1000} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="devices" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Device Breakdown</CardTitle>
                  <CardDescription>Clicks by device type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    {viewType === 'pie' ? (
                      <PieChart>
                        <Pie
                          data={analytics.devices}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          animationBegin={0}
                          animationDuration={1000}
                        >
                          {analytics.devices.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                      </PieChart>
                    ) : (
                      <BarChart data={analytics.devices}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="value" fill="hsl(var(--primary))" animationBegin={0} animationDuration={1000} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="browsers" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Browser Distribution</CardTitle>
                  <CardDescription>Clicks by browser</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    {viewType === 'pie' ? (
                      <PieChart>
                        <Pie
                          data={analytics.browsers}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          animationBegin={0}
                          animationDuration={1000}
                        >
                          {analytics.browsers.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                      </PieChart>
                    ) : (
                      <BarChart data={analytics.browsers}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="value" fill="hsl(var(--primary))" animationBegin={0} animationDuration={1000} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="locations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Locations</CardTitle>
                  <CardDescription>Geographic distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    {viewType === 'pie' ? (
                      <PieChart>
                        <Pie
                          data={analytics.locations}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          animationBegin={0}
                          animationDuration={1000}
                        >
                          {analytics.locations.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                      </PieChart>
                    ) : (
                      <BarChart data={analytics.locations} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                        <YAxis dataKey="name" type="category" width={120} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="value" fill="hsl(var(--accent))" animationBegin={0} animationDuration={1000} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>


        </motion.div>
      </main>
    </div>
  );
};

export default Analytics;
