document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("multiStepForm");
    let currentStep = 0;
    const steps = document.querySelectorAll(".form-step");

    // Atualiza a barra de progresso
    function updateProgress() {
        const progressBar = document.getElementById("progressBar");
        if (progressBar) {
            const progress = ((currentStep + 1) / steps.length) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }

    // Função para mostrar erro em um campo
    function showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.add("is-invalid");
            // Remove mensagem anterior se existir
            const existingError = field.parentElement.querySelector(".invalid-feedback");
            if (existingError) {
                existingError.remove();
            }
            // Adiciona nova mensagem
            const errorDiv = document.createElement("div");
            errorDiv.className = "invalid-feedback";
            errorDiv.textContent = message;
            field.parentElement.appendChild(errorDiv);
        }
    }

    // Função para limpar erros de um campo
    function clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.remove("is-invalid");
            const errorDiv = field.parentElement.querySelector(".invalid-feedback");
            if (errorDiv) {
                errorDiv.remove();
            }
        }
    }

    // Validação do primeiro passo (informações pessoais) - opcional, pode pular
    function validateFirstStep() {
        // Como é opcional, não precisa validar
        return true;
    }

    // Validação do segundo passo (informações do anúncio) - obrigatório
    function validateSecondStep() {
        let isValid = true;
        
        // Limpa erros anteriores
        clearFieldError("titulo");
        clearFieldError("categoria");
        clearFieldError("preco");
        clearFieldError("descricao");
        clearFieldError("estado");
        clearFieldError("localizacao");

        // Valida título
        const titulo = document.getElementById("titulo")?.value.trim();
        if (!titulo) {
            showFieldError("titulo", "O título do anúncio é obrigatório.");
            isValid = false;
        } else if (titulo.length < 3) {
            showFieldError("titulo", "O título deve ter pelo menos 3 caracteres.");
            isValid = false;
        }

        // Valida categoria
        const categoria = document.getElementById("categoria")?.value;
        if (!categoria || categoria === "") {
            showFieldError("categoria", "Por favor, selecione uma categoria.");
            isValid = false;
        }

        // Valida preço
        const preco = document.getElementById("preco")?.value.trim();
        if (!preco) {
            showFieldError("preco", "O preço é obrigatório.");
            isValid = false;
        } else {
            const precoNum = parseFloat(preco.replace(",", "."));
            if (isNaN(precoNum) || precoNum <= 0) {
                showFieldError("preco", "Por favor, insira um preço válido (maior que zero).");
                isValid = false;
            }
        }

        // Valida descrição
        const descricao = document.getElementById("descricao")?.value.trim();
        if (!descricao) {
            showFieldError("descricao", "A descrição é obrigatória.");
            isValid = false;
        } else if (descricao.length < 10) {
            showFieldError("descricao", "A descrição deve ter pelo menos 10 caracteres.");
            isValid = false;
        }

        // Valida estado (não obrigatório, mas valida se tem valor)
        const estado = document.getElementById("estado")?.value;
        if (!estado || estado === "") {
            // Se não tiver valor selecionado, usa "Novo" como padrão
        }

        // Valida localização
        const localizacao = document.getElementById("localizacao")?.value.trim();
        if (!localizacao) {
            showFieldError("localizacao", "A localização é obrigatória.");
            isValid = false;
        }

        return isValid;
    }

    // Botões "Próximo"
    document.querySelectorAll(".next-step").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            // Permite passar para o próximo passo sem validar o primeiro (opcional)
            if (currentStep < steps.length - 1) {
                steps[currentStep].classList.add("d-none");
                currentStep++;
                steps[currentStep].classList.remove("d-none");
                updateProgress();
            }
        });
    });

    // Botões "Voltar"
    document.querySelectorAll(".prev-step").forEach(btn => {
        btn.addEventListener("click", () => {
            if (currentStep > 0) {
                steps[currentStep].classList.add("d-none");
                currentStep--;
                steps[currentStep].classList.remove("d-none");
                updateProgress();
            }
        });
    });

    // Submit do formulário
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            console.log("=== INÍCIO DO SUBMIT ===");

            // Verifica se está no segundo passo (índice 1)
            // Se estiver no primeiro passo, avança automaticamente
            if (currentStep === 0) {
                steps[currentStep].classList.add("d-none");
                currentStep = 1;
                steps[currentStep].classList.remove("d-none");
                updateProgress();
            }
            
            // Só permite submit se estiver no segundo passo
            if (currentStep !== 1) {
                alert("Por favor, vá para a etapa de informações do anúncio primeiro.");
                return;
            }

            // Valida todos os campos
            if (!validateSecondStep()) {
                alert("❌ Por favor, corrija os erros destacados no formulário antes de continuar.");
                return;
            }

            // Verifica se o usuário está logado
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

            if (!user || !user.id) {
                alert("Erro: Usuário não encontrado. Faça login novamente.");
                window.location.href = "Login.html";
                return;
            }

            // Coleta os dados do formulário
            const titulo = document.getElementById("titulo").value.trim();
            const descricao = document.getElementById("descricao").value.trim();
            const preco = document.getElementById("preco").value.trim().replace(",", ".");
            const categoria = document.getElementById("categoria").value;
            const estado = document.getElementById("estado").value || "Novo";
            const localizacao = document.getElementById("localizacao").value.trim();

            const precoNum = parseFloat(preco);
            if (isNaN(precoNum) || precoNum <= 0) {
                alert("Por favor, insira um preço válido.");
                return;
            }

            const produto = {
                title: titulo,
                description: descricao,
                price: precoNum,
                category: categoria,
                condition: estado,
                location: localizacao,
                ownerId: user.id,
                imageUrl: "assets/img/no-image.png"
            };

            console.log("Dados do produto a serem enviados:", produto);
            console.log("URL da API:", `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}`);

            // Desabilita o botão de submit para evitar duplo envio
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Enviando...";
            }

            try {
                const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}`;
                console.log("Fazendo requisição para:", apiUrl);

                const response = await fetch(apiUrl, {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(produto),
                });

                console.log("Status da resposta:", response.status);
                console.log("Headers da resposta:", [...response.headers.entries()]);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("Erro do servidor (status " + response.status + "):", errorText);
                    let errorMessage = "Erro ao cadastrar produto";
                    try {
                        const error = JSON.parse(errorText);
                        errorMessage = error.message || error.title || errorMessage;
                    } catch (e) {
                        if (errorText) {
                            errorMessage = `Erro ${response.status}: ${errorText.substring(0, 100)}`;
                        } else {
                            errorMessage = `Erro ${response.status}: ${response.statusText}`;
                        }
                    }
                    throw new Error(errorMessage);
                }

                const produtoCriado = await response.json();
                console.log("✅ Produto criado com sucesso:", produtoCriado);
                alert("✅ Produto cadastrado com sucesso!");
                window.location.href = "meusanuncios.html";
            } catch (err) {
                console.error("❌ Erro completo:", err);
                
                // Verifica se é erro de conexão
                if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
                    alert("❌ Erro de conexão com o servidor!\n\nVerifique se:\n1. O backend está rodando\n2. A URL da API está correta (http://localhost:5196)\n3. Não há problemas de CORS\n\nAbra o console (F12) para mais detalhes.");
                } else {
                    alert(`❌ Erro ao cadastrar produto:\n\n${err.message}\n\nAbra o console (F12) para mais detalhes.`);
                }
            } finally {
                // Reabilita o botão
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Publicar Anúncio";
                }
            }
        });
    }

    updateProgress();
});

