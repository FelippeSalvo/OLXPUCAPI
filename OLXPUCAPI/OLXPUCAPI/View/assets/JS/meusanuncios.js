// Script para carregar e exibir os anúncios do usuário logado
document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("anuncios-container");
    const semAnuncios = document.getElementById("sem-anuncios");
    
    if (!container) return;

    // Verifica se usuário está logado
    const userStr = localStorage.getItem("usuarioLogado");
    if (!userStr) {
        container.innerHTML = `
            <div class="alert alert-warning text-center shadow-sm p-5">
                <i class="bi bi-exclamation-triangle fs-1 text-warning mb-3"></i>
                <h4 class="mb-3">Você precisa estar logado para ver seus anúncios.</h4>
                <a href="Login.html" class="btn btn-primary btn-lg mt-3">
                    <i class="bi bi-box-arrow-in-right me-2"></i> Fazer Login
                </a>
            </div>
        `;
        return;
    }

    let user;
    try {
        user = JSON.parse(userStr);
    } catch (err) {
        console.error("Erro ao parsear usuário:", err);
        return;
    }

    const userId = user.id || user.Id || user.ID;
    if (!userId) {
        container.innerHTML = `
            <div class="alert alert-danger text-center shadow-sm p-5">
                <h4>Erro: Usuário sem ID válido.</h4>
                <a href="Login.html" class="btn btn-primary mt-3">Fazer Login</a>
            </div>
        `;
        return;
    }

    try {
        // Busca os produtos do usuário
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}/owner/${userId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const produtos = await response.json();
        
        if (!produtos || produtos.length === 0) {
            // Mantém a mensagem padrão se não houver produtos
            if (semAnuncios) semAnuncios.style.display = "block";
            return;
        }

        // Esconde a mensagem padrão
        if (semAnuncios) semAnuncios.style.display = "none";

        // Cria a seção de grid com os cards
        const grid = document.createElement("section");
        grid.className = "ads-grid";
        grid.id = "meus-anuncios-grid";

        // Renderiza cada produto como card padrão
        produtos.forEach((produto) => {
            const card = document.createElement("div");
            card.className = "ad-card";

            const titulo = escapeHtml(produto.title || produto.Title || 'Sem título');
            let descricao = escapeHtml(produto.description || produto.Description || 'Sem descrição');
            if (descricao.length > 100) {
                descricao = descricao.substring(0, 100) + '...';
            }
            const preco = (produto.price || produto.Price || 0).toFixed(2).replace('.', ',');
            const imageUrl = escapeHtml(produto.imageUrl || produto.ImageUrl || 'assets/img/no-image.png');
            const produtoId = produto.id || produto.Id;

            card.innerHTML = `
                <div class="img-container">
                    <img src="${imageUrl}" alt="${titulo}" onerror="this.src='assets/img/no-image.png'">
                </div>
                <div class="ad-info">
                    <h3>${titulo}</h3>
                    <p>${descricao}</p>
                    <div class="price">R$ ${preco}</div>
                    <div class="d-flex gap-2 mt-2" style="flex-wrap: wrap;">
                        <button class="btn-card" onclick="window.location.href='detalhes.html?id=${produtoId}'">Ver detalhes</button>
                        <button class="btn-edit" onclick="editarProduto('${produtoId}')" style="background-color: #189f8f; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer;">
                            <i class="fas fa-edit me-1"></i>Editar
                        </button>
                        <button class="btn-delete" onclick="deletarProduto('${produtoId}', '${titulo}')" style="background-color: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer;">
                            <i class="fas fa-trash me-1"></i>Deletar
                        </button>
                    </div>
                </div>
            `;

            grid.appendChild(card);
        });

        // Adiciona o grid ao container
        container.innerHTML = "";
        container.appendChild(grid);

        // Adiciona botão para cadastrar novo anúncio
        const btnNovoAnuncio = document.createElement("div");
        btnNovoAnuncio.className = "text-center";
        btnNovoAnuncio.innerHTML = `
            <a href="cadastro.html" class="btn btn-success">
                <i class="fas fa-plus-circle me-2"></i> Cadastrar Novo Anúncio
            </a>
        `;
        container.appendChild(btnNovoAnuncio);

    } catch (err) {
        console.error("Erro ao carregar anúncios:", err);
        container.innerHTML = `
            <div class="alert alert-danger text-center shadow-sm p-5">
                <i class="bi bi-exclamation-triangle fs-1 text-danger mb-3"></i>
                <h4 class="mb-3">Erro ao carregar seus anúncios</h4>
                <p>${err.message}</p>
                <button class="btn btn-primary mt-3" onclick="location.reload()">
                    <i class="bi bi-arrow-clockwise me-2"></i> Tentar Novamente
                </button>
            </div>
        `;
    }
});

// Função para escapar HTML (mesma do Homepage.js)
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Função para deletar produto
async function deletarProduto(productId, titulo) {
    if (!confirm(`Tem certeza que deseja deletar o produto "${titulo}"? Esta ação não pode ser desfeita.`)) {
        return;
    }

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}/${productId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Erro ao deletar produto');
        }

        alert('✅ Produto deletado com sucesso!');
        location.reload();
    } catch (err) {
        console.error('Erro ao deletar produto:', err);
        alert(`Erro ao deletar produto: ${err.message}`);
    }
}

// Função para editar produto
function editarProduto(productId) {
    window.location.href = `editar-produto.html?id=${productId}`;
}

