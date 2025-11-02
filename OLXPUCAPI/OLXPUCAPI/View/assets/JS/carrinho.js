document.addEventListener("DOMContentLoaded", async () => {
    const userStr = localStorage.getItem("usuarioLogado");
    
    if (!userStr) {
        const container = document.querySelector(".card-body") || document.getElementById("carrinho-container");
        if (container) {
            container.innerHTML = "<p>Faça login para ver seu carrinho.</p>";
        }
        return;
    }

    const user = JSON.parse(userStr);
    if (!user || !user.id) {
        const container = document.querySelector(".card-body") || document.getElementById("carrinho-container");
        if (container) {
            container.innerHTML = "<p>Erro: Usuário não encontrado. Faça login novamente.</p>";
        }
        return;
    }

    try {
        const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CART}/${user.id}`);
        
        if (!res.ok) {
            throw new Error('Erro ao carregar carrinho');
        }
        
        const itens = await res.json();
        const container = document.querySelector(".card-body") || document.getElementById("carrinho-container");

        if (!container) {
            console.error("Container do carrinho não encontrado!");
            return;
        }

        container.innerHTML = "";

        if (!itens || itens.length === 0) {
            container.innerHTML = "<p>Seu carrinho está vazio.</p>";
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
                card.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h5>${produto.title || "Produto"}</h5>
                            <p>Quantidade: ${item.quantity || 1}</p>
                            <p>R$ ${subtotal.toFixed(2)}</p>
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
        const container = document.querySelector(".card-body") || document.getElementById("carrinho-container");
        if (container) {
            container.innerHTML = `<p>Erro ao carregar carrinho: ${err.message}</p>`;
        }
    }
});

function updateResumo(total) {
    const sumarioLista = document.querySelector(".sumario-lista");
    if (sumarioLista) {
        sumarioLista.innerHTML = `
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