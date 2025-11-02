document.addEventListener("DOMContentLoaded", () => {
    const botaoCadastro = document.getElementById("botaoCadastro");
    const nomeInput = document.getElementById("nome");
    const emailInput = document.getElementById("email");
    const senhaInput = document.getElementById("senha");
    const confirmarSenhaInput = document.getElementById("confirmarSenha");
    const tipoContaInput = document.getElementById("tipoConta");
    const erroDiv = document.getElementById("cadastroErro");

    if (botaoCadastro) {
        botaoCadastro.addEventListener("click", async (e) => {
            e.preventDefault();

            // Limpa mensagem de erro anterior
            if (erroDiv) {
                erroDiv.style.display = "none";
                erroDiv.textContent = "";
            }

            const nome = nomeInput?.value;
            const email = emailInput?.value;
            const senha = senhaInput?.value;
            const confirmarSenha = confirmarSenhaInput?.value;
            const tipoConta = tipoContaInput?.value;

            // Validações
            if (!nome || !email || !senha || !confirmarSenha) {
                if (erroDiv) {
                    erroDiv.textContent = "Por favor, preencha todos os campos.";
                    erroDiv.style.display = "block";
                } else {
                    alert("Por favor, preencha todos os campos.");
                }
                return;
            }

            if (senha !== confirmarSenha) {
                if (erroDiv) {
                    erroDiv.textContent = "As senhas não coincidem.";
                    erroDiv.style.display = "block";
                } else {
                    alert("As senhas não coincidem.");
                }
                return;
            }

            // Define role baseado no tipo de conta ou padrão "User"
            const role = tipoConta === "Vendedor" ? "Seller" : "User";

            try {
                const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH}/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: nome, email, password: senha, role }),
                });

                if (!response.ok) {
                    const data = await response.json();
                    const errorMsg = data.message || "Erro ao cadastrar usuário.";
                    if (erroDiv) {
                        erroDiv.textContent = errorMsg;
                        erroDiv.style.display = "block";
                    } else {
                        alert("❌ " + errorMsg);
                    }
                    return;
                }

                alert("✅ Cadastro realizado com sucesso!");
                window.location.href = "Login.html";
            } catch (err) {
                console.error(err);
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