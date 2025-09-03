import React, { useState, useEffect } from 'react';

const GEOAPIFY_API_KEY = 'YOUR_GEOAPIFY_API_KEY'; // Replace with your key

const KundliManager = () => {
    const [kundliList, setKundliList] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        dob: '',
        time: '',
        placeOfBirth: '', // user types here
        city: '',
        state: '',
        country: '',
    });
    const [suggestions, setSuggestions] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);

    // Fetch autocomplete suggestions from Geoapify
    const fetchSuggestions = async (input) => {
        if (!input) {
            setSuggestions([]);
            return;
        }
        try {
            const response = await fetch(
                `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(input)}&limit=5&apiKey=${GEOAPIFY_API_KEY}`
            );
            const data = await response.json();
            setSuggestions(data.features || []);
        } catch (err) {
            console.error('Geoapify fetch error:', err);
        }
    };

    // Handle typing in placeOfBirth input
    const handlePlaceChange = (e) => {
        const value = e.target.value;
        setFormData((prev) => ({ ...prev, placeOfBirth: value }));
        fetchSuggestions(value);
    };

    // When user clicks a suggestion, fill city, state, country and clear suggestions
    const handleSelectSuggestion = (feature) => {
        const props = feature.properties;
        setFormData((prev) => ({
            ...prev,
            placeOfBirth: props.formatted || '',
            city: props.city || '',
            state: props.state || '',
            country: props.country || '',
        }));
        setSuggestions([]);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingIndex !== null) {
            const updatedList = [...kundliList];
            updatedList[editingIndex] = formData;
            setKundliList(updatedList);
            setEditingIndex(null);
        } else {
            setKundliList([...kundliList, formData]);
        }
        setFormData({ name: '', dob: '', time: '', placeOfBirth: '', city: '', state: '', country: '' });
    };

    const handleEdit = (index) => {
        setFormData(kundliList[index]);
        setEditingIndex(index);
    };

    const handleDelete = (index) => {
        const updatedList = kundliList.filter((_, i) => i !== index);
        setKundliList(updatedList);
    };

    return (
        <div>
            <h2>Kundli Entry</h2>
            <form onSubmit={handleSubmit} autoComplete="off" className="mb-4">
                <div className="mb-2">
                    <label>Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>
                <div className="mb-2">
                    <label>Date of Birth</label>
                    <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>
                <div className="mb-2">
                    <label>Time of Birth</label>
                    <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>
                <div className="mb-2 position-relative">
                    <label>Place of Birth</label>
                    <input
                        type="text"
                        name="placeOfBirth"
                        value={formData.placeOfBirth}
                        onChange={handlePlaceChange}
                        className="form-control"
                        required
                        autoComplete="off"
                    />
                    {suggestions.length > 0 && (
                        <ul
                            className="list-group position-absolute w-100"
                            style={{ maxHeight: '150px', overflowY: 'auto', zIndex: 1000 }}
                        >
                            {suggestions.map((feature, idx) => (
                                <li
                                    key={idx}
                                    className="list-group-item list-group-item-action"
                                    onClick={() => handleSelectSuggestion(feature)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {feature.properties.formatted}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <button type="submit" className="btn btn-primary mt-3">
                    {editingIndex !== null ? 'Update' : 'Save'}
                </button>
            </form>

            <h3>Saved Kundlis</h3>
            {kundliList.length === 0 && <p>No Kundlis saved yet.</p>}
            <ul className="list-group">
                {kundliList.map((kundli, idx) => (
                    <li
                        key={idx}
                        className="list-group-item d-flex justify-content-between align-items-center"
                    >
                        <div>
                            <strong>{kundli.name}</strong> - {kundli.dob} {kundli.time}, {kundli.placeOfBirth}
                            <br />
                            <small>
                                City: {kundli.city}, State: {kundli.state}, Country: {kundli.country}
                            </small>
                        </div>
                        <div>
                            <button
                                className="btn btn-sm btn-info me-2"
                                onClick={() => handleEdit(idx)}
                            >
                                Edit
                            </button>
                            <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(idx)}
                            >
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            {/* Kundli chart & calculations will go here later */}
        </div>
    );
};

export default KundliManager;
