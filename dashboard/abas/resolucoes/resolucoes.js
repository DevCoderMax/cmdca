import { API_BASE_URL } from '../../config.js';

export function initResolucoesTab() {
    // Funções do Modal
    const modal = document.getElementById('resolucaoModal');
    const form = document.getElementById('resolucaoForm');
    const addResolucaoBtn = document.getElementById('addResolucaoBtn');
    const closeButtons = document.querySelectorAll('.close-modal');

    // Função para abrir o modal
    function openModal(title = 'Nova Resolução') {
        document.getElementById('modalTitle').textContent = title;
        modal.classList.add('active');
    }

    // Função para fechar o modal
    function closeModal() {
        modal.classList.remove('active');
        form.reset();
        document.getElementById('resolucaoId').value = '';
    }

    // Event listeners para fechar o modal
    closeButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });

    // Fechar modal ao pressionar ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Fechar modal ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Abrir modal para nova resolução
    addResolucaoBtn.addEventListener('click', () => {
        openModal('Nova Resolução');
    });

    // Handler do formulário
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const resolucaoId = document.getElementById('resolucaoId').value;
        const formData = {
            id: resolucaoId || null,
            titulo: document.getElementById('titulo').value,
            tipo_conselho: document.getElementById('tipo_conselho').value,
            data_resolucao: document.getElementById('data_resolucao').value,
            link_resolucao: document.getElementById('link_resolucao').value || null
        };

        try {
            const method = resolucaoId ? 'PUT' : 'POST';
            const url = resolucaoId ? `${API_BASE_URL}/resolucoes/${resolucaoId}` : `${API_BASE_URL}/resolucoes`;
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Erro ao salvar resolução');
            }

            closeModal();
            loadResolucoes();
        } catch (error) {
            console.error('Erro ao salvar resolução:', error);
            alert('Erro ao salvar resolução. Por favor, tente novamente.');
        }
    });

    // Função para carregar resoluções
    async function loadResolucoes() {
        const container = document.querySelector('#resolucoes .data-table tbody');
        container.innerHTML = '<tr><td colspan="4" class="loading">Carregando...</td></tr>';

        try {
            const response = await fetch(`${API_BASE_URL}/resolucoes`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error('Erro ao carregar dados');
            }

            renderResolucoes(container, data.resolucoes);
        } catch (error) {
            container.innerHTML = `<tr><td colspan="4" class="error">Erro ao carregar dados: ${error.message}</td></tr>`;
        }
    }

    // Função para renderizar resoluções
    function renderResolucoes(container, resolucoes) {
        container.innerHTML = '';
        
        if (!resolucoes || resolucoes.length === 0) {
            container.innerHTML = '<tr><td colspan="4" class="empty">Nenhuma resolução encontrada</td></tr>';
            return;
        }

        resolucoes.forEach(resolucao => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${resolucao.titulo || '-'}</td>
                <td>${resolucao.tipo_conselho || '-'}</td>
                <td>${formatDate(resolucao.data_resolucao) || '-'}</td>
                <td>
                    <div class="actions">
                        ${resolucao.link_resolucao ? `
                            <a href="${resolucao.link_resolucao}" target="_blank" class="btn btn-view">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                    <polyline points="15 3 21 3 21 9"></polyline>
                                    <line x1="10" y1="14" x2="21" y2="3"></line>
                                </svg>
                                Visualizar
                            </a>
                        ` : ''}
                        <button class="btn btn-edit" onclick="editResolucao(${resolucao.id})">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path>
                                <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon>
                            </svg>
                            Editar
                        </button>
                        <button class="btn btn-delete" onclick="deleteResolucao(${resolucao.id})">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            Excluir
                        </button>
                    </div>
                </td>
            `;
            container.appendChild(row);
        });
    }

    // Função para editar resolução
    window.editResolucao = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/resolucoes/${id}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error('Erro ao carregar resolução');
            }

            // Pega a primeira resolução do array
            const resolucao = data.resolucoes[0];

            document.getElementById('resolucaoId').value = resolucao.id;
            document.getElementById('titulo').value = resolucao.titulo || '';
            document.getElementById('tipo_conselho').value = resolucao.tipo_conselho || '';
            document.getElementById('data_resolucao').value = resolucao.data_resolucao || '';
            document.getElementById('link_resolucao').value = resolucao.link_resolucao || '';

            openModal('Editar Resolução');
        } catch (error) {
            console.error('Erro ao carregar resolução:', error);
            alert('Erro ao carregar resolução. Por favor, tente novamente.');
        }
    };

    // Função para deletar resolução
    window.deleteResolucao = async (id) => {
        if (!confirm('Tem certeza que deseja excluir esta resolução?')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/resolucoes/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Erro ao excluir resolução');
            }

            loadResolucoes();
        } catch (error) {
            console.error('Erro ao excluir resolução:', error);
            alert('Erro ao excluir resolução. Por favor, tente novamente.');
        }
    };

    // Função auxiliar para formatar datas
    function formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        return date.toLocaleDateString('pt-BR');
    }

    // Carrega as resoluções inicialmente
    loadResolucoes();
}