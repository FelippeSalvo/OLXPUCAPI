// Função para escapar HTML e prevenir XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Função para embaralhar array (Fisher-Yates)
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Inicializa o carrossel com imagens dos produtos
async function initializeCarousel() {
    const carouselContainer = document.querySelector('.carousel-container');
    if (!carouselContainer) return;

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const produtos = await response.json();

        // Filtra produtos que têm imagens válidas
        const produtosComImagens = produtos.filter(p => 
            p.imageUrl && 
            p.imageUrl !== 'assets/img/no-image.png' && 
            !p.imageUrl.includes('no-image')
        );

        let produtosParaCarrossel = [];

        if (produtosComImagens.length > 0) {
            // Embaralha aleatoriamente todos os produtos com imagens válidas
            // e mantém todos no carrossel
            produtosParaCarrossel = shuffleArray([...produtosComImagens]);
        }

        // Limpa o container e adiciona as imagens com links
        carouselContainer.innerHTML = '';
        
        if (produtosParaCarrossel.length > 0) {
            produtosParaCarrossel.forEach((produto, index) => {
                // Cria um link que envolve a imagem
                const link = document.createElement('a');
                link.href = `detalhes.html?id=${produto.id}`;
                link.style.textDecoration = 'none';
                link.style.display = 'block';
                link.style.width = '100%';
                link.style.height = '100%';
                link.style.position = 'relative';
                link.style.cursor = 'pointer';
                
                const img = document.createElement('img');
                img.src = escapeHtml(produto.imageUrl || 'assets/img/no-image.png');
                img.className = 'carousel-image';
                if (index === 0) {
                    img.classList.add('active');
                    link.classList.add('active');
                }
                img.onerror = function() {
                    this.src = 'assets/img/no-image.png';
                };
                
                link.appendChild(img);
                carouselContainer.appendChild(link);
            });
        } else {
            // Se não houver produtos com imagens, usa imagem padrão
            const img = document.createElement('img');
            img.src = 'assets/img/no-image.png';
            img.className = 'carousel-image active';
            img.alt = 'Carrossel';
            carouselContainer.appendChild(img);
        }

        // Inicializa o carrossel
        initCarouselControls();
    } catch (err) {
        console.error("Erro ao carregar imagens do carrossel:", err);
        // Usa imagem padrão em caso de erro
        if (carouselContainer) {
            carouselContainer.innerHTML = `
                <img src="assets/img/no-image.png" class="carousel-image active" alt="Carrossel">
            `;
        }
    }
}

// Inicializa os controles do carrossel
function initCarouselControls() {
    const images = document.querySelectorAll('.carousel-image');
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');
    let currentIndex = 0;

    if (images.length <= 1) {
        // Se tiver apenas uma imagem, esconde os botões
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
        return;
    }

    // Mostra os botões se estavam escondidos
    if (prevBtn) prevBtn.style.display = 'flex';
    if (nextBtn) nextBtn.style.display = 'flex';

    function showImage(index) {
        images.forEach((img, i) => {
            img.classList.remove('active');
            const link = img.closest('a');
            if (link) {
                link.classList.remove('active');
            }
            if (i === index) {
                img.classList.add('active');
                if (link) {
                    link.classList.add('active');
                }
            }
        });
    }

    function nextImage() {
        currentIndex = (currentIndex + 1) % images.length;
        showImage(currentIndex);
    }

    function prevImage() {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        showImage(currentIndex);
    }

    if (nextBtn) {
        nextBtn.onclick = nextImage;
    }

    if (prevBtn) {
        prevBtn.onclick = prevImage;
    }

    // Auto-play: muda a imagem a cada 5 segundos
    setInterval(nextImage, 5000);
}

// Variável global para armazenar todos os produtos
let todosProdutos = [];
let categoriaAtual = 'Todos';

// Função para renderizar produtos
function renderizarProdutos(produtos) {
    const container = document.getElementById("cards-container") || document.querySelector(".ads-grid");
    
    if (!container) {
        console.error("Container de produtos não encontrado!");
        return;
    }

    container.innerHTML = "";

    if (!produtos || produtos.length === 0) {
        container.innerHTML = "<p style='text-align: center; padding: 40px; color: #666;'>Nenhum produto encontrado nesta categoria. Seja o primeiro a anunciar!</p>";
        return;
    }

    produtos.forEach((produto) => {
        const card = document.createElement("div");
        card.classList.add("ad-card");
        
        const titulo = escapeHtml(produto.title || 'Sem título');
        let descricao = escapeHtml(produto.description || 'Sem descrição');
        if (descricao.length > 100) {
            descricao = descricao.substring(0, 100) + '...';
        }
        const preco = (produto.price || 0).toFixed(2).replace('.', ',');
        const imageUrl = escapeHtml(produto.imageUrl || 'assets/img/no-image.png');
        const produtoId = produto.id;
        
        card.innerHTML = `
            <div class="img-container">
                <img src="${imageUrl}" alt="${titulo}" onerror="this.src='assets/img/no-image.png'">
            </div>
            <div class="ad-info">
                <h3>${titulo}</h3>
                <p>${descricao}</p>
                <div class="price">R$ ${preco}</div>
                <button class="btn-card" onclick="verDetalhes('${produtoId}')">Ver detalhes</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// Função para filtrar produtos por categoria
function filtrarPorCategoria(categoria) {
    categoriaAtual = categoria;
    console.log('Filtrando por categoria:', categoria);
    console.log('Total de produtos:', todosProdutos.length);
    
    let produtosFiltrados = todosProdutos;
    
    if (categoria !== 'Todos') {
        produtosFiltrados = todosProdutos.filter(produto => {
            const categoriaProduto = (produto.category || '').trim();
            const match = categoriaProduto.toLowerCase() === categoria.toLowerCase();
            return match;
        });
        console.log('Produtos filtrados:', produtosFiltrados.length);
    }
    
    renderizarProdutos(produtosFiltrados);
    
    // Atualiza o botão ativo
    const botoes = document.querySelectorAll('.filters button');
    botoes.forEach(btn => {
        const textoBotao = btn.textContent.trim();
        if (textoBotao === categoria) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Torna a função globalmente acessível
window.filtrarPorCategoria = filtrarPorCategoria;

// Função para carregar e exibir categorias dinamicamente
function inicializarFiltros(produtos) {
    const filtrosContainer = document.querySelector('.filters');
    if (!filtrosContainer) {
        console.error('Container de filtros não encontrado!');
        return;
    }
    
    // Extrai categorias únicas dos produtos
    const categorias = ['Todos'];
    const categoriasProdutos = produtos
        .map(p => {
            const cat = (p.category || '').trim();
            return cat;
        })
        .filter(c => c && c !== '')
        .filter((c, index, self) => self.indexOf(c) === index)
        .sort();
    
    categorias.push(...categoriasProdutos);
    
    console.log('Categorias encontradas:', categorias);
    
    // Limpa e recria os botões
    filtrosContainer.innerHTML = '';
    
    categorias.forEach(categoria => {
        const button = document.createElement('button');
        button.textContent = categoria;
        button.type = 'button'; // Evita submit de formulário se houver
        button.addEventListener('click', function(e) {
            e.preventDefault();
            filtrarPorCategoria(categoria);
        });
        if (categoria === 'Todos') {
            button.classList.add('active');
        }
        filtrosContainer.appendChild(button);
    });
    
    console.log('Filtros inicializados com', categorias.length, 'categorias');
}

document.addEventListener("DOMContentLoaded", async () => {
    // Verificação de login para botão "Anunciar agora"
    const btnAnunciar = document.getElementById("btnAnunciar");
    if (btnAnunciar) {
        btnAnunciar.addEventListener("click", (e) => {
            e.preventDefault();
            const userStr = localStorage.getItem("usuarioLogado");
            if (!userStr) {
                alert("⚠️ Você precisa estar logado para anunciar produtos!");
                window.location.href = "Login.html";
                return;
            }
            window.location.href = "cadastro.html";
        });
    }

    // Inicializa o carrossel primeiro
    await initializeCarousel();

    // Depois carrega os cards
    const container = document.getElementById("cards-container") || document.querySelector(".ads-grid");

    if (!container) {
        console.error("Container de produtos não encontrado!");
        return;
    }

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        todosProdutos = await response.json();

        // Inicializa os filtros com as categorias encontradas
        inicializarFiltros(todosProdutos);

        // Renderiza todos os produtos inicialmente
        renderizarProdutos(todosProdutos);
    } catch (err) {
        console.error("Erro ao carregar produtos:", err);
        if (container) {
            container.innerHTML = `<p style='text-align: center; padding: 40px; color: #d32f2f;'>Erro ao carregar produtos: ${err.message}. Verifique se o backend está rodando.</p>`;
        }
    }
});

// Função global para ver detalhes
function verDetalhes(id) {
    if (id) {
        window.location.href = `detalhes.html?id=${id}`;
    } else {
        console.error("ID do produto não fornecido");
    }
}

// Torna a função globalmente acessível
window.verDetalhes = verDetalhes;