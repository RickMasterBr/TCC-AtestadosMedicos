const prisma = require('../../shared/prisma');

// Função responsável por criar um atestado
async function createCertificate(req, res) {
    try {
        const { startDate, durationDays, crmNumber } = req.body;

        // Verifica autenticação
        if (!req.user) {
            return res.status(401).json({
                error: 'Usuário não autenticado'
            });
        }

        // Verifica arquivo
        if (!req.file) {
            return res.status(400).json({
                error: 'Arquivo é obrigatório'
            });
        }

        // Validação dos campos
        if (!startDate || !durationDays || !crmNumber) {
            return res.status(400).json({
                error: 'Todos os campos são obrigatórios'
            });
        }

        // Salva no banco
        const certificate = await prisma.medicalCertificate.create({
            data: {
                startDate: new Date(startDate),
                endDate: new Date(new Date(startDate).getTime() + Number(durationDays) * 24 * 60 * 60 * 1000),
                crmNumber,
                // Ajuste importante para acesso via navegador/frontend
                fileUrl: `/uploads/${req.file.filename}`,
                userId: req.user.id,
                status: 'PENDING'
            }
        });

        return res.status(201).json({
            message: "Atestado enviado com sucesso",
            data: certificate
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            error: error.message
        });
    }
}

// Função para LISTAR atestados do usuário logado
async function getUserCertificates(req, res) {
    try {

        // Verifica autenticação
        if (!req.user) {
            return res.status(401).json({
                error: 'Usuário não autenticado'
            });
        }

        const certificates = await prisma.medicalCertificate.findMany({
            where: {
                userId: req.user.id
            },
            orderBy: {
                startDate: 'desc'
            }
        });

        return res.json(certificates);

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            error: error.message
        });
    }
}

module.exports = {
    createCertificate,
    getUserCertificates
};
