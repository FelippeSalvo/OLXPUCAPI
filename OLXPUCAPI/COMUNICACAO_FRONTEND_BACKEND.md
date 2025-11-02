# Guia de Comunicação Frontend-Backend

## ✅ Configurações Realizadas

### 1. **Backend (ASP.NET Core)**
- ✅ CORS configurado para permitir requisições do frontend
- ✅ API rodando em `http://localhost:5196` (HTTP para desenvolvimento)
- ✅ Endpoints disponíveis:
  - `/api/Auth` - Autenticação (login/register)
  - `/api/Products` - Produtos
  - `/api/Cart` - Carrinho
  - `/api/Users` - Usuários

### 2. **Frontend (HTML/JavaScript)**
- ✅ `config.js` centralizado com URL da API
- ✅ Todos os arquivos JS usando `API_CONFIG` do `config.js`
- ✅ Todos os HTMLs carregam `config.js` antes dos outros scripts

## 🚀 Como Testar

### Passo 1: Iniciar o Backend
```bash
cd OLXPUCAPI
dotnet run
```

O backend estará disponível em:
- HTTP: `http://localhost:5196`
- Swagger UI: `http://localhost:5196/swagger`

### Passo 2: Abrir o Frontend
Abra os arquivos HTML diretamente no navegador ou use um servidor local:

**Opção 1: Servidor Python**
```bash
cd OLXPUCAPI/View
python -m http.server 8000
```
Acesse: `http://localhost:8000/index.html`

**Opção 2: Servidor Node.js (se tiver instalado)**
```bash
cd OLXPUCAPI/View
npx http-server -p 8000
```

**Opção 3: Abrir diretamente**
- Clique duas vezes no arquivo `index.html` (pode ter problemas de CORS com alguns navegadores)

### Passo 3: Testar Funcionalidades

1. **Cadastro de Usuário**
   - Acesse `cadastro_usuario.html`
   - Preencha os dados e clique em "Criar conta"
   - O usuário será criado no backend

2. **Login**
   - Acesse `Login.html`
   - Use o email e senha cadastrados
   - O login autenticará com o backend

3. **Listar Produtos**
   - Acesse `index.html`
   - Os produtos serão carregados do backend automaticamente

4. **Adicionar ao Carrinho**
   - Faça login primeiro
   - Clique em um produto para ver detalhes
   - Clique em "Adicionar ao Carrinho"
   - O item será salvo no backend

5. **Ver Carrinho**
   - Acesse `carrinho.html`
   - Os itens do carrinho serão carregados do backend

## 🔧 Arquivos Modificados

### Backend
- `Program.cs` - Configuração de CORS

### Frontend
- `config.js` - URL da API centralizada
- `login.js` - Integração com API de autenticação
- `cadastro.js` - Integração com API de cadastro
- `Homepage.js` - Listagem de produtos
- `detalhesprodutos.js` - Detalhes e adicionar ao carrinho
- `carrinho.js` - Gerenciar carrinho
- `cadastro-produto.js` - Cadastrar novos produtos (novo arquivo)
- Todos os HTMLs - Inclusão do `config.js`

## ⚠️ Solução de Problemas

### Erro de CORS
Se você ver erros de CORS no console do navegador:
- Verifique se o backend está rodando
- Verifique se a URL no `config.js` está correta (`http://localhost:5196/api`)
- Limpe o cache do navegador

### Erro de Conexão
Se você ver "Erro de conexão com o servidor":
- Verifique se o backend está rodando na porta 5196
- Abra o Swagger em `http://localhost:5196/swagger` para testar a API
- Verifique o console do navegador (F12) para mais detalhes

### Produtos não aparecem
- Verifique se há produtos cadastrados no backend
- Abra o Swagger e teste o endpoint `/api/Products`
- Verifique o console do navegador para erros

## 📝 Próximos Passos (Opcional)

1. **Upload de Imagens**: Implementar upload de imagens para produtos
2. **Autenticação JWT**: Adicionar tokens JWT para melhor segurança
3. **Validação**: Adicionar validação de formulários no frontend
4. **Tratamento de Erros**: Melhorar mensagens de erro para o usuário

