const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// Corrige caminho do Swagger (mais seguro)
const swaggerDocument = YAML.load(path.join(__dirname, '../docs/swagger.yaml'));

// Importação das rotas
const authRoutes = require('./modules/auth/routes');
const adminRoutes = require('./modules/admin/routes');
const certificatesRoutes = require('./modules/certificates/certificates.routes');

// Swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ROTAS PRINCIPAIS
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/certificates', certificatesRoutes);

// 🔥 SERVIR ARQUIVOS (ESSENCIAL PARA O DIA 3)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API de Atestados Médicos rodando.' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});