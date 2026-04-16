import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Plus, Egg, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { formatKes } from '@/lib/currency';

const Poultry = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [batchName, setBatchName] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [quantity, setQuantity] = useState('');
  const [cost, setCost] = useState('');

  const { data: batches, isLoading } = useQuery({
    queryKey: ['poultry-batches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('poultry_batches')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createBatch = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('poultry_batches').insert({
        user_id: user!.id,
        batch_name: batchName,
        purchase_date: purchaseDate,
        quantity_bought: parseInt(quantity),
        purchase_cost: parseFloat(cost),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poultry-batches'] });
      setOpen(false);
      setBatchName('');
      setPurchaseDate('');
      setQuantity('');
      setCost('');
      toast({ title: 'Batch created successfully!' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Poultry Management</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage your poultry batches</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="self-start sm:self-auto">
                <Plus className="mr-2 h-4 w-4" />
                New Batch
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Batch</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createBatch.mutate(); }} className="space-y-4">
                <div className="space-y-2">
                  <Label>Batch Name</Label>
                  <Input value={batchName} onChange={(e) => setBatchName(e.target.value)} placeholder="e.g. Broilers Jan 2026" required />
                </div>
                <div className="space-y-2">
                  <Label>Purchase Date</Label>
                  <Input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Quantity Bought</Label>
                  <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g. 500" required min="1" />
                </div>
                <div className="space-y-2">
                  <Label>Purchase Cost (KES)</Label>
                  <Input type="number" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="Total cost in KES" required min="0" />
                </div>
                <Button type="submit" className="w-full" disabled={createBatch.isPending}>
                  {createBatch.isPending ? 'Creating...' : 'Create Batch'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="mt-8 text-center text-muted-foreground">Loading batches...</div>
        ) : !batches?.length ? (
          <div className="mt-16 text-center">
            <Egg className="mx-auto h-16 w-16 text-muted-foreground/30" />
            <h3 className="mt-4 text-lg font-medium text-foreground">No batches yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Create your first poultry batch to get started.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {batches.map((batch) => (
              <Card
                key={batch.id}
                className="cursor-pointer hover:shadow-md transition-all hover:border-primary/30"
                onClick={() => navigate(`/poultry/${batch.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{batch.batch_name}</CardTitle>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                      batch.status === 'active' ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {batch.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(batch.purchase_date), 'MMM dd, yyyy')}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Egg className="h-4 w-4" />
                      {batch.quantity_bought} birds
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-4 w-4 shrink-0" />
                      <span className="break-words">{formatKes(batch.purchase_cost)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Poultry;
