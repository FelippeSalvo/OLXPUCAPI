document.addEventListener("DOMContentLoaded", async () => {
    const userStr = localStorage.getItem("usuarioLogado");
    if (!userStr) {
        alert("⚠️ Você precisa estar logado para acessar seu perfil!");
        window.location.href = "Login.html";
        return;
    }

    const user = JSON.parse(userStr);
    const userId = user.id || user.Id || user.ID;

    if (!userId) {
        alert("Erro: Usuário sem ID válido.");
        window.location.href = "Login.html";
        return;
    }

    // Carrega dados do usuário
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}/${userId}`);
        if (!response.ok) {
            throw new Error("Erro ao carregar dados do usuário");
        }

        const userData = await response.json();

        // Preenche o formulário
        document.getElementById("nome").value = userData.name || userData.Name || "";
        document.getElementById("email").value = userData.email || userData.Email || "";
        document.getElementById("curso").value = userData.course || userData.Course || "";
        document.getElementById("telefone").value = userData.phone || userData.Phone || "";

    } catch (err) {
        console.error("Erro ao carregar dados:", err);
        alert(`Erro ao carregar dados: ${err.message}`);
        // Usa dados do localStorage como fallback
        document.getElementById("nome").value = user.name || "";
        document.getElementById("email").value = user.email || "";
        document.getElementById("curso").value = user.course || "";
        document.getElementById("telefone").value = user.phone || "";
    }

    // Submissão do formulário
    document.getElementById("formPerfil").addEventListener("submit", async (e) => {
        e.preventDefault();

        const userAtualizado = {
            Id: userId,
            Name: document.getElementById("nome").value.trim(),
            Email: document.getElementById("email").value.trim(),
            Course: document.getElementById("curso").value.trim(),
            Phone: document.getElementById("telefone").value.trim(),
            Password: user.password || user.Password || "",
            Role: user.role || user.Role || "User"
        };

        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userAtualizado)
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: "Erro ao atualizar perfil" }));
                throw new Error(error.message || "Erro ao atualizar perfil");
            }

            const updatedUser = await response.json();
            
            // Atualiza localStorage
            localStorage.setItem("usuarioLogado", JSON.stringify(updatedUser));

            alert("✅ Perfil atualizado com sucesso!");
            window.location.href = "index.html";
        } catch (err) {
            console.error("Erro ao atualizar perfil:", err);
            alert(`Erro ao atualizar perfil: ${err.message}`);
        }
    });
});

