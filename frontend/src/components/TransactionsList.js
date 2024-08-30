import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Grid } from '@mui/material';

const TransactionsList = () => {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const response = await axios.get('http://localhost:3000/transactions');
            setTransactions(response.data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };

    return (
        <div className="transactions-list">
            <Typography variant="h4" gutterBottom>
                Recent Transactions
            </Typography>
            {transactions.length === 0 ? (
                <Typography variant="body1">No recent transactions.</Typography>
            ) : (
                <Grid container spacing={3}>
                    {transactions.map((transaction) => (
                        <Grid item xs={12} sm={6} md={4} key={transaction.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">Transaction ID: {transaction.id}</Typography>
                                    <Typography variant="body2">Credit ID: {transaction.credit_id}</Typography>
                                    <Typography variant="body2">Buyer: {transaction.buyer}</Typography>
                                    <Typography variant="body2">Price: ${transaction.price}</Typography>
                                    <Typography variant="body2">Carbon Footprint: {transaction.carbon_footprint} tons</Typography>
                                    <Typography variant="body2">Transaction Date: {new Date(transaction.transaction_date).toLocaleString()}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </div>
    );
};

export default TransactionsList;
