const express = require('express');
const router = express.Router();

// Importa as funções do controller
const { register, login, registrarConsentimento, recuperarSenha } = require('./auth.controller');

// Importa o middleware de autenticação
const { authenticate } = require('./auth.middleware');

// =======================================================
// ROTAS PÚBLICAS (Não precisa de token)
// =======================================================
router.post('/register', register);
router.post('/login', login);
router.post('/recuperar-senha', recuperarSenha);

// =======================================================
// ROTAS PRIVADAS (Requer token no Header: Bearer <token>)
// =======================================================
// Colocamos o 'authenticate' antes de chamar o controller
router.post('/consentimento', authenticate, registrarConsentimento);

module.exports = router;