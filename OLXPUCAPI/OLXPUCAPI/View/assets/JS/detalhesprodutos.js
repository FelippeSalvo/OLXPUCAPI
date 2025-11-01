document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        console.error("ID do produto não fornecido!");
        return;
    }

    try {
        const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}`);
        
        if (!res.ok) {
            throw new Error("Produto não encontrado.");
        }
        
        const produto = await res.json();

        // Preenche os campos na página de detalhes
        const titulo = document.getElementById("titulo");
        const descricao = document.getElementById("descricao");
        const preco = document.getElementById("preco");
        const mainImage = document.getElementById("mainImage");
        const btnCarrinho = document.getElementById("btnCarrinho");

        if (titulo) titulo.textContent = produto.title || "Sem título";
        if (descricao) descricao.textContent = produto.description || "Sem descrição";
        if (preco) preco.innerHTML = `<h3 class="text-success">R$ ${(produto.price || 0).toFixed(2)}</h3>`;
        if (mainImage) mainImage.src = produto.imageUrl || 'assets/img/no-image.png';
        
        if (btnCarrinho) {
            btnCarrinho.onclick = (e) => {
                e.preventDefault();
                adicionarAoCarrinho(produto.id);
            };
        }

        // Preenche outros campos se existirem
        const categoria = document.getElementById("categoria");
        const condicao = document.getElementById("condicao");
        const localizacao = document.getElementById("localizacao");
        
        if (categoria) categoria.textContent = produto.category || "Não especificado";
        if (condicao) condicao.textContent = produto.condition || "Não especificado";
        if (localizacao) localizacao.textContent = produto.location || "Não especificado";
        
        // Carrega informações do vendedor
        if (produto.ownerId) {
            await carregarInformacoesVendedor(produto.ownerId);
        }
        
    } catch (err) {
        console.error("Erro ao carregar produto:", err);
        const container = document.getElementById("detalhes-produto");
        if (container) {
            container.innerHTML = `<p>Erro ao carregar produto: ${err.message}</p>`;
        }
    }
});

// Função para carregar informações do vendedor
async function carregarInformacoesVendedor(ownerId) {
    try {
        const userRes = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}/${ownerId}`);
        
        if (!userRes.ok) {
            console.warn("Não foi possível carregar informações do vendedor");
            return;
        }
        
        const vendedor = await userRes.json();
        
        // Preenche informações do vendedor
        const nomeVendedor = document.getElementById("nomeVendedor");
        const fotoVendedor = document.getElementById("fotoVendedor");
        const membroDesde = document.getElementById("membroDesde");
        const avaliacao = document.getElementById("avaliacao");
        const curso = document.getElementById("curso");
        const telefone = document.getElementById("telefone");
        
        if (nomeVendedor) nomeVendedor.textContent = vendedor.name || "Vendedor";
        if (fotoVendedor) {
            // Se não houver foto, usa uma imagem padrão ou inicial do nome
            fotoVendedor.src = vendedor.photoUrl || 'assets/img/no-image.png';
            fotoVendedor.alt = vendedor.name || "Foto do Vendedor";
        }
        
        // Membro desde - usa data de criação do usuário se disponível, senão usa data atual
        if (membroDesde) {
            const dataCriacao = vendedor.createdAt || vendedor.createdDate || new Date().toISOString();
            try {
                const data = new Date(dataCriacao);
                const mes = data.toLocaleString('pt-BR', { month: 'long' });
                const ano = data.getFullYear();
                membroDesde.textContent = `${mes} de ${ano}`;
            } catch {
                membroDesde.textContent = "Data não disponível";
            }
        }
        
        // Avaliação - por enquanto usa um valor padrão ou busca avaliações do vendedor
        if (avaliacao) {
            // Aqui você pode buscar avaliações do vendedor quando implementar o sistema de avaliações
            // Por enquanto, exibe estrelas padrão
            const notaMedia = vendedor.averageRating || 4.5; // Valor padrão
            const estrelas = Math.round(notaMedia);
            let htmlAvaliacao = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= estrelas) {
                    htmlAvaliacao += '<i class="bi bi-star-fill"></i>';
                } else {
                    htmlAvaliacao += '<i class="bi bi-star"></i>';
                }
            }
            avaliacao.innerHTML = htmlAvaliacao + ` <small>${notaMedia.toFixed(1)}</small>`;
        }
        
        // Curso - busca do campo course ou usa valor padrão
        if (curso) {
            curso.textContent = vendedor.course || vendedor.curso || "Não informado";
        }
        
        // Telefone - busca do campo phone ou telephone
        if (telefone) {
            telefone.textContent = vendedor.phone || vendedor.telephone || vendedor.contact || "Não informado";
        }
        
    } catch (err) {
        console.error("Erro ao carregar informações do vendedor:", err);
    }
}

async function adicionarAoCarrinho(productId) {
    const userStr = localStorage.getItem("usuarioLogado");
    if (!userStr) {
        alert("Faça login para adicionar produtos ao carrinho!");
        window.location.href = "Login.html";
        return;
    }

    const user = JSON.parse(userStr);
    if (!user || !user.id) {
        alert("Erro: Usuário não encontrado. Faça login novamente.");
        window.location.href = "Login.html";
        return;
    }

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CART}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                userId: user.id, 
                productId: productId, 
                quantity: 1 
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: "Erro ao adicionar ao carrinho" }));
            throw new Error(error.message || 'Erro ao adicionar ao carrinho');
        }

        // Mostra toast se existir
        const toast = document.getElementById("toast");
        if (toast) {
            toast.style.display = "block";
            setTimeout(() => {
                toast.style.display = "none";
            }, 3000);
        } else {
            alert("✅ Produto adicionado ao carrinho!");
        }
    } catch (err) {
        console.error(err);
        alert(`Erro ao adicionar produto ao carrinho: ${err.message}`);
    }
}