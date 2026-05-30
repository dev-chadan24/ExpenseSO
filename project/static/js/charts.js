/* ==========================================================================
   FinTrack — Reusable Chart.js Helpers
   ========================================================================== */

/**
 * Common chart default configurations
 */
function getChartTheme(isDark) {
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? '#22304d' : '#f1f5f9';
    const tooltipBg = isDark ? '#0f172a' : '#ffffff';
    const tooltipBorder = isDark ? '#22304d' : '#e2e8f0';
    const tooltipText = isDark ? '#f8fafc' : '#0f172a';

    return {
        textColor,
        gridColor,
        tooltipBg,
        tooltipBorder,
        tooltipText
    };
}

/**
 * Creates a premium line chart comparing Income and Expenses
 * @param {string} canvasId - Element ID of the canvas
 * @param {Array} labels - X-axis labels (months)
 * @param {Array} income - Y-axis income values
 * @param {Array} expense - Y-axis expense values
 */
function renderOverviewChart(canvasId, labels, income, expense) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const theme = getChartTheme(isDark);

    // Setup linear gradients for fills
    const incomeGrad = ctx.createLinearGradient(0, 0, 0, 300);
    incomeGrad.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
    incomeGrad.addColorStop(1, 'rgba(16, 185, 129, 0.00)');

    const expenseGrad = ctx.createLinearGradient(0, 0, 0, 300);
    expenseGrad.addColorStop(0, 'rgba(239, 68, 68, 0.20)');
    expenseGrad.addColorStop(1, 'rgba(239, 68, 68, 0.00)');

    const config = {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Income',
                    data: income,
                    borderColor: '#10b981',
                    borderWidth: 3,
                    backgroundColor: incomeGrad,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: 'Expenses',
                    data: expense,
                    borderColor: '#ef4444',
                    borderWidth: 3,
                    backgroundColor: expenseGrad,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#ef4444',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: { family: 'Plus Jakarta Sans', weight: '600', size: 12 },
                        color: theme.textColor,
                        boxWidth: 10,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: theme.tooltipBg,
                    titleColor: theme.tooltipText,
                    bodyColor: theme.tooltipText,
                    borderColor: theme.tooltipBorder,
                    borderWidth: 1,
                    padding: 12,
                    boxPadding: 6,
                    usePointStyle: true,
                    bodyFont: { family: 'Plus Jakarta Sans' },
                    titleFont: { family: 'Outfit', weight: 'bold' }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: theme.textColor, font: { family: 'Plus Jakarta Sans', size: 11 } }
                },
                y: {
                    grid: { color: theme.gridColor },
                    ticks: { color: theme.textColor, font: { family: 'Plus Jakarta Sans', size: 11 } }
                }
            }
        }
    };

    return new Chart(ctx, config);
}

/**
 * Creates a premium category distribution Donut chart
 * @param {string} canvasId - Element ID of the canvas
 * @param {Array} labels - Labels of the categories
 * @param {Array} values - Total value of each category
 * @param {Array} colors - Base colors of each category
 */
function renderCategoryDonutChart(canvasId, labels, values, colors) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const theme = getChartTheme(isDark);

    const config = {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors.length > 0 ? colors : ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
                borderWidth: isDark ? 2 : 1,
                borderColor: isDark ? '#151e33' : '#ffffff',
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '72%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { family: 'Plus Jakarta Sans', weight: '500', size: 11 },
                        color: theme.textColor,
                        boxWidth: 8,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: theme.tooltipBg,
                    titleColor: theme.tooltipText,
                    bodyColor: theme.tooltipText,
                    borderColor: theme.tooltipBorder,
                    borderWidth: 1,
                    padding: 12,
                    usePointStyle: true,
                    bodyFont: { family: 'Plus Jakarta Sans' },
                    titleFont: { family: 'Outfit', weight: 'bold' }
                }
            }
        }
    };

    return new Chart(ctx, config);
}
