import React from 'react';
import { useCurrentCompetition, usePhotos } from '@/src/lib/hooks';
import { PhotoCard } from '@/src/components/PhotoCard';
import { UploadModal } from '@/src/components/UploadModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Calendar, Info, Camera } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'motion/react';

export function Home() {
  const { competition, loading: compLoading } = useCurrentCompetition();
  const { photos, loading: photosLoading } = usePhotos(competition?.id);

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
      <div className="container mx-auto px-4 py-24 text-center space-y-6">
        <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center">
          <Camera className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-3xl font-bold">Nenhuma competição ativa no momento</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Fique atento! Novas competições temáticas serão lançadas em breve.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-background to-primary/5 border p-8 md:p-12"
      >
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-3 h-3" />
              Competição Ativa
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none">
              {competition.title}
            </h1>
            <p className="text-lg text-muted-foreground">
              {competition.description}
            </p>
            <div className="flex flex-wrap gap-4 text-sm font-medium">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Termina em {format(competition.endDate.toDate(), "d 'de' MMMM", { locale: ptBR })}</span>
              </div>
            </div>
          </div>
          <UploadModal competitionId={competition.id} />
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-2xl" />
      </motion.section>

      {/* Gallery Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Galeria de Participantes
            <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {photos.length} fotos
            </span>
          </h2>
        </div>

        {photosLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[400px] w-full rounded-2xl" />)}
          </div>
        ) : photos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {photos.map(photo => (
              <PhotoCard key={photo.id} photo={photo} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-3xl bg-muted/20">
            <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold">Seja o primeiro a participar!</h3>
            <p className="text-muted-foreground">Envie sua melhor foto e comece a ganhar votos.</p>
          </div>
        )}
      </section>
    </div>
  );
}
