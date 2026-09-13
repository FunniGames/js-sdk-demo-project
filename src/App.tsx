import {useEffect, useState} from "react";
import {
    addScore,
    checkPackageToken,
    getGameData,
    getLeaderboard,
    getProfile,
    listGamePackages,
    listOwnedPackages,
    purchaseGamePackage,
    saveGameData,
    start,
} from "./methods.ts";
import type {GamePackageCatalogItem, UserProfile} from "funnisdk";
import "./App.css";

type OutputBlock = {
    title: string;
    data: unknown;
};

type LogEntry = {
    id: number;
    time: string;
    message: string;
};

let logId = 0;

const formatJson = (value: unknown) => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "string") return value;
    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value);
    }
};

const OutputPanel = ({title, data}: OutputBlock) => (
    <div className="output-panel">
        <div className="output-panel-header">
            <span>{title}</span>
            <span>خروجی SDK</span>
        </div>
        <pre>{formatJson(data)}</pre>
    </div>
);

const App = () => {
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [savedData, setSavedData] = useState<unknown>(null);
    const [leaderboardData, setLeaderboardData] = useState<unknown>(null);
    const [scoreInput, setScoreInput] = useState("");
    const [saveKey, setSaveKey] = useState("game_data");
    const [saveValue, setSaveValue] = useState("");
    const [packageSku, setPackageSku] = useState("");
    const [packageIdentifier, setPackageIdentifier] = useState("");
    const [packagesData, setPackagesData] = useState<GamePackageCatalogItem[] | null>(null);
    const [ownedPackages, setOwnedPackages] = useState<unknown>(null);
    const [tokenCheckResult, setTokenCheckResult] = useState<unknown>(null);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [statusType, setStatusType] = useState<"info" | "success" | "error">("info");
    const [activityLog, setActivityLog] = useState<LogEntry[]>([]);
    const [busySection, setBusySection] = useState<string | null>(null);

    const pushLog = (message: string) => {
        const time = new Date().toLocaleTimeString("fa-IR");
        setActivityLog((prev) => [{id: ++logId, time, message}, ...prev].slice(0, 8));
    };

    const showStatus = (message: string, type: "info" | "success" | "error" = "info") => {
        setStatusMessage(message);
        setStatusType(type);
        pushLog(message);
    };

    useEffect(() => {
        const initializeSDK = async () => {
            setLoading(true);
            const success = await start();
            setInitialized(success);
            setLoading(false);
            if (success) {
                showStatus("SDK با موفقیت initialize شد.", "success");
            } else {
                showStatus(
                    "initialize ناموفق — بازی باید داخل iframe پلتفرم FunniGames باز شود.",
                    "error",
                );
            }
        };

        if (!initialized && !loading) {
            initializeSDK();
        }
    }, [initialized, loading]);

    useEffect(() => {
        if (!initialized) return;

        listGamePackages().then((result) => {
            if (result?.status && Array.isArray(result.data)) {
                setPackagesData(result.data);
                if (result.data.length > 0) {
                    setPackageSku((current) => current || result.data[0].sku);
                }
                pushLog(`کاتالوگ پکیج: ${result.data.length} مورد`);
            }
        });
    }, [initialized]);

    const handleGetProfile = async () => {
        setBusySection("profile");
        const profileData = await getProfile();
        setBusySection(null);
        if (profileData?.status) {
            setProfile(profileData.data);
            showStatus("پروفایل کاربر دریافت شد.", "success");
        } else {
            setProfile(null);
            showStatus("دریافت پروفایل ناموفق بود.", "error");
        }
    };

    const handleSaveData = async () => {
        if (!saveKey.trim()) {
            showStatus("کلید ذخیره‌سازی را وارد کنید.", "error");
            return;
        }

        const dataToSave = saveValue.trim()
            ? saveValue.trim()
            : {timestamp: new Date().toISOString(), randomValue: Math.random()};

        setBusySection("save");
        const success = await saveGameData(saveKey, dataToSave);
        setBusySection(null);

        if (success) {
            showStatus(`داده با کلید «${saveKey}» ذخیره شد.`, "success");
            setSaveValue("");
        } else {
            showStatus("ذخیره داده ناموفق بود.", "error");
        }
    };

    const handleGetData = async () => {
        setBusySection("save");
        const data = await getGameData(saveKey);
        setBusySection(null);
        setSavedData(data);
        if (data) {
            showStatus(`داده کلید «${saveKey}» بارگذاری شد.`, "success");
        } else {
            showStatus("داده‌ای برای این کلید پیدا نشد.", "error");
        }
    };

    const handleAddScore = async () => {
        const score = parseInt(scoreInput, 10);
        if (isNaN(score) || score <= 0) {
            showStatus("امتیاز معتبر (عدد مثبت) وارد کنید.", "error");
            return;
        }

        setBusySection("leaderboard");
        const success = await addScore(score);
        setBusySection(null);

        if (success) {
            showStatus(`${score} امتیاز به لیدربورد ارسال شد.`, "success");
            setScoreInput("");
        } else {
            showStatus("ارسال امتیاز ناموفق بود.", "error");
        }
    };

    const handleGetLeaderboard = async () => {
        setBusySection("leaderboard");
        const data = await getLeaderboard();
        setBusySection(null);
        setLeaderboardData(data);
        if (data) {
            showStatus("لیدربورد دریافت شد.", "success");
        } else {
            showStatus("دریافت لیدربورد ناموفق بود.", "error");
        }
    };

    const handleListPackages = async () => {
        setBusySection("packages");
        const result = await listGamePackages();
        setBusySection(null);

        if (result?.status && Array.isArray(result.data)) {
            setPackagesData(result.data);
            if (result.data.length > 0) {
                setPackageSku((current) => current || result.data[0].sku);
            }
            showStatus(`${result.data.length} پکیج فعال از پلتفرم دریافت شد.`, "success");
        } else {
            setPackagesData(null);
            showStatus("لیست پکیج‌ها خالی است یا خطا رخ داد.", "error");
        }
    };

    const handleListOwned = async () => {
        setBusySection("packages");
        const result = await listOwnedPackages();
        setBusySection(null);

        if (result?.status) {
            setOwnedPackages(result.data);
            showStatus("پکیج‌های خریده‌شده کاربر دریافت شد.", "success");
        } else {
            setOwnedPackages(null);
            showStatus("دریافت پکیج‌های owned ناموفق بود.", "error");
        }
    };

    const handleCheckToken = async () => {
        if (!packageIdentifier.trim()) {
            showStatus("برای checkToken ابتدا identifier را وارد کنید.", "error");
            return;
        }

        setBusySection("packages");
        const result = await checkPackageToken(packageIdentifier);
        setBusySection(null);

        if (result) {
            setTokenCheckResult(result);
            const granted = result.data?.status;
            showStatus(
                granted
                    ? "پکیج با این identifier grant شده است."
                    : "هنوز grant نشده — بعد از پرداخت دوباره چک کنید.",
                granted ? "success" : "info",
            );
        } else {
            setTokenCheckResult(null);
            showStatus("checkToken ناموفق بود.", "error");
        }
    };

    const handlePurchasePackage = async () => {
        if (!packageSku.trim()) {
            showStatus("ابتدا یک پکیج از لیست انتخاب کنید.", "error");
            return;
        }

        if (!packageIdentifier.trim()) {
            showStatus("identifier خرید را وارد کنید (یکتا برای این تلاش).", "error");
            return;
        }

        setBusySection("packages");
        const success = await purchaseGamePackage(packageSku, packageIdentifier);
        setBusySection(null);

        if (success) {
            showStatus(
                "فرآیند خرید باز شد. پرداخت را در پلتفرم انجام دهید، سپس Check Token بزنید.",
                "success",
            );
        } else {
            showStatus("باز کردن فرآیند خرید ناموفق بود.", "error");
        }
    };

    const statusClass = loading ? "loading" : initialized ? "ok" : "error";
    const statusLabel = loading
        ? "در حال initialize…"
        : initialized
          ? "SDK آماده"
          : "initialize ناموفق";

    return (
        <div className="demo-app">
            <header className="demo-header">
                <h1>FunniGames SDK — Demo</h1>
                <p>
                    این پروژه برای تست <code>funnisdk</code> داخل iframe پلتفرم FunniGames است.
                    هر بخش یک API SDK را صدا می‌زند و خروجی JSON را پایین همان کارت نشان می‌دهد.
                </p>
                <div className="status-row">
                    <span className={`status-pill ${statusClass}`}>{statusLabel}</span>
                    <span className="status-pill">host-mediated · postMessage</span>
                </div>
            </header>

            {statusMessage && (
                <div className={`banner ${statusType}`}>{statusMessage}</div>
            )}

            {!initialized && !loading && (
                <div className="banner error">
                    بازی را مستقیم روی localhost باز نکنید. URL این پروژه را در پلتفرم ثبت کنید
                    و از صفحه play در FunniGames تست کنید.
                </div>
            )}

            {initialized && (
                <div className="section-grid">
                    {/* Profile */}
                    <section className="card">
                        <div className="card-header">
                            <h2>👤 پروفایل</h2>
                            <div className="en">FunniGamesSDK.profile.getProfile()</div>
                        </div>
                        <p className="hint">
                            <strong>کار:</strong> اطلاعات کاربر لاگین‌شده (نام، سکه، wallet و …) را از پلتفرم می‌گیرد.
                            <br />
                            <strong>انتظار:</strong> بعد از کلیک، آبجکت پروفایل در خروجی نمایش داده می‌شود.
                        </p>
                        <div className="card-body">
                            <div className="btn-row">
                                <button
                                    className="btn btn-primary"
                                    onClick={handleGetProfile}
                                    disabled={busySection === "profile"}
                                >
                                    Get Profile
                                </button>
                            </div>
                            {profile
                                ? <OutputPanel title="Profile response" data={profile} />
                                : <div className="output-empty">هنوز پروفایلی دریافت نشده</div>}
                        </div>
                    </section>

                    {/* Save / Load */}
                    <section className="card">
                        <div className="card-header">
                            <h2>💾 ذخیره / بارگذاری</h2>
                            <div className="en">profile.saveData() · profile.getData()</div>
                        </div>
                        <p className="hint">
                            <strong>کار:</strong> داده سفارشی بازی را با یک key روی سرور ذخیره یا بارگذاری می‌کند.
                            <br />
                            <strong>نکته:</strong> value می‌تواند JSON باشد؛ اگر خالی بماند یک آبجکت نمونه ذخیره می‌شود.
                        </p>
                        <div className="card-body">
                            <div className="field-row">
                                <div className="field">
                                    <label>Key</label>
                                    <input
                                        value={saveKey}
                                        onChange={(e) => setSaveKey(e.target.value)}
                                        placeholder="player_stats"
                                    />
                                </div>
                                <div className="field">
                                    <label>Value (اختیاری)</label>
                                    <input
                                        value={saveValue}
                                        onChange={(e) => setSaveValue(e.target.value)}
                                        placeholder='{"level":3}'
                                    />
                                </div>
                            </div>
                            <div className="btn-row">
                                <button
                                    className="btn btn-success"
                                    onClick={handleSaveData}
                                    disabled={busySection === "save"}
                                >
                                    Save
                                </button>
                                <button
                                    className="btn btn-info"
                                    onClick={handleGetData}
                                    disabled={busySection === "save"}
                                >
                                    Load
                                </button>
                            </div>
                            {savedData
                                ? <OutputPanel title={`Loaded: ${saveKey}`} data={savedData} />
                                : <div className="output-empty">خروجی Load اینجا نمایش داده می‌شود</div>}
                        </div>
                    </section>

                    {/* Packages */}
                    <section className="card">
                        <div className="card-header">
                            <h2>🛒 Game Packages</h2>
                            <div className="en">packages.list() · purchase() · checkToken()</div>
                        </div>
                        <p className="hint">
                            بازی نیازی به ارسال شناسه بازی ندارد — پلتفرم context را از صفحه play می‌گیرد.
                            شما فقط <strong>SKU</strong> (از کاتالوگ) و <strong>identifier</strong> (توکن یکتای خود بازی) را می‌دهید.
                        </p>
                        <div className="card-body">
                            <ol className="steps">
                                <li>List Packages — کاتالوگ پکیج‌های فعال این بازی</li>
                                <li>SKU را انتخاب کنید + identifier یکتا بزنید (مثلاً level-3-bonus)</li>
                                <li>Buy Package — UI خرید پلتفرم باز می‌شود (منتظر پرداخت نمی‌ماند)</li>
                                <li>بعد از پرداخت: Check Token یا List Owned</li>
                            </ol>
                            <div className="field-row">
                                <div className="field">
                                    <label>Package SKU (از کاتالوگ)</label>
                                    <select
                                        value={packageSku}
                                        onChange={(e) => setPackageSku(e.target.value)}
                                    >
                                        <option value="">— انتخاب پکیج —</option>
                                        {packagesData?.map((pack) => (
                                            <option key={pack.sku} value={pack.sku}>
                                                {pack.name} · {pack.sku} · {pack.price} {pack.currency}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="field">
                                    <label>Identifier (توکن یکتای بازی)</label>
                                    <input
                                        value={packageIdentifier}
                                        onChange={(e) => setPackageIdentifier(e.target.value)}
                                        placeholder="level-3-bonus"
                                    />
                                </div>
                            </div>
                            <div className="btn-row">
                                <button
                                    className="btn btn-secondary"
                                    onClick={handleListPackages}
                                    disabled={busySection === "packages"}
                                >
                                    List Packages
                                </button>
                                <button
                                    className="btn btn-warning"
                                    onClick={handlePurchasePackage}
                                    disabled={busySection === "packages"}
                                >
                                    Buy Package
                                </button>
                                <button
                                    className="btn btn-info"
                                    onClick={handleCheckToken}
                                    disabled={busySection === "packages"}
                                >
                                    Check Token
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={handleListOwned}
                                    disabled={busySection === "packages"}
                                >
                                    List Owned
                                </button>
                            </div>
                            {packagesData && (
                                <OutputPanel title="Catalog (list)" data={packagesData} />
                            )}
                            {tokenCheckResult != null && (
                                <OutputPanel title="checkToken response" data={tokenCheckResult} />
                            )}
                            {ownedPackages != null && (
                                <OutputPanel title="Owned packages (listOwned)" data={ownedPackages} />
                            )}
                            {!packagesData && tokenCheckResult == null && ownedPackages == null && (
                                <div className="output-empty">
                                    خروجی پکیج‌ها اینجا نمایش داده می‌شود
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Leaderboard */}
                    <section className="card">
                        <div className="card-header">
                            <h2>🏆 لیدربورد</h2>
                            <div className="en">leaderboard.addScore() · getLeaderboard()</div>
                        </div>
                        <p className="hint">
                            <strong>کار:</strong> امتیاز جلسه را به لیدربورد بازی اضافه کنید یا رتبه‌بندی فعلی را بگیرید.
                        </p>
                        <div className="card-body">
                            <div className="field-row">
                                <div className="field">
                                    <label>Score</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={scoreInput}
                                        onChange={(e) => setScoreInput(e.target.value)}
                                        placeholder="100"
                                    />
                                </div>
                            </div>
                            <div className="btn-row">
                                <button
                                    className="btn btn-warning"
                                    onClick={handleAddScore}
                                    disabled={busySection === "leaderboard"}
                                >
                                    Add Score
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleGetLeaderboard}
                                    disabled={busySection === "leaderboard"}
                                >
                                    Get Leaderboard
                                </button>
                            </div>
                            {leaderboardData
                                ? <OutputPanel title="Leaderboard" data={leaderboardData} />
                                : <div className="output-empty">خروجی لیدربورد اینجا نمایش داده می‌شود</div>}
                        </div>
                    </section>

                    {activityLog.length > 0 && (
                        <section className="card activity-log">
                            <div className="card-header">
                                <h2>📋 لاگ اقدامات</h2>
                            </div>
                            <div className="card-body">
                                {activityLog.map((entry) => (
                                    <div key={entry.id} className="log-item">
                                        <time>{entry.time}</time>
                                        {entry.message}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
};

export default App;
