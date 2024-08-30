import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import CreditList from './components/CreditList';
import CreateCreditForm from './components/CreateCreditForm';
import TransactionsList from './components/TransactionsList';
import Login from './components/Login';
import Register from './components/Register';
import Portfolio from './components/Portfolio';
import './App.css';
import logo from './logo.png'; // Import the logo

function App() {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

    useEffect(() => {
        localStorage.setItem('user', JSON.stringify(user));
    }, [user]);

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <Router>
            <div className="background">
                <AppBar position="static" color="transparent" elevation={0}>
                    <Toolbar>
                        <img src={logo} alt="Logo" className="logo" />
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            Carbon Credit Marketplace
                        </Typography>
                        <Button color="inherit" component={Link} to="/">Home</Button>
                        <Button color="inherit" component={Link} to="/transactions">Transactions</Button>
                        {user ? (
                            <>
                                <Button color="inherit" component={Link} to="/create">Create Credit</Button>
                                <Button color="inherit" component={Link} to="/portfolio">Portfolio</Button>
                                <Typography variant="body1" component="div" sx={{ marginLeft: 2 }}>
                                    Welcome, {user.username} | Balance: ${user.balance}
                                </Typography>
                                <Button color="inherit" onClick={handleLogout}>Logout</Button>
                            </>
                        ) : (
                            <>
                                <Button color="inherit" component={Link} to="/login">Login</Button>
                                <Button color="inherit" component={Link} to="/register">Register</Button>
                            </>
                        )}
                    </Toolbar>
                </AppBar>
                <Container>
                    <Box mt={4}>
                        <Routes>
                            <Route path="/" element={<CreditList user={user} />} />
                            <Route path="/create" element={<CreateCreditForm user={user} />} />
                            <Route path="/transactions" element={<TransactionsList />} />
                            <Route path="/login" element={<Login setUser={setUser} />} />
                            <Route path="/register" element={<Register setUser={setUser} />} />
                            <Route path="/portfolio" element={<Portfolio user={user} />} />
                        </Routes>
                    </Box>
                </Container>
            </div>
        </Router>
    );
}

export default App;
