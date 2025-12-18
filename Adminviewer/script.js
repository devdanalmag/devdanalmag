// ==================== VISITOR TRACKER ADMIN ====================

// PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxPnYep23T-G4kedQrLkKhXToIIdoCMQzk6dP09ETHplPjdeDlZrLWD9zoMqiape7re/exec';

const STORAGE_KEY = 'portfolio_visitors';

// ==================== DATA MANAGEMENT ====================

async function getVisitors() {
    // Try to fetch from Google Sheets if URL is provided
    if (GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL !== 'YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE') {
        try {
            // Add cache buster to URL
            const urlWithCacheBuster = GOOGLE_SCRIPT_URL + (GOOGLE_SCRIPT_URL.includes('?') ? '&' : '?') + 't=' + Date.now();

            // Explicitly set redirect to follow (Google Apps Script uses 302 redirects)
            const response = await fetch(urlWithCacheBuster, {
                method: 'GET',
                mode: 'cors',
                redirect: 'follow'
            });

            const text = await response.text();
            const data = JSON.parse(text);
            return data;
        } catch (e) {
            console.error('Error fetching cloud data:', e);
            // Fallback to local
        }
    }

    // Fallback to local data
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Error reading local data:', e);
        return [];
    }
}

function countryToFlag(countryCode) {
    if (!countryCode || countryCode.length !== 2) return '🌍';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        if (hours < 1) {
            const mins = Math.floor(diff / 60000);
            return mins <= 1 ? 'Just now' : `${mins} mins ago`;
        }
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }

    if (diff < 604800000) {
        const days = Math.floor(diff / 86400000);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function isToday(timestamp) {
    const date = new Date(timestamp);
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

// ==================== STATS CALCULATION ====================

function calculateStats(entries) {
    const totalVisitors = [...new Set(entries.map(e => e.ip).filter(ip => ip !== 'Unknown'))].length;
    const totalPageViews = entries.length;
    const uniqueSessions = entries.filter(e => e.isNewSession).length;
    const todayVisitors = [...new Set(entries.filter(e => isToday(e.timestamp)).map(e => e.ip))].length;
    const uniqueCountries = [...new Set(entries.map(e => e.country).filter(Boolean))].length;

    return { totalVisitors, totalPageViews, uniqueSessions, todayVisitors, uniqueCountries };
}

function getUniqueCountries(entries) {
    const countries = entries
        .filter(v => v.country && v.countryCode)
        .reduce((acc, v) => {
            if (!acc.find(c => c.code === v.countryCode)) {
                acc.push({ name: v.country, code: v.countryCode });
            }
            return acc;
        }, []);
    return countries.sort((a, b) => a.name.localeCompare(b.name));
}

// ==================== UI RENDERING ====================

function updateStats(stats) {
    animateNumber('totalVisitors', stats.totalVisitors);
    animateNumber('totalPageViews', stats.totalPageViews);
    animateNumber('uniqueSessions', stats.uniqueSessions);
    animateNumber('todayVisitors', stats.todayVisitors);
    animateNumber('uniqueCountries', stats.uniqueCountries);
}

function animateNumber(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    const startValue = parseInt(element.textContent) || 0;
    const duration = 1000;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.round(startValue + (targetValue - startValue) * easeProgress);
        element.textContent = currentValue.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

function getDeviceIcon(device) {
    switch (device) {
        case 'Mobile': return 'fas fa-mobile-alt';
        case 'Tablet': return 'fas fa-tablet-alt';
        case 'Desktop': return 'fas fa-desktop';
        default: return 'fas fa-question';
    }
}

function renderTable(entries) {
    const tbody = document.getElementById('visitorsTableBody');
    const emptyState = document.getElementById('emptyState');
    const tableContainer = document.querySelector('.table-container');
    const displayedCount = document.getElementById('displayedCount');

    if (entries.length === 0) {
        tableContainer.style.display = 'none';
        if (emptyState) emptyState.classList.add('show');
        displayedCount.textContent = 'Showing 0 entries';
        return;
    }

    tableContainer.style.display = 'block';
    if (emptyState) emptyState.classList.remove('show');
    displayedCount.textContent = `Showing ${entries.length} entr${entries.length !== 1 ? 'y' : 'ies'}`;

    const sortedEntries = [...entries].sort((a, b) => b.timestamp - a.timestamp);

    tbody.innerHTML = sortedEntries.map((entry, index) => `
        <tr>
            <td>${index + 1}</td>
            <td class="ip-cell">${entry.ip || 'Unknown'}</td>
            <td class="country-cell">
                <span class="country-flag">${countryToFlag(entry.countryCode)}</span>
                ${entry.country || 'Unknown'}
            </td>
            <td>
                <span class="device-badge">
                    <i class="${getDeviceIcon(entry.device)}"></i>
                    ${entry.device || 'Unknown'}
                </span>
            </td>
            <td class="location-cell">${entry.region || ''} ${entry.city ? `• ${entry.city}` : ''}</td>
            <td class="time-cell">${formatDate(entry.timestamp)}</td>
        </tr>
    `).join('');
}

function populateCountryFilter(entries) {
    const select = document.getElementById('countryFilter');
    if (!select) return;
    const countries = getUniqueCountries(entries);
    const currentValue = select.value;
    select.innerHTML = '<option value="">All Countries</option>';

    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.code;
        option.textContent = `${countryToFlag(country.code)} ${country.name}`;
        select.appendChild(option);
    });

    select.value = currentValue;
}

function updateLastUpdated() {
    const element = document.getElementById('lastUpdated');
    if (element) {
        const now = new Date();
        element.textContent = `Last updated: ${now.toLocaleTimeString()}`;
    }
}

// ==================== FILTERING ====================

function filterEntries(entries, searchTerm, countryCode) {
    return entries.filter(entry => {
        if (countryCode && entry.countryCode !== countryCode) {
            return false;
        }

        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            const searchFields = [
                entry.ip,
                entry.country,
                entry.city,
                entry.region,
                entry.device
            ].filter(Boolean).join(' ').toLowerCase();

            if (!searchFields.includes(search)) {
                return false;
            }
        }

        return true;
    });
}

// ==================== EXPORT ====================

function exportToCSV(entries) {
    if (entries.length === 0) {
        alert('No data to export');
        return;
    }

    const headers = ['#', 'IP Address', 'Country', 'Country Code', 'Device', 'Region', 'City', 'Visit Time', 'Is New Session'];
    const rows = entries.map((e, i) => [
        i + 1,
        e.ip || '',
        e.country || '',
        e.countryCode || '',
        e.device || '',
        e.region || '',
        e.city || '',
        new Date(e.timestamp).toISOString(),
        e.isNewSession ? 'Yes' : 'No'
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `analytics_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

// ==================== MAIN CONTROLLER ====================

async function refreshData() {
    const searchTermInput = document.getElementById('searchInput');
    const countryFilterSelect = document.getElementById('countryFilter');

    const searchTerm = searchTermInput ? searchTermInput.value : '';
    const countryCode = countryFilterSelect ? countryFilterSelect.value : '';

    // Show loading state if needed

    const allEntries = await getVisitors();
    const filteredEntries = filterEntries(allEntries, searchTerm, countryCode);

    const stats = calculateStats(allEntries);
    updateStats(stats);

    renderTable(filteredEntries);
    populateCountryFilter(allEntries);
    updateLastUpdated();
}

// ==================== EVENT LISTENERS ====================

document.addEventListener('DOMContentLoaded', () => {
    refreshData();

    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            refreshBtn.style.transform = 'rotate(360deg)';
            setTimeout(() => { refreshBtn.style.transform = ''; }, 300);
            refreshData();
        });
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(refreshData, 300);
        });
    }

    const countryFilter = document.getElementById('countryFilter');
    if (countryFilter) {
        countryFilter.addEventListener('change', refreshData);
    }

    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            getVisitors().then(allEntries => exportToCSV(allEntries));
        });
    }

    setInterval(refreshData, 30000);
});
