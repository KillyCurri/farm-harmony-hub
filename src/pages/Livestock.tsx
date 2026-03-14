import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Fence, Calendar, DollarSign, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const Livestock = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [animalType, setAnimalType] = useState('');
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchaseCost, setPurchaseCost] = useState('');

  const [selectedRecord, setSelectedRecord] = useState<string | null>(null);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [saleOpen, setSaleOpen] = useState(false);

  const { data: records, isLoading } = useQuery({
    queryKey: ['livestock-records'],
    queryFn: async () => {
      const { data, error } = await supabase.from('livestock_records').select('*').eq('user_id', user!.id).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createRecord = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('livestock_records').insert({
        user_id: user!.id,
        animal_type: animalType,
        name: name || null,
        quantity: parseInt(qty),
        purchase_date: purchaseDate,
        purchase_cost: parseFloat(purchaseCost),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestock-records'] });
      setOpen(false);
      setAnimalType('');
      setName('');
      setQty('');
      setPurchaseDate('');
      setPurchaseCost('');
      toast({ title: 'Livestock record created!' });
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Livestock Management</h1>
            <p className="mt-1 text-muted-foreground">Track your livestock records and finances</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Add Livestock</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Livestock Record</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createRecord.mutate(); }} className="space-y-4">
                <div className="space-y-2">
                  <Label>Animal Type</Label>
                  <Select value={animalType} onValueChange={setAnimalType}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cattle">Cattle</SelectItem>
                      <SelectItem value="goats">Goats</SelectItem>
                      <SelectItem value="sheep">Sheep</SelectItem>
                      <SelectItem value="pigs">Pigs</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Name / Label (optional)</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Herd A" />
                </div>
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input type="number" value={qty} onChange={(e) => setQty(e.target.value)} required min="1" />
                </div>
                <div className="space-y-2">
                  <Label>Purchase Date</Label>
                  <Input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Purchase Cost</Label>
                  <Input type="number" step="0.01" value={purchaseCost} onChange={(e) => setPurchaseCost(e.target.value)} required min="0" />
                </div>
                <Button type="submit" className="w-full" disabled={createRecord.isPending}>
                  {createRecord.isPending ? 'Adding...' : 'Add Record'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="mt-8 text-center text-muted-foreground">Loading...</div>
        ) : !records?.length ? (
          <div className="mt-16 text-center">
            <Fence className="mx-auto h-16 w-16 text-muted-foreground/30" />
            <h3 className="mt-4 text-lg font-medium text-foreground">No livestock records</h3>
            <p className="mt-1 text-sm text-muted-foreground">Add your first livestock record to get started.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {records.map((record) => (
              <LivestockCard key={record.id} record={record} userId={user!.id} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

const LivestockCard = ({ record, userId }: { record: any; userId: string }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [expOpen, setExpOpen] = useState(false);
  const [saleOpen, setSaleOpen] = useState(false);
  const [expDate, setExpDate] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState('feed');
  const [expDesc, setExpDesc] = useState('');
  const [saleDate, setSaleDate] = useState('');
  const [saleQty, setSaleQty] = useState('');
  const [saleAmount, setSaleAmount] = useState('');
  const [saleDesc, setSaleDesc] = useState('');

  const { data: expenses } = useQuery({
    queryKey: ['livestock-expenses', record.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('livestock_expenses').select('*').eq('livestock_id', record.id).order('expense_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: sales } = useQuery({
    queryKey: ['livestock-sales', record.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('livestock_sales').select('*').eq('livestock_id', record.id).order('sale_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const totalExpenses = (expenses?.reduce((s, e) => s + Number(e.amount), 0) ?? 0) + Number(record.purchase_cost);
  const totalSales = sales?.reduce((s, e) => s + Number(e.amount), 0) ?? 0;
  const totalSold = sales?.reduce((s, e) => s + e.quantity_sold, 0) ?? 0;
  const netProfit = totalSales - totalExpenses;

  const addExpense = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('livestock_expenses').insert({
        livestock_id: record.id, user_id: userId, expense_date: expDate, amount: parseFloat(expAmount), category: expCategory, description: expDesc || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestock-expenses', record.id] });
      setExpOpen(false);
      setExpDate(''); setExpAmount(''); setExpDesc('');
      toast({ title: 'Expense added!' });
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const addSale = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('livestock_sales').insert({
        livestock_id: record.id, user_id: userId, sale_date: saleDate, quantity_sold: parseInt(saleQty), amount: parseFloat(saleAmount), description: saleDesc || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestock-sales', record.id] });
      setSaleOpen(false);
      setSaleDate(''); setSaleQty(''); setSaleAmount(''); setSaleDesc('');
      toast({ title: 'Sale recorded!' });
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base capitalize">{record.name || record.animal_type} — {record.quantity} head</CardTitle>
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${
            record.status === 'active' ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
          }`}>{record.status}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Purchased {format(new Date(record.purchase_date), 'MMM dd, yyyy')} · Cost: {Number(record.purchase_cost).toLocaleString()}
        </p>
      </CardHeader>
      <CardContent>
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-4 rounded-lg bg-muted p-4">
          <div>
            <p className="text-xs text-muted-foreground">Revenue</p>
            <p className="text-lg font-bold">{totalSales.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Expenses</p>
            <p className="text-lg font-bold">{totalExpenses.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Profit/Loss</p>
            <p className={`text-lg font-bold ${netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
              {netProfit >= 0 ? '+' : ''}{netProfit.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Dialog open={expOpen} onOpenChange={setExpOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline"><Plus className="mr-1 h-3 w-3" /> Expense</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); addExpense.mutate(); }} className="space-y-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={expCategory} onValueChange={setExpCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feed">Feed</SelectItem>
                      <SelectItem value="medicine">Medicine</SelectItem>
                      <SelectItem value="veterinary">Veterinary</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input type="number" step="0.01" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} required min="0" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={expDesc} onChange={(e) => setExpDesc(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={addExpense.isPending}>Add Expense</Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={saleOpen} onOpenChange={setSaleOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline"><Plus className="mr-1 h-3 w-3" /> Sale</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Record Sale</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); addSale.mutate(); }} className="space-y-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Quantity Sold</Label>
                  <Input type="number" value={saleQty} onChange={(e) => setSaleQty(e.target.value)} required min="1" />
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input type="number" step="0.01" value={saleAmount} onChange={(e) => setSaleAmount(e.target.value)} required min="0" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={saleDesc} onChange={(e) => setSaleDesc(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={addSale.isPending}>Record Sale</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Recent entries */}
        {(expenses?.length || sales?.length) ? (
          <div className="mt-4 space-y-2">
            {expenses?.slice(0, 3).map(e => (
              <div key={e.id} className="flex items-center justify-between rounded border p-2 text-sm">
                <div>
                  <span className="font-medium">{Number(e.amount).toLocaleString()}</span>
                  <span className="ml-2 text-muted-foreground capitalize">{e.category}</span>
                </div>
                <span className="text-xs text-muted-foreground">{format(new Date(e.expense_date), 'MMM dd')}</span>
              </div>
            ))}
            {sales?.slice(0, 3).map(s => (
              <div key={s.id} className="flex items-center justify-between rounded border p-2 text-sm">
                <div>
                  <span className="font-medium text-success">+{Number(s.amount).toLocaleString()}</span>
                  <span className="ml-2 text-muted-foreground">{s.quantity_sold} sold</span>
                </div>
                <span className="text-xs text-muted-foreground">{format(new Date(s.sale_date), 'MMM dd')}</span>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default Livestock;
