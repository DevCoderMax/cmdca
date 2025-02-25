const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Servir arquivos estáticos
app.use(express.static(__dirname));
app.use('/dashboard', express.static(path.join(__dirname, 'dashboard')));

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota do dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard/dashboard.html'));
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
