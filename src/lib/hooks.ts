import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';

export interface Competition {
  id: string;
  title: string;
  description: string;
  startDate: any;
  endDate: any;
  isActive: boolean;
  winnerPhotoId?: string;
  createdAt: any;
}

export interface Photo {
  id: string;
  userId: string;
  competitionId: string;
  imageUrl: string;
  title: string;
  description?: string;
  voteCount: number;
  createdAt: any;
}

export function useCurrentCompetition() {
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'competitions'),
      where('isActive', '==', true),
      orderBy('endDate', 'asc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setCompetition({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Competition);
      } else {
        setCompetition(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { competition, loading };
}

export function usePhotos(competitionId: string | undefined) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!competitionId) {
      setPhotos([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'photos'),
      where('competitionId', '==', competitionId),
      orderBy('voteCount', 'desc'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const photoList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Photo));
      setPhotos(photoList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [competitionId]);

  return { photos, loading };
}
