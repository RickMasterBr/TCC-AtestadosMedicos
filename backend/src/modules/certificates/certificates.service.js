const multer = require ('multer');
const path = require ('path');

// Configuração de onde e como os arquivos serão salvos
const storage = multer.diskStorage({
    //Define a pasta de destino
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },

    //Define o nome do arquivo (evita sobrescrever)
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

    if(allowedTypes.includes(file.mimetype)) {
        cb(null, true); // Arquivo aceito.
    } else {
        cb(new Error('Tipo de arquivo inválido')); // Arquivo inválido
    }
};

// Configuração final do multer
const upload = multer ({
    storage, // Onde salva
    fileFilter, // valida o tipo
    limits: {
        fileSize: 5 * 1024 * 1024 // limite de 5mb
    }
});

module.exports = { upload };