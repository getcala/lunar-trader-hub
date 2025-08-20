import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, X } from 'lucide-react';

interface MT5AccountFormProps {
  onClose: () => void;
  onAccountAdded: () => void;
}

const MT5AccountForm: React.FC<MT5AccountFormProps> = ({ onClose, onAccountAdded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    accountId: '',
    password: '',
    server: '',
    initialDeposit: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.accountId || !formData.password || !formData.server || !formData.initialDeposit) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    const initialDeposit = parseFloat(formData.initialDeposit);
    if (isNaN(initialDeposit) || initialDeposit <= 0) {
      toast({
        title: "Invalid deposit amount",
        description: "Please enter a valid initial deposit amount.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('mt5_accounts')
        .insert({
          user_id: user?.id,
          account_id: formData.accountId,
          password: formData.password,
          server: formData.server,
          initial_deposit: initialDeposit,
          current_balance: initialDeposit, // Start with initial deposit as current balance
        });

      if (error) throw error;

      onAccountAdded();
    } catch (error: any) {
      console.error('Error adding MT5 account:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add MT5 account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-gradient-card border-border/50 shadow-strong">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Add MT5 Account</CardTitle>
              <CardDescription>
                Submit your MT5 login details for professional management
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-surface-elevated"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accountId">Account ID</Label>
              <Input
                id="accountId"
                type="text"
                placeholder="123456789"
                value={formData.accountId}
                onChange={(e) => setFormData(prev => ({ ...prev, accountId: e.target.value }))}
                className="bg-surface-elevated border-border/50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Your MT5 password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="bg-surface-elevated border-border/50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="server">Server</Label>
              <Input
                id="server"
                type="text"
                placeholder="e.g., MetaQuotes-Demo, FBS-Real"
                value={formData.server}
                onChange={(e) => setFormData(prev => ({ ...prev, server: e.target.value }))}
                className="bg-surface-elevated border-border/50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="initialDeposit">Initial Deposit ($)</Label>
              <Input
                id="initialDeposit"
                type="number"
                step="0.01"
                min="0"
                placeholder="1000"
                value={formData.initialDeposit}
                onChange={(e) => setFormData(prev => ({ ...prev, initialDeposit: e.target.value }))}
                className="bg-surface-elevated border-border/50"
                required
              />
            </div>

            <div className="bg-surface-elevated rounded-lg p-4 text-sm text-muted-foreground">
              <p className="font-semibold mb-2">Important Security Notice:</p>
              <p>
                Your login credentials are encrypted and stored securely. They are only accessible 
                to authorized trading administrators for account management purposes.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-primary hover:shadow-glow"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Account'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MT5AccountForm;