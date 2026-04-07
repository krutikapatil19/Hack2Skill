(function() {
    const isAuthenticated = localStorage.getItem('isAiFoodAssistantAuth');
    const path = window.location.pathname;
    const isLoginPage = path.endsWith('login.html');

    if (!isAuthenticated && !isLoginPage) {
        window.location.href = 'login.html';
    } else if (isAuthenticated && isLoginPage) {
        window.location.href = 'index.html';
    }

    // Theme logic to prevent FOUC
    const savedTheme = localStorage.getItem('aiFoodTheme');
    if (savedTheme === 'light') {
        document.documentElement.classList.add('light-mode');
    }
})();
