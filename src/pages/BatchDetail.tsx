import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, DollarSign, TrendingDown, Skull, Package, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const BatchDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: batch } = useQuery({
    queryKey: ['batch', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('poultry_batches').select('*').eq('id', id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: foodExpenses } = useQuery({
    queryKey: ['food-expenses', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('batch_food_expenses').select('*').eq('batch_id', id!).order('expense_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: sales } = useQuery({
    queryKey: ['batch-sales', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('batch_sales').select('*').eq('batch_id', id!).order('sale_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: losses } = useQuery({
    queryKey: ['batch-losses', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('batch_losses').select('*').eq('batch_id', id!).order('loss_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: otherExpenses } = useQuery({
    queryKey: ['other-expenses', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('batch_other_expenses').select('*').eq('batch_id', id!).order('expense_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Calculations
  const totalFoodExpenses = foodExpenses?.reduce((sum, e) => sum + Number(e.amount), 0) ?? 0;
  const totalOtherExpenses = otherExpenses?.reduce((sum, e) => sum + Number(e.amount), 0) ?? 0;
  const totalSales = sales?.reduce((sum, s) => sum + Number(s.amount), 0) ?? 0;
  const totalLosses = losses?.reduce((sum, l) => sum + l.quantity_lost, 0) ?? 0;
  const totalSold = sales?.reduce((sum, s) => sum + s.quantity_sold, 0) ?? 0;
  const purchaseCost = Number(batch?.purchase_cost ?? 0);
  const totalExpenses = purchaseCost + totalFoodExpenses + totalOtherExpenses;
  const netProfit = totalSales - totalExpenses;
  const remainingStock = (batch?.quantity_bought ?? 0) - totalSold - totalLosses;

  if (!batch) return <AppLayout><div className="text-muted-foreground">Loading...</div></AppLayout>;

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <button onClick={() => navigate('/poultry')} className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Batches
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{batch.batch_name}</h1>
            <p className="text-sm text-muted-foreground">
              Started {format(new Date(batch.purchase_date), 'MMM dd, yyyy')} · {batch.quantity_bought} birds purchased
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${
            batch.status === 'active' ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            {batch.status}
          </span>
        </div>

        {/* Financial Summary */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground">{totalSales.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold text-foreground">{totalExpenses.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Net Profit/Loss</p>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                {netProfit >= 0 ? '+' : ''}{netProfit.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Remaining Stock</p>
              <p className="text-2xl font-bold text-foreground">{remainingStock}</p>
              <p className="text-xs text-muted-foreground">{totalLosses} lost · {totalSold} sold</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="food" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="food">Food Costs</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="losses">Losses</TabsTrigger>
            <TabsTrigger value="other">Other Expenses</TabsTrigger>
          </TabsList>

          <TabsContent value="food">
            <EntrySection
              title="Food Expenses"
              icon={<DollarSign className="h-5 w-5" />}
              entries={foodExpenses ?? []}
              batchId={id!}
              userId={user!.id}
              type="food"
            />
          </TabsContent>
          <TabsContent value="sales">
            <EntrySection
              title="Sales"
              icon={<TrendingDown className="h-5 w-5" />}
              entries={sales ?? []}
              batchId={id!}
              userId={user!.id}
              type="sales"
            />
          </TabsContent>
          <TabsContent value="losses">
            <EntrySection
              title="Losses"
              icon={<Skull className="h-5 w-5" />}
              entries={losses ?? []}
              batchId={id!}
              userId={user!.id}
              type="losses"
            />
          </TabsContent>
          <TabsContent value="other">
            <EntrySection
              title="Other Expenses"
              icon={<Package className="h-5 w-5" />}
              entries={otherExpenses ?? []}
              batchId={id!}
              userId={user!.id}
              type="other"
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

// Reusable entry section component
interface EntrySectionProps {
  title: string;
  icon: React.ReactNode;
  entries: any[];
  batchId: string;
  userId: string;
  type: 'food' | 'sales' | 'losses' | 'other';
}

const EntrySection = ({ title, icon, entries, batchId, userId, type }: EntrySectionProps) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const addEntry = useMutation({
    mutationFn: async () => {
      let error;
      if (type === 'food') {
        ({ error } = await supabase.from('batch_food_expenses').insert({
          batch_id: batchId, user_id: userId, expense_date: date, amount: parseFloat(amount), description: description || null,
        }));
      } else if (type === 'sales') {
        ({ error } = await supabase.from('batch_sales').insert({
          batch_id: batchId, user_id: userId, sale_date: date, quantity_sold: parseInt(quantity), amount: parseFloat(amount), description: description || null,
        }));
      } else if (type === 'losses') {
        ({ error } = await supabase.from('batch_losses').insert({
          batch_id: batchId, user_id: userId, loss_date: date, quantity_lost: parseInt(quantity), cause: description || null,
        }));
      } else {
        ({ error } = await supabase.from('batch_other_expenses').insert({
          batch_id: batchId, user_id: userId, expense_date: date, amount: parseFloat(amount), description,
        }));
      }
      if (error) throw error;
    },
    onSuccess: () => {
      const keyMap = { food: 'food-expenses', sales: 'batch-sales', losses: 'batch-losses', other: 'other-expenses' };
      queryClient.invalidateQueries({ queryKey: [keyMap[type], batchId] });
      setOpen(false);
      setDate('');
      setAmount('');
      setQuantity('');
      setDescription('');
      toast({ title: 'Entry added!' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const deleteEntry = useMutation({
    mutationFn: async (entryId: string) => {
      const tableMap = { food: 'batch_food_expenses' as const, sales: 'batch_sales' as const, losses: 'batch_losses' as const, other: 'batch_other_expenses' as const };
      const { error } = await supabase.from(tableMap[type]).delete().eq('id', entryId);
      if (error) throw error;
    },
    onSuccess: () => {
      const keyMap = { food: 'food-expenses', sales: 'batch-sales', losses: 'batch-losses', other: 'other-expenses' };
      queryClient.invalidateQueries({ queryKey: [keyMap[type], batchId] });
      toast({ title: 'Entry deleted' });
    },
  });

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          {icon} {title}
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" /> Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add {title}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); addEntry.mutate(); }} className="space-y-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              {(type === 'sales' || type === 'losses') && (
                <div className="space-y-2">
                  <Label>{type === 'sales' ? 'Quantity Sold' : 'Quantity Lost'}</Label>
                  <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required min="1" />
                </div>
              )}
              {type !== 'losses' && (
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required min="0" />
                </div>
              )}
              <div className="space-y-2">
                <Label>{type === 'losses' ? 'Cause' : 'Description'}{type === 'other' ? ' *' : ''}</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} required={type === 'other'} />
              </div>
              <Button type="submit" className="w-full" disabled={addEntry.isPending}>
                {addEntry.isPending ? 'Adding...' : 'Add Entry'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {!entries.length ? (
          <p className="text-sm text-muted-foreground">No entries yet.</p>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => {
              const entryDate = entry.expense_date || entry.sale_date || entry.loss_date;
              return (
                <div key={entry.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">
                      {type === 'losses' ? `${entry.quantity_lost} birds` : Number(entry.amount).toLocaleString()}
                      {type === 'sales' ? ` (${entry.quantity_sold} sold)` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(entryDate), 'MMM dd, yyyy')}
                      {(entry.description || entry.cause) ? ` · ${entry.description || entry.cause}` : ''}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteEntry.mutate(entry.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BatchDetail;
