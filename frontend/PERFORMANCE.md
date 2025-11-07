# Performance Optimization Notes

## Current Optimizations

### GPU Acceleration
- Framer Motion animations use transform and opacity (GPU accelerated)
- All animations avoid layout thrashing by using transforms
- Background effects use absolute positioning to avoid reflows

### Animation Performance
- Centralized timing configuration prevents animation conflicts
- Sequential reel animations prevent simultaneous heavy operations
- Staggered entrance animations distribute load over time

## Recommended Future Optimizations

### React.memo Candidates
Consider wrapping these components:
- `SpinningReel` - Pure presentation, doesn't need re-render on parent updates
- `StoppingReel` - Deterministic animation based on value prop
- `StoppedReel` - Static after animation completes
- `IdleReel` - Simple logo display

### CSS Containment
Add to animated containers for better layer optimization:
```css
.reel-container {
  contain: layout style paint;
}
```

### Will-Change Hints
Already handled by Framer Motion, but for custom animations:
```typescript
style={{ willChange: 'transform', transform: 'translate3d(0, 0, 0)' }}
```

### Bundle Size
- Code splitting for QA debug mode (lazy load)
- Tree-shake unused Framer Motion features if needed
- Consider dynamic imports for heavy screens

## Performance Targets
- 60 FPS on Raspberry Pi 5
- < 2s initial load time
- Smooth 800ms reel stagger transitions
- No dropped frames during confetti/shake effects

## Monitoring
Use QA Debug Mode to validate:
- Reel timing accuracy
- Animation smoothness
- FPS consistency during effects
