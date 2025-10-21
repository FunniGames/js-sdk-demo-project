import {useEffect, useState} from "react";
import {addScore, getGameData, getLeaderboard, getProfile, saveGameData, start,} from "./methods.ts";
import type {UserProfile} from "funnisdk"

const App = () => {
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [savedData, setSavedData] = useState(null);
    const [leaderboardData, setLeaderboardData] = useState(null);
    const [scoreInput, setScoreInput] = useState("");
    const [saveKey, setSaveKey] = useState("game_data");
    const [saveValue, setSaveValue] = useState("");

    useEffect(() => {
        const initializeSDK = async () => {
            setLoading(true);
            const success = await start();
            setInitialized(success);
            setLoading(false);
        };

        if (!initialized && !loading) {
            initializeSDK();
        }
    }, [initialized, loading]);

    const handleGetProfile = async () => {
        const profileData = await getProfile();
        if (profileData && profileData.status) {
            setProfile(profileData.data);
        } else {
            setProfile(null);
        }
    };

    const handleSaveData = async () => {
        if (!saveKey.trim()) {
            alert("Please enter a key");
            return;
        }

        const dataToSave = saveValue.trim() || {
            timestamp: new Date().toISOString(),
            randomValue: Math.random()
        };

        const success = await saveGameData(saveKey, dataToSave);
        if (success) {
            alert("Data saved successfully!");
            setSaveValue("");
        } else {
            alert("Failed to save data");
        }
    };

    const handleGetData = async () => {
        const data = await getGameData(saveKey);
        setSavedData(data);
    };

    const handleAddScore = async () => {
        const score = parseInt(scoreInput);
        if (isNaN(score) || score <= 0) {
            alert("Please enter a valid positive number");
            return;
        }

        const success = await addScore(score);
        if (success) {
            alert(`Added ${score} points to leaderboard!`);
            setScoreInput("");
        } else {
            alert("Failed to add score");
        }
    };

    const handleGetLeaderboard = async () => {
        const data = await getLeaderboard();
        setLeaderboardData(data);
    };

    return (
        <div style={{padding: '20px', fontFamily: 'Arial, sans-serif'}}>
            <h1>🎮 FunniGames SDK Demo</h1>
            <p>
                Status: <strong>{loading ? '🔄 Initializing...' : initialized ? '✅ Initialized!' : '❌ Not Initialized'}</strong>
            </p>

            {initialized && (
                <>
                    <hr style={{margin: '20px 0'}}/>

                    {/* Profile Section */}
                    <div style={{marginBottom: '20px'}}>
                        <h2>👤 Profile</h2>
                        <button
                            onClick={handleGetProfile}
                            style={{
                                padding: '10px 15px',
                                margin: '5px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Get Profile
                        </button>

                        {profile && (
                            <div style={{
                                marginTop: '10px',
                                padding: '10px',
                                border: '1px solid #28a745',
                                borderRadius: '4px',
                                backgroundColor: '#f8f9fa'
                            }}>
                                <h3>Profile Data:</h3>
                                <pre
                                    style={{
                                        overflowX: 'auto',
                                    }}
                                >{JSON.stringify(profile, null, 2)}</pre>
                            </div>
                        )}
                    </div>

                    {/* Save/Load Data Section */}
                    <div style={{marginBottom: '20px'}}>
                        <h2>💾 Save & Load Data</h2>
                        <div style={{marginBottom: '10px'}}>
                            <input
                                type="text"
                                placeholder="Data key (e.g., 'player_stats')"
                                value={saveKey}
                                onChange={(e) => setSaveKey(e.target.value)}
                                style={{
                                    padding: '8px',
                                    margin: '5px',
                                    width: '200px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px'
                                }}
                            />
                            <input
                                type="text"
                                placeholder="Data value (optional, JSON)"
                                value={saveValue}
                                onChange={(e) => setSaveValue(e.target.value)}
                                style={{
                                    padding: '8px',
                                    margin: '5px',
                                    width: '200px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px'
                                }}
                            />
                        </div>
                        <button
                            onClick={handleSaveData}
                            style={{
                                padding: '10px 15px',
                                margin: '5px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Save Data
                        </button>
                        <button
                            onClick={handleGetData}
                            style={{
                                padding: '10px 15px',
                                margin: '5px',
                                backgroundColor: '#17a2b8',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Load Data
                        </button>

                        {savedData && (
                            <div style={{
                                marginTop: '10px',
                                padding: '10px',
                                border: '1px solid #17a2b8',
                                borderRadius: '4px',
                                backgroundColor: '#f8f9fa'
                            }}>
                                <h3>Saved Data:</h3>
                                <pre
                                    style={{
                                        overflowX: 'auto',
                                    }}
                                >
                                    {savedData}
                                </pre>
                            </div>
                        )}
                    </div>

                    {/* Leaderboard Section */}
                    <div style={{marginBottom: '20px'}}>
                        <h2>🏆 Leaderboard</h2>
                        <div style={{marginBottom: '10px'}}>
                            <input
                                type="number"
                                placeholder="Enter score to add"
                                value={scoreInput}
                                onChange={(e) => setScoreInput(e.target.value)}
                                style={{
                                    padding: '8px',
                                    margin: '5px',
                                    width: '200px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px'
                                }}
                            />
                        </div>
                        <button
                            onClick={handleAddScore}
                            style={{
                                padding: '10px 15px',
                                margin: '5px',
                                backgroundColor: '#ffc107',
                                color: 'black',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Add Score
                        </button>
                        <button
                            onClick={handleGetLeaderboard}
                            style={{
                                padding: '10px 15px',
                                margin: '5px',
                                backgroundColor: '#6f42c1',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Get Leaderboard
                        </button>

                        {leaderboardData && (
                            <div style={{
                                marginTop: '10px',
                                padding: '10px',
                                border: '1px solid #6f42c1',
                                borderRadius: '4px',
                                backgroundColor: '#f8f9fa'
                            }}>
                                <h3>Leaderboard Data:</h3>
                                <pre
                                    style={{
                                        overflowX: 'auto',
                                    }}
                                >{JSON.stringify(leaderboardData, null, 2)}</pre>
                            </div>
                        )}
                    </div>
                </>
            )}

            {!initialized && !loading && (
                <div style={{
                    color: 'red',
                    marginTop: '20px',
                    padding: '10px',
                    border: '1px solid red',
                    borderRadius: '4px'
                }}>
                    ❌ SDK failed to initialize. Make sure you're running in the correct environment (embedded in
                    iframe).
                </div>
            )}
        </div>
    );
};

export default App;