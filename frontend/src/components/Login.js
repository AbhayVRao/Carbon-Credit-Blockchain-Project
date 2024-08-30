import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, TextField, Button } from '@mui/material';

const Login = ({ setUser }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3000/login', formData);
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
            navigate('/');
        } catch (error) {
            console.error('Error logging in:', error);
            alert('Invalid username or password');
        }
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Login
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Username"
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Password"
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <Button variant="contained" color="primary" type="submit">
                        Login
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default Login;
