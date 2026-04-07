const prisma = require('../../shared/prisma');

// Função responsável por criar um atestado
async function createCertificate(req, res) {
    try {
        const { startDate, durationDays, crmNumber } = req.body;

        // Verifica se o arquivo foi enviado
        if (!req.file) {
            return res.status(400).json({
                error: 'Arquivo é Obrigatório'
            });
        }

        // Cria o registro no banco de dados
        const certificate = await prisma.medicalCertificate.create({
            data: {
                startDate: new Date(startDate), // converte para Date
                durationDays: Number(durationDays), // garante número
                crmNumber,
                fileUrl: req.file.path, // caminho do arquivo salvo
                userId: req.user.id, // vem do middleware (mock ou real)
                status: 'PENDING' // status inicial
        }
      });

        // Retorna sucesso
        res.status(201).json(certificate);

    } catch (error) {
        //tratamento de erro
        res.status(500).json({
            error: error.message
        });
    }
}

// Função para LISTAR atestados do usuário logado
async function getUserCertificates(req, res) {
    try {
  
      const certificates = await prisma.medicalCertificate.findMany({
        where: {
          userId: req.user.id // filtra pelo usuário logado
        },
        orderBy: {
          startDate: 'desc' // ordena do mais recente
        }
      });
  
      res.json(certificates);
  
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }
  
  module.exports = {
    createCertificate,
    getUserCertificates
  };
    
        