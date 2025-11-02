document.addEventListener("DOMContentLoaded", async () => {
    const userStr = localStorage.getItem("usuarioLogado");
    
    if (!userStr) {
        const container = document.querySelector("#carrinho-container") || document.querySelector(".card-body");
        if (container) {
            container.innerHTML = `
                <div class="carrinho-vazio">
                    <i class="fas fa-lock"></i>
                    <h3>Faça login para ver seu carrinho</h3>
                    <p>Entre na sua conta para adicionar produtos ao carrinho</p>
                    <a href="Login.html" class="btn">Fazer Login</a>
                </div>
            `;
        }
        return;
    }

    const user = JSON.parse(userStr);
    if (!user || !user.id) {
        const container = document.querySelector("#carrinho-container") || document.querySelector(".card-body");
        if (container) {
            container.innerHTML = `
                <div class="carrinho-vazio">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Erro ao carregar carrinho</h3>
                    <p>Usuário não encontrado. Faça login novamente.</p>
                    <a href="Login.html" class="btn">Fazer Login</a>
                </div>
            `;
        }
        return;
    }

    try {
        const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CART}/${user.id}`);
        
        if (!res.ok) {
            throw new Error('Erro ao carregar carrinho');
        }
        
        const itens = await res.json();
        const container = document.querySelector("#carrinho-container") || document.querySelector(".card-body");

        if (!container) {
            console.error("Container do carrinho não encontrado!");
            return;
        }

        container.innerHTML = "";

        if (!itens || itens.length === 0) {
            container.innerHTML = `
                <div class="carrinho-vazio">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Seu carrinho está vazio</h3>
                    <p>Que tal começar a adicionar alguns produtos?</p>
                    <a href="index.html" class="btn">Voltar às compras</a>
                </div>
            `;
            updateResumo(0);
            return;
        }

        let total = 0;

        for (const item of itens) {
            try {
                const produtoRes = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}/${item.productId}`);
                
                if (!produtoRes.ok) {
                    console.warn(`Produto ${item.productId} não encontrado`);
                    continue;
                }
                
                const produto = await produtoRes.json();
                const subtotal = (produto.price || 0) * (item.quantity || 0);
                total += subtotal;

                const card = document.createElement("div");
                card.classList.add("card", "mb-3", "p-3");
                const imageUrl = produto.imageUrl || produto.ImageUrl || 'assets/img/no-image.png';
                const titulo = produto.title || produto.Title || "Produto";
                
                card.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="d-flex gap-3 align-items-center">
                            <img src="${imageUrl}" 
                                 alt="${titulo}" 
                                 class="carrinho-img"
                                 onerror="this.src='assets/img/no-image.png'">
                            <div>
                                <h5>${titulo}</h5>
                                <p>Quantidade: ${item.quantity || 1}</p>
                                <p>R$ ${subtotal.toFixed(2)}</p>
                            </div>
                        </div>
                        <button class="btn btn-danger" onclick="removerItem('${user.id}', '${item.productId}')">Remover</button>
                    </div>
                `;
                container.appendChild(card);
            } catch (err) {
                console.error(`Erro ao carregar produto ${item.productId}:`, err);
            }
        }

        updateResumo(total);
    } catch (err) {
        console.error("Erro ao carregar carrinho:", err);
        const container = document.querySelector("#carrinho-container") || document.querySelector(".card-body");
        if (container) {
            container.innerHTML = `
                <div class="carrinho-vazio">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Erro ao carregar carrinho</h3>
                    <p>${err.message}</p>
                    <a href="index.html" class="btn">Voltar à página inicial</a>
                </div>
            `;
        }
    }
});

function updateResumo(total) {
    const sumarioLista = document.querySelector(".sumario-lista");
    if (sumarioLista) {
        const userStr = localStorage.getItem("usuarioLogado");
        const user = userStr ? JSON.parse(userStr) : null;
        
        let html = `
            <li class="list-group-item d-flex justify-content-between">
                <span>Subtotal</span>
                <span>R$ ${total.toFixed(2)}</span>
            </li>
            <li class="list-group-item d-flex justify-content-between">
                <span>Frete</span>
                <span>Grátis</span>
            </li>
            <li class="list-group-item d-flex justify-content-between fw-bold">
                <span>Total</span>
                <span>R$ ${total.toFixed(2)}</span>
            </li>
        `;

        // Adiciona botão de limpar carrinho se houver itens
        if (total > 0 && user) {
            html += `
                <li class="list-group-item">
                    <button class="btn btn-danger w-100" onclick="limparCarrinho('${user.id}')">
                        <i class="fas fa-trash me-2"></i>Limpar Carrinho
                    </button>
                </li>
            `;
        }

        sumarioLista.innerHTML = html;
    }
}

async function removerItem(userId, productId) {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CART}/${userId}/${productId}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error('Erro ao remover item');
        }

        alert("🗑️ Produto removido do carrinho!");
        location.reload();
    } catch (err) {
        console.error("Erro ao remover item:", err);
        alert(`Erro ao remover produto do carrinho: ${err.message}`);
    }
}

async function limparCarrinho(userId) {
    if (!confirm("Tem certeza que deseja limpar todo o carrinho? Esta ação não pode ser desfeita.")) {
        return;
    }

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CART}/clear/${userId}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error('Erro ao limpar carrinho');
        }

        alert("✅ Carrinho limpo com sucesso!");
        location.reload();
    } catch (err) {
        console.error("Erro ao limpar carrinho:", err);
        alert(`Erro ao limpar carrinho: ${err.message}`);
    }
}
