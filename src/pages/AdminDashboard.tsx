import React, { useState, useEffect } from 'react';
import { useAuth } from '@/src/lib/AuthContext';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { collection, addDoc, serverTimestamp, query, getDocs, orderBy, updateDoc, doc, where, Timestamp, limit } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Trophy, Power, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function AdminDashboard() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (isAdmin) {
      fetchCompetitions();
    }
  }, [isAdmin]);

  const fetchCompetitions = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'competitions'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setCompetitions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching competitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompetition = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await addDoc(collection(db, 'competitions'), {
        title,
        description,
        startDate: Timestamp.fromDate(new Date(startDate)),
        endDate: Timestamp.fromDate(new Date(endDate)),
        isActive: true,
        createdAt: serverTimestamp(),
      });
      toast.success('Competição criada com sucesso!');
      setTitle('');
      setDescription('');
      setStartDate('');
      setEndDate('');
      fetchCompetitions();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'competitions');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEndCompetition = async (compId: string) => {
    try {
      // Find winner
      const photosQ = query(
        collection(db, 'photos'),
        where('competitionId', '==', compId),
        orderBy('voteCount', 'desc'),
        limit(1)
      );
      const photoSnap = await getDocs(photosQ);
      let winnerPhotoId = null;
      if (!photoSnap.empty) {
        winnerPhotoId = photoSnap.docs[0].id;
      }

      await updateDoc(doc(db, 'competitions', compId), {
        isActive: false,
        winnerPhotoId
      });
      toast.success('Competição encerrada!');
      fetchCompetitions();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `competitions/${compId}`);
    }
  };

  if (authLoading) return <div className="p-20 text-center">Carregando...</div>;
  if (!isAdmin) return <div className="p-20 text-center text-destructive font-bold">Acesso Negado</div>;

  return (
    <div className="container mx-auto px-4 py-12 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Painel Administrativo</h1>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="list">Competições</TabsTrigger>
          <TabsTrigger value="create">Nova Competição</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6 pt-6">
          {loading ? (
            <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
          ) : competitions.length > 0 ? (
            <div className="grid gap-4">
              {competitions.map(comp => (
                <Card key={comp.id} className={comp.isActive ? 'border-primary/50 bg-primary/5' : ''}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{comp.title}</CardTitle>
                      <CardDescription>
                        {format(comp.startDate.toDate(), "d/MM/yy")} - {format(comp.endDate.toDate(), "d/MM/yy")}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {comp.isActive ? (
                        <Button variant="outline" size="sm" onClick={() => handleEndCompetition(comp.id)} className="gap-2">
                          <Power className="w-4 h-4" />
                          Encerrar
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-xs font-bold">
                          Encerrada
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{comp.description}</p>
                    {comp.winnerPhotoId && (
                      <div className="mt-4 flex items-center gap-2 text-sm font-bold text-yellow-600">
                        <Trophy className="w-4 h-4" />
                        Vencedor Definido
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border-2 border-dashed rounded-xl">
              Nenhuma competição encontrada.
            </div>
          )}
        </TabsContent>

        <TabsContent value="create" className="pt-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Criar Nova Competição</CardTitle>
              <CardDescription>Defina o tema e o período da competição.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateCompetition} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Descrição / Regras</Label>
                  <Input id="desc" value={description} onChange={e => setDescription(e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start">Data de Início</Label>
                    <Input id="start" type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end">Data de Término</Label>
                    <Input id="end" type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isCreating}>
                  {isCreating ? <Loader2 className="animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  Criar Competição
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
