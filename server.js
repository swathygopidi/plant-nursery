const express =require("express");
const mysql= require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require('path');
const cookieParser = require("cookie-parser");
const multer = require('multer');
const bcrypt = require('bcryptjs');
const session = require('express-session');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());


//app.use('/uploads', express.static('uploads')); // Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const db = mysql.createConnection({
     host: "localhost",
    user: "root",
    password: "root",
    database: "plantnursery"
});

const storage= multer.diskStorage({
    destination:(req,file,cb)=>{
    cb(null,`./uploads/`);
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now() + path.extname(file.originalname));
    }
});
const upload=multer({storage:storage});
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "homepage.html"));
});


db.connect((err) => {
    if (err) {
        console.error("Database connection failed: " + err.stack);
        return;
    }
    console.log("Connected to MySQL Database");
});

// POST route to handle form submission
app.post('/submit-plant', upload.single('plantImage'), (req, res) => {
    const { plantName, plantType, price } = req.body;
    const plantImage = req.file ? `/uploads/${req.file.filename}`: null;

    const sql = `INSERT INTO plants (plantName, plantType, price, plantImage) VALUES (?, ?, ?, ?)`;
    db.query(sql, [plantName, plantType, price, plantImage], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).send('Database Error');
        }
        res.send('Plant added successfully!');
    });
});

// API endpoint to fetch plants based on category
app.get('/plants/:category', (req, res) => {
    const category = req.params.category;

    // Query to fetch plants based on category
    const query = `SELECT * FROM plants WHERE plantType = ?`;

    db.query(query, [category], (err, results) => {
        if (err) {
            console.error('Error fetching plants:', err);
            return res.status(500).json({ error: 'Failed to fetch plants' });
        }
        res.json(results); // Return the fetched plants
    });
});

/*
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM user WHERE username = ? AND password = ?', [username, password], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).send('Database error');
        }
        if (results.length === 0) {
            return res.status(401).send('Invalid credentials');
        }
       
        res.send('Login successful');
        });
});


app.post('/register', (req, res) => {
    const { username, password, email } = req.body;
    db.execute('INSERT INTO user (username, password,email) VALUES (?, ?, ?)', [username, password, email], (err) => {
        if (err) {
            return res.status(500).send('Registration failed');
        }
        
        res.send('Registration successful');
        
    });
});
*/
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM user WHERE username = ? AND password = ?', [username, password], (err, results) => { // INSECURE: Storing passwords directly
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ message: 'Database error', redirect: 'register.html' });
        }
        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials', redirect: 'register.html' });
        }
        if (username === 'admin' && password === 'administrator') { //INSECURE: password check on client side.
            res.json({ message: 'Login successful', redirect: 'adminpage.html' });
        } else {
            res.json({ message: 'Login successful', redirect: 'homepage.html' });
        }
    });
});

app.post('/register', (req, res) => {
    const { username, password, email } = req.body;
    db.execute('INSERT INTO user (username, password, email) VALUES (?, ?, ?)', [username, password, email], (err) => { // INSECURE: Storing passwords directly
        if (err) {
            return res.status(500).json({ message: 'Registration failed' });
        }
        res.json({ message: 'Registration successful', redirect: 'login.html' });
    });
});
app.get('/logout', (req, res) => {
    // Perform any necessary logout actions (e.g., clear session, cookies)
    // ...

    // Redirect to homepage.html
    res.sendFile(path.join(__dirname, 'public', 'homepage.html')); //adjust path as needed.
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
