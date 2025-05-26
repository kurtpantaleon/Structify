import { db } from '../services/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

function safePlayer(player) {
  return {
    uid: player?.uid || 'unknown',
    name: player?.name || 'Unknown',
  };
}

export async function recordMatch({
  player1,
  player2,
  winnerUid,
  challengeId,
  completionTime,
  difficulty
}) {
  try {
    await addDoc(collection(db, 'matches'), {
      player1: safePlayer(player1),
      player2: safePlayer(player2),
      winnerUid: winnerUid || 'unknown',
      challengeId: challengeId || null,
      difficulty: difficulty || null,
      completionTime: completionTime || null,
      endedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('Error recording match:', err);
  }
} 