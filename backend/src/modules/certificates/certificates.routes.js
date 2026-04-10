const express = require('express');
const router = express.Router();

// Middleware de autenticação
const { authenticate } = require('../auth/auth.middleware');

// Controller (regras de negócio)
const {
  createCertificate,
  getUserCertificates
} = require('./certificates.controller');

// Upload (multer)
const { upload } = require('./certificates.service');

// Todas as rotas abaixo exigem usuário autenticado
router.use(authenticate);

// POST /certificates
// Envia um novo atestado com arquivo
router.post(
  '/',
  upload.single('file'), // o nome deve ser "file" no frontend/Postman
  createCertificate
);

// GET /certificates
// Lista os atestados do usuário logado
router.get(
  '/',
  getUserCertificates
);

module.exports = router;