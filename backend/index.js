const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const recommendationRoutes = require('./routes/recommendationRoutes');

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/recommendations', recommendationRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});