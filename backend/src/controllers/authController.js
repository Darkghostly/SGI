const prisma = require('../services/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'stockos_super_secret_key';

const authController = {
  login: async (req, res) => {
    try {
      const { email, senha } = req.body;
      const user = await prisma.usuario.findUnique({ where: { email } });
      
      if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const isValid = await bcrypt.compare(senha, user.senhaHash);
      if (!isValid) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        SECRET_KEY,
        { expiresIn: '1d' }
      );

      res.json({
        token,
        user: { id: user.id, nome: user.nome, email: user.email, role: user.role }
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  createAdmin: async (req, res) => {
    // Only accessible if logged in as DEV/SUPERADMIN (enforced by middleware)
    try {
      const { nome, email, senha } = req.body;
      const existing = await prisma.usuario.findUnique({ where: { email } });
      if (existing) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }
      
      const senhaHash = await bcrypt.hash(senha, 10);
      const novoAdmin = await prisma.usuario.create({
        data: { nome, email, senhaHash, role: 'ADMIN' }
      });
      res.status(201).json({ id: novoAdmin.id, nome: novoAdmin.nome, email: novoAdmin.email, role: novoAdmin.role });
    } catch (error) {
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  getMe: async (req, res) => {
    try {
      const id = req.user.id;
      const user = await prisma.usuario.findUnique({ where: { id }, select: { id: true, nome: true, email: true, role: true } });
      if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  updateMe: async (req, res) => {
    try {
      const id = req.user.id;
      const { nome, email, senha } = req.body;
      let dataToUpdate = { nome, email };
      if (senha && senha.trim() !== '') {
        dataToUpdate.senhaHash = await bcrypt.hash(senha, 10);
      }
      const updated = await prisma.usuario.update({
        where: { id },
        data: dataToUpdate,
        select: { id: true, nome: true, email: true, role: true }
      });
      res.json(updated);
    } catch (error) {
      if (error.code === 'P2002') return res.status(400).json({ error: 'Email já cadastrado' });
      res.status(500).json({ error: 'Erro no servidor' });
    }
  }
};

module.exports = authController;
