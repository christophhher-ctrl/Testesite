import React from 'react';
import { useCurrentCompetition, usePhotos } from '@/src/lib/hooks';
import { PhotoCard } from '@/src/components/PhotoCard';
import { UploadModal } from '@/src/components/UploadModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Calendar, Info, Camera, Plus, LogIn } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'motion/react';
import { useAuth } from '@/src/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/src/lib/firebase';
import { toast } from 'sonner';

export function Home() {
  const { user, isAdmin } = useAuth();
  const { competition, loading: compLoading } = useCurrentCompetition();
  const { photos, loading: photosLoading } = usePhotos(competition?.id);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      toast.success('Login realizado com sucesso!');
    } catch (error) {
      toast.error('Falha ao entrar.');
    }
  };

  if (compLoading) {
    return (
      <div className="container mx-auto px-4 py-12 space-y-8">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <Skeleton key={i} className="h-[400px] w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="container mx-auto px-4 py-24 text-center space-y-8">
        <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center">
          <Camera className="w-10 h-10 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Nenhuma competição ativa</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Fique atento! Novas competições temáticas serão lançadas em breve.
          </p>
        </div>
        {isAdmin && (
          <div className="pt-4">
            <Button asChild size="lg" className="gap-2">
              <a href="/admin">
                <Plus className="w-5 h-5" />
                Criar Primeira Competição
              </a>
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-16">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-background to-primary/5 border-2 border-primary/10 p-8 md:p-16"
      >
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12">
          <div className="space-y-6 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20">
              <Trophy className="w-3.5 h-3.5" />
              Competição em Destaque
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]">
              {competition.title}
            </h1>
            <p className="text-xl text-muted-foreground font-medium max-w-xl">
              {competition.description}
            </p>
            <div className="flex flex-wrap gap-6 text-sm font-semibold">
              <div className="flex items-center gap-2.5 text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Encerra em {format(competition.endDate.toDate(), "d 'de' MMMM", { locale: ptBR })}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-4 w-full lg:w-auto">
            {user ? (
              <UploadModal competitionId={competition.id} />
            ) : (
              <Button size="lg" onClick={handleLogin} className="gap-2 h-14 px-8 text-lg shadow-xl hover:shadow-primary/20 transition-all">
                <LogIn className="w-5 h-5" />
                Entre para Participar
              </Button>
            )}
            <p className="text-xs text-center text-muted-foreground font-medium">
              {user ? "Envie sua melhor foto agora!" : "É necessário fazer login para enviar fotos e votar."}
            </p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[30rem] h-[30rem] bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[20rem] h-[20rem] bg-primary/5 rounded-full blur-[80px]" />
      </motion.section>

      {/* Gallery Section */}
      <section className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
              Galeria da Competição
              <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                {photos.length}
              </span>
            </h2>
            <p className="text-muted-foreground font-medium">Explore as obras enviadas e vote nas suas favoritas.</p>
          </div>
          {user && photos.length > 0 && (
            <div className="hidden md:block">
              <UploadModal competitionId={competition.id} />
            </div>
          )}
        </div>

        {photosLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[450px] w-full rounded-[2rem]" />)}
          </div>
        ) : photos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {photos.map(photo => (
              <PhotoCard key={photo.id} photo={photo} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 border-4 border-dashed rounded-[3rem] bg-muted/10 flex flex-col items-center justify-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <Camera className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Seja o primeiro a participar!</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Esta competição acabou de começar. Envie sua foto agora e saia na frente!
              </p>
            </div>
            {user ? (
              <UploadModal competitionId={competition.id} />
            ) : (
              <Button onClick={handleLogin} variant="outline" className="gap-2">
                <LogIn className="w-4 h-4" />
                Entrar e Enviar Foto
              </Button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
