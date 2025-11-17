import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, QrCode, BarChart3 } from 'lucide-react';
import { logoutUser, getCurrentUser } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

const Navbar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getCurrentUser();

  const handleLogout = () => {
    logoutUser();
    toast({
      title: 'Logged out successfully',
      description: 'See you next time!',
    });
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <span className="text-xl font-bold text-primary-foreground">ST</span>
          </div>
          <span className="text-xl font-bold">ShortTube</span>
        </Link>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin">
              <BarChart3 className="mr-2 h-4 w-4" />
              Admin
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/qr">
              <QrCode className="mr-2 h-4 w-4" />
              QR
            </Link>
          </Button>
          
          {user && (
            <>
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
