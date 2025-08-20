import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Moon, Sun, MessageCircle, LogOut, User, Settings } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';

const Navigation: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      // Clean up auth state
      localStorage.clear();
      await supabase.auth.signOut({ scope: 'global' });
      navigate('/');
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account."
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const openTelegramChat = () => {
    window.open('https://t.me/your_telegram_bot', '_blank');
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-gradient-surface backdrop-blur-md border-b border-border shadow-medium">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
            <span className="text-primary-foreground font-bold text-sm">LT</span>
          </div>
          <span className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
            LunarTrades
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          {user ? (
            <>
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              {isAdmin && (
                <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
                  Admin Panel
                </Link>
              )}
            </>
          ) : (
            <>
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">
                Login
              </Link>
            </>
          )}
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-2">
          {/* Telegram Chat Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={openTelegramChat}
            className="hover:shadow-glow transition-all duration-300"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="hover:shadow-glow transition-all duration-300"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* User Actions */}
          {user ? (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate('/profile')}
                className="hover:shadow-glow transition-all duration-300"
              >
                <User className="h-4 w-4" />
              </Button>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigate('/admin')}
                  className="hover:shadow-glow transition-all duration-300"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={handleSignOut}
                className="hover:shadow-glow hover:border-destructive hover:text-destructive transition-all duration-300"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => navigate('/auth')}
              className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
            >
              Get Started
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;