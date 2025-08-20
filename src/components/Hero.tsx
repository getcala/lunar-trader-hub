import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, TrendingUp, Shield, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Professional Trading",
      description: "Expert MT5 account management with proven strategies"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure Platform",
      description: "Bank-level security for your trading accounts and data"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Real-time Monitoring",
      description: "24/7 monitoring and transparent performance tracking"
    }
  ];

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-background via-surface to-background">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-up">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Lunar
              </span>
              <span className="text-foreground">Trades</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              Professional MT5 Account Management Platform
            </p>

            {/* Description */}
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '0.2s' }}>
              Join our exclusive trading community where expert traders manage your MT5 accounts 
              with proven strategies. Experience consistent growth with transparent fee structure.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <Button
                size="lg"
                onClick={() => navigate(user ? '/dashboard' : '/auth')}
                className="bg-gradient-primary hover:shadow-glow-secondary text-lg px-8 py-6 h-auto group transition-all duration-300"
              >
                {user ? 'Go to Dashboard' : 'Start Trading'}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-lg px-8 py-6 h-auto hover:shadow-3d transition-all duration-300"
              >
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-up" style={{ animationDelay: '0.4s' }}>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">500+</div>
                <div className="text-muted-foreground">Active Traders</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">$2M+</div>
                <div className="text-muted-foreground">Assets Under Management</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">85%</div>
                <div className="text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose LunarTrades?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform combines cutting-edge technology with expert trading strategies 
              to deliver exceptional results for our clients.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="p-8 bg-gradient-card border-border/50 hover:shadow-3d-hover transition-all duration-300 group hover:-translate-y-2"
              >
                <div className="text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Commission Policy Section */}
      <section className="py-20 bg-gradient-to-r from-surface/50 to-transparent">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto p-8 bg-gradient-card border-border/50 shadow-strong">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-6">Our Commission Policy</h2>
              <div className="text-lg text-muted-foreground space-y-4">
                <p>
                  Our success is directly tied to yours. We only earn when you profit.
                </p>
                <div className="bg-surface-elevated rounded-lg p-6 my-8">
                  <p className="text-xl font-semibold text-primary mb-2">
                    50% Commission on Profits
                  </p>
                  <p className="text-muted-foreground">
                    Once your account doubles (100% profit), you pay a one-time 50% commission 
                    on profits to our USDT wallet. No hidden fees, no monthly charges.
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Trading continues only after commission payment is confirmed. 
                  This ensures complete transparency and aligns our interests with yours.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Hero;