import { API_BASE_URL } from './config.js';

// Configuração do tema
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.querySelector('.theme-toggle');
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');
    
    // Verifica se há um tema salvo
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }
    
    // Função para atualizar o ícone do tema
    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        } else {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        }
    }
    
    // Alterna o tema
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    // Seleção de elementos
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Função para trocar de aba
    function switchTab(tabId) {
        // Remove classe active de todas as abas
        tabButtons.forEach(button => button.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Adiciona classe active na aba selecionada
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        document.querySelector(`#${tabId}`).classList.add('active');
    }

    // Event listeners para os botões das abas
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Inicializa a funcionalidade das leis
    initLeis();

    // Inicializa a funcionalidade das atas
    initAtas();

    // Inicializa a funcionalidade das resoluções
    initResolucoes();

    // Inicializa a funcionalidade dos ofícios
    initOficios();
});

// Funções para gerenciamento das leis
async function carregarLeis() {
    try {
        const response = await fetch(`${API_BASE_URL}/leis`);
        const leis = await response.json();
        const tbody = document.querySelector('#leisTable tbody');
        tbody.innerHTML = '';

        leis.forEach(lei => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${lei.titulo}</td>
                <td>${lei.numero}</td>
                <td>${lei.abrangencia}</td>
                <td>${new Date(lei.data).toLocaleDateString('pt-BR')}</td>
                <td>
                    ${lei.link ? `<a href="${lei.link}" target="_blank" class="table-link">Visualizar</a>` : '-'}
                </td>
                <td class="actions">
                    <button class="edit-btn lei-edit" data-id="${lei.id}" title="Editar">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="delete-btn lei-delete" data-id="${lei.id}" title="Excluir">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Adicionar event listeners para os botões
        setupEventListeners();
    } catch (error) {
        console.error('Erro ao carregar leis:', error);
        alert('Erro ao carregar as leis');
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Event listeners para botões de delete
    document.querySelectorAll('.lei-delete').forEach(btn => {
        btn.addEventListener('click', handleDelete);
    });

    // Event listeners para botões de edit
    document.querySelectorAll('.lei-edit').forEach(btn => {
        btn.addEventListener('click', handleEdit);
    });

    // Event listener para fechar modal
    document.querySelector('.modal-close').addEventListener('click', closeModal);
    document.querySelector('.btn-cancel').addEventListener('click', closeModal);

    // Event listener para o formulário de edição
    document.getElementById('editForm').addEventListener('submit', handleSubmit);
}

// Função para lidar com o clique no botão de editar
async function handleEdit(e) {
    // Encontra o botão mais próximo caso o clique seja no SVG
    const button = e.target.closest('.edit-btn');
    if (!button) return;
    
    const id = button.dataset.id;
    try {
        const response = await fetch(`${API_BASE_URL}/leis`);
        const leis = await response.json();
        const lei = leis.find(l => l.id === parseInt(id));
        
        if (lei) {
            // Preencher o formulário com os dados da lei
            document.getElementById('editId').value = lei.id;
            document.getElementById('editTitulo').value = lei.titulo;
            document.getElementById('editNumero').value = lei.numero;
            document.getElementById('editAbrangencia').value = lei.abrangencia;
            document.getElementById('editData').value = lei.data.split('T')[0];
            document.getElementById('editLink').value = lei.link || '';

            // Abrir o modal
            document.getElementById('editModal').classList.add('active');
        }
    } catch (error) {
        console.error('Erro ao carregar dados da lei:', error);
        alert('Erro ao carregar dados da lei');
    }
}

// Função para lidar com o submit do formulário
async function handleSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('editId').value;
    
    const leiData = {
        titulo: document.getElementById('editTitulo').value,
        numero: document.getElementById('editNumero').value,
        abrangencia: document.getElementById('editAbrangencia').value,
        data: document.getElementById('editData').value,
        link: document.getElementById('editLink').value || null,
        arquivo: null // Mantendo o arquivo como null por enquanto
    };

    try {
        const response = await fetch(`${API_BASE_URL}/leis/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(leiData)
        });

        if (response.ok) {
            closeModal();
            carregarLeis();
            alert('Lei atualizada com sucesso!');
        } else {
            throw new Error('Erro ao atualizar lei');
        }
    } catch (error) {
        console.error('Erro ao atualizar lei:', error);
        alert('Erro ao atualizar a lei');
    }
}

// Função para lidar com o delete
async function handleDelete(e) {
    // Encontra o botão mais próximo caso o clique seja no SVG
    const button = e.target.closest('.delete-btn');
    if (!button) return;

    if (confirm('Tem certeza que deseja excluir esta lei?')) {
        const id = button.dataset.id;
        try {
            const response = await fetch(`${API_BASE_URL}/leis/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                carregarLeis();
                alert('Lei excluída com sucesso!');
            } else {
                throw new Error('Erro ao excluir lei');
            }
        } catch (error) {
            console.error('Erro ao excluir lei:', error);
            alert('Erro ao excluir a lei');
        }
    }
}

// Função para fechar o modal
function closeModal() {
    document.getElementById('editModal').classList.remove('active');
    document.getElementById('editForm').reset();
}

// Função para inicializar a funcionalidade das leis
function initLeis() {
    // Carregar leis quando a página carregar
    carregarLeis();

    // Event listener para o botão de adicionar lei
    document.getElementById('addLeiBtn').addEventListener('click', () => {
        document.getElementById('addLeiModal').classList.add('active');
    });

    // Event listener para o formulário de adicionar lei
    document.getElementById('addLeiForm').addEventListener('submit', handleAddSubmit);

    // Event listener para fechar o modal de adicionar
    document.querySelector('#addLeiModal .modal-close').addEventListener('click', closeAddModal);
    document.querySelector('#addLeiModal .btn-cancel').addEventListener('click', closeAddModal);
}

// Função para lidar com o submit do formulário de adicionar
async function handleAddSubmit(e) {
    e.preventDefault();
    
    const leiData = {
        titulo: document.getElementById('addTitulo').value,
        numero: document.getElementById('addNumero').value,
        abrangencia: document.getElementById('addAbrangencia').value,
        data: document.getElementById('addData').value,
        link: document.getElementById('addLink').value || null,
        arquivo: null // Mantendo o arquivo como null por enquanto
    };

    try {
        const response = await fetch(`${API_BASE_URL}/leis`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(leiData)
        });

        if (response.ok) {
            closeAddModal();
            carregarLeis();
            alert('Lei adicionada com sucesso!');
        } else {
            throw new Error('Erro ao adicionar lei');
        }
    } catch (error) {
        console.error('Erro ao adicionar lei:', error);
        alert('Erro ao adicionar a lei');
    }
}

// Função para fechar o modal de adicionar
function closeAddModal() {
    document.getElementById('addLeiModal').classList.remove('active');
    document.getElementById('addLeiForm').reset();
}

// Função para inicializar a funcionalidade das atas
function initAtas() {
    // Carregar atas quando a página carregar
    carregarAtas();

    // Event listener para o botão de adicionar ata
    document.getElementById('addAtaBtn').addEventListener('click', () => {
        document.getElementById('addAtaModal').classList.add('active');
    });

    // Event listener para o formulário de adicionar ata
    document.getElementById('addAtaForm').addEventListener('submit', handleAddAtaSubmit);

    // Event listeners para fechar o modal de adicionar
    document.querySelector('#addAtaModal .modal-close').addEventListener('click', closeAddAtaModal);
    document.querySelector('#addAtaModal .btn-cancel').addEventListener('click', closeAddAtaModal);

    // Event listeners para fechar o modal de editar
    document.querySelector('#editAtaModal .modal-close').addEventListener('click', closeEditAtaModal);
    document.querySelector('#editAtaModal .btn-cancel').addEventListener('click', closeEditAtaModal);

    // Event listener para o formulário de edição
    document.getElementById('editAtaForm').addEventListener('submit', handleEditAtaSubmit);
}

// Função para carregar atas
async function carregarAtas() {
    try {
        const response = await fetch(`${API_BASE_URL}/atas`);
        const data = await response.json();
        const tbody = document.querySelector('#atasTable tbody');
        tbody.innerHTML = '';

        data.atas.forEach(ata => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${ata.titulo}</td>
                <td>${ata.tipo_reuniao}</td>
                <td>${new Date(ata.data_reuniao).toLocaleDateString('pt-BR')}</td>
                <td>
                    ${ata.link_ata ? `<a href="${ata.link_ata}" target="_blank" class="table-link">Visualizar</a>` : '-'}
                </td>
                <td class="actions">
                    <button class="edit-btn ata-edit" data-id="${ata.id}" title="Editar">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="delete-btn ata-delete" data-id="${ata.id}" title="Excluir">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Adicionar event listeners para os botões
        setupAtaEventListeners();
    } catch (error) {
        console.error('Erro ao carregar atas:', error);
        alert('Erro ao carregar as atas');
    }
}

// Configurar event listeners para atas
function setupAtaEventListeners() {
    // Event listeners para botões de delete
    document.querySelectorAll('.ata-delete').forEach(btn => {
        btn.addEventListener('click', handleDeleteAta);
    });

    // Event listeners para botões de edit
    document.querySelectorAll('.ata-edit').forEach(btn => {
        btn.addEventListener('click', handleEditAta);
    });
}

// Função para lidar com o submit do formulário de adicionar ata
async function handleAddAtaSubmit(e) {
    e.preventDefault();
    
    const ataData = {
        titulo: document.getElementById('addAtaTitulo').value,
        tipo_reuniao: document.getElementById('addAtaTipoReuniao').value,
        data_reuniao: document.getElementById('addAtaData').value,
        link_ata: document.getElementById('addAtaLink').value || null
    };

    try {
        const response = await fetch(`${API_BASE_URL}/atas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ataData)
        });

        if (response.ok) {
            closeAddAtaModal();
            carregarAtas();
            alert('Ata adicionada com sucesso!');
        } else {
            throw new Error('Erro ao adicionar ata');
        }
    } catch (error) {
        console.error('Erro ao adicionar ata:', error);
        alert('Erro ao adicionar a ata');
    }
}

// Função para lidar com o clique no botão de editar ata
async function handleEditAta(e) {
    const button = e.target.closest('.edit-btn');
    if (!button) return;
    
    const id = button.dataset.id;
    try {
        const response = await fetch(`${API_BASE_URL}/atas`);
        const data = await response.json();
        const ata = data.atas.find(a => a.id === parseInt(id));
        
        if (ata) {
            document.getElementById('editAtaId').value = ata.id;
            document.getElementById('editAtaTitulo').value = ata.titulo;
            document.getElementById('editAtaTipoReuniao').value = ata.tipo_reuniao;
            document.getElementById('editAtaData').value = ata.data_reuniao.split('T')[0];
            document.getElementById('editAtaLink').value = ata.link_ata || '';

            document.getElementById('editAtaModal').classList.add('active');
        }
    } catch (error) {
        console.error('Erro ao carregar dados da ata:', error);
        alert('Erro ao carregar dados da ata');
    }
}

// Função para lidar com o submit do formulário de editar ata
async function handleEditAtaSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('editAtaId').value;
    
    const ataData = {
        titulo: document.getElementById('editAtaTitulo').value,
        tipo_reuniao: document.getElementById('editAtaTipoReuniao').value,
        data_reuniao: document.getElementById('editAtaData').value,
        link_ata: document.getElementById('editAtaLink').value || null
    };

    try {
        const response = await fetch(`${API_BASE_URL}/atas/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ataData)
        });

        if (response.ok) {
            closeEditAtaModal();
            carregarAtas();
            alert('Ata atualizada com sucesso!');
        } else {
            throw new Error('Erro ao atualizar ata');
        }
    } catch (error) {
        console.error('Erro ao atualizar ata:', error);
        alert('Erro ao atualizar a ata');
    }
}

// Função para lidar com o delete de ata
async function handleDeleteAta(e) {
    const button = e.target.closest('.delete-btn');
    if (!button) return;

    if (confirm('Tem certeza que deseja excluir esta ata?')) {
        const id = button.dataset.id;
        try {
            const response = await fetch(`${API_BASE_URL}/atas/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                carregarAtas();
                alert('Ata excluída com sucesso!');
            } else {
                throw new Error('Erro ao excluir ata');
            }
        } catch (error) {
            console.error('Erro ao excluir ata:', error);
            alert('Erro ao excluir a ata');
        }
    }
}

// Função para fechar o modal de adicionar ata
function closeAddAtaModal() {
    document.getElementById('addAtaModal').classList.remove('active');
    document.getElementById('addAtaForm').reset();
}

// Função para fechar o modal de editar ata
function closeEditAtaModal() {
    document.getElementById('editAtaModal').classList.remove('active');
    document.getElementById('editAtaForm').reset();
}

// Função para inicializar a funcionalidade das resoluções
function initResolucoes() {
    // Carregar resoluções quando a página carregar
    carregarResolucoes();

    // Event listener para o botão de adicionar resolução
    document.getElementById('addResolucaoBtn').addEventListener('click', () => {
        document.getElementById('addResolucaoModal').classList.add('active');
    });

    // Event listener para o formulário de adicionar resolução
    document.getElementById('addResolucaoForm').addEventListener('submit', handleAddResolucaoSubmit);

    // Event listeners para fechar o modal de adicionar
    document.querySelector('#addResolucaoModal .modal-close').addEventListener('click', closeAddResolucaoModal);
    document.querySelector('#addResolucaoModal .btn-cancel').addEventListener('click', closeAddResolucaoModal);

    // Event listeners para fechar o modal de editar
    document.querySelector('#editResolucaoModal .modal-close').addEventListener('click', closeEditResolucaoModal);
    document.querySelector('#editResolucaoModal .btn-cancel').addEventListener('click', closeEditResolucaoModal);

    // Event listener para o formulário de edição
    document.getElementById('editResolucaoForm').addEventListener('submit', handleEditResolucaoSubmit);
}

// Função para carregar resoluções
async function carregarResolucoes() {
    try {
        const response = await fetch(`${API_BASE_URL}/resolucoes`);
        const data = await response.json();
        const tbody = document.querySelector('#resolucoesTable tbody');
        tbody.innerHTML = '';

        data.resolucoes.forEach(resolucao => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${resolucao.titulo}</td>
                <td>${resolucao.tipo_conselho}</td>
                <td>${new Date(resolucao.data_resolucao).toLocaleDateString('pt-BR')}</td>
                <td>
                    ${resolucao.link_resolucao ? `<a href="${resolucao.link_resolucao}" target="_blank" class="table-link">Visualizar</a>` : '-'}
                </td>
                <td class="actions">
                    <button class="edit-btn resolucao-edit" data-id="${resolucao.id}" title="Editar">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="delete-btn resolucao-delete" data-id="${resolucao.id}" title="Excluir">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Adicionar event listeners para os botões
        setupResolucaoEventListeners();
    } catch (error) {
        console.error('Erro ao carregar resoluções:', error);
        alert('Erro ao carregar as resoluções');
    }
}

// Configurar event listeners para resoluções
function setupResolucaoEventListeners() {
    // Event listeners para botões de delete
    document.querySelectorAll('.resolucao-delete').forEach(btn => {
        btn.addEventListener('click', handleDeleteResolucao);
    });

    // Event listeners para botões de edit
    document.querySelectorAll('.resolucao-edit').forEach(btn => {
        btn.addEventListener('click', handleEditResolucao);
    });
}

// Função para lidar com o submit do formulário de adicionar resolução
async function handleAddResolucaoSubmit(e) {
    e.preventDefault();
    
    const resolucaoData = {
        titulo: document.getElementById('addResolucaoTitulo').value,
        tipo_conselho: document.getElementById('addResolucaoTipoConselho').value,
        data_resolucao: document.getElementById('addResolucaoData').value,
        link_resolucao: document.getElementById('addResolucaoLink').value || null
    };

    try {
        const response = await fetch(`${API_BASE_URL}/resolucoes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(resolucaoData)
        });

        if (response.ok) {
            closeAddResolucaoModal();
            carregarResolucoes();
            alert('Resolução adicionada com sucesso!');
        } else {
            throw new Error('Erro ao adicionar resolução');
        }
    } catch (error) {
        console.error('Erro ao adicionar resolução:', error);
        alert('Erro ao adicionar a resolução');
    }
}

// Função para lidar com o clique no botão de editar resolução
async function handleEditResolucao(e) {
    const button = e.target.closest('.resolucao-edit');
    if (!button) return;
    
    const id = button.dataset.id;
    try {
        const response = await fetch(`${API_BASE_URL}/resolucoes`);
        const data = await response.json();
        const resolucao = data.resolucoes.find(r => r.id === parseInt(id));
        
        if (resolucao) {
            document.getElementById('editResolucaoId').value = resolucao.id;
            document.getElementById('editResolucaoTitulo').value = resolucao.titulo;
            document.getElementById('editResolucaoTipoConselho').value = resolucao.tipo_conselho;
            document.getElementById('editResolucaoData').value = resolucao.data_resolucao.split('T')[0];
            document.getElementById('editResolucaoLink').value = resolucao.link_resolucao || '';

            document.getElementById('editResolucaoModal').classList.add('active');
        }
    } catch (error) {
        console.error('Erro ao carregar dados da resolução:', error);
        alert('Erro ao carregar dados da resolução');
    }
}

// Função para lidar com o submit do formulário de editar resolução
async function handleEditResolucaoSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('editResolucaoId').value;
    
    const resolucaoData = {
        titulo: document.getElementById('editResolucaoTitulo').value,
        tipo_conselho: document.getElementById('editResolucaoTipoConselho').value,
        data_resolucao: document.getElementById('editResolucaoData').value,
        link_resolucao: document.getElementById('editResolucaoLink').value || null
    };

    try {
        const response = await fetch(`${API_BASE_URL}/resolucoes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(resolucaoData)
        });

        if (response.ok) {
            closeEditResolucaoModal();
            carregarResolucoes();
            alert('Resolução atualizada com sucesso!');
        } else {
            throw new Error('Erro ao atualizar resolução');
        }
    } catch (error) {
        console.error('Erro ao atualizar resolução:', error);
        alert('Erro ao atualizar a resolução');
    }
}

// Função para lidar com o delete de resolução
async function handleDeleteResolucao(e) {
    const button = e.target.closest('.resolucao-delete');
    if (!button) return;

    if (confirm('Tem certeza que deseja excluir esta resolução?')) {
        const id = button.dataset.id;
        try {
            const response = await fetch(`${API_BASE_URL}/resolucoes/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                carregarResolucoes();
                alert('Resolução excluída com sucesso!');
            } else {
                throw new Error('Erro ao excluir resolução');
            }
        } catch (error) {
            console.error('Erro ao excluir resolução:', error);
            alert('Erro ao excluir a resolução');
        }
    }
}

// Função para fechar o modal de adicionar resolução
function closeAddResolucaoModal() {
    document.getElementById('addResolucaoModal').classList.remove('active');
    document.getElementById('addResolucaoForm').reset();
}

// Função para fechar o modal de editar resolução
function closeEditResolucaoModal() {
    document.getElementById('editResolucaoModal').classList.remove('active');
    document.getElementById('editResolucaoForm').reset();
}

// Função para inicializar a funcionalidade dos ofícios
function initOficios() {
    // Carregar ofícios ao iniciar
    carregarOficios();

    // Configurar modal de adicionar
    const addOficioBtn = document.getElementById('addOficioBtn');
    const addOficioModal = document.getElementById('addOficioModal');
    const addOficioForm = document.getElementById('addOficioForm');

    if (addOficioBtn) {
        addOficioBtn.addEventListener('click', () => {
            addOficioModal.classList.add('active');
        });
    }

    if (addOficioForm) {
        addOficioForm.addEventListener('submit', handleAddOficioSubmit);
    }

    // Configurar fechamento do modal
    const closeButtons = addOficioModal.querySelectorAll('.modal-close, .btn-cancel');
    closeButtons.forEach(button => {
        button.addEventListener('click', closeAddOficioModal);
    });
}

// Função para carregar ofícios
async function carregarOficios() {
    try {
        const response = await fetch(`${API_BASE_URL}/oficios`);
        const data = await response.json();
        const tbody = document.querySelector('#oficiosTable tbody');
        tbody.innerHTML = '';

        // Verifica se data é um array (resposta direta) ou se está dentro de uma propriedade
        const oficios = Array.isArray(data) ? data : (data.oficios || []);

        oficios.forEach(oficio => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td data-label="Número">${oficio.NumOficio}</td>
                <td data-label="Título">${oficio.titulo}</td>
                <td data-label="Descrição">${oficio.description}</td>
                <td data-label="Data">${new Date(oficio.data).toLocaleDateString('pt-BR')}</td>
                <td data-label="Link">
                    ${oficio.link ? `<a href="${oficio.link}" target="_blank" class="table-link">Visualizar</a>` : '-'}
                </td>
                <td data-label="Ações" class="actions">
                    <button class="edit-btn oficio-edit" data-id="${oficio.id}" title="Editar">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="delete-btn oficio-delete" data-id="${oficio.id}" title="Excluir">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        setupOficioEventListeners();
    } catch (error) {
        console.error('Erro ao carregar ofícios:', error);
        alert('Erro ao carregar os ofícios');
    }
}

// Configurar event listeners para ofícios
function setupOficioEventListeners() {
    document.querySelectorAll('.oficio-delete').forEach(btn => {
        btn.addEventListener('click', handleDeleteOficio);
    });

    document.querySelectorAll('.oficio-edit').forEach(btn => {
        btn.addEventListener('click', handleEditOficio);
    });
}

// Função para lidar com o submit do formulário de adicionar ofício
async function handleAddOficioSubmit(e) {
    e.preventDefault();
    
    const oficioData = {
        NumOficio: document.getElementById('addNumOficio').value,
        titulo: document.getElementById('addTituloOficio').value,
        description: document.getElementById('addDescriptionOficio').value,
        data: document.getElementById('addDataOficio').value,
        link: document.getElementById('addLinkOficio').value || null
    };

    try {
        const response = await fetch(`${API_BASE_URL}/oficios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(oficioData)
        });

        if (response.ok) {
            closeAddOficioModal();
            carregarOficios();
            alert('Ofício adicionado com sucesso!');
        } else {
            throw new Error('Erro ao adicionar ofício');
        }
    } catch (error) {
        console.error('Erro ao adicionar ofício:', error);
        alert('Erro ao adicionar o ofício');
    }
}

// Função para lidar com o clique no botão de editar ofício
async function handleEditOficio(e) {
    const button = e.target.closest('.edit-btn');
    if (!button) return;
    
    const id = button.dataset.id;
    try {
        const response = await fetch(`${API_BASE_URL}/oficios`);
        const data = await response.json();
        // Verifica se data é um array (resposta direta) ou se está dentro de uma propriedade
        const oficios = Array.isArray(data) ? data : (data.oficios || []);
        const oficio = oficios.find(o => o.id === parseInt(id));
        
        if (oficio) {
            document.getElementById('editOficioId').value = oficio.id;
            document.getElementById('editNumOficio').value = oficio.NumOficio;
            document.getElementById('editTituloOficio').value = oficio.titulo;
            document.getElementById('editDescriptionOficio').value = oficio.description;
            document.getElementById('editDataOficio').value = oficio.data.split('T')[0];
            document.getElementById('editLinkOficio').value = oficio.link || '';

            document.getElementById('editOficioModal').classList.add('active');
            
            // Adicionar event listener para o formulário de edição
            const editForm = document.getElementById('editOficioForm');
            editForm.removeEventListener('submit', handleEditOficioSubmit);
            editForm.addEventListener('submit', handleEditOficioSubmit);
            
            // Adicionar event listeners para fechar o modal
            const closeButtons = document.getElementById('editOficioModal')
                .querySelectorAll('.modal-close, .btn-cancel');
            closeButtons.forEach(button => {
                button.addEventListener('click', closeEditOficioModal);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar dados do ofício:', error);
        alert('Erro ao carregar dados do ofício');
    }
}

// Função para lidar com o submit do formulário de editar ofício
async function handleEditOficioSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('editOficioId').value;
    
    const oficioData = {
        NumOficio: document.getElementById('editNumOficio').value,
        titulo: document.getElementById('editTituloOficio').value,
        description: document.getElementById('editDescriptionOficio').value,
        data: document.getElementById('editDataOficio').value,
        link: document.getElementById('editLinkOficio').value || null
    };

    try {
        const response = await fetch(`${API_BASE_URL}/oficios/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(oficioData)
        });

        if (response.ok) {
            closeEditOficioModal();
            carregarOficios();
            alert('Ofício atualizado com sucesso!');
        } else {
            throw new Error('Erro ao atualizar ofício');
        }
    } catch (error) {
        console.error('Erro ao atualizar ofício:', error);
        alert('Erro ao atualizar o ofício');
    }
}

// Função para lidar com o delete de ofício
async function handleDeleteOficio(e) {
    const button = e.target.closest('.delete-btn');
    if (!button) return;
    
    if (confirm('Tem certeza que deseja excluir este ofício?')) {
        const id = button.dataset.id;
        try {
            const response = await fetch(`${API_BASE_URL}/oficios/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                carregarOficios();
                alert('Ofício excluído com sucesso!');
            } else {
                throw new Error('Erro ao excluir ofício');
            }
        } catch (error) {
            console.error('Erro ao excluir ofício:', error);
            alert('Erro ao excluir o ofício');
        }
    }
}

// Função para fechar o modal de adicionar ofício
function closeAddOficioModal() {
    document.getElementById('addOficioModal').classList.remove('active');
    document.getElementById('addOficioForm').reset();
}

// Função para fechar o modal de editar ofício
function closeEditOficioModal() {
    document.getElementById('editOficioModal').classList.remove('active');
    document.getElementById('editOficioForm').reset();
}