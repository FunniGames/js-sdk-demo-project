# FunniGames SDK

[![npm version](https://img.shields.io/npm/v/funnisdk.svg)](https://www.npmjs.com/package/funnisdk)
[![License: PROPRIETARY](https://img.shields.io/badge/License-PROPRIETARY-red.svg)](./LICENSE)

A lightweight, type-safe TypeScript/JavaScript SDK for seamless integration with the FunniGames platform. Built with
modern web standards, this SDK enables your game to communicate with the FunniGames host environment via secure
postMessage API.

## 🎮 Features

- **🔒 Secure Communication** - Built on postMessage API for safe cross-origin communication
- **📦 Lightweight** - Minimal bundle size with zero dependencies
- **🎯 TypeScript First** - Full TypeScript support with comprehensive type definitions
- **🚀 Easy Integration** - Simple initialization and intuitive API
- **👤 User Profiles** - Access and manage player profiles
- **🏆 Leaderboard Support** - Built-in leaderboard functionality
- **🎲 Game Lifecycle** - Manage game saves

[//]: # (- **📊 Complete Analytics** - Track user behavior and game progression)

[//]: # (- **💰 Wallet Integration** - Handle in-game transactions seamlessly)

[//]: # (- **📱 Ad Management** - Display fullscreen and rewarded ads)

[//]: # (- **🎲 Game Lifecycle** - Manage game states &#40;start, pause, stop&#41;)

## 📦 Installation

```bash
npm install funnisdk
```

## 🚀 Quick Start

```typescript
import FunniGamesSDK from 'funnisdk';

async function initializeGame() {
// Initialize SDK with required features
    const initialized = await FunniGamesSDK.initialize({
        leaderboard: true,
        gameplay: true,
    });

    if (!initialized) {
        console.error('Failed to initialize SDK');
        return;
    }

// Start game session
    await FunniGamesSDK.gameplay.start();

// Get user profile
    const profile = await FunniGamesSDK.profile.getProfile();
    console.log('Player:', profile.data.full_name);
    console.log('Coins:', profile.data.totalCoins);

// Add score to leaderboard
    await FunniGamesSDK.leaderboard.addScore(1000);

// Save game progress
    await FunniGamesSDK.profile.saveData('progress', JSON.stringify({
        level: 5,
        score: 1000,
        completedAt: new Date().toISOString()
    }));
}

initializeGame().catch(console.error);
```

## 📚 Table of Contents

- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Initialization](#-initialization)
- [API Reference](#-api-reference)
    - [Profile](#profile-api)
    - [Leaderboard](#leaderboard-api)

[//]: # (  - [Wallet]&#40;#wallet-api&#41;)

[//]: # (  - [Ads]&#40;#ads-api&#41;)

[//]: # (  - [Analytics]&#40;#analytics-api&#41;)

[//]: # (  - [GamePlay]&#40;#gameplay-api&#41;)

- [Type Definitions](#-type-definitions)
- [Error Handling](#-error-handling)
- [Environment Requirements](#-environment-requirements)
- [Build & Development](#-build--development)
- [Examples](#-examples)
- [License](#-license)

## 🎯 Initialization

### `initialize(config: InitConfig): Promise<boolean>`

Initialize the SDK with the features your game needs. This must be called before using any other SDK features.

**Parameters:**

```typescript
interface InitConfig {
    leaderboard?: boolean;  // Enable leaderboard functionality
    gameplay?: boolean;     // Enable gameplay state management
}
```

**Returns:** `Promise<boolean>` - Returns `true` if initialization succeeded, `false` otherwise.

**Example:**

```typescript
const success = await FunniGamesSDK.initialize({
    leaderboard: true,
    gameplay: true
});

if (success) {
    console.log('SDK initialized successfully');
} else {
    console.error('SDK initialization failed');
}
```

> **Note:** The Profile component is always initialized by default, regardless of the config.

## 📖 API Reference

### Profile API

Manage user profiles, coins, and save/load game data.

#### `getProfile(): Promise<ResponseModel & { data: UserProfile }>`

Retrieve the current user's profile information.

**Response:**

```typescript
{
    status: boolean;
    message: string | null;
    version: number;
    data: {
        account_id: string;
        full_name: string;
        totalPoints: number;
        totalCoins: number;
        timeWallet: {
            freeTimeRemaining: number;
            todayTimeRemaining: number;
            totalTimeRemaining: number;
            eligiblePlay: boolean;
            todayUsedTime: number;
        }
        ;
        moneyWalletBalance: number;
        images: {
            proAvatar: string | null;
            avatar: string;
        }
        ;
        pro: {
            startedDate: string;
            expirationDate: string;
        }
        ;
        isGuest: boolean;
        isActive: boolean;
    }
}
```

**Example:**

```typescript
const profile = await FunniGamesSDK.profile.getProfile();
console.log(`Welcome ${profile.data.full_name}!`);
console.log(`You have ${profile.data.totalCoins} coins`);
```

#### `addPoint(amount: number): Promise<ResponseModel & { data: AddPointInterface }>`

Add coins to the user's account.

**Parameters:**

- `amount` (number) - Number of coins to add (must be positive)

**Example:**

```typescript
await FunniGamesSDK.profile.addPoint(50);
console.log('Added 50 coins to user account');
```

#### `saveData(key: string, data: string): Promise<ResponseModel & { data: SaveData }>`

Save custom game data associated with a key.

**Parameters:**

- `key` (string) - Unique identifier for the data
- `data` (string) - Data to save (must be a string, use JSON.stringify for objects)

**Example:**

```typescript
const gameData = {
    level: 5,
    health: 100,
    inventory: ['sword', 'shield']
};

await FunniGamesSDK.profile.saveData(
    'player_progress',
    JSON.stringify(gameData)
);
```

#### `getData(key: string): Promise<ResponseModel & { data: GetData }>`

Retrieve previously saved game data.

**Parameters:**

- `key` (string) - The key used when saving the data

**Example:**

```typescript
const response = await FunniGamesSDK.profile.getData('player_progress');
if (response.status) {
    const gameData = JSON.parse(response.data);
    console.log('Current level:', gameData.level);
}
```

---

### Leaderboard API

Manage game scores and retrieve leaderboard rankings.

#### `addScore(score: number): Promise<ResponseModel>`

Submit a score to the leaderboard.

**Parameters:**

- `score` (number) - The score to submit

**Example:**

```typescript
await FunniGamesSDK.leaderboard.addScore(1500);
console.log('Score submitted successfully');
```

#### `getLeaderboard(): Promise<ResponseModel & { data: LeaderboardInterface }>`

Retrieve the current leaderboard standings.

**Response:**

```typescript
{
    status: boolean;
    message: string | null;
    version: number;
    data: {
        leaderboard: [
            {
                userId: string;
                userName: string;
                totalPoints: number;
                rank: number;
                images?: {
                    avatar?: string;
                    proAvatar?: string;
                };
                uniqueId: string;
                isPro: boolean;
            }
        ];
        userRecord: {
            _id: string;
            name?: string;
            registrationId: string;
            images?: {
                avatar?: string;
                proAvatar?: string;
            };
            uniqueId: string;
            pro: {
                startedDate?: Date | null;
                expirationDate?: Date | null;
            }
        }
    }
}
```

**Example:**

```typescript
const leaderboard = await FunniGamesSDK.leaderboard.getLeaderboard();
console.log('Top player:', leaderboard.data.leaderboard[0]);
console.log('Your rank:', leaderboard.data.userRecord);
```

---

[//]: # (### Wallet API)

[//]: # ()

[//]: # (Handle in-game transactions and purchases.)

[//]: # ()

[//]: # (#### `spendFunniCoin&#40;identifier: string, amount: number&#41;: Promise<TransactionResponseModel>`)

[//]: # ()

[//]: # (Spend coins on an in-game item.)

[//]: # ()

[//]: # (**Parameters:**)

[//]: # (- `identifier` &#40;string&#41; - Unique identifier for the item/purchase)

[//]: # (- `amount` &#40;number&#41; - Number of coins to spend)

[//]: # ()

[//]: # (**Example:**)

[//]: # (```typescript)

[//]: # (const transaction = await FunniGamesSDK.wallet.spendFunniCoin&#40;'power_up_1', 100&#41;;)

[//]: # (console.log&#40;'Transaction ID:', transaction.Transaction.TransactionId&#41;;)

[//]: # (```)

[//]: # (#### `getNotConsumedTransactions&#40;&#41;: Promise<TransactionsResponseModel>`)

[//]: # ()

[//]: # (Retrieve transactions that haven't been consumed yet.)

[//]: # ()

[//]: # (**Example:**)

[//]: # (```typescript)

[//]: # (const pending = await FunniGamesSDK.wallet.getNotConsumedTransactions&#40;&#41;;)

[//]: # (pending.Transactions.forEach&#40;tx => {)

[//]: # (console.log&#40;`Pending: ${tx.Identifier} - ${tx.Amount} coins`&#41;;)

[//]: # (}&#41;;)

[//]: # (```)

[//]: # (#### `consume&#40;transactionId: string&#41;: Promise<ResponseModel>`)

[//]: # ()

[//]: # (Mark a transaction as consumed after delivering the purchased item.)

[//]: # ()

[//]: # (**Parameters:**)

[//]: # (- `transactionId` &#40;string&#41; - The transaction ID to consume)

[//]: # ()

[//]: # (**Example:**)

[//]: # (```typescript)

[//]: # (await FunniGamesSDK.wallet.consume&#40;transactionId&#41;;)

[//]: # (console.log&#40;'Transaction consumed successfully'&#41;;)

[//]: # (```)

[//]: # (---)

[//]: # (### Ads API)

[//]: # ()

[//]: # (Display advertisements to users.)

[//]: # ()

[//]: # (#### `showFullPageAd&#40;&#41;: Promise<boolean>`)

[//]: # ()

[//]: # (Display a full-page interstitial ad.)

[//]: # ()

[//]: # (**Returns:** `Promise<boolean>` - `true` if ad was shown successfully)

[//]: # ()

[//]: # (**Example:**)

[//]: # (```typescript)

[//]: # (const shown = await FunniGamesSDK.ad.showFullPageAd&#40;&#41;;)

[//]: # (if &#40;shown&#41; {)

[//]: # (console.log&#40;'Full page ad displayed'&#41;;)

[//]: # (})

[//]: # (```)

[//]: # (#### `showRewardedAd&#40;&#41;: Promise<boolean>`)

[//]: # ()

[//]: # (Display a rewarded ad. User should receive a reward after watching.)

[//]: # ()

[//]: # (**Returns:** `Promise<boolean>` - `true` if ad was watched successfully)

[//]: # ()

[//]: # (**Example:**)

[//]: # (```typescript)

[//]: # (const watched = await FunniGamesSDK.ad.showRewardedAd&#40;&#41;;)

[//]: # (if &#40;watched&#41; {)

[//]: # (// Grant reward to user)

[//]: # (await FunniGamesSDK.profile.addPoint&#40;100&#41;;)

[//]: # (console.log&#40;'Reward granted!'&#41;;)

[//]: # (})

[//]: # (```)

[//]: # (---)

[//]: # ()

[//]: # (### Analytics API)

[//]: # ()

[//]: # (Track user actions and game events.)

[//]: # ()

[//]: # (#### Enums)

[//]: # (```typescript)

[//]: # (enum FlowType {)

[//]: # (Sink = 0,      // Resource spent)

[//]: # (Source = 1,    // Resource gained)

[//]: # (Undefined = 2)

[//]: # (})

[//]: # ()

[//]: # (enum ProgressionStatus {)

[//]: # (Undefined = 0,)

[//]: # (Start = 1,     // Level/mission started)

[//]: # (Complete = 2,  // Level/mission completed)

[//]: # (Fail = 3       // Level/mission failed)

[//]: # (})

[//]: # (```)

[//]: # (#### `resourceEvent&#40;flowType: FlowType, itemType: string, itemId: string, amount: number, resourceCurrency: string&#41;: Promise<void>`)

[//]: # ()

[//]: # (Track resource flow &#40;spending or gaining resources&#41;.)

[//]: # ()

[//]: # (**Parameters:**)

[//]: # (- `flowType` &#40;FlowType&#41; - Whether resource is spent &#40;Sink&#41; or gained &#40;Source&#41;)

[//]: # (- `itemType` &#40;string&#41; - Category of the item)

[//]: # (- `itemId` &#40;string&#41; - Unique identifier for the item)

[//]: # (- `amount` &#40;number&#41; - Amount of resource)

[//]: # (- `resourceCurrency` &#40;string&#41; - Type of currency/resource)

[//]: # ()

[//]: # (**Example:**)

[//]: # (```typescript)

[//]: # (import { FlowType } from 'funnisdk';)

[//]: # ()

[//]: # (// Track spending gold coins)

[//]: # (await FunniGamesSDK.analytics.resourceEvent&#40;)

[//]: # (FlowType.Sink,)

[//]: # ('currency',)

[//]: # ('gold_coins',)

[//]: # (50,)

[//]: # ('gold')

[//]: # (&#41;;)

[//]: # ()

[//]: # (// Track earning gems)

[//]: # (await FunniGamesSDK.analytics.resourceEvent&#40;)

[//]: # (FlowType.Source,)

[//]: # ('currency',)

[//]: # ('gems',)

[//]: # (10,)

[//]: # ('gems')

[//]: # (&#41;;)

[//]: # (```)

[//]: # (#### `designEvent&#40;events: string[], value?: number&#41;: Promise<void>`)

[//]: # ()

[//]: # (Track custom game events.)

[//]: # ()

[//]: # (**Parameters:**)

[//]: # (- `events` &#40;string[]&#41; - Array of event identifiers)

[//]: # (- `value` &#40;number, optional&#41; - Optional numeric value associated with the event)

[//]: # ()

[//]: # (**Example:**)

[//]: # (```typescript)

[//]: # (await FunniGamesSDK.analytics.designEvent&#40;['tutorial', 'completed'], 1&#41;;)

[//]: # (await FunniGamesSDK.analytics.designEvent&#40;['boss_fight', 'victory']&#41;;)

[//]: # (```)

[//]: # (#### `progressionEvent&#40;status: ProgressionStatus, progression01: string, progression02: string, progression03: string, value?: number&#41;: Promise<void>`)

[//]: # ()

[//]: # (Track game progression through levels or missions.)

[//]: # ()

[//]: # (**Parameters:**)

[//]: # (- `status` &#40;ProgressionStatus&#41; - Current status &#40;Start, Complete, or Fail&#41;)

[//]: # (- `progression01` &#40;string&#41; - First progression level &#40;e.g., world&#41;)

[//]: # (- `progression02` &#40;string&#41; - Second progression level &#40;e.g., chapter&#41;)

[//]: # (- `progression03` &#40;string&#41; - Third progression level &#40;e.g., level&#41;)

[//]: # (- `value` &#40;number, optional&#41; - Optional score or value)

[//]: # ()

[//]: # (**Example:**)

[//]: # (```typescript)

[//]: # (import { ProgressionStatus } from 'funnisdk';)

[//]: # ()

[//]: # (// Track level start)

[//]: # (await FunniGamesSDK.analytics.progressionEvent&#40;)

[//]: # (ProgressionStatus.Start,)

[//]: # ('World1',)

[//]: # ('Chapter1',)

[//]: # ('Level1')

[//]: # (&#41;;)

[//]: # ()

[//]: # (// Track level completion with score)

[//]: # (await FunniGamesSDK.analytics.progressionEvent&#40;)

[//]: # (ProgressionStatus.Complete,)

[//]: # ('World1',)

[//]: # ('Chapter1',)

[//]: # ('Level1',)

[//]: # (1500)

[//]: # (&#41;;)

[//]: # (```)

[//]: # (---)

[//]: # ()

[//]: # (### GamePlay API)

[//]: # ()

[//]: # (Manage game lifecycle states.)

[//]: # ()

[//]: # (#### `start&#40;&#41;: Promise<void>`)

[//]: # ()

[//]: # (Signal that gameplay has started. Call this when the game begins.)

[//]: # ()

[//]: # (**Example:**)

[//]: # (```typescript)

[//]: # (await FunniGamesSDK.gameplay.start&#40;&#41;;)

[//]: # (console.log&#40;'Game session started'&#41;;)

[//]: # (```)

[//]: # (#### `pause&#40;&#41;: Promise<void>`)

[//]: # ()

[//]: # (Signal that gameplay has been paused. Call when user pauses or switches tabs.)

[//]: # ()

[//]: # (**Example:**)

[//]: # (```typescript)

[//]: # (window.addEventListener&#40;'blur', async &#40;&#41; => {)

[//]: # (await FunniGamesSDK.gameplay.pause&#40;&#41;;)

[//]: # (}&#41;;)

[//]: # (```)

[//]: # (#### `stop&#40;&#41;: Promise<void>`)

[//]: # ()

[//]: # (Signal that gameplay has ended. Call when the game session ends.)

[//]: # ()

[//]: # (**Example:**)

[//]: # (```typescript)

[//]: # (async function endGame&#40;&#41; {)

[//]: # (await FunniGamesSDK.gameplay.stop&#40;&#41;;)

[//]: # (console.log&#40;'Game session ended'&#41;;)

[//]: # (})

[//]: # (```)

[//]: # (---)

## 📝 Type Definitions

### ResponseModel

```typescript
interface ResponseModel {
    status: boolean;
    message: string | null;
    version: number;
    data?: any;
}
```

### InitConfig

```typescript
interface InitConfig {
    leaderboard?: boolean;
    gameplay?: boolean;
}
```

### UserProfile

```typescript
interface UserProfile {
    account_id: string;
    full_name: string;
    totalPoints: number;
    totalCoins: number;
    timeWallet: TimeWallet;
    moneyWalletBalance: number;
    images: Images;
    pro: Pro;
    isGuest: boolean;
    isActive: boolean;
}
```

For complete type definitions, see the TypeScript declarations included in the package.

---

## ⚠️ Error Handling

All SDK methods return promises and may throw errors. Always use try-catch blocks or `.catch()` handlers.

**Common error scenarios:**

- SDK not initialized (call `initialize()` first)
- Parent window not available (game not embedded in FunniGames platform)
- Network/communication failures
- Invalid parameters

**Example:**

```typescript
try {
    const profile = await FunniGamesSDK.profile.getProfile();
    console.log('Profile loaded:', profile.data);
} catch (error) {
    console.error('Failed to load profile:', error.message);
    // Handle error appropriately (show message to user, retry, etc.)
}
```

---

## 🌍 Environment Requirements

- **Platform:** Must be embedded in an iframe within the FunniGames platform
- **Parent Window:** Parent window must implement required postMessage handlers
- **Browser:** Modern browser with ES2018+ support
- **Node:** >=14.0.0 (for development)

---

## 🛠️ Build & Development

### Development Setup

```shell script
# Clone the repository
git clone <repository-url>

# Navigate to the SDK directory
cd jsSDK

# Install dependencies
npm install

# Start development build with watch mode
npm run dev
```

### Building

```shell script
# Clean build artifacts
npm run clean

# Build the SDK
npm run build

# Prepare for publishing
npm run prepare-publish
```

### Build Output

The SDK is built in multiple formats:

- **ESM** (`dist/index.js`) - ES Module format
- **CommonJS** (`dist/index.cjs`) - CommonJS format
- **IIFE** (`dist/game-platform.min.js`) - Browser-ready bundle
- **Types** (`dist/index.d.ts`) - TypeScript type definitions

---

## 💡 Examples

### Complete Game Integration

```typescript
import FunniGamesSDK from 'funnisdk';
import {FlowType, ProgressionStatus} from 'funnisdk';

class Game {
    async init() {
        // Initialize SDK
        const success = await FunniGamesSDK.initialize({
            leaderboard: true,
            gameplay: true
        });

        if (!success) {
            throw new Error('Failed to initialize FunniGames SDK');
        }

        // Get player info
        const profile = await FunniGamesSDK.profile.getProfile();
        this.displayPlayerInfo(profile.data);

        // Load saved progress
        try {
            const savedData = await FunniGamesSDK.profile.getData('game_progress');
            this.loadProgress(JSON.parse(savedData.data));
        } catch (error) {
            // No saved data, start fresh
            this.startNewGame();
        }
    }

    async startLevel(level: number) {
        // Signal game start
        await FunniGamesSDK.gameplay.start();

        // Track level start
        await FunniGamesSDK.analytics.progressionEvent(
            ProgressionStatus.Start,
            `Level${level}`,
            '',
            ''
        );
    }

    async completeLevel(level: number, score: number, coinsEarned: number) {
        // Submit score
        await FunniGamesSDK.leaderboard.addScore(score);

        // Add coins
        await FunniGamesSDK.profile.addPoint(coinsEarned);

        // Track resource gain
        await FunniGamesSDK.analytics.resourceEvent(
            FlowType.Source,
            'currency',
            'coins',
            coinsEarned,
            'coins'
        );

        // Track progression
        await FunniGamesSDK.analytics.progressionEvent(
            ProgressionStatus.Complete,
            `Level${level}`,
            '',
            '',
            score
        );

        // Save progress
        await this.saveProgress();
    }

    async purchaseItem(itemId: string, cost: number) {
        try {
            const transaction = await FunniGamesSDK.wallet.spendFunniCoin(itemId, cost);

            // Deliver item to player
            this.giveItemToPlayer(itemId);

            // Consume transaction
            await FunniGamesSDK.wallet.consume(transaction.Transaction.TransactionId);

            // Track spending
            await FunniGamesSDK.analytics.resourceEvent(
                FlowType.Sink,
                'item',
                itemId,
                cost,
                'coins'
            );

            return true;
        } catch (error) {
            console.error('Purchase failed:', error);
            return false;
        }
    }

    async saveProgress() {
        const progress = {
            level: this.currentLevel,
            score: this.totalScore,
            inventory: this.inventory,
            savedAt: new Date().toISOString()
        };

        await FunniGamesSDK.profile.saveData(
            'game_progress',
            JSON.stringify(progress)
        );
    }

    async endGame() {
        await this.saveProgress();
        await FunniGamesSDK.gameplay.stop();
    }
}
```

---

## 📄 License

Proprietary License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

- **Email** [funnigamesir@gmail.com](mailto:funnigamesir@gmail.com)

---

## 🔄 Changelog

### v1.0.0 (Current)

- Initial release
- Profile management
- Leaderboard integration
- Game save management

[//]: # (- Wallet and transactions)

[//]: # (- Ad support)

[//]: # (- Analytics tracking)

[//]: # (- Game lifecycle management)

---

**Made with ❤️ by the FunniGames Team**
