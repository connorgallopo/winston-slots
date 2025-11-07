// frontend/src/utils/winTiers.ts

export const WinTier = {
  Normal: 'normal',
  Big: 'big',
  Epic: 'epic',
  Legendary: 'legendary',
} as const;

export type WinTier = typeof WinTier[keyof typeof WinTier];

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
  return getWinTier(total) !== WinTier.Normal;
};

export const getShakeIntensity = (tier: WinTier): 'low' | 'medium' | 'high' => {
  switch (tier) {
    case WinTier.Legendary:
      return 'high';
    case WinTier.Epic:
      return 'medium';
    case WinTier.Big:
      return 'medium';
    default:
      return 'low';
  }
};

export const getConfettiCount = (tier: WinTier): number => {
  switch (tier) {
    case WinTier.Legendary:
      return 200;
    case WinTier.Epic:
      return 150;
    case WinTier.Big:
      return 100;
    default:
      return 0;
  }
};
