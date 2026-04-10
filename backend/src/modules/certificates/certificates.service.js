const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Caminho absoluto da pasta uploads
const uploadPath = path.join(__dirname, '../../../uploads');

// Garante que a pasta existe (cria automaticamente se não existir)
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

// Configuração de onde e como os arquivos serão salvos
const storage = multer.diskStorage({
    
    // Define a pasta de destino
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },

    // Define o nome do arquivo (evita sobrescrever)
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

// Filtro para aceitar apenas PDF ou imagem
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de arquivo inválido'));
    }
};

// Configuração final do multer
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // limite de 5MB
    }
});

module.exports = { upload };