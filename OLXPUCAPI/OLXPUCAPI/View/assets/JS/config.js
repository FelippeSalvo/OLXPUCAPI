// Configuração centralizada da API
const API_CONFIG = {
    // URL base da API - usando HTTP para desenvolvimento (porta 5196)
    BASE_URL: 'http://localhost:5196/api',
    ENDPOINTS: {
        AUTH: '/Auth',
        USERS: '/Users', 
        PRODUCTS: '/Products',
        CART: '/Cart'
    }
};

// Alias para compatibilidade com código existente
const API_URL = API_CONFIG.BASE_URL;

// Função auxiliar para fazer requisições
async function apiRequest(endpoint, options = {}) {
    try {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            const error = await response.json().catch(() => null);
            throw new Error(error?.message || `Erro HTTP: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Request failed:', error);
        throw error;
    }
}

// Verifica se usuário está logado
function getLoggedUser() {
    const user = localStorage.getItem('usuarioLogado');
    return user ? JSON.parse(user) : null;
}