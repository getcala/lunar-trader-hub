import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Settings, 
  DollarSign, 
  Edit, 
  Save, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

interface User {
  id: string;
  full_name: string;
  telegram_handle: string;
  email: string;
  created_at: string;
}

interface MT5Account {
  id: string;
  user_id: string;
  account_id: string;
  password: string;
  server: string;
  initial_deposit: number;
  current_balance: number;
  profit_target_reached: boolean;
  commission_paid: boolean;
  created_at: string;
}

interface AdminSettings {
  id: string;
  fbs_partner_link: string;
  usdt_wallet_address: string;
  telegram_bot_username: string;
  updated_at: string;
}

const Admin: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [mt5Accounts, setMT5Accounts] = useState<MT5Account[]>([]);
  const [adminSettings, setAdminSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [editingSettings, setEditingSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    fbs_partner_link: '',
    usdt_wallet_address: '',
    telegram_bot_username: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!isAdmin) {
      navigate('/dashboard');
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin panel.",
        variant: "destructive"
      });
      return;
    }
    fetchData();
  }, [user, isAdmin, navigate]);

  const fetchData = async () => {
    try {
      // Fetch all users with profiles
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          telegram_handle,
          created_at
        `);

      if (userError) throw userError;

      // Get emails from auth.users metadata
      const usersWithEmails = await Promise.all(
        (userData || []).map(async (profile) => {
          try {
            const { data: authData } = await supabase.auth.admin.getUserById(profile.user_id);
            return {
              id: profile.user_id,
              full_name: profile.full_name,
              telegram_handle: profile.telegram_handle,
              email: authData.user?.email || 'N/A',
              created_at: profile.created_at
            };
          } catch (error) {
            return {
              id: profile.user_id,
              full_name: profile.full_name,
              telegram_handle: profile.telegram_handle,
              email: 'N/A',
              created_at: profile.created_at
            };
          }
        })
      );

      setUsers(usersWithEmails);

      // Fetch all MT5 accounts
      const { data: mt5Data, error: mt5Error } = await supabase
        .from('mt5_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (mt5Error) throw mt5Error;
      setMT5Accounts(mt5Data || []);

      // Fetch admin settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('admin_settings')
        .select('*')
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        console.warn('Error fetching settings:', settingsError);
      } else if (settingsData) {
        setAdminSettings(settingsData);
        setSettingsForm({
          fbs_partner_link: settingsData.fbs_partner_link || '',
          usdt_wallet_address: settingsData.usdt_wallet_address || '',
          telegram_bot_username: settingsData.telegram_bot_username || ''
        });
      }

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

  const updateMT5Account = async (accountId: string, updates: Partial<MT5Account>) => {
    try {
      const { error } = await supabase
        .from('mt5_accounts')
        .update(updates)
        .eq('id', accountId);

      if (error) throw error;

      toast({
        title: "Account updated",
        description: "MT5 account has been updated successfully."
      });
      
      fetchData();
    } catch (error: any) {
      console.error('Error updating account:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateSettings = async () => {
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          id: adminSettings?.id,
          ...settingsForm,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Settings updated",
        description: "Admin settings have been saved successfully."
      });
      
      setEditingSettings(false);
      fetchData();
    } catch (error: any) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const togglePasswordVisibility = (accountId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const getUserNameById = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.full_name || 'Unknown User';
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-b from-background via-surface to-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const totalUsers = users.length;
  const totalAccounts = mt5Accounts.length;
  const totalBalance = mt5Accounts.reduce((sum, account) => sum + (account.current_balance || 0), 0);
  const accountsNeedingCommission = mt5Accounts.filter(a => a.profit_target_reached && !a.commission_paid).length;

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-background via-surface to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage users, MT5 accounts, and platform settings.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-card border-border/50 shadow-medium">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 shadow-medium">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">MT5 Accounts</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAccounts}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 shadow-medium">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalBalance.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 shadow-medium">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commission Due</CardTitle>
              <AlertCircle className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{accountsNeedingCommission}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="accounts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="accounts">MT5 Accounts</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="accounts" className="space-y-6">
            <Card className="bg-gradient-card border-border/50 shadow-medium">
              <CardHeader>
                <CardTitle>MT5 Accounts Management</CardTitle>
                <CardDescription>
                  View and manage all MT5 trading accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mt5Accounts.map((account) => {
                    const profit = (account.current_balance || 0) - (account.initial_deposit || 0);
                    const profitPercentage = account.initial_deposit ? (profit / account.initial_deposit) * 100 : 0;
                    
                    return (
                      <Card key={account.id} className="bg-surface-elevated border-border/30">
                        <CardContent className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <h4 className="font-semibold">Account #{account.account_id}</h4>
                              <p className="text-sm text-muted-foreground">
                                User: {getUserNameById(account.user_id)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Server: {account.server}
                              </p>
                              <div className="flex items-center gap-2">
                                <Label htmlFor={`password-${account.id}`} className="text-sm">Password:</Label>
                                <Input
                                  id={`password-${account.id}`}
                                  type={showPasswords[account.id] ? "text" : "password"}
                                  value={account.password}
                                  readOnly
                                  className="flex-1 text-xs"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => togglePasswordVisibility(account.id)}
                                >
                                  {showPasswords[account.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Initial:</span>
                                <span className="font-medium">${account.initial_deposit?.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Current:</span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={account.current_balance || 0}
                                  onChange={(e) => {
                                    const newBalance = parseFloat(e.target.value) || 0;
                                    updateMT5Account(account.id, { current_balance: newBalance });
                                  }}
                                  className="w-24 h-6 text-right"
                                />
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Profit:</span>
                                <span className={`font-medium ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  ${profit.toLocaleString()} ({profitPercentage.toFixed(1)}%)
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={account.profit_target_reached}
                                    onChange={(e) => updateMT5Account(account.id, { profit_target_reached: e.target.checked })}
                                    className="rounded"
                                  />
                                  <Label className="text-sm">Profit Target Reached</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={account.commission_paid}
                                    onChange={(e) => updateMT5Account(account.id, { commission_paid: e.target.checked })}
                                    className="rounded"
                                  />
                                  <Label className="text-sm">Commission Paid</Label>
                                </div>
                              </div>
                              
                              <div className="flex flex-col gap-1">
                                {account.profit_target_reached && (
                                  <Badge variant={account.commission_paid ? "default" : "destructive"}>
                                    {account.commission_paid ? "Commission Paid" : "Commission Due"}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="bg-gradient-card border-border/50 shadow-medium">
              <CardHeader>
                <CardTitle>Users Management</CardTitle>
                <CardDescription>
                  View all registered users and their information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <Card key={user.id} className="bg-surface-elevated border-border/30">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <Label className="text-sm text-muted-foreground">Name</Label>
                            <p className="font-medium">{user.full_name}</p>
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">Email</Label>
                            <p className="font-medium">{user.email}</p>
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">Telegram</Label>
                            <p className="font-medium">{user.telegram_handle}</p>
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">Joined</Label>
                            <p className="font-medium">
                              {new Date(user.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-gradient-card border-border/50 shadow-medium">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Platform Settings</CardTitle>
                    <CardDescription>
                      Configure platform-wide settings
                    </CardDescription>
                  </div>
                  <Button
                    variant={editingSettings ? "default" : "outline"}
                    onClick={() => {
                      if (editingSettings) {
                        updateSettings();
                      } else {
                        setEditingSettings(true);
                      }
                    }}
                  >
                    {editingSettings ? <Save className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />}
                    {editingSettings ? 'Save Settings' : 'Edit Settings'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fbs_partner_link">FBS Partner Link</Label>
                  <Input
                    id="fbs_partner_link"
                    type="url"
                    value={settingsForm.fbs_partner_link}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, fbs_partner_link: e.target.value }))}
                    placeholder="https://fbs.com/partner-link"
                    className="bg-surface-elevated border-border/50"
                    disabled={!editingSettings}
                  />
                  <p className="text-sm text-muted-foreground">
                    New users without trading accounts will be redirected here
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="usdt_wallet_address">USDT Wallet Address</Label>
                  <Input
                    id="usdt_wallet_address"
                    type="text"
                    value={settingsForm.usdt_wallet_address}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, usdt_wallet_address: e.target.value }))}
                    placeholder="TBD_USDT_ADDRESS"
                    className="bg-surface-elevated border-border/50"
                    disabled={!editingSettings}
                  />
                  <p className="text-sm text-muted-foreground">
                    Users will pay commissions to this address
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telegram_bot_username">Telegram Bot Username</Label>
                  <Input
                    id="telegram_bot_username"
                    type="text"
                    value={settingsForm.telegram_bot_username}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, telegram_bot_username: e.target.value }))}
                    placeholder="your_telegram_bot"
                    className="bg-surface-elevated border-border/50"
                    disabled={!editingSettings}
                  />
                  <p className="text-sm text-muted-foreground">
                    Chat button will link to this Telegram bot
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;