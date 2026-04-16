import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Egg, Fence, TrendingUp, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: batches } = useQuery({
    queryKey: ['poultry-batches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('poultry_batches')
        .select('*')
        .eq('user_id', user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: livestock } = useQuery({
    queryKey: ['livestock-records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('livestock_records')
        .select('*')
        .eq('user_id', user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const activeBatches = batches?.filter(b => b.status === 'active').length ?? 0;
  const totalLivestock = livestock?.reduce((sum, l) => sum + l.quantity, 0) ?? 0;

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Welcome back to your farm overview</p>

        <div className="mt-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/poultry')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Batches</CardTitle>
              <Egg className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeBatches}</div>
              <p className="text-xs text-muted-foreground mt-1">Poultry batches</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/livestock')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Livestock</CardTitle>
              <Fence className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalLivestock}</div>
              <p className="text-xs text-muted-foreground mt-1">Total animals</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Batches</CardTitle>
              <TrendingUp className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{batches?.length ?? 0}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Livestock Types</CardTitle>
              <AlertTriangle className="h-5 w-5 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {new Set(livestock?.map(l => l.animal_type)).size}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Categories</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Egg className="h-5 w-5 text-primary" />
                Recent Poultry Batches
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!batches?.length ? (
                <p className="text-sm text-muted-foreground">No batches yet. Start by adding your first batch!</p>
              ) : (
                <div className="space-y-3">
                  {batches.slice(0, 5).map(batch => (
                    <div
                      key={batch.id}
                      className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => navigate(`/poultry/${batch.id}`)}
                    >
                      <div>
                        <p className="font-medium text-sm">{batch.batch_name}</p>
                        <p className="text-xs text-muted-foreground">{batch.quantity_bought} birds</p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                        batch.status === 'active' ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        {batch.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fence className="h-5 w-5 text-primary" />
                Livestock Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!livestock?.length ? (
                <p className="text-sm text-muted-foreground">No livestock records yet.</p>
              ) : (
                <div className="space-y-3">
                  {livestock.slice(0, 5).map(record => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium text-sm">{record.name || record.animal_type}</p>
                        <p className="text-xs text-muted-foreground">{record.quantity} head</p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                        record.status === 'active' ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        {record.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
