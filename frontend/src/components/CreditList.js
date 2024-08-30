import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Button, Grid } from '@mui/material';

const CreditList = ({ user }) => {
    const [credits, setCredits] = useState([]);

    useEffect(() => {
        fetchCredits();
    }, []);

    const fetchCredits = async () => {
        try {
            const response = await axios.get('http://localhost:3000/credits');
            setCredits(response.data);
        } catch (error) {
            console.error('Error fetching credits:', error);
        }
    };

    const buyCredit = async (creditId) => {
        if (!user) {
            alert('Please log in to buy credits');
            return;
        }

        try {
            const response = await axios.post('http://localhost:3000/buy_credit', { creditId, buyerId: user.id });
            fetchCredits();
            user.balance -= response.data.price;
            localStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
            console.error('Error buying credit:', error);
            alert(error.response.data.error);
        }
    };

    return (
        <div className="credit-list">
            <Typography variant="h4" gutterBottom>
                Available Carbon Credits
            </Typography>
            {credits.length === 0 ? (
                <Typography variant="body1">No credits available for purchase.</Typography>
            ) : (
                <Grid container spacing={3}>
                    {credits.map((credit) => (
                        <Grid item xs={12} sm={6} md={4} key={credit.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">ID: {credit.id}</Typography>
                                    <Typography variant="body2">Owner: {credit.owner}</Typography>
                                    <Typography variant="body2">Carbon Footprint: {credit.carbon_footprint} tons</Typography>
                                    <Typography variant="body2">Price: ${credit.price}</Typography>
                                    <Typography variant="body2">Expires At: {new Date(credit.expires_at).toLocaleString()}</Typography>
                                    <Typography variant="body2">Price per Carbon Footprint: ${(credit.price / credit.carbon_footprint).toFixed(2)} $/ton</Typography>
                                    {!credit.purchased && (
                                        <Button variant="contained" color="primary" onClick={() => buyCredit(credit.id)}>
                                            Buy Credit
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </div>
    );
};

export default CreditList;
