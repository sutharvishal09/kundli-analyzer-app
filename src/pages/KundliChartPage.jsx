import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../firebase";
import { Form, Card, Button } from "react-bootstrap";

const BACKEND_URL = "http://localhost:5000/analyze";

const labels = {
    en: {
        title: "Kundli Chart",
        select: "Select Kundli",
        showChart: "Show Chart",
        dob: "Date of Birth",
        time: "Time of Birth",
        place: "Place",
        ascendant: "Ascendant",
        moon: "Moon Sign",
        planets: "Planets",
        houses: "Houses",
        noPlanets: "No planets data",
        noHouses: "No houses data",
        loading: "Loading..."
    },
    gu: {
        title: "કુંડળી ચાર્ટ",
        select: "કુંડળી પસંદ કરો",
        showChart: "ચાર્ટ બતાવો",
        dob: "જન્મ તારીખ",
        time: "જન્મ સમય",
        place: "જન્મ સ્થાન",
        ascendant: "લગ્ન",
        moon: "ચંદ્ર રાશિ",
        planets: "ગ્રહો",
        houses: "ભાવો",
        noPlanets: "કોઈ ગ્રહોની માહિતી નથી",
        noHouses: "કોઈ ભાવોની માહિતી નથી",
        loading: "લોડ થઈ રહ્યું છે..."
    },
};

const KundliChartPage = () => {
    const db = getFirestore(app);
    const kundliCollection = collection(db, "kundlis");

    const [kundliList, setKundliList] = useState([]);
    const [selectedKundliId, setSelectedKundliId] = useState("");
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [language, setLanguage] = useState("en");

    // Fetch Kundli entries from Firestore
    useEffect(() => {
        const fetchKundlis = async () => {
            try {
                const snapshot = await getDocs(kundliCollection);
                const list = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setKundliList(list);
            } catch (error) {
                console.error("Error fetching kundlis:", error);
            }
        };
        fetchKundlis();
    }, []);

    // Fetch Kundli chart from backend
    const fetchChart = async () => {
        if (!selectedKundliId) return;
        const entry = kundliList.find((k) => k.id === selectedKundliId);
        if (!entry) return;

        setLoading(true);
        try {
            console.log("Sending request for:", entry);

            const response = await fetch(BACKEND_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName: entry.name,
                    dateOfBirth: entry.dob,
                    timeOfBirth: entry.time,
                    placeOfBirth: entry.placeOfBirth,
                    latitude: entry.latitude,
                    longitude: entry.longitude,
                }),
            });

            const result = await response.json();
            console.log("Backend response:", result);

            if (result.status === "success") {
                setChartData(result.data);
            } else {
                alert("Failed to fetch Kundli: " + result.message);
            }
        } catch (err) {
            console.error("Error fetching kundli:", err);
        }
        setLoading(false);
    };

    const t = labels[language];

    return (
        <div className="py-4">
            <h2>{t.title}</h2>

            <div className="mb-3 d-flex gap-3">
                <Form.Select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    style={{ width: "150px" }}
                >
                    <option value="en">English</option>
                    <option value="gu">ગુજરાતી</option>
                </Form.Select>

                <Form.Group controlId="kundliSelect" className="flex-grow-1">
                    <Form.Label>{t.select}</Form.Label>
                    <Form.Select
                        value={selectedKundliId}
                        onChange={(e) => setSelectedKundliId(e.target.value)}
                    >
                        <option value="">-- {t.select} --</option>
                        {kundliList.map((entry) => (
                            <option key={entry.id} value={entry.id}>
                                {entry.name} ({entry.placeOfBirth})
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
            </div>

            <Button
                variant="primary"
                onClick={fetchChart}
                disabled={!selectedKundliId || loading}
            >
                {loading ? t.loading : t.showChart}
            </Button>

            {chartData && (
                <Card className="mt-3 p-3">
                    <h5>🔮 {t.title} - {kundliList.find(k => k.id === selectedKundliId)?.name}</h5>
                    <p><strong>{t.dob}:</strong> {chartData.dob}</p>
                    <p><strong>{t.time}:</strong> {chartData.time}</p>
                    <p><strong>{t.place}:</strong> {chartData.placeOfBirth}</p>
                    <p><strong>{t.ascendant}:</strong> {chartData.ascendant}</p>
                    <p><strong>{t.moon}:</strong> {chartData.moon_sign}</p>

                    <h6>{t.planets}</h6>
                    <ul>
                        {chartData.planets && Object.keys(chartData.planets).length > 0
                            ? Object.entries(chartData.planets).map(([planet, info]) => (
                                <li key={planet}>
                                    {planet}: {info.sign} ({info.lon}) {info.house ? `House ${info.house}` : ""}
                                </li>
                            ))
                            : t.noPlanets}
                    </ul>

                    <h6>{t.houses}</h6>
                    <ul>
                        {chartData.houses && Object.keys(chartData.houses).length > 0
                            ? Object.entries(chartData.houses).map(([house, sign]) => (
                                <li key={house}>
                                    {house}: {sign}
                                </li>
                            ))
                            : t.noHouses}
                    </ul>
                </Card>
            )}
        </div>
    );
};

export default KundliChartPage;
