const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const schedule = require('node-schedule');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE,
        password TEXT,
        balance INTEGER
    )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS credits (
        id TEXT PRIMARY KEY,
        owner TEXT,
        carbon_footprint INTEGER,
        validity_period INTEGER,
        price INTEGER,
        status TEXT,
        buyer TEXT,
        purchased BOOLEAN,
        created_at TEXT,
        expires_at TEXT,
        FOREIGN KEY (owner) REFERENCES users (id)
    )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        credit_id TEXT,
        buyer TEXT,
        price INTEGER,
        carbon_footprint INTEGER,
        transaction_date TEXT,
        FOREIGN KEY (credit_id) REFERENCES credits (id),
        FOREIGN KEY (buyer) REFERENCES users (id)
    )
`);

// User registration
app.post('/register', (req, res) => {
    const { username, password, balance } = req.body;
    const newUser = {
        id: uuidv4(),
        username,
        password,
        balance
    };

    db.run(`
        INSERT INTO users (id, username, password, balance)
        VALUES (?, ?, ?, ?)
    `, [newUser.id, newUser.username, newUser.password, newUser.balance], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Username already exists' });
        }
        res.status(201).json(newUser);
    });
});

// User login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get(`
        SELECT * FROM users WHERE username = ? AND password = ?
    `, [username, password], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        res.status(200).json(user);
    });
});

// Create a new carbon credit
app.post('/create_credit', (req, res) => {
    const { owner, carbon_footprint, validity_period, price } = req.body;
    const newCredit = {
        id: uuidv4(),
        owner,
        carbon_footprint,
        validity_period,
        price,
        status: 'approved',
        buyer: null,
        purchased: false,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + validity_period * 24 * 60 * 60 * 1000).toISOString()
    };

    db.run(`
        INSERT INTO credits (id, owner, carbon_footprint, validity_period, price, status, buyer, purchased, created_at, expires_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [newCredit.id, newCredit.owner, newCredit.carbon_footprint, newCredit.validity_period, newCredit.price, newCredit.status, newCredit.buyer, newCredit.purchased, newCredit.created_at, newCredit.expires_at], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json(newCredit);
    });
});

// Get all approved credits sorted by price per carbon footprint
app.get('/credits', (req, res) => {
    db.all(`SELECT * FROM credits WHERE status = 'approved' AND purchased = 0 ORDER BY price/carbon_footprint ASC`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(rows);
    });
});

// Get credits owned by a user
app.get('/credits/:userId', (req, res) => {
    const { userId } = req.params;
    db.all(`SELECT * FROM credits WHERE owner = ? OR buyer = ?`, [userId, userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(rows);
    });
});

// Buy a carbon credit
app.post('/buy_credit', (req, res) => {
    const { creditId, buyerId } = req.body;
    db.get(`
        SELECT * FROM credits WHERE id = ? AND purchased = 0
    `, [creditId], (err, credit) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!credit) {
            return res.status(404).json({ error: 'Credit not found or already purchased' });
        }

        db.get(`
            SELECT * FROM users WHERE id = ?
        `, [buyerId], (err, buyer) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (!buyer) {
                return res.status(404).json({ error: 'Buyer not found' });
            }
            if (buyer.balance < credit.price) {
                return res.status(400).json({ error: 'Insufficient balance' });
            }

            db.run(`
                UPDATE users SET balance = balance - ? WHERE id = ?
            `, [credit.price, buyerId], (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }

                db.run(`
                    UPDATE credits
                    SET buyer = ?, purchased = 1
                    WHERE id = ? AND purchased = 0
                `, [buyerId, creditId], function (err) {
                    if (err) {
                        return res.status(500).json({ error: 'Database error' });
                    }
                    if (this.changes === 0) {
                        return res.status(404).json({ error: 'Credit not found or already purchased' });
                    }

                    db.run(`
                        UPDATE users SET balance = balance + ? WHERE id = ?
                    `, [credit.price, credit.owner], (err) => {
                        if (err) {
                            return res.status(500).json({ error: 'Database error' });
                        }

                        const transaction = {
                            id: uuidv4(),
                            credit_id: creditId,
                            buyer: buyerId,
                            price: credit.price,
                            carbon_footprint: credit.carbon_footprint,
                            transaction_date: new Date().toISOString()
                        };

                        db.run(`
                            INSERT INTO transactions (id, credit_id, buyer, price, carbon_footprint, transaction_date)
                            VALUES (?, ?, ?, ?, ?, ?)
                        `, [transaction.id, transaction.credit_id, transaction.buyer, transaction.price, transaction.carbon_footprint, transaction.transaction_date], (err) => {
                            if (err) {
                                return res.status(500).json({ error: 'Database error' });
                            }
                            res.status(200).json(transaction);
                        });
                    });
                });
            });
        });
    });
});

// Get recently executed transactions
app.get('/transactions', (req, res) => {
    db.all(`SELECT * FROM transactions ORDER BY transaction_date DESC LIMIT 10`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(rows);
    });
});

// Schedule job to check for expired credits
schedule.scheduleJob('*/1 * * * *', () => {
    const now = new Date().toISOString();
    db.run(`
        UPDATE credits
        SET status = 'expired'
        WHERE expires_at < ? AND status != 'expired'
    `, [now], (err) => {
        if (err) {
            console.error(err.message);
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
