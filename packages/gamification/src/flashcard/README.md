# Flashcard System - Anki Algorithm Implementation

A comprehensive flashcard system implementing the Anki spaced repetition algorithm, including both SM-2 (SuperMemo 2) and FSRS (Free Spaced Repetition Scheduler) algorithms.

## Overview

This flashcard system is designed to help users learn and retain information efficiently using scientifically-proven spaced repetition techniques. It's based on the popular Anki application but provides a flexible, modern TypeScript implementation.

### Key Features

- **Multiple Algorithms**: Support for both SM-2 (legacy) and FSRS (modern) algorithms
- **Spaced Repetition**: Optimal scheduling based on memory research
- **Flexible Learning**: Customizable learning steps and intervals
- **Performance Tracking**: Detailed statistics and progress monitoring
- **Preset Management**: Pre-configured settings for different learning scenarios
- **Session Management**: Organized study sessions with progress tracking

## Core Concepts

### Card States

- **New**: Cards that haven't been studied yet
- **Learning**: Cards in the initial learning phase with short intervals
- **Review**: Graduated cards in the long-term review cycle
- **Relearning**: Cards that were forgotten and need to be relearned
- **Buried**: Cards temporarily hidden until the next day
- **Suspended**: Cards permanently hidden from reviews

### Answer Ratings

- **Again (1)**: Incorrect answer - restart learning process
- **Hard (2)**: Correct but difficult - shorter interval than normal
- **Good (3)**: Correct with some effort - normal interval progression
- **Easy (4)**: Correct with no effort - longer interval than normal

### Algorithms

#### SM-2 (SuperMemo 2)
The classic spaced repetition algorithm using ease factors and interval multipliers.

```typescript
// Default SM-2 settings
{
  startingEaseFactor: 2.5,
  easyBonus: 1.3,
  intervalModifier: 1.0,
  hardInterval: 1.2,
  newInterval: 0.0
}
```

#### FSRS (Free Spaced Repetition Scheduler)
Modern algorithm using machine learning principles with three memory parameters:
- **Difficulty**: How hard the card is to remember (1-10)
- **Stability**: How long the memory will last
- **Retrievability**: Current probability of successful recall (0-1)

## Usage Examples

### Creating a Flashcard Deck

```typescript
import { createExampleDeck, createSampleFlashcards } from '@/flashcard';

// Create a new deck
const deck = createExampleDeck();

// Add sample cards
const cards = createSampleFlashcards();
deck.cards = cards;
deck.totalCards = cards.length;
```

### Setting up a Study Session

```typescript
import { createExampleSession, EFlashcardSessionStatus } from '@/flashcard';

// Create a study session
const session = createExampleSession(deck);

// Start the session
session.status = EFlashcardSessionStatus.STARTED;
session.startedAt = new Date();
```

### Processing a Card Review

```typescript
import { EFlashcardRating } from '@/flashcard';

// User answers a card
const rating = EFlashcardRating.GOOD;
const responseTime = 8; // seconds

// Update session statistics
session.studiedCount++;
session.correctCount++;
session.studyTime += responseTime;
```

### Using Presets

```typescript
import { getAvailablePresets, DEFAULT_PRESETS } from '@/flashcard';

// Get all available presets
const presets = getAvailablePresets();

// Use a specific preset
const beginnerPreset = DEFAULT_PRESETS.BEGINNER;
deck.maxNewCardsPerDay = beginnerPreset.maxNewCardsPerDay;
deck.desiredRetention = beginnerPreset.desiredRetention;
```

## Configuration Options

### Learning Steps

Configure the intervals for new cards in the learning phase:

```typescript
// Default: [1, 10] = 1 minute, then 10 minutes
learningSteps: [1, 10]

// More intensive: [1, 5, 10, 30] = 1m, 5m, 10m, 30m
learningSteps: [1, 5, 10, 30]

// Quick learning: [10] = single 10-minute step
learningSteps: [10]
```

### Daily Limits

Control the number of cards per day:

```typescript
{
  maxNewCardsPerDay: 20,      // New cards to learn
  maxReviewCardsPerDay: 200   // Review cards to study
}
```

### FSRS Configuration

```typescript
{
  desiredRetention: 0.9,      // 90% target retention
  fsrsParameters: [/* 17 optimized parameters */]
}
```

### Lapse Handling

Configure what happens when cards are forgotten:

```typescript
{
  relearningSteps: [10],      // 10 minutes relearning
  minimumInterval: 1,         // 1 day minimum after relearning
  leechThreshold: 8          // Mark as leech after 8 lapses
}
```

## Default Presets

### Beginner
- More repetition for new learners
- Lower target retention (85%)
- Longer learning steps
- Fewer new cards per day (10)

### Default
- Balanced settings for most users
- Standard target retention (90%)
- Standard learning steps
- Moderate new cards per day (20)

### Intensive
- For serious learners
- High target retention (95%)
- More new cards per day (30)
- Optimized for maximum retention

### Light
- For casual learning
- Lower target retention (80%)
- Fewer reviews per day
- Suitable for maintenance learning

## Algorithm Constants

### Key Timing Values

```typescript
ANKI_DEFAULTS = {
  LEARNING_STEPS: [1, 10],           // 1 min, 10 min
  GRADUATING_INTERVAL: 1,            // 1 day
  EASY_INTERVAL: 4,                  // 4 days
  STARTING_EASE_FACTOR: 2.5,         // 250%
  MAX_INTERVAL: 36500,               // ~100 years
  DESIRED_RETENTION: 0.9             // 90%
}
```

### Score Calculation

Cards are scored based on the answer rating:

```typescript
SCORE_WEIGHTS = {
  AGAIN: 0,    // 0 points
  HARD: 50,    // 50 points  
  GOOD: 80,    // 80 points
  EASY: 100    // 100 points
}
```

## Statistics and Analytics

The system provides comprehensive statistics:

```typescript
interface IFlashcardStats {
  cardsStudiedToday: number;
  timeSpentToday: number;          // in minutes
  currentStreak: number;           // consecutive days
  longestStreak: number;
  totalReviews: number;
  retentionRate: number;           // 0-1
  matureCardsCount: number;        // interval >= 21 days
  youngCardsCount: number;         // interval < 21 days
  // ... more statistics
}
```

## Best Practices

### 1. Start with Defaults
Use the default preset initially to understand how the system works before customizing.

### 2. Consistent Study
Aim for daily study sessions rather than long, infrequent sessions.

### 3. Honest Rating
- Use "Again" when you forget or make mistakes
- Use "Hard" when you struggle but eventually remember
- Use "Good" for normal recall (most common)
- Use "Easy" only when recall is effortless

### 4. Card Design
- Keep cards simple and focused on one concept
- Use the minimum information principle
- Add context when needed but avoid overloading

### 5. Regular Review
- Don't skip review sessions
- If you fall behind, prioritize overdue cards
- Consider reducing new cards if review load becomes overwhelming

## Advanced Features

### Sibling Card Burying
Automatically hide related cards until the next day to avoid interference.

### Leech Detection
Cards that fail repeatedly (8+ times by default) are marked as leeches for special attention.

### Fuzzing
Intervals are slightly randomized (95-105% of calculated value) to prevent cards from clustering together.

### Learning Optimization
FSRS can optimize its parameters based on your review history for personalized scheduling.

## Integration Example

```typescript
import { 
  demonstrateFlashcardSystem,
  EFlashcardAlgorithm,
  EFlashcardRating
} from '@/flashcard';

// Complete example
const {
  deck,
  session,
  completedSession,
  stats,
  presets
} = demonstrateFlashcardSystem();

console.log(`Deck: ${deck.name}`);
console.log(`Cards: ${deck.totalCards}`);
console.log(`Session Score: ${completedSession.score}%`);
console.log(`Retention Rate: ${stats.retentionRate * 100}%`);
```

## Future Enhancements

- **Audio Support**: Pronunciation practice with audio recordings
- **Image Support**: Visual learning with image-based cards
- **Collaborative Decks**: Shared deck creation and maintenance
- **Mobile Sync**: Cross-platform synchronization
- **Advanced Analytics**: Learning pattern analysis and recommendations
- **Custom Algorithms**: Plugin system for alternative scheduling algorithms

This implementation provides a solid foundation for building sophisticated spaced repetition learning applications while maintaining the proven effectiveness of the Anki algorithm.
