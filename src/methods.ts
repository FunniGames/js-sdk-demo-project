import FunniGamesSDK from "funnisdk"

let isInitialized = false;

export const start = async (): Promise<boolean> => {
    try {
        if (isInitialized) {
            console.log('SDK already initialized');
            return true;
        }

        console.log('Starting SDK initialization...');

        const initSuccess = await FunniGamesSDK.initialize({
            leaderboard: true,
            gameplay: true,
            packages: true,
        });

        console.log('SDK initialization result:', initSuccess);
        if (!initSuccess) {
            console.error('SDK initialize() returned false — ensure the game runs inside the FunniGames platform iframe, not standalone');
        }

        if (initSuccess) {
            isInitialized = true;
            FunniGamesSDK.gameplay.start();
            console.log('Game session started');
        } else {
            console.error('SDK initialization failed');
        }

        return initSuccess;
    } catch (error) {
        console.error('SDK initialization error:', error);
        return false;
    }
}

export const getProfile = async () => {
    try {
        if (!isInitialized) {
            console.warn('SDK not initialized. Call start() first.');
            return null;
        }

        console.log('Getting user profile...');
        const profile = await FunniGamesSDK.profile.getProfile();
        console.log('User profile received:', profile);
        return profile;
    } catch (error) {
        console.error('Failed to get profile:', error);
        return null;
    }
}

// Save data to store
export const saveGameData = async (key: string, data: any): Promise<boolean> => {
    try {
        if (!isInitialized) {
            console.warn('SDK not initialized. Call start() first.');
            return false;
        }

        console.log(`Saving data for key: ${key}`, data);
        await FunniGamesSDK.profile.saveData(key, JSON.stringify(data));
        console.log('Data saved successfully');
        return true;
    } catch (error) {
        console.error('Failed to save data:', error);
        return false;
    }
}

// Get data from store
export const getGameData = async (key: string) => {
    try {
        if (!isInitialized) {
            console.warn('SDK not initialized. Call start() first.');
            return null;
        }

        console.log(`Getting data for key: ${key}`);
        const result = await FunniGamesSDK.profile.getData(key);
        console.log('Data retrieval result:', result);

        if (result.status && result.data) {
            const parsedData = JSON.parse(result.data);
            console.log('Parsed data:', parsedData);
            return parsedData;
        } else {
            console.log('No data found or error:', result.message);
            return null;
        }
    } catch (error) {
        console.error('Failed to get data:', error);
        return null;
    }
}

// Add score to leaderboard
export const addScore = async (score: number): Promise<boolean> => {
    try {
        if (!isInitialized) {
            console.warn('SDK not initialized. Call start() first.');
            return false;
        }

        console.log(`Adding score: ${score}`);
        const result = await FunniGamesSDK.leaderboard.addScore(score);
        console.log('Add score result:', result);

        if (result.status) {
            console.log(`✅ Successfully added ${score} points to leaderboard`);
            return true;
        } else {
            console.error('Failed to add score:', result.message);
            return false;
        }
    } catch (error) {
        console.error('Failed to add score:', error);
        return false;
    }
}

export const listGamePackages = async () => {
    try {
        if (!isInitialized) {
            console.warn('SDK not initialized. Call start() first.');
            return null;
        }

        console.log('Getting game packages catalog...');
        const result = await FunniGamesSDK.packages.list();
        console.log('Game packages:', result.data);
        return result;
    } catch (error) {
        console.error('Failed to list game packages:', error);
        return null;
    }
}

export const purchaseGamePackage = async (
    sku: string,
    identifier: string,
): Promise<boolean> => {
    try {
        if (!isInitialized) {
            console.warn('SDK not initialized. Call start() first.');
            return false;
        }

        if (!sku.trim()) {
            console.warn('Package SKU is required');
            return false;
        }

        if (!identifier.trim()) {
            console.warn('Purchase identifier is required');
            return false;
        }

        console.log(`Opening purchase for SKU: ${sku}, identifier: ${identifier}`);

        const result = await FunniGamesSDK.packages.purchase(sku.trim(), identifier.trim());
        console.log('Purchase result:', result);

        return !!result.status;
    } catch (error) {
        console.error('Failed to open package purchase:', error);
        return false;
    }
}

export const listOwnedPackages = async () => {
    try {
        if (!isInitialized) {
            console.warn('SDK not initialized. Call start() first.');
            return null;
        }

        const result = await FunniGamesSDK.packages.listOwned();
        console.log('Owned packages:', result.data);
        return result;
    } catch (error) {
        console.error('Failed to list owned packages:', error);
        return null;
    }
}

export const checkPackageToken = async (identifier: string) => {
    try {
        if (!isInitialized) {
            console.warn('SDK not initialized. Call start() first.');
            return null;
        }

        const result = await FunniGamesSDK.packages.checkToken(identifier.trim());
        console.log('Check token result:', result);
        return result;
    } catch (error) {
        console.error('Failed to check package token:', error);
        return null;
    }
}

// Get leaderboard data
export const getLeaderboard = async () => {
    try {
        if (!isInitialized) {
            console.warn('SDK not initialized. Call start() first.');
            return null;
        }

        console.log('Getting leaderboard...');
        const leaderboard = await FunniGamesSDK.leaderboard.getLeaderboard();
        console.log('Leaderboard received:', leaderboard.data);
        return leaderboard.data;
    } catch (error) {
        console.error('Failed to get leaderboard:', error);
        return null;
    }
}
