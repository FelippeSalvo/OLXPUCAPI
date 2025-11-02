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

        let imagensParaCarrossel = [];

        if (produtosComImagens.length > 0) {
            // Embaralha e pega no máximo 5 imagens aleatórias
            const produtosEmbaralhados = shuffleArray(produtosComImagens);
            imagensParaCarrossel = produtosEmbaralhados
                .slice(0, Math.min(5, produtosEmbaralhados.length))
                .map(p => p.imageUrl);
        }

        // Se não houver produtos com imagens, usa imagem padrão
        if (imagensParaCarrossel.length === 0) {
            imagensParaCarrossel = ['assets/img/no-image.png'];
        }

        // Limpa o container e adiciona as imagens
        carouselContainer.innerHTML = '';
        imagensParaCarrossel.forEach((imageUrl, index) => {
            const img = document.createElement('img');
            img.src = escapeHtml(imageUrl);
            img.className = 'carousel-image';
            if (index === 0) {
                img.classList.add('active');
            }
            img.onerror = function() {
                this.src = 'assets/img/no-image.png';
            };
            carouselContainer.appendChild(img);
        });

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
            if (i === index) {
                img.classList.add('active');
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

document.addEventListener("DOMContentLoaded", async () => {
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
        
        const produtos = await response.json();

        container.innerHTML = "";

        if (!produtos || produtos.length === 0) {
            container.innerHTML = "<p style='text-align: center; padding: 40px; color: #666;'>Nenhum produto encontrado. Seja o primeiro a anunciar!</p>";
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