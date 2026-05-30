// Wait for DOM to be loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize mobile navigation
  initMobileNav();
  
  // Initialize charts if they exist
  initCharts();
  
  // Initialize tooltips
  initTooltips();
  
  // Initialize animations
  initAnimations();
  
  // Initialize category icon selector
  initIconSelector();
});

// Mobile navigation
function initMobileNav() {
  const navToggle = document.querySelector('.mobile-nav-toggle');
  const sidebar = document.querySelector('.sidebar');
  
  if (navToggle && sidebar) {
    navToggle.addEventListener('click', function() {
      sidebar.classList.toggle('show');
    });
    
    // Close sidebar when clicking outside
    document.addEventListener('click', function(event) {
      if (!sidebar.contains(event.target) && !navToggle.contains(event.target) && sidebar.classList.contains('show')) {
        sidebar.classList.remove('show');
      }
    });
  }
}

// Charts initialization
function initCharts() {
  // Monthly spending chart
  const monthlyChartElement = document.getElementById('monthlySpendingChart');
  if (monthlyChartElement) {
    const ctx = monthlyChartElement.getContext('2d');
    
    // Get data from data attributes
    const months = JSON.parse(monthlyChartElement.dataset.months || '[]');
    const amounts = JSON.parse(monthlyChartElement.dataset.amounts || '[]');
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: 'Monthly Spending',
          data: amounts,
          backgroundColor: 'rgba(0, 122, 255, 0.1)',
          borderColor: 'rgba(0, 122, 255, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(0, 122, 255, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            titleFont: {
              size: 14
            },
            bodyFont: {
              size: 13
            },
            padding: 12,
            cornerRadius: 8
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart'
        }
      }
    });
  }
  
  // Category pie chart
  const categoryChartElement = document.getElementById('categoryChart');
  if (categoryChartElement) {
    const ctx = categoryChartElement.getContext('2d');
    
    // Get data from data attributes
    const categories = JSON.parse(categoryChartElement.dataset.categories || '[]');
    const values = JSON.parse(categoryChartElement.dataset.values || '[]');
    
    // Generate colors for each category
    const colors = generateColorPalette(categories.length);
    
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: categories,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 12,
              padding: 15
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            titleFont: {
              size: 14
            },
            bodyFont: {
              size: 13
            },
            padding: 12,
            cornerRadius: 8
          }
        },
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 1000,
          easing: 'easeOutQuart'
        }
      }
    });
  }
  
  // Daily expense chart
  const dailyChartElement = document.getElementById('dailyExpenseChart');
  if (dailyChartElement) {
    const ctx = dailyChartElement.getContext('2d');
    
    // Get data from data attributes
    const dates = JSON.parse(dailyChartElement.dataset.dates || '[]');
    const amounts = JSON.parse(dailyChartElement.dataset.amounts || '[]');
    
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dates,
        datasets: [{
          label: 'Daily Expenses',
          data: amounts,
          backgroundColor: 'rgba(88, 86, 214, 0.7)',
          borderColor: 'rgba(88, 86, 214, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart'
        }
      }
    });
  }
}

// Generate color palette
function generateColorPalette(count) {
  const baseColors = [
    'rgba(0, 122, 255, 0.8)',    // Primary
    'rgba(88, 86, 214, 0.8)',    // Secondary
    'rgba(52, 199, 89, 0.8)',    // Success
    'rgba(255, 204, 0, 0.8)',    // Warning
    'rgba(255, 59, 48, 0.8)',    // Danger
    'rgba(90, 200, 250, 0.8)',   // Info
    'rgba(175, 82, 222, 0.8)',   // Purple
    'rgba(255, 149, 0, 0.8)',    // Orange
    'rgba(142, 142, 147, 0.8)',  // Gray
    'rgba(0, 199, 190, 0.8)'     // Teal
  ];
  
  // If we have fewer categories than base colors, just return a subset
  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }
  
  // Otherwise, generate additional colors
  const colors = [...baseColors];
  
  for (let i = baseColors.length; i < count; i++) {
    // Generate random hue, but keep saturation and lightness consistent
    const hue = Math.floor(Math.random() * 360);
    colors.push(`hsla(${hue}, 75%, 50%, 0.8)`);
  }
  
  return colors;
}

// Tooltips initialization
function initTooltips() {
  const tooltipElements = document.querySelectorAll('[data-tooltip]');
  
  tooltipElements.forEach(element => {
    const tooltip = element.dataset.tooltip;
    
    element.addEventListener('mouseenter', function(event) {
      // Create tooltip element
      const tooltipEl = document.createElement('div');
      tooltipEl.className = 'tooltip';
      tooltipEl.textContent = tooltip;
      
      // Position tooltip
      tooltipEl.style.position = 'absolute';
      tooltipEl.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      tooltipEl.style.color = 'white';
      tooltipEl.style.padding = '5px 10px';
      tooltipEl.style.borderRadius = '4px';
      tooltipEl.style.fontSize = '14px';
      tooltipEl.style.zIndex = '1000';
      tooltipEl.style.pointerEvents = 'none';
      tooltipEl.style.whiteSpace = 'nowrap';
      
      document.body.appendChild(tooltipEl);
      
      const rect = element.getBoundingClientRect();
      const tooltipRect = tooltipEl.getBoundingClientRect();
      
      tooltipEl.style.top = `${rect.top - tooltipRect.height - 10 + window.scrollY}px`;
      tooltipEl.style.left = `${rect.left + rect.width / 2 - tooltipRect.width / 2 + window.scrollX}px`;
      
      // Add an arrow
      tooltipEl.style.setProperty('--arrow-size', '6px');
      tooltipEl.style.setProperty('--arrow-color', 'rgba(0, 0, 0, 0.8)');
      tooltipEl.style.setProperty('--arrow-offset', '-6px');
      tooltipEl.style.setProperty('--arrow-position', '100%');
      
      tooltipEl.innerHTML += `
        <div style="position: absolute; width: 0; height: 0; top: var(--arrow-position); left: calc(50% - var(--arrow-size)); border-left: var(--arrow-size) solid transparent; border-right: var(--arrow-size) solid transparent; border-top: var(--arrow-size) solid var(--arrow-color);"></div>
      `;
      
      // Store reference to the tooltip
      element.tooltip = tooltipEl;
    });
    
    element.addEventListener('mouseleave', function() {
      if (element.tooltip) {
        element.tooltip.remove();
        element.tooltip = null;
      }
    });
  });
}

// Initialize animations
function initAnimations() {
  // Stagger animate items with the .animate-stagger class
  const staggerItems = document.querySelectorAll('.animate-stagger');
  
  staggerItems.forEach((item, index) => {
    // Add delay based on index
    item.style.animationDelay = `${index * 0.1}s`;
  });
  
  // Animate items when they enter the viewport
  const animateOnScroll = document.querySelectorAll('.animate-on-scroll');
  
  if (animateOnScroll.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    
    animateOnScroll.forEach(item => {
      observer.observe(item);
    });
  }
}

// Initialize icon selector
function initIconSelector() {
  const iconField = document.querySelector('select[name="icon"]');
  
  if (iconField) {
    // Create icon selector container
    const container = document.createElement('div');
    container.className = 'icon-selector';
    
    // Get parent form group
    const formGroup = iconField.closest('.form-group');
    
    // Insert before the select field
    formGroup.insertBefore(container, iconField);
    
    // Get options from select
    const options = Array.from(iconField.options);
    
    // Create visual icon options
    options.forEach(option => {
      const iconOption = document.createElement('div');
      iconOption.className = 'icon-option';
      iconOption.dataset.value = option.value;
      
      // Add icon
      const icon = document.createElement('i');
      icon.className = `fas ${option.value}`;
      iconOption.appendChild(icon);
      
      // Add selected class if this is the current value
      if (option.value === iconField.value) {
        iconOption.classList.add('selected');
      }
      
      // Add click handler
      iconOption.addEventListener('click', () => {
        // Update select value
        iconField.value = option.value;
        
        // Update selected state
        container.querySelectorAll('.icon-option').forEach(opt => {
          opt.classList.remove('selected');
        });
        iconOption.classList.add('selected');
      });
      
      container.appendChild(iconOption);
    });
    
    // Hide the original select
    iconField.style.display = 'none';
  }
}