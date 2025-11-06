// frontend/src/utils/winTiers.ts

export enum WinTier {
  Normal = 'normal',
  Big = 'big',
  Epic = 'epic',
  Legendary = 'legendary',
}

export const getWinTier = (total: number): WinTier => {
  if (total >= 5_000_000) return WinTier.Legendary;
  if (total >= 3_000_000) return WinTier.Epic;
  if (total >= 2_000_000) return WinTier.Big;
  return WinTier.Normal;
};

export const getWinMessage = (total: number): string => {
  const tier = getWinTier(total);

  switch (tier) {
    case WinTier.Legendary:
      return '🎉 INCREDIBLE! LEGENDARY SPIN! 🎉';
    case WinTier.Epic:
      return '🔥 AMAZING! BIG WIN! 🔥';
    case WinTier.Big:
      return '⭐ Fantastic performance! ⭐';
    case WinTier.Normal:
      return 'Great job!';
  }
};

export const shouldPlayBigWinEffects = (total: number): boolean => {
  return getWinTier(total) === WinTier.Epic || getWinTier(total) === WinTier.Legendary;
};
