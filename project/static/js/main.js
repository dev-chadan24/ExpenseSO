/* ==========================================================================
   FinTrack — Custom JavaScript Functionality
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- Initialize Theme ---
    initTheme();

    // --- Sidebar Mobile Toggle ---
    initSidebar();

    // --- Auto-Dismiss Toast Alerts ---
    initToasts();

    // --- Counter Animation for stats ---
    initCounters();
});

/**
 * Retrieves a cookie value by name (used for CSRF token)
 */
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

/**
 * Controls theme preference checks, updates and persistence
 */
function initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (!themeToggleBtn) return;

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        // Update DOM
        document.documentElement.setAttribute('data-theme', newTheme);
        
        // Update toggler icon
        updateThemeIcon(newTheme);
        
        // Persist locally
        localStorage.setItem('theme', newTheme);
        
        // Persist on backend (Asynchronously if logged in)
        const csrfToken = getCookie('csrftoken');
        if (csrfToken) {
            fetch('/users/update-theme/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({ theme: newTheme })
            })
            .then(res => res.json())
            .then(data => {
                if (data.status !== 'success') {
                    console.error('Failed to sync theme preference with backend');
                }
            })
            .catch(err => console.error('Error updating theme preference:', err));
        }
    });

    // Helper to update toggle button icons
    function updateThemeIcon(theme) {
        const icon = themeToggleBtn.querySelector('i');
        if (!icon) return;
        
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
            themeToggleBtn.title = 'Switch to Light Mode';
        } else {
            icon.className = 'fas fa-moon';
            themeToggleBtn.title = 'Switch to Dark Mode';
        }
    }

    // Set initial icon on page load
    const loadedTheme = document.documentElement.getAttribute('data-theme') || 'light';
    updateThemeIcon(loadedTheme);
}

/**
 * Toggles mobile sidebar navigation visibility
 */
function initSidebar() {
    const toggleBtn = document.querySelector('.mobile-nav-toggle');
    const sidebar = document.getElementById('sidebar');
    
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('open');
        });

        // Close sidebar if clicking outside of it
        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }
}

/**
 * Handles custom toast dismissals and setups auto-fade out
 */
function initToasts() {
    const toasts = document.querySelectorAll('.toast-custom');
    
    toasts.forEach(toast => {
        const closeBtn = toast.querySelector('.toast-close');
        
        // Auto dismiss after 5 seconds
        const autoDismiss = setTimeout(() => {
            dismissToast(toast);
        }, 5000);
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                clearTimeout(autoDismiss);
                dismissToast(toast);
            });
        }
    });
}

function dismissToast(toast) {
    toast.classList.add('animate-fade-out');
    toast.addEventListener('animationend', () => {
        toast.remove();
    });
}

/**
 * Creates dynamic counter increment animations for stat card numbers
 */
function initCounters() {
    const counters = document.querySelectorAll('.counter-anim');
    
    counters.forEach(counter => {
        const targetStr = counter.getAttribute('data-target');
        if (!targetStr) return;
        
        const target = parseFloat(targetStr.replace(/[^\d.-]/g, ''));
        const prefix = targetStr.match(/^[^\d]*/) ? targetStr.match(/^[^\d]*/)[0] : '';
        const suffix = targetStr.match(/[^\d]*$/) ? targetStr.match(/[^\d]*$/)[0] : '';
        
        if (isNaN(target)) return;
        
        let start = 0;
        const duration = 1000; // 1s animation
        const steps = 50;
        const stepTime = duration / steps;
        const increment = target / steps;
        
        const timer = setInterval(() => {
            start += increment;
            if ((increment >= 0 && start >= target) || (increment < 0 && start <= target)) {
                clearInterval(timer);
                counter.innerText = targetStr;
            } else {
                // Formatting values nicely
                if (target % 1 === 0) {
                    counter.innerText = prefix + Math.round(start).toLocaleString() + suffix;
                } else {
                    counter.innerText = prefix + start.toFixed(2).toLocaleString() + suffix;
                }
            }
        }, stepTime);
    });
}

/**
 * Creates programmatically a new Toast notification dynamically on the screen
 * @param {string} message - Text inside toast
 * @param {string} type - type indicator: success, danger, warning, info
 */
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast-custom ${type}`;
    
    let iconClass = 'fa-check-circle';
    if (type === 'danger') iconClass = 'fa-exclamation-circle';
    if (type === 'warning') iconClass = 'fa-exclamation-triangle';
    if (type === 'info') iconClass = 'fa-info-circle';
    
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${iconClass}"></i>
            <span>${message}</span>
        </div>
        <button class="toast-close"><i class="fas fa-times"></i></button>
    `;
    
    container.appendChild(toast);
    
    const closeBtn = toast.querySelector('.toast-close');
    const autoDismiss = setTimeout(() => {
        dismissToast(toast);
    }, 5000);
    
    closeBtn.addEventListener('click', () => {
        clearTimeout(autoDismiss);
        dismissToast(toast);
    });
}
