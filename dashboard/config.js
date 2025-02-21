const CONFIG_VERSION = '1.0.1';
const API_BASE_URL = 'https://max-cmdca-api.uvxtdw.easypanel.host';

// Função para forçar recarregamento do cache
function clearConfigCache() {
    localStorage.removeItem('config_version');
    window.location.reload(true);
}

// Verifica se há uma nova versão da configuração
function checkConfigVersion() {
    const storedVersion = localStorage.getItem('config_version');
    if (storedVersion !== CONFIG_VERSION) {
        localStorage.setItem('config_version', CONFIG_VERSION);
        return true; // Indica que houve atualização
    }
    return false;
}

export { API_BASE_URL, CONFIG_VERSION, clearConfigCache, checkConfigVersion };
