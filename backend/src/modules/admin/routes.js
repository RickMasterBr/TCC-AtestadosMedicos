const express = require('express');
const router = express.Router();
const adminController = require('./controller');
const { authenticate, authorizeAdmin } = require('../auth/auth.middleware');

// Aplicados uma vez, valem para todas as rotas abaixo
router.use(authenticate);
router.use(authorizeAdmin);

router.get('/certificates', adminController.listarAtestados);
router.get('/certificates/:id', adminController.buscarAtestadoPorId);
router.patch('/certificates/:id/approve', adminController.aprovarAtestado);
router.patch('/certificates/:id/reject', adminController.rejeitarAtestado);

module.exports = router;