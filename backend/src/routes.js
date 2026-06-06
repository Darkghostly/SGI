const express = require('express');
const router = express.Router();

const produtoController = require('./controllers/produtoController');
const movimentacaoController = require('./controllers/movimentacaoController');
const relatorioController = require('./controllers/relatorioController');

const authController = require('./controllers/authController');
const adminController = require('./controllers/adminController');
const emailController = require('./controllers/emailController');
const dashboardController = require('./controllers/dashboardController');
const { verifyToken, requireDev } = require('./middlewares/authMiddleware');

// Auth (Public)
router.post('/auth/login', authController.login);

// Protected routes (Require login)
router.use(verifyToken);

router.get('/users/me', authController.getMe);
router.put('/users/me', authController.updateMe);

// Produtos
router.get('/produtos', produtoController.listar);
router.post('/produtos', produtoController.criar);
router.put('/produtos/:id', produtoController.atualizar);
router.delete('/produtos/:id', produtoController.deletar);

// Movimentações
router.get('/movimentacoes', movimentacaoController.listar);
router.post('/movimentacoes', movimentacaoController.registrar);

// Relatório
router.get('/relatorio', relatorioController.gerar);

// Dashboard
router.get('/dashboard/evolucao', dashboardController.getEvolucao);

// Admin Routes (Require DEV)
router.post('/auth/register', requireDev, authController.createAdmin);
router.delete('/admin/reset', requireDev, adminController.resetDatabase);
router.get('/admin/users', requireDev, adminController.listarUsuarios);
router.put('/admin/users/:id', requireDev, adminController.atualizarUsuario);
router.delete('/admin/users/:id', requireDev, adminController.deletarUsuario);
router.post('/email/send', requireDev, emailController.sendBulkEmail);

module.exports = router;
