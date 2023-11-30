const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();

const port = 3000;

app.use(bodyParser.json());

const db = new sqlite3.Database(':memory:'); // For demonstration, use in-memory database
const newData = [{ LedgerName: "Ishan" }, { LedgerName: "Taruna" }, { LedgerName: "Anant" }, { LedgerName: "Comapny New" }, { LedgerName: "Some Enter" }, { LedgerName: "Ipsum Donor" }, { LedgerName: "" }, { LedgerName: "Ishan" }, { LedgerName: "dummy text" }, { LedgerName: "Ishan" }, { LedgerName: "Ishan" }, { LedgerName: "Ishan" }, { LedgerName: "Ishan" }, { LedgerName: "UBER Technologies" }, { LedgerName: "industry's standard" }, { LedgerName: "Ishan" }, { LedgerName: " has survived " }, { LedgerName: "UBER Technologies" }, { LedgerName: "the 1500s" }, { LedgerName: "electronic typesetting" }, { LedgerName: "Ishan" }, { LedgerName: "Ishan" }, { LedgerName: "UBER Technologies" }, { LedgerName: "Ish Enterprises" }, { LedgerName: "Ishan" }, { LedgerName: "Ishan" }, { LedgerName: "five centuries" }, { LedgerName: "Ishan" }, { LedgerName: "UBER Technologies" }, { LedgerName: "Bharat Associates" }, { LedgerName: "Ishan" }, { LedgerName: "Google .CO" }, { LedgerName: "UBER Technologies" }, { LedgerName: "Ishan" }, { LedgerName: "Ishan" }, { LedgerName: "not only" }, { LedgerName: "Ishan" }, { LedgerName: "UBER Technologies" }, { LedgerName: "Ishan" }, { LedgerName: "Bharat Associates" }, { LedgerName: "Ishan" }, { LedgerName: "Ishan" }, { LedgerName: "Ishan" }, { LedgerName: "Ishan" }, { LedgerName: "Ishan" }, { LedgerName: "Bharat Associates" }, { LedgerName: "essentially unchanged" }, { LedgerName: "Ishan" }, { LedgerName: "Bharat Associates" }, { LedgerName: "VIPIN LTD" }, { LedgerName: "Bharat Associates" }, { LedgerName: "Unique" }, { LedgerName: "Ishan" }, { LedgerName: "Shri RAM" }, { LedgerName: "Ishan" }, { LedgerName: "Bharat" }, { LedgerName: "Google .CO" }, { LedgerName: "Google .CO" }, { LedgerName: "Google .CO" }, { LedgerName: "Google .CO" }, { LedgerName: "Google .CO" }, { LedgerName: "Google .CO" }, { LedgerName: "Google .CO" }, { LedgerName: "Shri RAM" }, { LedgerName: "Shri RAM" }, { LedgerName: "Shri RAM" }, { LedgerName: "Shri RAM" }, { LedgerName: "Shri RAM" }, { LedgerName: "Shri RAM" }]
// Create a table
db.run(`
    CREATE TABLE IF NOT EXISTS Ledgers (
        LedgerID INTEGER PRIMARY KEY AUTOINCREMENT,
        LedgerName TEXT NOT NULL
    )
`);
app.use(express.json());
app.get('/ledgers', (req, res) => {


    // db.all('SELECT LedgerName FROM ledgers', (err, rows) => {
    //     if (err) {
    //         return res.status(500).json({ error: err.message });
    //     }

    // res.json(newData);

    // });
    res.json(newData);
});
// app.get('/api/ledgers', (req, res) => {
//     // Fetch LedgerName from the ledgers table
//     db.all('SELECT LedgerName FROM ledgers', (err, rows) => {
//         if (err) {
//             return res.status(500).json({ error: err.message });
//         }

//         // Extract LedgerName values into an array
//         const ledgerNames = rows.map(row => row.LedgerName);

//         // Send the array to the frontend
//         res.json({ ledgerNames });
//     });
// });
app.post('/updateLedgers', (req, res) => {
    const ledgers = req.body.ledgersArray;

    const insertLedger = db.prepare('INSERT INTO Ledgers (LedgerName) VALUES (?)');

    // Insert all ledgers together
    ledgers.forEach((ledgerName) => {
        insertLedger.run(ledgerName);
    });

    res.json({ success: true, message: 'Array received successfully.' });
})

// app.post('/items', (req, res) => {
//     const { name } = req.body;

//     db.run('INSERT INTO items (name) VALUES (?)', [name], function (err) {
//         if (err) {
//             return res.status(500).json({ error: err.message });
//         }

//         res.json({
//             id: this.lastID,
//             name: name
//         });
//     });
// });

// Read All


// // Read One
// app.get('/items/:id', (req, res) => {
//     const { id } = req.params;

//     db.get('SELECT * FROM items WHERE id = ?', [id], (err, row) => {
//         if (err) {
//             return res.status(500).json({ error: err.message });
//         }

//         if (!row) {
//             return res.status(404).json({ error: 'Item not found' });
//         }

//         res.json(row);
//     });
// });

// // Update
// app.put('/items/:id', (req, res) => {
//     const { id } = req.params;
//     const { name } = req.body;

//     db.run('UPDATE items SET name = ? WHERE id = ?', [name, id], function (err) {
//         if (err) {
//             return res.status(500).json({ error: err.message });
//         }

//         if (this.changes === 0) {
//             return res.status(404).json({ error: 'Item not found' });
//         }

//         res.json({ id: id, name: name });
//     });
// });

// // Delete
// app.delete('/items/:id', (req, res) => {
//     const { id } = req.params;

//     db.run('DELETE FROM items WHERE id = ?', [id], function (err) {
//         if (err) {
//             return res.status(500).json({ error: err.message });
//         }

//         if (this.changes === 0) {
//             return res.status(404).json({ error: 'Item not found' });
//         }

//         res.json({ message: 'Item deleted', changes: this.changes });
//     });
// });

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
