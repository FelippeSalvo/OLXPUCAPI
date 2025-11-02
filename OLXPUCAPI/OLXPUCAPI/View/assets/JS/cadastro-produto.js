document.addEventListener("DOMContentLoaded", () => {
    // Verifica se o usuário está logado ao carregar a página
    const userStr = localStorage.getItem("usuarioLogado");
    if (!userStr) {
        alert("⚠️ Você precisa estar logado para cadastrar produtos!");
        window.location.href = "Login.html";
        return;
    }

    let currentStep = 1; // Começa na step 1, mas mostra a step 2 quando necessário
    const step1 = document.getElementById("step1");
    const step2 = document.getElementById("step2");
    const form = document.getElementById("cadastroProdutoForm");
    const progressBar = document.getElementById("progressBar");
    
    // Botões de navegação
    const btnProximo = document.getElementById("btnProximo");
    const btnPular = document.getElementById("btnPular");
    const btnVoltar = document.getElementById("btnVoltar");
    const btnPublicar = document.getElementById("btnPublicar");

    // Atualiza progresso
    function updateProgress() {
        if (progressBar) {
            const progress = currentStep === 1 ? 50 : 100;
            progressBar.style.width = `${progress}%`;
        }
    }

    // Vai para próximo passo
    function goToStep2() {
        if (step1) step1.classList.add("d-none");
        if (step2) step2.classList.remove("d-none");
        currentStep = 2;
        updateProgress();
    }

    // Volta para passo anterior
    function goToStep1() {
        if (step2) step2.classList.add("d-none");
        if (step1) step1.classList.remove("d-none");
        currentStep = 1;
        updateProgress();
    }

    // Preview de imagem
    const imagemUrlInput = document.getElementById("imagemUrl");
    if (imagemUrlInput) {
        imagemUrlInput.addEventListener("input", () => {
            const previewContainer = document.getElementById("previewImagem");
            if (!previewContainer) return;

            const url = imagemUrlInput.value.trim();
            previewContainer.innerHTML = "";

            if (url) {
                previewContainer.innerHTML = `
                    <div class="border rounded p-2 text-center">
                        <img src="${url}" alt="Preview" class="img-thumbnail" style="max-height: 200px; max-width: 100%;" 
                             onerror="this.onerror=null; this.src='assets/img/no-image.png';">
                    </div>
                `;
            }
        });
    }

    // Botão Próximo
    if (btnProximo) {
        btnProximo.addEventListener("click", () => {
            goToStep2();
        });
    }

    // Botão Pular
    if (btnPular) {
        btnPular.addEventListener("click", () => {
            goToStep2();
        });
    }

    // Botão Voltar
    if (btnVoltar) {
        btnVoltar.addEventListener("click", () => {
            goToStep1();
        });
    }

    // Submit do formulário
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            // Se está na step 1, vai para step 2
            if (currentStep === 1) {
                goToStep2();
                return;
            }

            // Validações
            const titulo = document.getElementById("titulo")?.value.trim();
            const descricao = document.getElementById("descricao")?.value.trim();
            const preco = document.getElementById("preco")?.value.trim();
            const categoria = document.getElementById("categoria")?.value;
            const localizacao = document.getElementById("localizacao")?.value.trim();
            const imagemUrl = document.getElementById("imagemUrl")?.value.trim();
            const estado = document.getElementById("estado")?.value || "Novo";

            if (!titulo || titulo.length < 3) {
                alert("Por favor, preencha o título (mínimo 3 caracteres).");
                return;
            }

            if (!descricao || descricao.length < 10) {
                alert("Por favor, preencha a descrição (mínimo 10 caracteres).");
                return;
            }

            if (!preco || parseFloat(preco) <= 0) {
                alert("Por favor, insira um preço válido.");
                return;
            }

            if (!categoria) {
                alert("Por favor, selecione uma categoria.");
                return;
            }

            if (!localizacao) {
                alert("Por favor, preencha a localização.");
                return;
            }

            if (!imagemUrl) {
                alert("Por favor, insira uma URL para a imagem.");
                return;
            }

            // Verifica se usuário está logado
            const userStr = localStorage.getItem("usuarioLogado");
            if (!userStr) {
                alert("⚠️ Faça login para cadastrar produtos!");
                window.location.href = "Login.html";
                return;
            }

            let user;
            try {
                user = JSON.parse(userStr);
            } catch (err) {
                console.error("Erro ao parsear usuário:", err);
                alert("Erro: Dados de usuário inválidos. Faça login novamente.");
                window.location.href = "Login.html";
                return;
            }

            // Pega o ID do usuário
            const userId = user.id || user.Id || user.ID;
            if (!userId) {
                console.error("Usuário sem ID:", user);
                alert("Erro: Usuário sem ID válido. Faça login novamente.");
                window.location.href = "Login.html";
                return;
            }

            // Prepara os dados do produto
            const precoNum = parseFloat(preco);

            // Monta o produto exatamente como o C# espera
            const produto = {
                Title: titulo,
                Description: descricao,
                Price: precoNum,
                Category: categoria,
                Condition: estado,
                Location: localizacao,
                OwnerId: userId,
                ImageUrl: imagemUrl
            };

            console.log("=== ENVIANDO PRODUTO ===");
            console.log("Produto:", JSON.stringify(produto, null, 2));
            console.log("User ID:", userId);
            console.log("API URL:", `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}`);

            // Desabilita o botão
            if (btnPublicar) {
                btnPublicar.disabled = true;
                btnPublicar.textContent = "Enviando...";
            }

            try {
                // Faz o POST
                const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}`;
                console.log("POST para:", apiUrl);

                const response = await fetch(apiUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(produto)
                });

                console.log("Status da resposta:", response.status);
                console.log("OK?", response.ok);

                // Verifica resposta
                if (!response.ok) {
                    let errorMessage = "Erro ao cadastrar produto";
                    try {
                        const errorData = await response.json();
                        console.error("Erro do servidor:", errorData);
                        errorMessage = errorData.message || errorData.error || errorMessage;
                    } catch (e) {
                        const text = await response.text();
                        console.error("Erro (texto):", text);
                        errorMessage = `Erro ${response.status}: ${text || response.statusText}`;
                    }
                    
                    alert(`❌ ${errorMessage}`);
                    if (btnPublicar) {
                        btnPublicar.disabled = false;
                        btnPublicar.textContent = "Publicar Anúncio";
                    }
                    return;
                }

                // Sucesso!
                const produtoCriado = await response.json();
                console.log("✅ Produto criado:", produtoCriado);
                
                alert("✅ Produto cadastrado com sucesso!");
                window.location.href = "meusanuncios.html";

            } catch (err) {
                console.error("❌ Erro na requisição:", err);
                
                if (err.message && (err.message.includes("Failed to fetch") || err.message.includes("NetworkError"))) {
                    alert("❌ Erro de conexão com o servidor!\n\nVerifique se:\n1. O backend está rodando (http://localhost:5196)\n2. A URL da API está correta\n3. Não há problemas de CORS");
                } else {
                    alert(`❌ Erro ao cadastrar produto: ${err.message || "Erro desconhecido"}`);
                }

                if (btnPublicar) {
                    btnPublicar.disabled = false;
                    btnPublicar.textContent = "Publicar Anúncio";
                }
            }
        });
    }

    // Inicializa
    updateProgress();
});
