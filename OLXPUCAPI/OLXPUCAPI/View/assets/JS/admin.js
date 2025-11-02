document.addEventListener("DOMContentLoaded", async () => {
    const userStr = localStorage.getItem("usuarioLogado");
    if (!userStr) {
        alert("⚠️ Você precisa estar logado para acessar o painel de administração!");
        window.location.href = "Login.html";
        return;
    }

    const user = JSON.parse(userStr);
    const userRole = user.role || user.Role || "";

    // Verifica se é admin
    if (userRole !== "Admin" && userRole !== "admin") {
        alert("⚠️ Você não tem permissão para acessar esta página!");
        window.location.href = "index.html";
        return;
    }

    const container = document.getElementById("admin-container");

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}`);
        if (!response.ok) {
            throw new Error("Erro ao carregar usuários");
        }

        const users = await response.json();

        if (!users || users.length === 0) {
            container.innerHTML = `
                <div class="alert alert-info text-center">
                    <i class="fas fa-info-circle me-2"></i>Nenhum usuário encontrado.
                </div>
            `;
            return;
        }

        let html = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h4 class="mb-0">Total de Usuários: ${users.length}</h4>
                <button class="btn btn-primary" onclick="location.reload()">
                    <i class="fas fa-sync-alt me-2"></i>Atualizar
                </button>
            </div>
        `;

        users.forEach((u) => {
            const name = escapeHtml(u.name || u.Name || "Sem nome");
            const email = escapeHtml(u.email || u.Email || "Sem email");
            const role = u.role || u.Role || "User";
            const course = u.course || u.Course || "Não informado";
            const userId = u.id || u.Id;
            const roleBadge = role === "Admin" || role === "admin" 
                ? '<span class="badge bg-danger">Admin</span>' 
                : '<span class="badge bg-primary">Usuário</span>';

            html += `
                <div class="user-card">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h5 class="mb-2">
                                ${name} ${roleBadge}
                            </h5>
                            <p class="mb-1"><strong>Email:</strong> ${email}</p>
                            <p class="mb-1"><strong>Curso:</strong> ${course}</p>
                            <p class="mb-0 text-muted small"><strong>ID:</strong> ${userId}</p>
                        </div>
                        <div>
                            <button class="btn btn-sm btn-danger" onclick="deletarUsuario('${userId}', '${name}')" ${role === "Admin" || role === "admin" ? 'disabled title="Não é possível deletar admin"' : ''}>
                                <i class="fas fa-trash me-1"></i>Deletar
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

    } catch (err) {
        console.error("Erro ao carregar usuários:", err);
        container.innerHTML = `
            <div class="alert alert-danger text-center">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <h5>Erro ao carregar usuários</h5>
                <p>${err.message}</p>
                <button class="btn btn-primary mt-2" onclick="location.reload()">
                    <i class="fas fa-sync-alt me-2"></i>Tentar Novamente
                </button>
            </div>
        `;
    }
});

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function deletarUsuario(userId, userName) {
    if (!confirm(`Tem certeza que deseja deletar o usuário "${userName}"? Esta ação não pode ser desfeita.`)) {
        return;
    }

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}/${userId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Erro ao deletar usuário');
        }

        alert('✅ Usuário deletado com sucesso!');
        location.reload();
    } catch (err) {
        console.error('Erro ao deletar usuário:', err);
        alert(`Erro ao deletar usuário: ${err.message}`);
    }
}

