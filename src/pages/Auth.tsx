import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Egg, Fence, TrendingUp, ShieldCheck, Phone, Sparkles, MessageCircle } from 'lucide-react';
import farmHero from '@/assets/farm-hero.jpg';
import farmPoultry from '@/assets/farm-poultry.jpg';
import farmLivestock from '@/assets/farm-livestock.jpg';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({
          title: 'Account created!',
          description: 'Please check your email to verify your account.',
        });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
      });

      if (result.error) {
        toast({
          title: 'Google sign-in failed',
          description: (result.error as Error).message ?? 'Please try again.',
          variant: 'destructive',
        });
        return;
      }

      if (result.redirected) return;
      navigate('/');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary/80">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-8 p-4 lg:grid-cols-2 lg:gap-12 lg:p-8">
        {/* LEFT: Welcome / hero */}
        <section className="flex flex-col justify-center text-primary-foreground">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/15 backdrop-blur-sm ring-1 ring-primary-foreground/20">
              <Egg className="h-6 w-6" />
            </div>
            <span className="text-lg font-semibold tracking-tight">OurFarmKenya</span>
          </div>

          <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-medium backdrop-blur-sm ring-1 ring-primary-foreground/20">
            <Sparkles className="h-3.5 w-3.5" />
            Built for Kenyan farmers
          </span>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Karibu, mkulima!{' '}
            <span className="block bg-gradient-to-r from-primary-foreground to-primary-foreground/60 bg-clip-text text-transparent">
              Grow smarter every day.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-primary-foreground/85 sm:text-lg">
            OurFarmKenya is your pocket farm manager — track every poultry batch and
            livestock record, log feed, sales and losses, and see real-time profit
            so you always know which animals are paying off.
          </p>

          {/* Picture collage */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            <img
              src={farmHero}
              alt="Kenyan farm at sunset with chickens and cattle"
              width={1280}
              height={896}
              className="col-span-2 h-40 w-full rounded-2xl object-cover shadow-2xl ring-1 ring-primary-foreground/20 sm:h-56"
            />
            <div className="grid grid-rows-2 gap-3">
              <img
                src={farmPoultry}
                alt="Healthy free-range chickens"
                width={768}
                height={768}
                loading="lazy"
                className="h-[74px] w-full rounded-2xl object-cover shadow-xl ring-1 ring-primary-foreground/20 sm:h-[106px]"
              />
              <img
                src={farmLivestock}
                alt="Dairy cows and goats grazing"
                width={768}
                height={768}
                loading="lazy"
                className="h-[74px] w-full rounded-2xl object-cover shadow-xl ring-1 ring-primary-foreground/20 sm:h-[106px]"
              />
            </div>
          </div>

          {/* Feature pills */}
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { icon: Egg, label: 'Poultry batches' },
              { icon: Fence, label: 'Livestock records' },
              { icon: TrendingUp, label: 'Live profit & loss' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-xl bg-primary-foreground/10 px-3 py-2.5 text-sm backdrop-blur-sm ring-1 ring-primary-foreground/15"
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{label}</span>
              </div>
            ))}
          </div>

          {/* Contact / creator */}
          <div className="mt-8 rounded-2xl bg-primary-foreground/10 p-4 backdrop-blur-sm ring-1 ring-primary-foreground/15">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="text-sm">
                <p className="font-semibold">Crafted by Benedict Kili</p>
                <p className="mt-0.5 text-primary-foreground/80">
                  Need help getting started or have a feature in mind? Reach out anytime.
                </p>
                <a
                  href="tel:+254706711531"
                  className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary-foreground px-3 py-1.5 text-sm font-semibold text-primary transition-transform hover:scale-[1.02]"
                >
                  <Phone className="h-4 w-4" />
                  0706 711 531
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT: Auth card */}
        <section className="flex items-center justify-center">
          <div className="w-full max-w-md">
            <Card className="border-0 shadow-2xl">
              <CardContent className="p-6 sm:p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground">
                    {isLogin ? 'Welcome back 👋' : 'Create your account'}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {isLogin
                      ? 'Sign in to keep track of your farm.'
                      : 'Start tracking your farm in under a minute.'}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading || loading}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.7 4-5.5 4-3.3 0-6-2.7-6-6.1S8.7 5.9 12 5.9c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12S6.8 21.5 12 21.5c6.9 0 9.5-4.8 9.5-7.3 0-.5 0-.9-.1-1.3H12z" />
                  </svg>
                  {googleLoading ? 'Connecting…' : 'Continue with Google'}
                </Button>

                <div className="my-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">OR</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Farmer"
                        required={!isLogin}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
                  </Button>
                </form>
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                  </button>
                </div>
              </CardContent>
            </Card>

            <p className="mt-4 text-center text-xs text-primary-foreground/70">
              © {new Date().getFullYear()} OurFarmKenya · Built by Benedict Kili
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Auth;
