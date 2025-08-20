import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import MT5AccountForm from '@/components/MT5AccountForm';

interface Profile {
  full_name: string;
  telegram_handle: string;
}

interface MT5Account {
  id: string;
  account_id: string;
  server: string;
  initial_deposit: number;
  current_balance: number;
  profit_target_reached: boolean;
  commission_paid: boolean;
  created_at: string;
}

interface AdminSettings {
  usdt_wallet_address: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mt5Accounts, setMT5Accounts] = useState<MT5Account[]>([]);
  const [adminSettings, setAdminSettings] = useState<AdminSettings | null>(null);
  const [showMT5Form, setShowMT5Form] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      setProfile(profileData);

      // Fetch MT5 accounts (users can only see their own)
      const { data: mt5Data, error: mt5Error } = await supabase
        .from('mt5_accounts')
        .select('*')
        .eq('user_id', user?.id);

      if (mt5Error) {
        throw mt5Error;
      }

      setMT5Accounts(mt5Data || []);

      // Fetch admin settings for USDT wallet
      const { data: settingsData, error: settingsError } = await supabase
        .from('admin_settings')
        .select('usdt_wallet_address')
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        console.warn('Could not fetch admin settings:', settingsError);
      }

      setAdminSettings(settingsData);

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMT5AccountAdded = () => {
    setShowMT5Form(false);
    fetchData();
    toast({
      title: "MT5 Account Added",
      description: "Your MT5 account has been submitted successfully."
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-b from-background via-surface to-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const totalBalance = mt5Accounts.reduce((sum, account) => sum + (account.current_balance || 0), 0);
  const totalProfit = mt5Accounts.reduce((sum, account) => {
    const profit = (account.current_balance || 0) - (account.initial_deposit || 0);
    return sum + Math.max(0, profit);
  }, 0);

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-background via-surface to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {profile?.full_name || 'Trader'}!
          </h1>
          <p className="text-muted-foreground">
            Monitor your MT5 accounts and track your trading performance.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-card border-border/50 shadow-medium">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mt5Accounts.length}</div>
              <p className="text-xs text-muted-foreground">
                Active trading accounts
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 shadow-medium">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalBalance.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Across all accounts
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 shadow-medium">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">${totalProfit.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Unrealized gains
              </p>
            </CardContent>
          </Card>
        </div>

        {/* MT5 Accounts Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Your MT5 Accounts</h2>
            <Button
              onClick={() => setShowMT5Form(true)}
              className="bg-gradient-primary hover:shadow-glow"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Account
            </Button>
          </div>

          {mt5Accounts.length === 0 ? (
            <Card className="bg-gradient-card border-border/50 shadow-medium">
              <CardContent className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No MT5 Accounts Yet</h3>
                  <p>Add your first MT5 account to start professional trading management.</p>
                </div>
                <Button
                  onClick={() => setShowMT5Form(true)}
                  className="bg-gradient-primary hover:shadow-glow"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Account
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mt5Accounts.map((account) => {
                const profit = (account.current_balance || 0) - (account.initial_deposit || 0);
                const profitPercentage = account.initial_deposit ? (profit / account.initial_deposit) * 100 : 0;
                const isProfitable = profit > 0;

                return (
                  <Card key={account.id} className="bg-gradient-card border-border/50 shadow-medium">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">Account #{account.account_id}</CardTitle>
                          <CardDescription>Server: {account.server}</CardDescription>
                        </div>
                        <div className="flex flex-col gap-1">
                          {account.profit_target_reached && (
                            <Badge variant={account.commission_paid ? "default" : "destructive"}>
                              {account.commission_paid ? "Commission Paid" : "Commission Due"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Initial Deposit</p>
                          <p className="text-lg font-semibold">${account.initial_deposit?.toLocaleString() || '0'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Current Balance</p>
                          <p className="text-lg font-semibold">${account.current_balance?.toLocaleString() || '0'}</p>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t border-border/50">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Profit/Loss</span>
                          <span className={`font-semibold ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
                            ${profit.toLocaleString()} ({profitPercentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>

                      {account.profit_target_reached && !account.commission_paid && (
                        <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="h-4 w-4 text-secondary" />
                            <span className="font-semibold text-secondary">Commission Payment Required</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Your account has reached 100% profit! Please pay the 50% commission to continue trading.
                          </p>
                          {adminSettings?.usdt_wallet_address && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">USDT Wallet Address:</p>
                              <code className="text-xs bg-surface-elevated px-2 py-1 rounded border break-all">
                                {adminSettings.usdt_wallet_address}
                              </code>
                            </div>
                          )}
                        </div>
                      )}

                      {account.commission_paid && (
                        <div className="flex items-center gap-2 text-green-500">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm">Commission paid - Trading active</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Commission Policy */}
        <Card className="mt-8 bg-gradient-card border-border/50 shadow-medium">
          <CardHeader>
            <CardTitle>Commission Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                • <strong>No upfront fees:</strong> We only earn when you profit
              </p>
              <p>
                • <strong>50% commission:</strong> Paid only after your account doubles (100% profit)
              </p>
              <p>
                • <strong>One-time payment:</strong> Commission is paid once per profit milestone
              </p>
              <p>
                • <strong>Trading suspension:</strong> Trading pauses until commission is confirmed
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MT5 Account Form Modal */}
      {showMT5Form && (
        <MT5AccountForm
          onClose={() => setShowMT5Form(false)}
          onAccountAdded={handleMT5AccountAdded}
        />
      )}
    </div>
  );
};

export default Dashboard;