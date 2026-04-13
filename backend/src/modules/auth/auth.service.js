// Essa parte é responsável somente pela lógica

/*
No caso do auth.service.js, o que ele faz especificamente é:
Recebe name, email, password e role como parâmetros simples — sem saber que veio de uma requisição HTTP.
Pega a senha em texto puro e transforma em um hash com bcrypt. O hash é uma string embaralhada irreversível — você nunca consegue "desembaralhar" de volta para a senha original, só consegue comparar.
Depois salva o usuário no banco com o hash no lugar da senha.
Devolve o usuário criado para quem chamou a função — que vai ser o controller.
*/

const bcryptjs = require('bcryptjs');
const prisma = require('../../shared/prisma');
const jwt = require('jsonwebtoken');

// Cria um novo usuário no banco com a senha criptografada
async function createUser(name, email, password, role) {

    // Gera o hash da senha. O número 10 é o custo do algoritmo.
    // Se mudar esse número, senhas antigas não vão mais funcionar.
    const passwordHash = await bcryptjs.hash(password, 10);

    // Salva o usuário no banco. Nunca salvar a senha em texto puro.
    // Se der erro de email duplicado, o Prisma lança código P2002 — tratado no controller.
    const user = await prisma.user.create({
        data: {
            name,
            email,
            passwordHash, // senha já criptografada
            role          // 'EMPLOYEE' ou 'ADMIN'
        }
    });

    // Retorna o usuário criado para o controller montar a resposta HTTP
    return user;
}

// Verifica email e senha, retorna token JWT se válido
async function loginUser(email, password) {

    // Busca o usuário pelo email — se não existir, nega o acesso
    // Nunca dizer se foi o email ou a senha que errou — isso é uma boa prática de segurança
    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        throw new Error('Credenciais inválidas');
    }

    // Compara a senha digitada com o hash salvo no banco
    // bcryptjs faz isso internamente — você nunca descriptografa, só compara
    const senhaCorreta = await bcryptjs.compare(password, user.passwordHash);

    if (!senhaCorreta) {
        throw new Error('Credenciais inválidas');
    }

    // Gera o token JWT com id e role do usuário
    // O token expira em 8 horas — suficiente para um dia de trabalho
    const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
    );

    return { token, role: user.role };
}

// ==========================================
// TAREFA DIA 3: Registro de Consentimento
// ==========================================
async function gravarConsentimento(dados) {
    // Aqui nós usamos o Prisma para gravar na tabela ConsentAgreement.
    // ATENÇÃO: Os nomes dos campos (userId, atestadoId, etc.) devem ser 
    // EXATAMENTE os mesmos que estão definidos no seu arquivo schema.prisma!
    // Se no seu schema estiver "usuario_id", troque "userId" para "usuario_id" abaixo.
    
    const consentimento = await prisma.consentAgreement.create({
        data: {
            userId: dados.idUsuario,
            atestadoId: dados.idAtestado,
            ipAddress: dados.ipRequisicao,
            termVersion: dados.versaoTermo,
            acceptedAt: dados.timestamp
        }
    });

    return consentimento;
}

// ==========================================
// TAREFA DIA 4: Recuperação de Senha Simples
// ==========================================
async function atualizarSenhaSimples(email, novaSenha) {
    // 1. Primeiro, verificamos se o usuário com esse email realmente existe
    const user = await prisma.user.findUnique({
        where: { email }
    });

    // Se não existir, jogamos o erro de volta para o Controller tratar
    if (!user) {
        throw new Error('Usuário não encontrado');
    }

    // 2. Assim como na criação de usuário, NUNCA salvamos a senha nova em texto puro
    // Precisamos gerar o hash da nova senha antes de atualizar
    const passwordHash = await bcryptjs.hash(novaSenha, 10);

    // 3. Atualizamos o registro do usuário no banco de dados com o novo hash
    await prisma.user.update({
        where: { email },
        data: { passwordHash }
    });

    return true; // Retorna sucesso
}

module.exports = { 
    createUser, 
    loginUser, 
    gravarConsentimento, 
    atualizarSenhaSimples 
};

/*
Pense no módulo de Auth como uma agência bancaria. Ela tem funcionarios com
funções diferentes.

o Service é o funcionário dos bastidores, ele não atende diretamente o cliente, ele só executa
as operações: abre conta, calcula saldo, criptografa dados. Ele não sabe se o cliente chegou
e nem por onde, ele só recebe dados e faz o trabalho.

o COntroler é o atendente do balcão, ele recebe e requisição HTTP do cliente (FrontEnd), 
valida se os campos estiverem certos e chama os bastidores (service) para fazer o trabalho
e depois devolve a resposta ao cliente.

o Routes é a porta de entrada da agência, ele define qual caminho leva para qual atendente.
*/