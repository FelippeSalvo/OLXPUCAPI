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
        console.log("Dados do usuário carregados:", userData);

        // Preenche o formulário - prioriza PascalCase do backend
        document.getElementById("nome").value = userData.Name || userData.name || "";
        document.getElementById("email").value = userData.Email || userData.email || "";
        document.getElementById("curso").value = userData.Course || userData.course || "";
        document.getElementById("telefone").value = userData.Phone || userData.phone || "";

    } catch (err) {
        console.error("Erro ao carregar dados:", err);
        alert(`Erro ao carregar dados: ${err.message}`);
        // Usa dados do localStorage como fallback
        document.getElementById("nome").value = user.Name || user.name || "";
        document.getElementById("email").value = user.Email || user.email || "";
        document.getElementById("curso").value = user.Course || user.course || "";
        document.getElementById("telefone").value = user.Phone || user.phone || "";
    }

    // Submissão do formulário
    document.getElementById("formPerfil").addEventListener("submit", async (e) => {
        e.preventDefault();

        // Obtém valores dos campos
        const nomeValue = document.getElementById("nome").value.trim();
        const emailValue = document.getElementById("email").value.trim();
        const cursoValue = document.getElementById("curso").value.trim();
        const telefoneValue = document.getElementById("telefone").value.trim();

        // Valida campos obrigatórios
        if (!nomeValue || !emailValue) {
            alert("⚠️ Por favor, preencha os campos obrigatórios (Nome e Email).");
            return;
        }

        // Prepara dados do usuário atualizado
        // Usa null para campos vazios ao invés de string vazia, mas mantém string se tiver valor
        const userAtualizado = {
            Id: userId,
            Name: nomeValue,
            Email: emailValue,
            Course: cursoValue ? cursoValue : null,
            Phone: telefoneValue ? telefoneValue : null,
            Password: user.Password || user.password || "",
            Role: user.Role !== undefined ? user.Role : (user.role !== undefined ? user.role : 0)  // 0 = User, 1 = Admin
        };

        console.log("Enviando atualização do perfil:", JSON.stringify(userAtualizado, null, 2));
        console.log("Valores individuais - Curso:", cursoValue, "Telefone:", telefoneValue);

        // Desabilita o botão para evitar múltiplos cliques
        const submitBtn = document.querySelector("#formPerfil button[type='submit']");
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Salvando...';
        }

        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userAtualizado)
            });

            if (!response.ok) {
                let errorMsg = "Erro ao atualizar perfil";
                try {
                    const error = await response.json();
                    errorMsg = error.message || errorMsg;
                    console.error("Erro do servidor:", error);
                } catch (e) {
                    const text = await response.text();
                    console.error("Erro (texto):", text);
                    errorMsg = `Erro ${response.status}: ${text || response.statusText}`;
                }
                throw new Error(errorMsg);
            }

            const updatedUser = await response.json();
            console.log("Perfil atualizado com sucesso:", updatedUser);
            console.log("Curso salvo:", updatedUser.Course || updatedUser.course);
            console.log("Telefone salvo:", updatedUser.Phone || updatedUser.phone);
            
            // Atualiza localStorage com os dados atualizados
            localStorage.setItem("usuarioLogado", JSON.stringify(updatedUser));

            // Verifica se os dados foram realmente salvos
            if ((updatedUser.Course || updatedUser.course) || (updatedUser.Phone || updatedUser.phone)) {
                const mensagem = `✅ Perfil atualizado com sucesso!\n\n` +
                               `Curso: ${updatedUser.Course || updatedUser.course || "Não informado"}\n` +
                               `Telefone: ${updatedUser.Phone || updatedUser.phone || "Não informado"}`;
                alert(mensagem);
            } else {
                alert("✅ Perfil atualizado com sucesso!");
            }
            
            window.location.href = "index.html";
        } catch (err) {
            console.error("Erro ao atualizar perfil:", err);
            alert(`❌ Erro ao atualizar perfil: ${err.message}`);
        } finally {
            // Reabilita o botão
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>Salvar Alterações';
            }
        }
    });
});

