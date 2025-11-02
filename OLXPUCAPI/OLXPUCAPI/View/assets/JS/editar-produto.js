document.addEventListener("DOMContentLoaded", async () => {
    // Verifica login
    const userStr = localStorage.getItem("usuarioLogado");
    if (!userStr) {
        alert("⚠️ Você precisa estar logado para editar produtos!");
        window.location.href = "Login.html";
        return;
    }

    const user = JSON.parse(userStr);
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");

    if (!productId) {
        alert("ID do produto não fornecido!");
        window.location.href = "meusanuncios.html";
        return;
    }

    // Carrega dados do produto
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}/${productId}`);
        if (!response.ok) {
            throw new Error("Produto não encontrado");
        }

        const produto = await response.json();

        // Verifica se o usuário é o dono
        if (produto.ownerId !== user.id && produto.OwnerId !== user.id) {
            alert("⚠️ Você não tem permissão para editar este produto!");
            window.location.href = "meusanuncios.html";
            return;
        }

        // Preenche o formulário
        document.getElementById("titulo").value = produto.title || produto.Title || "";
        document.getElementById("descricao").value = produto.description || produto.Description || "";
        document.getElementById("preco").value = produto.price || produto.Price || "";
        document.getElementById("categoria").value = produto.category || produto.Category || "";
        document.getElementById("condicao").value = produto.condition || produto.Condition || "";
        document.getElementById("localizacao").value = produto.location || produto.Location || "";
        document.getElementById("imagemUrl").value = produto.imageUrl || produto.ImageUrl || "";

        // Preview da imagem
        updateImagePreview();

    } catch (err) {
        console.error("Erro ao carregar produto:", err);
        alert(`Erro ao carregar produto: ${err.message}`);
        window.location.href = "meusanuncios.html";
    }

    // Preview de imagem
    const imagemUrlInput = document.getElementById("imagemUrl");
    imagemUrlInput.addEventListener("input", updateImagePreview);

    function updateImagePreview() {
        const url = imagemUrlInput.value;
        const preview = document.getElementById("previewImagem");
        if (url && isValidUrl(url)) {
            preview.innerHTML = `<img src="${url}" class="img-thumbnail mt-2" style="max-width: 300px; max-height: 200px;" onerror="this.style.display='none'">`;
        } else {
            preview.innerHTML = "";
        }
    }

    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    // Submissão do formulário
    document.getElementById("formEditarProduto").addEventListener("submit", async (e) => {
        e.preventDefault();

        const produtoAtualizado = {
            Id: productId,
            Title: document.getElementById("titulo").value.trim(),
            Description: document.getElementById("descricao").value.trim(),
            Price: parseFloat(document.getElementById("preco").value),
            ImageUrl: document.getElementById("imagemUrl").value.trim(),
            OwnerId: user.id,
            Category: document.getElementById("categoria").value,
            Condition: document.getElementById("condicao").value,
            Location: document.getElementById("localizacao").value.trim()
        };

        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}/${productId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(produtoAtualizado)
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: "Erro ao atualizar produto" }));
                throw new Error(error.message || "Erro ao atualizar produto");
            }

            alert("✅ Produto atualizado com sucesso!");
            window.location.href = "meusanuncios.html";
        } catch (err) {
            console.error("Erro ao atualizar produto:", err);
            alert(`Erro ao atualizar produto: ${err.message}`);
        }
    });
});

