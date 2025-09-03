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
import { app } from '../firebase';  // Your firebase config
import { calculateKundli } from '../utils/kundliCalculator';  // Your kundli logic

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
    const [kundliCharts, setKundliCharts] = useState({}); // store kundli data keyed by id

    // Fetch kundli entries from Firestore on component mount
    useEffect(() => {
        const fetchKundlis = async () => {
            try {
                const snapshot = await getDocs(kundliCollection);
                const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setKundliList(list);
            } catch (error) {
                console.error('Error fetching kundlis:', error);
            }
        };
        fetchKundlis();
    }, []);

    // Fetch place suggestions for autocomplete from Geoapify
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
        } catch (error) {
            console.error('Geoapify fetch error:', error);
        }
    };

    const handlePlaceChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, placeOfBirth: value }));
        fetchSuggestions(value);
    };

    const handleSelectSuggestion = (feature) => {
        const props = feature.properties;
        setFormData(prev => ({
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
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Open modal for adding new kundli
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

    // Open modal for editing existing kundli
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

    // Handle form submit: add or update Firestore record
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (editingIndex !== null) {
            // Update existing kundli
            try {
                const id = formData.id;
                if (!id) {
                    alert('Missing ID for update');
                    return;
                }
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
            } catch (error) {
                console.error('Update error:', error);
                alert('Failed to update entry');
            }
        } else {
            // Add new kundli
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
            } catch (error) {
                console.error('Add error:', error);
                alert('Failed to add entry');
            }
        }
    };

    // Delete kundli entry from Firestore and state
    const handleDelete = async (id) => {
        if (!id) return alert('Missing ID');
        if (window.confirm('Are you sure you want to delete this entry?')) {
            try {
                await deleteDoc(doc(db, 'kundlis', id));
                setKundliList(kundliList.filter(k => k.id !== id));
                setExpandedChartIndex(null);
            } catch (error) {
                console.error('Delete error:', error);
                alert('Failed to delete entry');
            }
        }
    };

    // Generate kundli chart and save in state for rendering
    const generateKundli = (entry) => {
        const kundliData = calculateKundli({
            dob: entry.dob,
            time: entry.time,
            city: entry.city,
            state: entry.state,
            country: entry.country
        });
        console.log('Generated Kundli Data:', kundliData);  // <--- Add this

        setKundliCharts(prev => ({ ...prev, [entry.id]: kundliData }));
    };

    // Toggle chart visibility, generate if opening
    const toggleChart = (index) => {
        if (expandedChartIndex === index) {
            setExpandedChartIndex(null);
        } else {
            generateKundli(kundliList[index]);
            setExpandedChartIndex(index);
        }
    };
    // Render kundli chart details
    const renderChartDetails = (entry) => {
        const kundliData = kundliCharts[entry.id];
        return (
            <div className="p-3 mt-3 bg-light border rounded">
                <h5>Kundli Chart for {entry.name}</h5>
                <p><strong>Date of Birth:</strong> {entry.dob}</p>
                <p><strong>Time of Birth:</strong> {entry.time}</p>
                <p><strong>Place of Birth:</strong> {entry.placeOfBirth}</p>
                <p><strong>City:</strong> {entry.city}, <strong>State:</strong> {entry.state}, <strong>Country:</strong> {entry.country}</p>
                <div className="mt-2 p-2 bg-white rounded shadow-sm">
                    <strong>Calculated Info:</strong>
                    <ul>
                        <li>Sun Sign: {kundliData ? kundliData.sunSign : 'Loading...'}</li>
                        <li>Moon Sign: {kundliData ? kundliData.moonSign : 'Loading...'}</li>
                        <li>Ascendant: {kundliData ? kundliData.ascendant : 'Loading...'}</li>
                    </ul>
                    {kundliData && (
                        <>
                            <strong>Yogas:</strong>
                            <ul>
                                {kundliData.yogas.map((yoga, i) => (
                                    <li key={i}>{yoga}</li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between mb-4">
                <h2>Kundli Entries</h2>
                <Button variant="primary" onClick={openAddModal}>+ Add New</Button>
            </div>

            {kundliList.length === 0 ? (
                <p className="text-muted">No entries found. Add new kundli above.</p>
            ) : (
                <ListGroup>
                    {kundliList.map((entry, index) => (
                        <ListGroup.Item key={entry.id} className="mb-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <div style={{ cursor: 'pointer' }} onClick={() => toggleChart(index)}>
                                    <h5>{entry.name}</h5>
                                    <small>{entry.placeOfBirth}</small>
                                </div>
                                <div>
                                    <Button
                                        variant={expandedChartIndex === index ? 'warning' : 'success'}
                                        size="sm"
                                        className="me-2"
                                        onClick={() => toggleChart(index)}
                                    >
                                        {expandedChartIndex === index ? 'Hide Chart' : 'Show Chart'}
                                    </Button>
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => openEditModal(index)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleDelete(entry.id)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>

                            <Collapse in={expandedChartIndex === index}>
                                <div>{renderChartDetails(entry)}</div>
                            </Collapse>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}

            {/* Modal for Add/Edit */}
            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{editingIndex !== null ? 'Edit Kundli' : 'Add Kundli'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit} autoComplete="off">
                        {['name', 'dob', 'time', 'placeOfBirth', 'city', 'state', 'country'].map(field => (
                            <Form.Group className="mb-3" controlId={`form${field}`} key={field}>
                                <Form.Label>{field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}</Form.Label>
                                <Form.Control
                                    name={field}
                                    type={field === 'dob' ? 'date' : field === 'time' ? 'time' : 'text'}
                                    value={formData[field]}
                                    onChange={field === 'placeOfBirth' ? handlePlaceChange : handleChange}
                                    required
                                />
                                {field === 'placeOfBirth' && suggestions.length > 0 && (
                                    <ListGroup className="position-absolute w-100 shadow" style={{ zIndex: 1050 }}>
                                        {suggestions.map(feature => (
                                            <ListGroup.Item
                                                action
                                                key={feature.properties.place_id || feature.properties.osm_id}
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
