# Node Auth Project (Basic + Bearer)

Projeto simples para praticar autenticação **Basic** e **Bearer (JWT)**, desenvolvido durante o curso de Node.js da **B7Web**.  
Após o curso, o código foi **aprimorado consideravelmente**, como foco em **tipagem forte**, **tratamento de erros mais robusto**, **funções utilitárias** e **separação de responsabilidades**.

## O que tem aqui

- **Register** (`POST /register`): cria usuário e retorna **token JWT**
- **Login** (`POST /login`): autentica usuário e retorna **token JWT**
- **Rota protegida** (`GET /list`): exige **Bearer token** válido

## Tecnologias

- Node.js + **TypeScript**
- **Express**
- **Sequelize** + **PostgreSQL**
- **bcrypt** (hash de senha)
- **jsonwebtoken** (JWT)
- **dotenv** e **cors**

## Estrutura (resumo)

- `src/controllers` – controllers da API (register/login/list)
- `src/routes` – definição das rotas
- `src/middlewares` – autenticação (Bearer) e error handler
- `src/utils` – utilitários de autenticação (parse de Basic/Bearer, validações)
- `src/models` – model `User` (Sequelize)
- `src/instances` – instância/conexão com Postgres (Sequelize)
- `src/types` / `src/interfaces` – tipos e contratos (tipagem forte)

## Variáveis de ambiente

Crie um arquivo `.env`:

```env
PORT=3000
JWT_SECRET_KEY=sua_chave_secreta

PG_DB=seu_banco
PG_USER=seu_usuario
PG_PASSWORD=sua_senha
PG_HOST=localhost
PG_PORT=5432
```

## Como rodar

```bash
npm install
npm run dev
```

Servidor sobe em: `http://localhost:3000`

## Exemplos rápidos

### Register
```http
POST /register
Content-Type: application/json

{
  "email": "email@teste.com",
  "password": "123456"
}
```

### Login
```http
POST /login
Content-Type: application/json

{
  "email": "email@teste.com",
  "password": "123456"
}
```

### Rota protegida (Bearer)
```http
GET /list
Authorization: Bearer SEU_TOKEN_AQUI
```

## Melhorias em relação ao projeto do curso

- Validação mais completa de headers e credenciais (Basic/Bearer)
- Tratamento de erros centralizado (inclui caso de **JSON inválido**)
- Tipagem mais rigorosa com `types` e `interfaces`
- Utilitários dedicados para parse/validação de autenticação
- Melhor separação de responsabilidade (controllers/middlewares/utils)

## Créditos

Projeto base feito no curso de Node.js da [B7Web](https://b7web.com.br/).  