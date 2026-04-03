# Plano Completo do Projeto — Sistema de Gestão de Atestados Médicos

## Informações Gerais

**Projeto:** Plataforma de envio e gestão de atestados médicos para o departamento de RH.
**Tipo:** Trabalho de Conclusão de Curso (TCC).
**Prazo:** 7 dias de desenvolvimento (sprint única).
**Escopo:** MVP funcional em nível local. Sem deploy obrigatório em nuvem.

---

## A Equipe e Suas Responsabilidades

| Membro | Área | Responsabilidade Principal |
|--------|------|---------------------------|
| **Dev 1 (Coordenador)** | Fundação + Frontend | Cria o projeto, banco de dados, ORM, estrutura de pastas. Depois trabalha no frontend com Dev 2. Coordena a equipe. |
| **Dev 2** | Frontend | Trabalha junto com Dev 1 nas telas do sistema (funcionário e administrador). |
| **Dev 3** | Backend — Módulo Auth | Dono exclusivo da pasta `/modules/auth`. Tudo sobre cadastro, login, token JWT e proteção de rotas. |
| **Dev 4** | Backend — Módulo Atestados | Dono exclusivo da pasta `/modules/certificates`. Tudo sobre envio de arquivo, validação e armazenamento local. |
| **Dev 5** | Backend — Módulo Admin | Dono exclusivo da pasta `/modules/admin`. Tudo sobre painel do RH, filtros, aprovação, recusa e histórico. |

---

## Decisões Técnicas Já Tomadas

Estas decisões já foram definidas e não devem ser rediscutidas pela equipe:

**Stack do Backend:** Node.js + Express.js + JavaScript (não TypeScript).
**Banco de dados:** MySQL (porta 3303 localmente).
**ORM:** Prisma versão 5 (não usar versão 7, ela tem breaking changes).
**Stack do Frontend:** React com Next.js + Tailwind CSS + shadcn/ui.
**Arquitetura:** Monolito Modular — um único projeto Node.js com pastas separadas por domínio.
**Armazenamento de arquivos:** Pasta `/uploads` local no projeto (não vamos usar AWS S3 — é TCC).
**Validação de vírus:** Não implementar. Mencionar na apresentação como evolução futura.
**Integração com CFM:** Não implementar. Mencionar na apresentação como evolução futura.
**Assinatura digital ICP-Brasil:** Não implementar. Mencionar na apresentação como evolução futura.
**Filas de processamento (Redis):** Não implementar. Processamento direto e síncrono.

Todas essas simplificações são academicamente honestas. Na apresentação, a equipe menciona o que foi simplificado e justifica dizendo que o foco foi entregar um MVP funcional dentro do prazo, e que essas integrações são evoluções futuras documentadas no relatório.

---

## Conceitos que Todos Precisam Entender

Antes de começar, cada membro deve ler e entender estes três conceitos. Se não entender, pesquise no YouTube "o que é [conceito] em português".

**API-First:** Antes de escrever código, a equipe define num documento quais são as rotas da API (os endereços que o frontend vai chamar), o que cada rota recebe e o que retorna. Com isso, o frontend trabalha com dados falsos (mock) no mesmo formato, sem esperar o backend ficar pronto. O documento de rotas é o "contrato" entre front e back.

**Monolito Modular:** Um projeto Node.js único, mas com pastas isoladas por responsabilidade. Cada dev do backend é dono de uma pasta e ninguém edita a pasta do outro. Se um módulo precisa de informação de outro, o dono daquele módulo exporta uma função pública e o outro importa. Ninguém acessa o banco diretamente por outro módulo.

**DSS (Sistema de Suporte à Decisão):** O sistema nunca aprova nem reprova um atestado sozinho. Ele analisa, exibe alertas visuais para o RH, e o humano toma a decisão final. Isso protege o projeto de responsabilidade legal e é um ponto forte na apresentação.

---

## Estrutura de Pastas do Backend

```
atestados-backend/
├── prisma/
│   └── schema.prisma         ← Dev 1 cria, ninguém mais mexe
├── src/
│   ├── server.js              ← Dev 1 cria, ninguém mais mexe
│   ├── shared/
│   │   └── prisma.js          ← Dev 1 cria, ninguém mais mexe
│   └── modules/
│       ├── auth/              ← SOMENTE Dev 3
│       │   ├── auth.routes.js
│       │   ├── auth.controller.js
│       │   ├── auth.service.js
│       │   └── auth.middleware.js
│       ├── certificates/      ← SOMENTE Dev 4
│       │   ├── certificates.routes.js
│       │   ├── certificates.controller.js
│       │   └── certificates.service.js
│       └── admin/             ← SOMENTE Dev 5
│           ├── admin.routes.js
│           ├── admin.controller.js
│           └── admin.service.js
├── uploads/                   ← Pasta onde os arquivos enviados ficam salvos
├── .env                       ← Nunca subir no Git
├── .gitignore
└── package.json
```

**Regra de ouro:** cada dev do backend só cria e edita arquivos dentro da própria pasta de módulo. Se precisar de algo que outro módulo tem, pede para o dono exportar uma função.

---

## Estrutura de Pastas do Frontend

```
atestados-frontend/
├── src/
│   ├── app/
│   │   ├── login/             ← Tela de login
│   │   │   └── page.js
│   │   ├── employee/
│   │   │   ├── dashboard/     ← Histórico do funcionário
│   │   │   │   └── page.js
│   │   │   └── submit/        ← Envio de atestado
│   │   │       └── page.js
│   │   └── admin/
│   │       └── dashboard/     ← Painel do RH
│   │           └── page.js
│   ├── services/
│   │   └── api.js             ← Configuração do axios
│   ├── mocks/
│   │   └── certificates.js    ← Dados falsos para desenvolver sem backend
│   └── components/            ← Componentes reutilizáveis
├── .env.local
└── package.json
```

---

## Tabelas do Banco de Dados (4 tabelas)

Estas tabelas já estão definidas no schema.prisma que Dev 1 vai configurar:

**Users** — Armazena os dados de acesso dos usuários. Campos: id (UUID), name, email (único), passwordHash, role (EMPLOYEE ou ADMIN), createdAt.

**MedicalCertificate** — Núcleo do sistema. Campos: id (UUID), startDate, durationDays, status (PENDING, APPROVED, REJECTED), fileUrl (caminho do arquivo local), crmNumber, cidCode (opcional, pode ser omitido), userId (quem enviou), reviewedById (qual admin revisou).

**AuditLog** — Tabela imutável de histórico. Toda vez que o RH aprova ou recusa, um registro é criado aqui. Campos: id, action, previousState, newState, adminNotes, ipAddress, timestamp, certificateId, actorId.

**ConsentAgreement** — Registra o aceite do funcionário ao enviar o atestado (exigência da LGPD). Campos: id, consentVersion, acceptedAt, ipAddress, deviceFingerprint, userId.

---

## Rotas da API (Contrato)

Estas são todas as rotas que o sistema terá. Cada rota está atribuída ao módulo responsável:

### Módulo Auth (Dev 3)

| Método | Rota | Descrição | Quem pode acessar |
|--------|------|-----------|-------------------|
| POST | `/auth/register` | Cadastro de novo usuário | Público |
| POST | `/auth/login` | Login, retorna token JWT | Público |

### Módulo Atestados (Dev 4)

| Método | Rota | Descrição | Quem pode acessar |
|--------|------|-----------|-------------------|
| POST | `/certificates` | Envio de atestado com arquivo | Funcionário logado |
| GET | `/certificates` | Lista atestados do funcionário logado | Funcionário logado |

### Módulo Admin (Dev 5)

| Método | Rota | Descrição | Quem pode acessar |
|--------|------|-----------|-------------------|
| GET | `/admin/certificates` | Lista todos os atestados com filtros | Admin logado |
| PATCH | `/admin/certificates/:id/approve` | Aprova um atestado | Admin logado |
| PATCH | `/admin/certificates/:id/reject` | Recusa um atestado | Admin logado |

---

## Como o Git Vai Funcionar

A equipe sabe commit e push básico, então o fluxo será simples:

1. Dev 1 cria o repositório no GitHub e sobe a estrutura inicial.
2. Todos clonam o repositório.
3. Cada dev do backend cria uma branch com o nome do seu módulo (pesquisar "como criar branch no Git").
4. Cada dev trabalha na própria branch, faz commit e push nela.
5. No final de cada dia, Dev 1 é responsável por fazer o merge das branches na main (pesquisar "como fazer merge no Git").
6. No dia seguinte, todos fazem `git pull origin main` antes de começar.

**Repositórios:** serão dois repositórios separados — um para o backend e outro para o frontend.

---

## Cronograma Dia a Dia

---

### FASE 0 — Fundação (Dev 1 faz sozinho antes de tudo)

**Quem:** Apenas Dev 1 (coordenador).
**Quando:** Antes de qualquer outro dev começar a trabalhar.
**Objetivo:** Deixar o projeto pronto para os outros clonarem e começarem.

O que Dev 1 faz nesta fase:

1. Cria a pasta do projeto backend e inicializa com `npm init -y`.
2. Instala as dependências: express, cors, dotenv, nodemon (como dev dependency).
3. Instala o Prisma versão 5: `npm install prisma@5 @prisma/client@5`.
4. Inicializa o Prisma: `npx prisma init --datasource-provider mysql`.
5. Cria o banco `atestados_db` no MySQL Workbench.
6. Configura o `.env` com a URL do MySQL na porta 3303.
7. Escreve o schema.prisma com as 4 tabelas definidas acima.
8. Roda a migration: `npx prisma migrate dev --name init` (abrir terminal como administrador no Windows para evitar erro EPERM).
9. Cria a estrutura de pastas completa (src/modules/auth, certificates, admin, shared).
10. Cria o server.js básico com Express, cors e uma rota `/health`.
11. Cria o arquivo shared/prisma.js que exporta a instância do PrismaClient.
12. Cria o .gitignore (excluindo node_modules, .env, uploads/).
13. Sobe tudo no GitHub.

**Resultado esperado:** repositório no GitHub com o servidor rodando em `localhost:3001/health`, tabelas criadas no banco, e estrutura de pastas pronta.

**Depois disso:** avisa os outros devs para clonarem. Cada um do backend entra na própria pasta e começa.

---

### DIA 1 — Estrutura e Primeiras Telas

| Quem | O que faz | O que pesquisar |
|------|-----------|-----------------|
| **Dev 1** | Cria o projeto frontend com Next.js, instala shadcn/ui e Tailwind, cria a estrutura de páginas (login, employee/dashboard, employee/submit, admin/dashboard). Configura o axios apontando para localhost:3001. Cria dados mock para o frontend usar. | "como criar projeto Next.js com JavaScript", "como instalar shadcn/ui no Next.js" |
| **Dev 2** | Usa os dados mock criados por Dev 1 e monta a tela de login (formulário com email e senha) e a tela de histórico do funcionário (listando os atestados falsos na tela). | "como fazer formulário em React", "como mapear lista com map em React" |
| **Dev 3** | Clona o repositório backend, cria sua branch, e começa o módulo de autenticação: rota de cadastro que recebe nome, email, senha e role, salva no banco com a senha criptografada. | "como usar bcrypt no Node.js", "como criar rota POST no Express" |
| **Dev 4** | Clona o repositório backend, cria sua branch, e começa o módulo de atestados: rota de envio que recebe arquivo e dados do formulário. Configura o multer para receber arquivos e salvar na pasta /uploads. | "como usar multer no Express para upload de arquivo", "multer disk storage" |
| **Dev 5** | Clona o repositório backend, cria sua branch, e começa o módulo admin: rota de listagem de todos os atestados com paginação simples. | "como fazer paginação com Prisma", "Prisma findMany skip take" |

**Checklist do fim do Dia 1:**
- [ ] Servidor Express rodando em localhost:3001/health
- [ ] Projeto frontend rodando em localhost:3000
- [ ] Tela de login montada no frontend (visual, sem funcionar de verdade ainda)
- [ ] Tela de histórico do funcionário exibindo dados mock
- [ ] Dev 3 tem a rota de cadastro salvando usuário no banco
- [ ] Dev 4 tem a rota de upload salvando arquivo na pasta /uploads
- [ ] Dev 5 tem a rota de listagem retornando atestados do banco

---

### DIA 2 — Autenticação e Proteção de Rotas

| Quem | O que faz | O que pesquisar |
|------|-----------|-----------------|
| **Dev 1** | Conecta o formulário de login do frontend na API real do backend. Quando o backend retornar o token JWT, salva no localStorage do navegador. Configura o axios para enviar o token em todas as requisições. | "como salvar token no localStorage React", "como adicionar header Authorization no axios" |
| **Dev 2** | Cria a lógica de redirecionamento: se o usuário não tiver token, redireciona para login. Se for admin, redireciona para painel admin. Se for funcionário, redireciona para dashboard do funcionário. | "como proteger rotas no Next.js", "como redirecionar em Next.js" |
| **Dev 3** | Cria a rota de login que verifica email e senha, e retorna um token JWT contendo o id e o role do usuário. Cria o middleware de autenticação que verifica se o token é válido. Cria o middleware de autorização (RBAC) que bloqueia funcionário de acessar rotas de admin. | "como gerar token JWT no Node.js", "como criar middleware no Express" |
| **Dev 4** | Adiciona proteção na rota de envio de atestado: só funciona se o usuário estiver logado. Usa o middleware de autenticação que Dev 3 criou (importa da pasta do auth). Adiciona validação de tipo de arquivo (aceitar apenas PDF e imagem) e limite de tamanho (5MB). | "como verificar tipo MIME no Node.js", "multer file filter" |
| **Dev 5** | Adiciona proteção nas rotas do admin: só funciona se o usuário for ADMIN. Usa o middleware de RBAC que Dev 3 criou. Começa a criar a lógica de filtros na listagem (filtrar por status, por nome de funcionário). | "Prisma where contains filter", "Prisma filter by enum" |

**Ponto de integração importante:** Dev 3 precisa exportar os middlewares de autenticação e RBAC como funções públicas para Dev 4 e Dev 5 importarem. Combinem isso no começo do dia.

**Checklist do fim do Dia 2:**
- [ ] Login funcionando de ponta a ponta (frontend → backend → token → localStorage)
- [ ] Rotas protegidas: funcionário não acessa painel admin
- [ ] Upload de atestado só funciona com usuário logado
- [ ] Filtros básicos funcionando na listagem admin

---

### DIA 3 — Formulário de Envio e Consentimento LGPD

| Quem | O que faz | O que pesquisar |
|------|-----------|-----------------|
| **Dev 1** | Monta a tela de envio de atestado: área de upload (pode usar react-dropzone ou input nativo de arquivo), campos para data de início e número de dias de afastamento, campo para CRM do médico. Adiciona o preview obrigatório: depois de selecionar o arquivo, mostra na tela antes de enviar e pede confirmação. | "react-dropzone tutorial", "como mostrar preview de imagem em React com URL.createObjectURL" |
| **Dev 2** | Adiciona o checkbox de consentimento LGPD na tela de envio. O checkbox NÃO pode vir marcado por padrão. O botão de enviar fica desabilitado até o checkbox ser marcado. Texto do checkbox: "Autorizo o tratamento dos dados de saúde contidos neste atestado exclusivamente para a finalidade de gestão de afastamentos pelo departamento de RH." | "checkbox React controlled component", "como desabilitar botão em React" |
| **Dev 3** | Cria a rota de registro de consentimento. Quando o frontend enviar o atestado, o backend também grava na tabela ConsentAgreement o timestamp, o IP da requisição e a versão do termo aceito. | "como pegar IP da requisição no Express", "req.ip Express" |
| **Dev 4** | Conecta o upload no frontend: quando o funcionário envia o formulário, o frontend empacota tudo em multipart/form-data e envia para a rota do backend. O backend recebe, salva o arquivo na pasta /uploads, e grava os metadados (data, dias, CRM, caminho do arquivo) na tabela MedicalCertificate. | "como enviar FormData com axios", "multer multipart form data" |
| **Dev 5** | Adiciona as ações de aprovar e recusar atestado. Quando o admin clica em aprovar ou recusar, o backend muda o status na tabela MedicalCertificate e insere um registro na tabela AuditLog com quem fez, quando fez, qual era o estado anterior e qual é o novo estado. | "Prisma update + create em uma transaction", "Prisma transaction" |

**Checklist do fim do Dia 3:**
- [ ] Funcionário consegue enviar atestado com arquivo e dados
- [ ] Preview do arquivo aparece antes do envio
- [ ] Checkbox de consentimento funcionando e obrigatório
- [ ] Consentimento gravado no banco
- [ ] Admin consegue aprovar e recusar atestados
- [ ] AuditLog registrando cada ação do admin

---

### DIA 4 — Painel do RH e Tela do Funcionário

| Quem | O que faz | O que pesquisar |
|------|-----------|-----------------|
| **Dev 1** | Monta a tabela principal do painel do RH: lista todos os atestados com colunas para nome do funcionário, data, dias, status e ações. Adiciona filtros laterais (por status, por nome, por intervalo de datas). | "como fazer tabela de dados em React", "shadcn/ui table", "filtro de data em React" |
| **Dev 2** | Monta o modal de decisão: quando o admin clica em um atestado na tabela, abre um modal mostrando todos os detalhes, o arquivo do atestado (renderizado via link ou imagem), e botões de aprovar e recusar com campo para o admin escrever uma observação. | "como fazer modal em React", "shadcn/ui dialog" |
| **Dev 3** | Cria a funcionalidade de recuperação de senha simples (se houver tempo) OU ajuda Dev 4 e Dev 5 com bugs e integração dos middlewares. Faz testes manuais no Postman/Insomnia em todas as rotas de autenticação para garantir que estão funcionando. | "como testar API REST no Postman" |
| **Dev 4** | Cria a rota de listagem dos atestados do funcionário logado. O backend extrai o userId do token JWT e filtra apenas os atestados daquele funcionário. Também cria a rota para o frontend baixar/visualizar o arquivo do atestado. | "como servir arquivo estático no Express", "express.static uploads" |
| **Dev 5** | Refina os filtros da listagem admin: busca por nome de funcionário, filtro por status (PENDING, APPROVED, REJECTED), filtro por intervalo de datas, ordenação por data mais recente, paginação. | "Prisma orderBy", "Prisma date range filter gte lte" |

**Checklist do fim do Dia 4:**
- [ ] Painel do RH exibindo todos os atestados com filtros
- [ ] Modal de decisão funcionando (aprovar/recusar com observação)
- [ ] Tela do funcionário exibindo seus próprios atestados com status atualizado
- [ ] Arquivo do atestado visível no painel admin
- [ ] Paginação funcionando

---

### DIA 5 — Integração Frontend ↔ Backend

| Quem | O que faz |
|------|-----------|
| **Dev 1 e Dev 2** | Param de criar telas novas. Foco total em conectar TODAS as telas do frontend nas APIs reais do backend. Substituem todos os dados mock por chamadas reais ao backend. Testam cada fluxo completo: cadastro → login → envio de atestado → visualização no painel → aprovação → status atualizado na tela do funcionário. |
| **Dev 3, Dev 4, Dev 5** | Param de criar rotas novas. Foco total em corrigir bugs encontrados pela integração. Resolvem problemas de CORS, erros de validação, campos faltando na resposta, erros de tipagem. Garantem que todas as rotas retornam os dados no formato correto. |

**O que todo mundo pesquisa neste dia:** "como resolver erro CORS no Express", "como tratar erro de API no React com try catch".

**Checklist do fim do Dia 5:**
- [ ] Zero dados mock no frontend — tudo vem do backend real
- [ ] Fluxo completo do funcionário funcionando de ponta a ponta
- [ ] Fluxo completo do admin funcionando de ponta a ponta
- [ ] Nenhum erro no console do navegador nos fluxos principais
- [ ] Nenhum erro 500 no terminal do backend nos fluxos principais

---

### DIA 6 — Polimento, Testes e Detalhes Finais

| Quem | O que faz |
|------|-----------|
| **Dev 1** | Revisa a interface inteira: corrige responsividade, estados de loading (mostra "Carregando..." enquanto espera resposta do backend), mensagens de erro amigáveis quando algo falha, e mensagens de sucesso quando o atestado é enviado ou quando o admin aprova. |
| **Dev 2** | Testa TODOS os cenários de erro: o que acontece se enviar sem arquivo? Se o token expirar? Se o backend estiver fora do ar? Cada cenário deve mostrar uma mensagem amigável, nunca uma tela branca ou crash. |
| **Dev 3** | Testa segurança: tenta acessar rota de admin com token de funcionário (deve dar erro 403). Tenta enviar atestado sem token (deve dar 401). Tenta cadastrar com email que já existe (deve dar erro amigável). |
| **Dev 4** | Testa envio: tenta enviar arquivo maior que 5MB (deve rejeitar). Tenta enviar arquivo que não é PDF nem imagem (deve rejeitar). Testa envio com todos os campos preenchidos e confirma que tudo salva corretamente. |
| **Dev 5** | Testa fluxo do admin: aprova um atestado e confirma que o AuditLog foi criado. Recusa outro e verifica. Testa todos os filtros. Verifica que a paginação funciona quando tem muitos atestados. |

**Checklist do fim do Dia 6:**
- [ ] Todos os cenários de erro mostram mensagens amigáveis
- [ ] Loading states em todas as telas
- [ ] Nenhuma vulnerabilidade de segurança básica
- [ ] Todos os filtros e ações do admin funcionando
- [ ] Sistema visualmente polido e apresentável

---

### DIA 7 — Finalização e Preparação da Apresentação

| Quem | O que faz |
|------|-----------|
| **Dev 1** | Faz o merge final de todas as branches na main. Remove console.logs de debug. Garante que o projeto roda do zero (clone → npm install → npm run dev). Escreve o README do repositório explicando como rodar o projeto. |
| **Dev 2** | Prepara os slides da apresentação: contexto do problema, arquitetura do sistema (diagrama simples), tecnologias usadas, demonstração do sistema, e slide de "Evoluções Futuras" listando as simplificações. |
| **Dev 3, Dev 4, Dev 5** | Populam o banco com dados de demonstração realistas para a apresentação: alguns usuários, alguns atestados em diferentes status, alguns registros no AuditLog. Garantem que a demonstração conta uma história convincente. |
| **Todos** | Ensaiam a apresentação. Definem quem demonstra qual parte. Preparam respostas para perguntas prováveis da banca. |

**OPCIONAL — Deploy:** Se sobrar tempo, o backend pode ir para o Render (gratuito) e o frontend para a Vercel (gratuito). Pesquisar "como fazer deploy de Node.js no Render" e "como fazer deploy de Next.js na Vercel". Isso não é obrigatório, mas impressiona a banca.

---

## O Que Falar na Apresentação sobre as Simplificações

A banca vai perguntar sobre as diferenças entre o relatório técnico e o que foi implementado. Resposta preparada:

"O relatório técnico detalha a arquitetura ideal para um sistema em produção. Para o MVP, priorizamos a entrega funcional dentro do prazo e fizemos simplificações conscientes e documentadas:"

| O que o relatório propõe | O que implementamos | Justificativa |
|--------------------------|---------------------|---------------|
| AWS S3 para armazenamento | Pasta /uploads local | Suficiente para demonstração. A migração para S3 exige apenas trocar o destino do upload. |
| Antivírus via API | Validação de tipo e tamanho | Protege contra uploads indevidos. Antivírus em produção seria uma integração adicional. |
| Integração com API do CFM | Campo manual para código de verificação | A API do CFM requer credenciais institucionais. O sistema está preparado para a integração. |
| Assinatura digital ICP-Brasil | Não implementado | Requer certificados reais. Documentado como evolução futura. |
| Redis + filas (BullMQ) | Processamento síncrono | Adequado para o volume de um MVP. Em produção, filas seriam necessárias para milhares de atestados simultâneos. |
| Presigned URLs do S3 | Servir arquivo estático local | Em produção, URLs temporárias do S3 garantiriam privacidade extra. |

---

## Regras de Convivência no Código

1. **Cada dev do backend só mexe na própria pasta de módulo.** Sem exceção.
2. **Se precisar de algo de outro módulo, pede para o dono exportar uma função.** Nunca copiar código nem acessar o banco por fora.
3. **O arquivo server.js e o shared/prisma.js são intocáveis depois de criados.** Dev 1 é o único que mexe se necessário.
4. **Commit no final de cada sessão de trabalho.** Mesmo que incompleto, commit e push na sua branch.
5. **Problemas técnicos vão para Dev 1.** Ele centraliza e decide a solução.
6. **Nenhuma tecnologia nova é adicionada sem aprovação de Dev 1.** Não instale bibliotecas por conta própria.
7. **Daily de 15 minutos todo dia.** Cada um responde: "O que fiz, o que vou fazer, onde estou travado."

---

## Bibliotecas que Cada Dev Precisa Conhecer

| Dev | Biblioteca | Para quê | O que pesquisar |
|-----|-----------|----------|-----------------|
| Dev 1 | next, tailwindcss, shadcn/ui, axios | Framework frontend, estilo, componentes, chamadas HTTP | "Next.js tutorial português", "shadcn/ui getting started" |
| Dev 2 | react-dropzone (opcional) | Área de upload drag-and-drop | "react-dropzone tutorial" |
| Dev 3 | bcrypt, jsonwebtoken | Criptografia de senha e geração de token | "bcrypt Node.js tutorial", "JWT Node.js tutorial" |
| Dev 4 | multer | Receber arquivos no Express | "multer Express upload tutorial" |
| Dev 5 | (só Prisma) | Queries complexas com filtros | "Prisma findMany where filter tutorial" |

---

## Perguntas Frequentes da Equipe

**"O que é um middleware?"**
É uma função que roda ANTES da sua rota. Exemplo: o middleware de autenticação verifica se o token JWT é válido antes de deixar a requisição chegar na lógica principal. Pesquise "middleware Express tutorial".

**"O que é JWT?"**
É um token (uma string longa) que o backend gera quando o login dá certo. O frontend guarda esse token e envia em toda requisição. O backend verifica o token e sabe quem é o usuário sem precisar pedir login de novo. Pesquise "JWT explicado em português".

**"O que é RBAC?"**
Role-Based Access Control. Cada usuário tem um papel (role): EMPLOYEE ou ADMIN. Um middleware verifica o role e bloqueia acesso se não for compatível. Exemplo: funcionário tentando acessar rota de admin recebe erro 403.

**"Como o módulo do admin sabe quem é o usuário?"**
O middleware de autenticação (feito por Dev 3) decodifica o token JWT e coloca os dados do usuário (id, role) no objeto `req`. Todos os módulos acessam `req.user` depois que o middleware roda.

**"Posso usar SQL puro em vez do Prisma?"**
Não. O Prisma já está configurado e todos usam ele. Isso garante consistência. Pesquise "Prisma CRUD tutorial" para aprender os comandos básicos.

**"E se eu travar em algo?"**
Pesquise no YouTube ou Google em português. Se não resolver em 30 minutos, manda no grupo da equipe. Dev 1 decide a solução. Não perca o dia inteiro em um problema.
