const express = require('express');
const app = express();
const port = 3000;

app.use(express.json()); // Middleware to parse JSON bodies

// Route for echoing messages back
app.post('/echo', (req, res) => {
    const message = req.body.message;
    console.log(`Received message: ${message}`);
    res.json({echo: message});
});

app.listen(port, () => {
    console.log(`Echo server listening at http://localhost:${port}`);
});
    