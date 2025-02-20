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

    // Função para trocar de aba
    async function switchTab(tabId) {
        // Remove a classe active de todas as abas e botões
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-button').forEach(button => button.classList.remove('active'));
        
        // Adiciona a classe active na aba e botão selecionados
        document.getElementById(tabId).classList.add('active');
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

        // Carrega o conteúdo específico da aba
        if (tabId === 'leis') {
            const leisSection = document.getElementById('leis');
            // Carrega o HTML da aba de leis
            const response = await fetch('/dashboard/abas/leis/leis.html');
            const html = await response.text();
            leisSection.innerHTML = html;
            // Inicializa a funcionalidade da aba de leis
            initLeisTab();
        } else {
            await loadTabContent(tabId);
        }
    }

    // Event listeners para os botões das abas
    const tabButtons = document.querySelectorAll('.tab-button');
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