import { API_BASE_URL } from '../../config.js';

export function initLeisTab() {
    // Funções do Modal
    const modal = document.getElementById('leiModal');
    const form = document.getElementById('leiForm');
    const addLeiBtn = document.getElementById('addLeiBtn');
    const closeButtons = document.querySelectorAll('.close-modal');

    // Função para abrir o modal
    function openModal(title = 'Nova Lei') {
        document.getElementById('modalTitle').textContent = title;
        modal.classList.add('active');
    }

    // Função para fechar o modal
    function closeModal() {
        modal.classList.remove('active');
        form.reset();
        document.getElementById('leiId').value = '';
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

    // Abrir modal para nova lei
    addLeiBtn.addEventListener('click', () => {
        openModal('Nova Lei');
    });

    // Handler do formulário
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const leiId = document.getElementById('leiId').value;
        const formData = {
            numero: document.getElementById('numero').value,
            titulo: document.getElementById('titulo').value,
            abrangencia: document.getElementById('abrangencia').value,
            data: document.getElementById('data').value,
            link: document.getElementById('link').value || null,
            arquivo: document.getElementById('arquivo').value || null
        };

        try {
            const method = leiId ? 'PUT' : 'POST';
            const url = leiId ? `${API_BASE_URL}/leis/${leiId}` : `${API_BASE_URL}/leis`;
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Erro ao salvar lei');
            }

            closeModal();
            loadLeis();
        } catch (error) {
            console.error('Erro ao salvar lei:', error);
            alert('Erro ao salvar lei. Por favor, tente novamente.');
        }
    });

    // Função para carregar leis
    async function loadLeis() {
        const container = document.querySelector('#leis .data-table tbody');
        container.innerHTML = '<tr><td colspan="5" class="loading">Carregando...</td></tr>';

        try {
            const response = await fetch(`${API_BASE_URL}/leis`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error('Erro ao carregar dados');
            }

            renderLeis(container, data);
        } catch (error) {
            container.innerHTML = `<tr><td colspan="5" class="error">Erro ao carregar dados: ${error.message}</td></tr>`;
        }
    }

    // Função para renderizar leis
    function renderLeis(container, data) {
        container.innerHTML = '';
        
        data.forEach(lei => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${lei.numero}</td>
                <td>${lei.titulo}</td>
                <td>${lei.abrangencia}</td>
                <td>${formatDate(lei.data)}</td>
                <td class="actions">
                    <div class="actions">
                        <button class="btn btn-edit" data-lei-id="${lei.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            Editar
                        </button>
                        ${lei.arquivo ? 
                            `<a href="${lei.arquivo}" target="_blank" class="btn btn-view">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                                Ver PDF
                            </a>` : 
                            ''
                        }
                        ${lei.link ? 
                            `<a href="${lei.link}" target="_blank" class="btn btn-view">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                    <polyline points="15 3 21 3 21 9"></polyline>
                                    <line x1="10" y1="14" x2="21" y2="3"></line>
                                </svg>
                                Link Externo
                            </a>` : 
                            ''
                        }
                    </div>
                </td>
            `;
            container.appendChild(row);

            // Adiciona event listener para o botão de editar
            const editButton = row.querySelector('.btn-edit');
            editButton.addEventListener('click', () => {
                // Preenche o formulário com os dados existentes
                document.getElementById('leiId').value = lei.id;
                document.getElementById('numero').value = lei.numero;
                document.getElementById('titulo').value = lei.titulo;
                document.getElementById('abrangencia').value = lei.abrangencia;
                document.getElementById('data').value = lei.data.split('T')[0];
                document.getElementById('link').value = lei.link || '';
                document.getElementById('arquivo').value = lei.arquivo || '';
                
                openModal('Editar Lei');
            });
        });
    }

    // Função auxiliar para formatar datas
    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('pt-BR');
    }

    // Carrega as leis inicialmente
    loadLeis();
}
