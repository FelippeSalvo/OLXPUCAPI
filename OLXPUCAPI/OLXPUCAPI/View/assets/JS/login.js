document.addEventListener("DOMContentLoaded", () => {
    const botaoLogin = document.getElementById("botaoLogin");
    const emailInput = document.getElementById("email");
    const senhaInput = document.getElementById("senha");
    const tipoContaInput = document.getElementById("tipoContaLogin");
    const erroDiv = document.getElementById("loginErro");

    if (botaoLogin) {
        botaoLogin.addEventListener("click", async (e) => {
            e.preventDefault();
            
            // Limpa mensagem de erro anterior
            if (erroDiv) {
                erroDiv.style.display = "none";
                erroDiv.textContent = "";
            }

            const email = emailInput?.value;
            const senha = senhaInput?.value;

            if (!email || !senha) {
                if (erroDiv) {
                    erroDiv.textContent = "Por favor, preencha todos os campos.";
                    erroDiv.style.display = "block";
                }
                return;
            }

            try {
                const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH}/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password: senha }),
                });

                if (!response.ok) {
                    const error = await response.json().catch(() => ({ message: "Credenciais inválidas" }));
                    if (erroDiv) {
                        erroDiv.textContent = error.message || "❌ E-mail ou senha inválidos!";
                        erroDiv.style.display = "block";
                    } else {
                        alert("❌ E-mail ou senha inválidos!");
                    }
                    return;
                }

                const user = await response.json();
                localStorage.setItem("usuarioLogado", JSON.stringify(user));
                alert(`✅ Bem-vindo, ${user.name}!`);
                window.location.href = "index.html";
            } catch (err) {
                console.error("Erro ao fazer login:", err);
                if (erroDiv) {
                    erroDiv.textContent = "Erro de conexão com o servidor. Verifique se o backend está rodando.";
                    erroDiv.style.display = "block";
                } else {
                    alert("Erro de conexão com o servidor.");
                }
            }
        });
    }
});