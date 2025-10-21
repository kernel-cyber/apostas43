import { useCallback } from 'react';

const SOUNDS = {
  betPlaced: '/sounds/bet-placed.mp3',
  matchStart: '/sounds/match-start.mp3',
  matchFinish: '/sounds/match-finish.mp3',
  win: '/sounds/win.mp3',
  loss: '/sounds/loss.mp3',
} as const;

export const useSoundEffects = () => {
  const playSound = useCallback((soundPath: string, volume: number = 0.5) => {
    try {
      const audio = new Audio(soundPath);
      audio.volume = Math.min(Math.max(volume, 0), 1);
      audio.play().catch((error) => {
        console.log('Sound play prevented:', error);
      });
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }, []);

  return {
    playBetPlaced: useCallback(() => playSound(SOUNDS.betPlaced), [playSound]),
    playMatchStart: useCallback(() => playSound(SOUNDS.matchStart), [playSound]),
    playMatchFinish: useCallback(() => playSound(SOUNDS.matchFinish), [playSound]),
    playWin: useCallback(() => playSound(SOUNDS.win, 0.7), [playSound]),
    playLoss: useCallback(() => playSound(SOUNDS.loss, 0.4), [playSound]),
  };
};
