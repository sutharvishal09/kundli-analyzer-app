// KundliAnalyzer.jsx

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, ListGroup, Collapse } from 'react-bootstrap';
import {
    getFirestore,
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs
} from 'firebase/firestore';
import { app } from '../firebase'; // Make sure app is exported in firebase.js


const GEOAPIFY_API_KEY = '43e931c41ff148aa9900f59e664578ff';

const KundliAnalyzer = () => {
    const db = getFirestore(app);
    const kundliCollection = collection(db, 'kundlis');

    const [kundliList, setKundliList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        dob: '',
        time: '',
        placeOfBirth: '',
        city: '',
        state: '',
        country: ''
    });
    const [suggestions, setSuggestions] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
    const [expandedChartIndex, setExpandedChartIndex] = useState(null);

    // Fetch kundlis from Firestore on load
    useEffect(() => {
        const fetchKundlis = async () => {
            try {
                const snapshot = await getDocs(kundliCollection);
                const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setKundliList(list);
            } catch (err) {
                console.error('Error fetching kundlis:', err);
            }
        };
        fetchKundlis();
    }, []);

    // Fetch place suggestions from Geoapify
    const fetchSuggestions = async (input) => {
        if (!input) return setSuggestions([]);
        try {
            const res = await fetch(
                `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
                    input
                )}&limit=5&apiKey=${GEOAPIFY_API_KEY}`
            );
            const data = await res.json();
            setSuggestions(data.features || []);
        } catch (err) {
            console.error('Geoapify error:', err);
        }
    };

    const handlePlaceChange = (e) => {
        const value = e.target.value;
        setFormData((prev) => ({ ...prev, placeOfBirth: value }));
        fetchSuggestions(value);
    };

    const handleSelectSuggestion = (feature) => {
        const props = feature.properties;
        setFormData((prev) => ({
            ...prev,
            placeOfBirth: props.formatted || '',
            city: props.city || '',
            state: props.state || '',
            country: props.country || ''
        }));
        setSuggestions([]);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const openAddModal = () => {
        setFormData({
            id: '',
            name: '',
            dob: '',
            time: '',
            placeOfBirth: '',
            city: '',
            state: '',
            country: ''
        });
        setEditingIndex(null);
        setSuggestions([]);
        setShowModal(true);
    };

    const openEditModal = (index) => {
        setFormData(kundliList[index]);
        setEditingIndex(index);
        setSuggestions([]);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSuggestions([]);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (editingIndex !== null) {
            const id = formData.id;
            if (!id) return alert('Missing ID for update');
            try {
                const docRef = doc(db, 'kundlis', id);
                await updateDoc(docRef, {
                    name: formData.name,
                    dob: formData.dob,
                    time: formData.time,
                    placeOfBirth: formData.placeOfBirth,
                    city: formData.city,
                    state: formData.state,
                    country: formData.country
                });
                const updatedList = [...kundliList];
                updatedList[editingIndex] = formData;
                setKundliList(updatedList);
                setShowModal(false);
            } catch (err) {
                console.error('Update error:', err);
                alert('Failed to update');
            }
        } else {
            try {
                const docRef = await addDoc(kundliCollection, {
                    name: formData.name,
                    dob: formData.dob,
                    time: formData.time,
                    placeOfBirth: formData.placeOfBirth,
                    city: formData.city,
                    state: formData.state,
                    country: formData.country
                });
                setKundliList([...kundliList, { ...formData, id: docRef.id }]);
                setShowModal(false);
            } catch (err) {
                console.error('Add error:', err);
                alert('Failed to save');
            }
        }
    };

    const handleDelete = async (index) => {
        const entry = kundliList[index];
        if (!entry.id) return alert('Missing ID');
        if (window.confirm(`Delete ${entry.name}?`)) {
            try {
                await deleteDoc(doc(db, 'kundlis', entry.id));
                const updated = kundliList.filter((_, i) => i !== index);
                setKundliList(updated);
                if (expandedChartIndex === index) setExpandedChartIndex(null);
            } catch (err) {
                console.error('Delete error:', err);
                alert('Failed to delete');
            }
        }
    };

    const renderChartDetails = (kundli) => (
        <div className="p-3 mt-3 bg-light border rounded">
            <h5>Kundli Chart for {kundli.name}</h5>
            <p><strong>Date:</strong> {kundli.dob}</p>
            <p><strong>Time:</strong> {kundli.time}</p>
            <p><strong>Location:</strong> {kundli.placeOfBirth}</p>
            <p><strong>City:</strong> {kundli.city}, <strong>State:</strong> {kundli.state}, <strong>Country:</strong> {kundli.country}</p>
            <div className="mt-2 p-2 bg-white rounded shadow-sm">
                <strong>Sample Calculations</strong>
                <ul>
                    <li>Sun Sign: ♌ (Leo)</li>
                    <li>Moon Sign: ♋ (Cancer)</li>
                    <li>Ascendant: ♎ (Libra)</li>
                </ul>
            </div>
        </div>
    );

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between mb-4">
                <h2>Kundli Entries</h2>
                <Button variant="primary" onClick={openAddModal}>+ Add New</Button>
            </div>

            {kundliList.length === 0 ? (
                <div className="text-muted">No entries yet. Click "Add New" to begin.</div>
            ) : (
                <ListGroup>
                    {kundliList.map((entry, index) => (
                        <ListGroup.Item key={entry.id} className="mb-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <div onClick={() => setExpandedChartIndex(expandedChartIndex === index ? null : index)} style={{ cursor: 'pointer' }}>
                                    <h5>{entry.name}</h5>
                                    <small>{entry.placeOfBirth}</small>
                                </div>
                                <div>
                                    <Button
                                        variant={expandedChartIndex === index ? 'warning' : 'success'}
                                        size="sm"
                                        className="me-2"
                                        onClick={() => setExpandedChartIndex(expandedChartIndex === index ? null : index)}
                                    >
                                        {expandedChartIndex === index ? 'Hide Chart' : 'Show Chart'}
                                    </Button>
                                    <Button variant="outline-secondary" size="sm" onClick={() => openEditModal(index)} className="me-2">Edit</Button>
                                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(index)}>Delete</Button>
                                </div>
                            </div>
                            <Collapse in={expandedChartIndex === index}>
                                <div>{renderChartDetails(entry)}</div>
                            </Collapse>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}

            {/* Modal */}
            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{editingIndex !== null ? 'Edit Kundli' : 'Add Kundli'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit} autoComplete="off">
                        {['name', 'dob', 'time', 'placeOfBirth', 'city', 'state', 'country'].map((field, i) => (
                            <Form.Group key={i} className="mb-3" controlId={`form${field}`}>
                                <Form.Label>{field.replace(/([A-Z])/g, ' $1')}</Form.Label>
                                <Form.Control
                                    name={field}
                                    value={formData[field]}
                                    onChange={field === 'placeOfBirth' ? handlePlaceChange : handleChange}
                                    required
                                    type={field === 'dob' ? 'date' : field === 'time' ? 'time' : 'text'}
                                />
                                {field === 'placeOfBirth' && suggestions.length > 0 && (
                                    <ListGroup className="position-absolute w-100 shadow" style={{ zIndex: 1050 }}>
                                        {suggestions.map((feature) => (
                                            <ListGroup.Item
                                                key={feature.properties.place_id || feature.properties.osm_id}
                                                action
                                                onClick={() => handleSelectSuggestion(feature)}
                                            >
                                                {feature.properties.formatted}
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                )}
                            </Form.Group>
                        ))}
                        <div className="d-flex justify-content-end">
                            <Button variant="secondary" onClick={handleCloseModal} className="me-2">Cancel</Button>
                            <Button variant="primary" type="submit">{editingIndex !== null ? 'Update' : 'Save'}</Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default KundliAnalyzer;
