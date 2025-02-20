import { API_BASE_URL } from './config.js';
import { initLeisTab } from './abas/leis/leis.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Configuração do tema
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
    async function switchTab(tabId) {
        // Remove classe active de todas as abas
        tabButtons.forEach(button => button.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Adiciona classe active na aba selecionada
        const selectedButton = document.querySelector(`[data-tab="${tabId}"]`);
        const selectedContent = document.getElementById(tabId);
        
        selectedButton.classList.add('active');
        selectedContent.classList.add('active');

        // Se for a aba de leis e ainda não foi carregada
        if (tabId === 'leis' && !selectedContent.dataset.loaded) {
            // Carrega o conteúdo HTML da aba de leis
            const response = await fetch('abas/leis/leis.html');
            const html = await response.text();
            selectedContent.innerHTML = html;
            selectedContent.dataset.loaded = 'true';
            
            // Inicializa a funcionalidade da aba de leis
            initLeisTab();
        } else if (tabId !== 'leis') {
            // Carrega o conteúdo das outras abas como antes
            loadTabContent(tabId);
        }
    }

    // Event listeners para os botões das abas
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Função para carregar o conteúdo das outras abas
    async function loadTabContent(tabId) {
        const container = document.querySelector(`#${tabId} .card-container`);
        container.innerHTML = '<div class="loading">Carregando...</div>';

        try {
            const response = await fetch(`${API_BASE_URL}/${tabId}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error('Erro ao carregar dados');
            }

            renderContent(container, data, tabId);
        } catch (error) {
            container.innerHTML = `<div class="error">Erro ao carregar dados: ${error.message}</div>`;
        }
    }

    // Função para renderizar o conteúdo das outras abas
    function renderContent(container, data, tabId) {
        container.innerHTML = '';
        
        data.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';
            
            switch(tabId) {
                case 'resolucoes':
                    card.innerHTML = `
                        <h3>Resolução ${item.numero}</h3>
                        <p>${item.descricao}</p>
                        <div class="card-footer">
                            <span class="data">${formatDate(item.data)}</span>
                            ${item.arquivo ? `<a href="${item.arquivo}" target="_blank">Ver PDF</a>` : ''}
                        </div>
                    `;
                    break;
                    
                case 'atas':
                    card.innerHTML = `
                        <h3>Ata - ${formatDate(item.data)}</h3>
                        <p>${item.descricao}</p>
                        <div class="card-footer">
                            ${item.arquivo ? `<a href="${item.arquivo}" target="_blank">Ver PDF</a>` : ''}
                        </div>
                    `;
                    break;
            }
            
            container.appendChild(card);
        });
    }

    // Função auxiliar para formatar datas
    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('pt-BR');
    }

    // Carrega a aba inicial
    await switchTab('leis');
});