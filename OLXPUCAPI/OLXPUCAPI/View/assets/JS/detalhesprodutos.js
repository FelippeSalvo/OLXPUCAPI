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

        // Preenche outros campos se existirem - com múltiplas variações
        const categoria = document.getElementById("categoria");
        const condicao = document.getElementById("condicao");
        const localizacao = document.getElementById("localizacao");
        
        if (categoria) {
            categoria.textContent = produto.category || produto.Category || "Não especificado";
        }
        if (condicao) {
            condicao.textContent = produto.condition || produto.Condition || "Não especificado";
        }
        if (localizacao) {
            localizacao.textContent = produto.location || produto.Location || "Não especificado";
        }
        
        // Carrega informações do vendedor - tenta com diferentes variações
        const ownerId = produto.ownerId || produto.OwnerId || produto.ownerID;
        if (ownerId) {
            await carregarInformacoesVendedor(ownerId);
        } else {
            // Se não houver ownerId, preenche valores padrão
            const curso = document.getElementById("curso");
            const telefone = document.getElementById("telefone");
            const avaliacao = document.getElementById("avaliacao");
            const nomeVendedor = document.getElementById("nomeVendedor");
            const membroDesde = document.getElementById("membroDesde");
            const fotoVendedor = document.getElementById("fotoVendedor");
            const fotoPadrao = 'assets/img/pucicone.png';
            
            if (curso) curso.textContent = "Não informado";
            if (telefone) telefone.textContent = "Não informado";
            if (avaliacao) {
                avaliacao.innerHTML = '<i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star"></i> <small>4.0</small>';
            }
            if (nomeVendedor) nomeVendedor.textContent = "Vendedor";
            if (membroDesde) membroDesde.textContent = "2024";
            if (fotoVendedor) {
                fotoVendedor.src = fotoPadrao;
                fotoVendedor.alt = "Foto do Vendedor";
            }
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
        
        let vendedor = null;
        
        if (userRes.ok) {
            vendedor = await userRes.json();
        } else {
            console.warn("Não foi possível carregar informações do vendedor da API");
        }
        
        // Tenta buscar do localStorage como fallback
        if (!vendedor) {
            try {
                const usuarioLogado = localStorage.getItem("usuarioLogado");
                if (usuarioLogado) {
                    const userLocal = JSON.parse(usuarioLogado);
                    const userIdLocal = userLocal.id || userLocal.Id || userLocal.ID;
                    // Compara como strings para garantir compatibilidade
                    if (userIdLocal && userIdLocal.toString() === ownerId.toString()) {
                        vendedor = userLocal;
                    }
                }
            } catch (e) {
                console.warn("Erro ao buscar do localStorage:", e);
            }
        }
        
        // Preenche informações do vendedor
        const nomeVendedor = document.getElementById("nomeVendedor");
        const fotoVendedor = document.getElementById("fotoVendedor");
        const membroDesde = document.getElementById("membroDesde");
        const avaliacao = document.getElementById("avaliacao");
        const curso = document.getElementById("curso");
        const telefone = document.getElementById("telefone");
        
        if (nomeVendedor) {
            nomeVendedor.textContent = vendedor?.name || vendedor?.Name || "Vendedor";
        }
        
        if (fotoVendedor) {
            // Usa a foto do vendedor se disponível, senão usa o logo da PUC Minas
            const fotoPadrao = 'assets/img/pucicone.png';
            fotoVendedor.src = vendedor?.photoUrl || vendedor?.PhotoUrl || fotoPadrao;
            fotoVendedor.alt = vendedor?.name || vendedor?.Name || "Foto do Vendedor";
        }
        
        // Membro desde - usa data de criação do usuário se disponível, senão usa data atual
        if (membroDesde) {
            const dataCriacao = vendedor?.createdAt || vendedor?.CreatedAt || 
                              vendedor?.createdDate || vendedor?.CreatedDate || 
                              new Date().toISOString();
            try {
                const data = new Date(dataCriacao);
                if (!isNaN(data.getTime())) {
                    const mes = data.toLocaleString('pt-BR', { month: 'long' });
                    const ano = data.getFullYear();
                    membroDesde.textContent = `${mes} de ${ano}`;
                } else {
                    membroDesde.textContent = "2024";
                }
            } catch {
                membroDesde.textContent = "2024";
            }
        }
        
        // Avaliação - busca avaliações do vendedor ou usa valor padrão
        if (avaliacao) {
            const notaMedia = vendedor?.averageRating || vendedor?.AverageRating || 
                            vendedor?.rating || vendedor?.Rating || 4.5;
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
        
        // Curso - busca do campo com diferentes variações de capitalização
        if (curso) {
            const cursoValue = vendedor?.course || vendedor?.Course || 
                             vendedor?.curso || vendedor?.Curso || 
                             "Não informado";
            curso.textContent = cursoValue;
        }
        
        // Telefone - busca do campo com diferentes variações
        if (telefone) {
            const telefoneValue = vendedor?.phone || vendedor?.Phone || 
                                vendedor?.telephone || vendedor?.Telephone || 
                                vendedor?.contact || vendedor?.Contact ||
                                vendedor?.telefone || vendedor?.Telefone ||
                                "Não informado";
            telefone.textContent = telefoneValue;
        }
        
    } catch (err) {
        console.error("Erro ao carregar informações do vendedor:", err);
        
        // Preenche valores padrão em caso de erro
        const curso = document.getElementById("curso");
        const telefone = document.getElementById("telefone");
        const avaliacao = document.getElementById("avaliacao");
        const fotoVendedor = document.getElementById("fotoVendedor");
        const fotoPadrao = 'assets/img/pucicone.png';
        
        if (curso) curso.textContent = "Não informado";
        if (telefone) telefone.textContent = "Não informado";
        if (avaliacao) {
            avaliacao.innerHTML = '<i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star"></i> <small>4.0</small>';
        }
        if (fotoVendedor) {
            fotoVendedor.src = fotoPadrao;
            fotoVendedor.alt = "Foto do Vendedor";
        }
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
            toast.classList.add("show");
            setTimeout(() => {
                toast.classList.remove("show");
            }, 3000);
        } else {
            alert("✅ Produto adicionado ao carrinho!");
        }
    } catch (err) {
        console.error(err);
        alert(`Erro ao adicionar produto ao carrinho: ${err.message}`);
    }
}