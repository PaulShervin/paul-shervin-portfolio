import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { toast } from 'sonner';
import { auth } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Lock, Mail, ArrowLeft, UserPlus, LogIn } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();

  // If already logged in and an admin, redirect straight to dashboard
  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate('/admin');
    }
  }, [user, isAdmin, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success('Successfully created admin account and logged in!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Successfully authenticated!');
      }
      navigate('/admin');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(75_20%_95%)] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-accent/10 blur-3xl pointer-events-none" />

      <Card className="w-full max-w-md bg-card/85 backdrop-blur-md border-border/60 shadow-xl relative z-10 rounded-2xl">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center text-primary mb-2">
            {isRegistering ? <UserPlus className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            {isRegistering ? 'Create Admin Account' : 'Portfolio Administration'}
          </CardTitle>
          <CardDescription>
            {isRegistering 
              ? 'Register your admin credentials to manage the portfolio' 
              : "Enter credentials to manage Paul Shervin's portfolio"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="paul.shervin@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Security Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Min 6 characters"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-accent text-primary-foreground font-semibold rounded-xl py-6"
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? (isRegistering ? 'Registering...' : 'Authenticating...') 
                : (isRegistering ? 'Register & Log In' : 'Sign In')}
            </Button>
            
            <div className="w-full text-center">
              <button
                type="button"
                className="text-xs text-primary font-semibold hover:underline"
                onClick={() => setIsRegistering(!isRegistering)}
              >
                {isRegistering 
                  ? 'Already have an account? Sign In' 
                  : "Don't have an account? Create one"}
              </button>
            </div>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-xs text-muted-foreground hover:text-foreground"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Portfolio
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
