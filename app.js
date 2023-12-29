const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const port = 3000;

app.use(bodyParser.json());

const db = new sqlite3.Database('Tally212.db'); // For demonstration, use in-memory database
app.use(cors());
// Create tables
db.run(`
    CREATE TABLE IF NOT EXISTS Ledgers (
        LedgerID INTEGER PRIMARY KEY AUTOINCREMENT,
        LedgerName TEXT NOT NULL
    )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS PurchaseVouchers (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    LedgerID INTEGER, 
    ADDRESS TEXT,
    DATE TEXT,
    GUID TEXT,
    STATENAME TEXT,
    NARRATION TEXT,
    COUNTRYOFRESIDENCE TEXT,
    PARTYGSTIN TEXT,
    PLACEOFSUPPLY TEXT,
    PARTYNAME TEXT,
    PARTYLEDGERNAME TEXT,
    VOUCHERNUMBER TEXT,
    TOTALAMOUNT REAL,
    PURCHASELOCAL REAL,
    CGST REAL,
    SGST REAL,
    FOREIGN KEY (LedgerID) REFERENCES Ledgers(LedgerID) 
  )
`);

db.run(`
        CREATE TABLE IF NOT EXISTS StockInventory (
            stockItemID INTEGER PRIMARY KEY AUTOINCREMENT,
            BASEUNITS TEXT,
            GUID TEXT,
            OPENINGBALANCE INTEGER,
            HSNCODE TEXT,
            ITEMNAME TEXT
        )
    `);

db.run(`
        CREATE TABLE IF NOT EXISTS SalesVouchers (
            voucherID INTEGER PRIMARY KEY AUTOINCREMENT,
            LedgerID INTEGER,
            ADDRESS TEXT,
            DATE DATE,
            GUID TEXT,
            STATENAME TEXT,
            NARRATION TEXT,
            COUNTRYOFRESIDENCE TEXT,
            PARTYGSTIN TEXT,
            PLACEOFSUPPLY TEXT,
            PARTYNAME TEXT,
            VOUCHERNUMBER TEXT,
            TERMS TEXT,
            SHIPPEDBY TEXT,
            VEHICLENO TEXT,
            DETAILS TEXT,
            totalAmount DECIMAL(10, 2),
            IGSTSALE DECIMAL(10, 2)
            )
            `);


db.run(`
            CREATE TABLE IF NOT EXISTS PaymentVouchers (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                 LedgerID INTEGER, 
                DATE DATE,
                NARRATION TEXT,
                VOUCHERNUMBER NUMBER,
                GUID TEXT,
                STATENAME TEXT,
                COUNTRYOFRESIDENCE TEXT,
                PARTYGSTIN TEXT,
                PARTYLEDGERNAME TEXT,
                GSTREGISTRATIONTYPE TEXT,
                TRANSACTIONTYPE TEXT,
                PAYMENTFAVOURING TEXT,
                CHEQUECROSSCOMMENT TEXT,
                AMOUNT DECIMAL(10, 2),
                LEDGERNAME TEXT,
                FOREIGN KEY (LedgerID) REFERENCES Ledgers(LedgerID) 
    )
`);


db.run(`
            CREATE TABLE IF NOT EXISTS ReceiptVouchers (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                 LedgerID INTEGER, 
                DATE DATE,
                NARRATION TEXT,
                VOUCHERNUMBER NUMBER,
                GUID TEXT,
                PARTYGSTIN TEXT,
                PARTYLEDGERNAME TEXT,
                TRANSACTIONTYPE TEXT,
                PAYMENTFAVOURING TEXT,
                CHEQUECROSSCOMMENT TEXT,
                AMOUNT DECIMAL(10, 2),
                FOREIGN KEY (LedgerID) REFERENCES Ledgers(LedgerID) 
    )
`);
// Create foreign key constraint
db.run(`
        PRAGMA foreign_keys = ON; -- Enable foreign key support
        ALTER TABLE SalesVouchers
        ADD CONSTRAINT FK_LedgerID FOREIGN KEY (LedgerID) REFERENCES Ledgers(LedgerID);
    `);

db.run(`
        CREATE TABLE IF NOT EXISTS SalesItems (
            itemID INTEGER PRIMARY KEY AUTOINCREMENT,
            voucherID INTEGER, 
            stockItemID INTEGER, 
            STOCKITEM TEXT,
            HSNCODE TEXT,
            RATE TEXT,
            DISCOUNT DECIMAL(10, 2),
            AMOUNT DECIMAL(10, 2),
            ACTUALQTY TEXT,
            
            CONSTRAINT FK_voucherID FOREIGN KEY (voucherID) REFERENCES SalesVouchers(voucherID)
            CONSTRAINT FK_stockItemID FOREIGN KEY (stockItemID) REFERENCES StockInventory(stockItemID)
        )
    `);
app.use(express.json());

// Fetch ledgers
app.get('/ledgers', async (req, res) => {
    const tableName = 'Ledgers';
    console.log("Request Received from App");
    const query = `SELECT * FROM ${tableName}`;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error executing query:', err.message);
        } else {
            // Process the retrieved rows
            console.log('Sent Ledgers', rows.length);
            res.json(rows);
        }
    });
});

// Upedate Stock Items
app.post('/stockItems', async (req, res) => {
    console.log("Chunk Received at the");
    const { chunk } = req.body;
    try {

        for (item of chunk) {
            const itemToInsert = {
                BASEUNITS: item.BASEUNITS,
                GUID: item.GUID,
                OPENINGBALANCE: item.OPENINGBALANCE,
                HSNCODE: item.HSNCODE,
                ITEMNAME: item.ITEMNAME
            };

            const insertQuery = `INSERT INTO StockInventory (BASEUNITS, GUID, OPENINGBALANCE, HSNCODE, ITEMNAME)
        VALUES (?, ?, ?, ?, ?)`;

            db.run(insertQuery, [item.BASEUNITS, item.GUID, item.OPENINGBALANCE, item.HSNCODE, item.ITEMNAME], function (err) {
                if (err) {
                    console.error(err.message);
                } else {
                    console.log(`Item inserted with ID: ${this.lastID}`);
                }
            });
        }
        res.json({ success: true, message: 'Array received successfully.' })
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update ledgers
app.post('/updateLedgers', async (req, res) => {
    const ledgers = req.body.ledgersArray;
    const insertLedger = db.prepare('INSERT INTO Ledgers (LedgerName) VALUES (?)');

    try {
        ledgers.forEach((ledgerName) => {
            insertLedger.run(ledgerName);
        });

        res.json({ success: true, message: 'Array received successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch vouchers
app.get('/vouchers', async (req, res) => {
    try {
        const rows = await db.all('SELECT * FROM PurchaseVouchers');
        console.log('rows are', rows);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Purchase vouchers
app.post('/purchaseVouchers', async (req, res) => {
    const { chunk } = req.body;

    console.log('vouchers ', chunk);


    for (const item of chunk) {
        let {
            ADDRESS,
            DATE,
            GUID,
            STATENAME,
            NARRATION,
            COUNTRYOFRESIDENCE,
            PARTYGSTIN,
            PLACEOFSUPPLY,
            PARTYNAME,
            PARTYLEDGERNAME,
            VOUCHERNUMBER,
            totalAmount,
            PURCHASELOCAL,
            CGST,
            SGST,
        } = item;

        ADDRESS = JSON.stringify(ADDRESS);
        DATE = DATE[0];
        GUID = GUID[0];
        STATENAME = STATENAME[0];
        NARRATION = NARRATION[0];
        COUNTRYOFRESIDENCE = COUNTRYOFRESIDENCE[0];
        PARTYGSTIN = PARTYGSTIN[0];
        PLACEOFSUPPLY = PLACEOFSUPPLY[0];
        PARTYLEDGERNAME = PARTYLEDGERNAME[0];
        VOUCHERNUMBER = VOUCHERNUMBER[0];
        PARTYNAME = PARTYNAME[0]

        const fetchLedgerID = () => {
            // console.log("the Party NAme is", PARTYNAME, typeof (PARTYNAME));
            db.get('SELECT LedgerID FROM Ledgers WHERE LedgerName = ?', [PARTYNAME], (err, row) => {
                if (err) {
                    console.error(err.message);
                    // Handle the error
                } else {
                    if (row) {
                        const LedgerID = row.LedgerID;
                        // Use the retrieved ledgerID as needed
                        dataToInsert = [
                            LedgerID,
                            ADDRESS,
                            DATE,
                            GUID,
                            STATENAME,
                            NARRATION,
                            COUNTRYOFRESIDENCE,
                            PARTYGSTIN,
                            PLACEOFSUPPLY,
                            PARTYNAME,
                            PARTYLEDGERNAME,
                            VOUCHERNUMBER,
                            totalAmount,
                            PURCHASELOCAL,
                            CGST,
                            SGST,
                        ];
                        const insertStatement = db.prepare(`
                        INSERT INTO PurchaseVouchers (
                            LedgerID,
                            ADDRESS,
                            DATE,
                            GUID,
                            STATENAME,
                            NARRATION,
                            COUNTRYOFRESIDENCE,
                            PARTYGSTIN,
                            PLACEOFSUPPLY,
                            PARTYNAME,
                            PARTYLEDGERNAME,
                            VOUCHERNUMBER,
                            TOTALAMOUNT,
                            PURCHASELOCAL,
                            CGST,
                            SGST
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `);


                        insertStatement.run(dataToInsert, (err) => {
                            if (err) {
                                console.error('Error inserting data:', err);
                            } else {
                                console.log('Data inserted successfully.');
                            }
                        });

                    } else {
                        console.log(`Ledger with name ${PARTYNAME} not found.`);
                    }
                }
            });
        }
        fetchLedgerID()
        // const row = await db.get('SELECT LedgerID FROM Ledgers WHERE LedgerName = ?', [PARTYNAME]);

        // console.log("ROW IS", row);

    }

    res.json({ success: true, message: 'Array received successfully.' });
});


app.post('/salesVouchers', async (req, res) => {
    const { chunk } = req.body;

    console.log('vouchers ', chunk[0]?.INVENTORY_ITEMS);

    const insertSalesItems = (voucherID, saleItem) => {
        console.log("insertSales item called", voucherID, saleItem);
        let {
            STOCKITEM,
            HSNCODE,
            RATE,
            DISCOUNT,
            AMOUNT,
            ACTUALQTY,
        } = saleItem;
        db.get('SELECT stockItemID FROM StockInventory WHERE ITEMNAME = ?', [STOCKITEM], (err, row) => {
            if (err) {
                console.error(err.message);
            } else {
                if (row) {
                    const stockItemID = row.stockItemID;

                    const dataToInsert = [
                        voucherID,
                        stockItemID,
                        STOCKITEM,
                        HSNCODE,
                        RATE,
                        DISCOUNT,
                        AMOUNT,
                        ACTUALQTY,
                    ];

                    const insertStatement = db.prepare(`
                            INSERT INTO SalesItems (
                                voucherID,
                                stockItemID,
                                STOCKITEM,
                                HSNCODE,
                                RATE,
                                DISCOUNT,
                                AMOUNT,
                                ACTUALQTY
                            ) VALUES (?,?, ?, ?, ?, ?, ?, ?)
                        `);
                    insertStatement.run(dataToInsert, (err) => {
                        if (err) {
                            console.error('Error inserting data:', err);
                        } else {
                            console.log('Data inserted successfully.');
                        }
                    });
                } else {
                    console.log(`Ledger with name ${STOCKITEM} not found.`);
                }
            }
        });


    }

    for (const item of chunk) {
        const fetchLedgerID = () => {
            let {
                ADDRESS,
                DATE,
                GUID,
                STATENAME,
                NARRATION,
                COUNTRYOFRESIDENCE,
                PARTYGSTIN,
                PLACEOFSUPPLY,
                PARTYNAME,
                VOUCHERNUMBER,
                SHIPPEDBY,
                VEHICLENO,
                DETAILS,
                IGSTSALE,
                totalAmount,
            } = item;

            db.get('SELECT LedgerID FROM Ledgers WHERE LedgerName = ?', [PARTYNAME], (err, row) => {
                if (err) {
                    console.error(err.message);
                } else {
                    if (row) {
                        const LedgerID = row.LedgerID;

                        const dataToInsert = [
                            LedgerID,
                            ADDRESS,
                            DATE,
                            GUID,
                            STATENAME,
                            NARRATION,
                            COUNTRYOFRESIDENCE,
                            PARTYGSTIN,
                            PLACEOFSUPPLY,
                            PARTYNAME,
                            VOUCHERNUMBER,
                            totalAmount, // Corrected the case to match SQL statement
                            SHIPPEDBY,
                            VEHICLENO,
                            DETAILS,
                            IGSTSALE,
                        ];

                        const insertStatement = db.prepare(`
                            INSERT INTO SalesVouchers (
                                LedgerID,
                                ADDRESS,
                                DATE,
                                GUID,
                                STATENAME,
                                NARRATION,
                                COUNTRYOFRESIDENCE,
                                PARTYGSTIN,
                                PLACEOFSUPPLY,
                                PARTYNAME,
                                VOUCHERNUMBER,
                                totalAmount, -- Corrected the case
                                SHIPPEDBY,
                                VEHICLENO,
                                DETAILS,
                                IGSTSALE
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `);

                        insertStatement.run(dataToInsert, function (err) {
                            if (err) {
                                console.error('Error inserting data:', err);
                            } else {
                                console.log('Data inserted successfully.');
                                voucherID = this.lastID;
                                console.log('Inserted voucherID:', voucherID);
                                const inventoryItems = chunk[0]?.INVENTORY_ITEMS;
                                for (let saleItem of inventoryItems) {
                                    console.log("sale item sent is", saleItem);
                                    insertSalesItems(voucherID, saleItem)
                                }
                            }
                        });
                    } else {
                        console.log(`Ledger with name ${PARTYNAME} not found.`);
                    }
                }
            });
        };
        if (item.VOUCHERNUMBER == 4003) {
            fetchLedgerID();
        }
    }

    res.json({ success: true, message: 'Array received successfully.' });
});


app.post('/paymentVouchers', async (req, res) => {
    const { chunk } = req.body;

    console.log('vouchers ', chunk[0]);

    // let LedgerID = 0;

    for (const item of chunk) {
        let {
            DATE,
            NARRATION,
            VOUCHERNUMBER,
            GUID,
            STATENAME,
            COUNTRYOFRESIDENCE,
            PARTYGSTIN,
            PARTYLEDGERNAME,
            GSTREGISTRATIONTYPE,
            TRANSACTIONTYPE,
            PAYMENTFAVOURING,
            CHEQUECROSSCOMMENT,
            AMOUNT,
            LEDGERNAME,
        } = item;

        const fetchLedgerID = async () => {
            return new Promise((resolve, reject) => {
                db.get('SELECT LedgerID FROM Ledgers WHERE LedgerName = ?', [PARTYLEDGERNAME], (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        if (row) {
                            resolve(row.LedgerID);
                        } else {
                            console.log(`Ledger with name ${PARTYLEDGERNAME} not found.`);
                            resolve(0);
                        }
                    }
                });
            });
        };

        const LedgerID = await fetchLedgerID(); // This is now a Promise
        console.log("Inserting Voucher in DB", LedgerID);
        const dataToInsert = [
            LedgerID,
            DATE,
            NARRATION,
            VOUCHERNUMBER,
            GUID,
            STATENAME,
            COUNTRYOFRESIDENCE,
            PARTYGSTIN,
            PARTYLEDGERNAME,
            GSTREGISTRATIONTYPE,
            TRANSACTIONTYPE,
            PAYMENTFAVOURING,
            CHEQUECROSSCOMMENT,
            AMOUNT,
            LEDGERNAME,
        ];

        const insertStatement = db.prepare(`
                        INSERT INTO PaymentVouchers (
                            LedgerID,
                            DATE,
                            NARRATION,
                            VOUCHERNUMBER,
                            GUID,
                            STATENAME,
                            COUNTRYOFRESIDENCE,
                            PARTYGSTIN,
                            PARTYLEDGERNAME,
                            GSTREGISTRATIONTYPE,
                            TRANSACTIONTYPE,
                            PAYMENTFAVOURING,
                            CHEQUECROSSCOMMENT,
                            AMOUNT,
                            LEDGERNAME
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
                        `);


        insertStatement.run(dataToInsert, (err) => {
            if (err) {
                console.error('Error inserting data:', err);
            } else {
                console.log('Data inserted successfully.');
            }
        });

    }

    res.json({ success: true, message: 'Array received successfully.' });
});



app.post('/receiptVouchers', async (req, res) => {
    const { chunk } = req.body;

    // console.log('vouchers in server', chunk[0]);

    // let LedgerID = 0;

    for (const item of chunk) {
        let {
            DATE,
            NARRATION,
            VOUCHERNUMBER,
            GUID,
            PARTYGSTIN,
            PARTYLEDGERNAME,
            TRANSACTIONTYPE,
            PAYMENTFAVOURING,
            CHEQUECROSSCOMMENT,
            AMOUNT,
        } = item;

        const fetchLedgerID = async () => {
            return new Promise((resolve, reject) => {
                db.get('SELECT LedgerID FROM Ledgers WHERE LedgerName = ?', [PARTYLEDGERNAME], (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        if (row) {
                            resolve(row.LedgerID);
                        } else {
                            console.log(`Ledger with name ${PARTYLEDGERNAME} not found.`);
                            resolve(0);
                        }
                    }
                });
            });
        };

        const LedgerID = await fetchLedgerID(); // This is now a Promise
        console.log("Inserting Voucher in DB", LedgerID);
        const dataToInsert = [
            LedgerID,
            DATE,
            NARRATION,
            VOUCHERNUMBER,
            GUID,
            PARTYGSTIN,
            PARTYLEDGERNAME,
            TRANSACTIONTYPE,
            PAYMENTFAVOURING,
            CHEQUECROSSCOMMENT,
            AMOUNT,
        ];

        const insertStatement = db.prepare(`
                        INSERT INTO ReceiptVouchers (
                            LedgerID,
                            DATE,
                            NARRATION,
                            VOUCHERNUMBER,
                            GUID,
                            PARTYGSTIN,
                            PARTYLEDGERNAME,
                            TRANSACTIONTYPE,
                            PAYMENTFAVOURING,
                            CHEQUECROSSCOMMENT,
                            AMOUNT
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `);


        insertStatement.run(dataToInsert, (err) => {
            if (err) {
                console.error('Error inserting data:', err);
            } else {
                console.log('Data inserted successfully in receipt.');
            }
        });

    }

    res.json({ success: true, message: 'Array received successfully.' });
});

// Search endpoint
app.get('/search', async (req, res) => {
    try {
        const row = await db.get('SELECT ADDRESS FROM PurchaseVouchers');
        res.json(row);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: error.message });
    }
});


app.get('/getPurchaseV', async (req, res) => {
    console.log("Request Received from App");

    const tableName = 'PurchaseVouchers';

    const query = `SELECT * FROM ${tableName}`;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error executing query:', err.message);
        } else {
            // Process the retrieved rows
            console.log('Purchase Vouchers Sent', rows.length);
            res.json(rows);
        }
    });
});

app.get('/getSalesV', async (req, res) => {
    console.log("request rec at server");
    const tableName = 'SalesVouchers';

    const query = `SELECT * FROM ${tableName}`;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error executing query:', err.message);
        } else {
            // Process the retrieved rows
            console.log('Sales Vouchers Sent ', rows.length);
            res.json(rows);
        }
    });
});
app.get('/getPaymentV', async (req, res) => {
    console.log("request rec at server");
    const tableName = 'PaymentVouchers';

    const query = `SELECT * FROM ${tableName}`;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error executing query:', err.message);
        } else {
            // Process the retrieved rows
            console.log('Payment Vouchers Sent', rows.length);
            res.json(rows);
        }
    });
});

app.get('/getReceiptV', async (req, res) => {
    console.log("request rec at server");
    const tableName = 'ReceiptVouchers';

    const query = `SELECT * FROM ${tableName}`;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error executing query:', err.message);
        } else {
            // Process the retrieved rows
            console.log('Receipt Vouchers sent', rows.length);
            res.json(rows);
        }
    });
});

app.get('/getSaleItems', async (req, res) => {
    console.log("request rec at server");
    const tableName = 'SalesItems';

    const query = `SELECT * FROM ${tableName}`;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error executing query:', err.message);
        } else {
            // Process the retrieved rows
            console.log('Sale Items sent', rows.length);
            res.json(rows);
        }
    });
});


app.get('/getInventory', async (req, res) => {
    console.log("request rec at server");
    const tableName = 'StockInventory';

    const query = `SELECT * FROM ${tableName}`;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error executing query:', err.message);
        } else {
            // Process the retrieved rows
            console.log('Inventory sent', rows.length);
            res.json(rows);
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
//remember to close and open the db connection for each route and for each request