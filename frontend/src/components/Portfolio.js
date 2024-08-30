import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Grid } from '@mui/material';

const Portfolio = ({ user }) => {
    const [credits, setCredits] = useState([]);

    useEffect(() => {
        fetchCredits();
    }, []);

    const fetchCredits = async () => {
        if (!user) {
            alert('Please log in to view your portfolio');
            return;
        }
        try {
            const response = await axios.get(`http://localhost:3000/credits/${user.id}`);
            setCredits(response.data.filter(credit => credit.purchased && credit.buyer === user.id));
        } catch (error) {
            console.error('Error fetching credits:', error);
        }
    };

    return (
        <div className="portfolio">
            <Typography variant="h4" gutterBottom>
                My Portfolio
            </Typography>
            {credits.length === 0 ? (
                <Typography variant="body1">No credits in your portfolio.</Typography>
            ) : (
                <Grid container spacing={3}>
                    {credits.map((credit) => (
                        <Grid item xs={12} sm={6} md={4} key={credit.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">ID: {credit.id}</Typography>
                                    <Typography variant="body2">Carbon Footprint: {credit.carbon_footprint} tons</Typography>
                                    <Typography variant="body2">Price: ${credit.price}</Typography>
                                    <Typography variant="body2">Expires At: {new Date(credit.expires_at).toLocaleString()}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </div>
    );
};

export default Portfolio;
