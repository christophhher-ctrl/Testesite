import React, { useState } from 'react';
import { Photo } from '@/src/lib/hooks';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Maximize2, User } from 'lucide-react';
import { useAuth } from '@/src/lib/AuthContext';
import { doc, runTransaction, serverTimestamp, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { motion } from 'motion/react';

interface PhotoCardProps {
  photo: Photo;
  hasVoted?: boolean;
}

export function PhotoCard({ photo, hasVoted: initialHasVoted }: PhotoCardProps) {
  const { user } = useAuth();
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para votar!');
      return;
    }

    if (user.uid === photo.userId) {
      toast.error('Você não pode votar na sua própria foto!');
      return;
    }

    setIsVoting(true);
    const voteId = `${user.uid}_${photo.id}`;
    const voteRef = doc(db, 'votes', voteId);
    const photoRef = doc(db, 'photos', photo.id);

    try {
      await runTransaction(db, async (transaction) => {
        const voteDoc = await transaction.get(voteRef);
        if (voteDoc.exists()) {
          throw new Error('Você já votou nesta foto!');
        }

        transaction.set(voteRef, {
          userId: user.uid,
          photoId: photo.id,
          competitionId: photo.competitionId,
          createdAt: serverTimestamp(),
        });

        transaction.update(photoRef, {
          voteCount: (photo.voteCount || 0) + 1
        });
      });

      setHasVoted(true);
      toast.success('Voto registrado!');
    } catch (error: any) {
      if (error.message === 'Você já votou nesta foto!') {
        toast.error(error.message);
        setHasVoted(true);
      } else {
        handleFirestoreError(error, OperationType.WRITE, `photos/${photo.id}/vote`);
      }
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden group border-none shadow-md hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-0 relative aspect-[4/5]">
          <img 
            src={photo.imageUrl} 
            alt={photo.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <Dialog>
              <DialogTrigger render={<Button variant="secondary" size="icon" className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100" />}>
                <Maximize2 className="w-4 h-4" />
              </DialogTrigger>
              <DialogContent className="max-w-4xl p-0 overflow-hidden border-none bg-transparent shadow-none">
                <AspectRatio ratio={16 / 9} className="bg-black/90">
                  <img 
                    src={photo.imageUrl} 
                    alt={photo.title} 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </AspectRatio>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                  <h3 className="text-2xl font-bold">{photo.title}</h3>
                  {photo.description && <p className="text-sm text-gray-300 mt-2">{photo.description}</p>}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
        <CardFooter className="p-4 flex flex-col gap-3">
          <div className="flex justify-between items-start w-full">
            <div className="flex flex-col">
              <h3 className="font-semibold text-lg line-clamp-1">{photo.title}</h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="w-3 h-3" />
                <span>Enviado por um competidor</span>
              </div>
            </div>
            <div className="flex items-center gap-1 font-bold text-primary">
              <Heart className={`w-4 h-4 ${hasVoted ? 'fill-primary' : ''}`} />
              <span>{photo.voteCount}</span>
            </div>
          </div>
          
          <Button 
            className="w-full gap-2 font-semibold" 
            variant={hasVoted ? "outline" : "default"}
            disabled={hasVoted || isVoting || user?.uid === photo.userId}
            onClick={handleVote}
          >
            <Heart className={`w-4 h-4 ${hasVoted ? 'fill-primary' : ''}`} />
            {hasVoted ? 'Votado' : isVoting ? 'Votando...' : 'Votar'}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
