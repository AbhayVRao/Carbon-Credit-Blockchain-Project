import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, TextField, Button } from '@mui/material';

const CreateCreditForm = ({ user }) => {
    const [formData, setFormData] = useState({
        owner: user ? user.id : '',
        carbon_footprint: '',
        validity_period: '',
        price: ''
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3000/create_credit', formData);
            setFormData({
                owner: user ? user.id : '',
                carbon_footprint: '',
                validity_period: '',
                price: ''
            });
            alert('Carbon credit created successfully');
            navigate('/');
        } catch (error) {
            console.error('Error creating credit:', error);
        }
    };

    if (!user) {
        return <Typography variant="body1">Please log in to create credits</Typography>;
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Create Carbon Credit
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Carbon Footprint (tons)"
                        type="number"
                        id="carbon_footprint"
                        name="carbon_footprint"
                        value={formData.carbon_footprint}
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Validity Period (days)"
                        type="number"
                        id="validity_period"
                        name="validity_period"
                        value={formData.validity_period}
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Price ($)"
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                    />
                    <Button variant="contained" color="primary" type="submit">
                        Create Credit
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default CreateCreditForm;
