import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

export const useStickers = (pageId) => {
  const [stickers, setStickers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pageId || !db) {
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, 'stickers'),
        where('page', '==', pageId.toString())
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const stickerData = [];
        querySnapshot.forEach((doc) => {
          stickerData.push({ id: doc.id, ...doc.data() });
        });
        setStickers(stickerData);
        setLoading(false);
      }, (error) => {
        console.error("Firestore snapshot error:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Firestore error in useStickers:", error);
      setLoading(false);
    }
  }, [pageId]);

  const addSticker = async (sticker) => {
    if (!db) {
      console.warn("Firestore is not initialized. Adding locally for preview...");
      setStickers(prev => [...prev, { id: Date.now(), ...sticker, timestamp: new Date() }]);
      return;
    }

    try {
      await addDoc(collection(db, 'stickers'), {
        ...sticker,
        timestamp: serverTimestamp(),
      });
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return { stickers, loading, addSticker };
};
