import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Competition, Photo } from '@/src/lib/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'motion/react';

export function HallOfFame() {
  const [winners, setWinners] = useState<{ competition: Competition; photo: Photo }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const q = query(
          collection(db, 'competitions'),
          where('isActive', '==', false),
          where('winnerPhotoId', '!=', null),
          orderBy('endDate', 'desc')
        );
        const snapshot = await getDocs(q);
        
        const winnerData = await Promise.all(snapshot.docs.map(async (doc) => {
          const comp = { id: doc.id, ...doc.data() } as Competition;
          const photoSnap = await getDocs(query(collection(db, 'photos'), where('id', '==', comp.winnerPhotoId)));
          // Actually, we can just get the specific doc
          // But for simplicity in this mock-like env, let's assume we fetch it
          // In a real app, I'd use getDoc(doc(db, 'photos', comp.winnerPhotoId))
          return { competition: comp, photo: {} as Photo }; // Placeholder for now
        }));
        
        // Let's refine the fetch
        const results = [];
        for (const doc of snapshot.docs) {
          const comp = { id: doc.id, ...doc.data() } as Competition;
          if (comp.winnerPhotoId) {
            const photoSnap = await getDocs(query(collection(db, 'photos'), where('__name__', '==', comp.winnerPhotoId)));
            if (!photoSnap.empty) {
              results.push({
                competition: comp,
                photo: { id: photoSnap.docs[0].id, ...photoSnap.docs[0].data() } as Photo
              });
            }
          }
        }
        setWinners(results);
      } catch (error) {
        console.error('Error fetching winners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWinners();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight">Hall da Fama</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Celebrando a criatividade e o talento dos nossos maiores vencedores.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-[500px] w-full rounded-3xl" />)}
        </div>
      ) : winners.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {winners.map(({ competition, photo }, index) => (
            <motion.div
              key={competition.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden border-none shadow-2xl bg-gradient-to-b from-card to-muted/20">
                <div className="relative aspect-[4/5]">
                  <img 
                    src={photo.imageUrl} 
                    alt={photo.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4">
                    <div className="bg-yellow-500 text-white p-2 rounded-full shadow-lg">
                      <Trophy className="w-6 h-6" />
                    </div>
                  </div>
                </div>
                <CardHeader className="space-y-1">
                  <div className="text-xs font-bold text-primary uppercase tracking-widest">{competition.title}</div>
                  <CardTitle className="text-2xl">{photo.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold">{photo.voteCount} votos</span>
                    </div>
                    <div className="text-muted-foreground">Vencedor em {new Date(competition.endDate.toDate()).getFullYear()}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 opacity-50">
          <Medal className="w-16 h-16 mx-auto mb-4" />
          <p>Ainda não temos vencedores registrados. A primeira competição está em andamento!</p>
        </div>
      )}
    </div>
  );
}
