// Script comum para gerenciar o header com autenticação
document.addEventListener("DOMContentLoaded", () => {
    const authButtons = document.querySelector(".auth-buttons");
    if (!authButtons) return;

    const userStr = localStorage.getItem("usuarioLogado");
    
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            const userName = user.name || user.Name || user.email || user.Email || "Usuário";
            
            // Remove os botões antigos
            authButtons.innerHTML = "";
            
            // Cria o novo layout com nome do usuário e botão sair
            const userInfo = document.createElement("div");
            userInfo.className = "user-info";
            
            const userNameSpan = document.createElement("span");
            userNameSpan.className = "user-name";
            userNameSpan.textContent = `Olá, ${userName}`;
            
            const logoutBtn = document.createElement("a");
            logoutBtn.href = "#";
            logoutBtn.className = "btn logout";
            logoutBtn.textContent = "Sair";
            
            logoutBtn.addEventListener("click", (e) => {
                e.preventDefault();
                if (confirm("Tem certeza que deseja sair?")) {
                    localStorage.removeItem("usuarioLogado");
                    window.location.href = "index.html";
                }
            });
            
            userInfo.appendChild(userNameSpan);
            userInfo.appendChild(logoutBtn);
            
            authButtons.appendChild(userInfo);

            // Adiciona links de Perfil e Admin no navbar
            const linkPerfil = document.getElementById("linkPerfil");
            const linkAdmin = document.getElementById("linkAdmin");
            const userRole = user.role || user.Role || "";

            if (linkPerfil) {
                linkPerfil.style.display = "block";
            }

            if (linkAdmin && (userRole === "Admin" || userRole === "admin")) {
                linkAdmin.style.display = "block";
            }
        } catch (err) {
            console.error("Erro ao carregar usuário:", err);
        }
    }
    // Se não estiver logado, mantém os botões padrão
});

