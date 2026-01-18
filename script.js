// 🔽 ВСТАВТЕ СЮДИ ВАШЕ ПОСИЛАННЯ З GOOGLE SHEETS (має бути CSV!)
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vREIsxYDJr1yAx9rYNzgRDdnfHTS6DWTVZcHo6BErGjCn5EmK1ydOxzbzLbSaWDuriGh6M6xdFXx0pE/pub?output=csv';

let data = [];

// Завантаження даних при старті
document.addEventListener('DOMContentLoaded', () => {
    fetch(SHEET_URL)
        .then(res => res.text())
        .then(csvText => {
            data = csvToJSON(csvText); // Конвертуємо CSV у зручний формат
            populateTable(data);
            populateRegions(data);
        })
        .catch(err => console.error("Помилка завантаження таблиці:", err));
});

// --- Основна логіка відображення ---

function populateTable(rows) {
    const tbody = document.querySelector("#tzkTable tbody");
    tbody.innerHTML = "";
    const query = document.getElementById("search").value.toLowerCase();

    // Якщо нічого не знайдено
    if (rows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Нічого не знайдено або помилка завантаження</td></tr>';
        return;
    }

    rows.forEach((row, i) => {
        // Формуємо блок контактів
        let contactsHtml = "";
        if (row.address) contactsHtml += `📍 ${highlight(row.address, query)}<br>`;
        if (row.phone) contactsHtml += `📞 ${highlight(row.phone, query)}<br>`;
        if (row.email) contactsHtml += `📧 ${highlight(row.email, query)}`;

        const nameHighlighted = highlight(row.name, query);
        const regionHighlighted = highlight(row.region, query);

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td data-label="№">${i + 1}</td>
            <td data-label="Назва ТЦК"><strong>${nameHighlighted}</strong></td>
            <td data-label="Контакти">${contactsHtml}</td>
            <td data-label="Область">${regionHighlighted}</td>
        `;
        tbody.appendChild(tr);
    });
}

// --- Допоміжні функції ---

// Парсер CSV (перетворює текст таблиці на об'єкти)
function csvToJSON(csvText) {
    const lines = csvText.trim().split('\n');
    const result = [];
    
    // Пропускаємо заголовок (i = 1)
    for (let i = 1; i < lines.length; i++) {
        // Розбиваємо рядок по комаз, враховуючи лапки (простий варіант)
        // Якщо у вас у клітинках є коми, Excel автоматично бере текст у лапки "..."
        const row = parseCSVLine(lines[i]);
        
        // Мапимо колонки (ЗАЛЕЖИТЬ ВІД ПОРЯДКУ В GOOGLE SHEETS!)
        // 0=Назва, 1=Область, 2=Адреса, 3=Телефон, 4=Email
        if (row.length >= 2) { 
            result.push({
                name: row[0] || "",
                region: row[1] || "",
                address: row[2] || "",
                phone: row[3] || "",
                email: row[4] || ""
            });
        }
    }
    return result;
}

// Правильний розбір рядка CSV, що враховує лапки
function parseCSVLine(text) {
    let result = [];
    let cell = '';
    let quote = false;
    
    for (let i = 0; i < text.length; i++) {
        let char = text[i];
        if (char === '"') {
            quote = !quote; // Перемикач лапок
        } else if (char === ',' && !quote) {
            result.push(cell); // Кінець клітинки
            cell = '';
        } else {
            cell += char; // Додаємо символ
        }
    }
    result.push(cell);
    return result.map(c => c.trim().replace(/^"|"$/g, '')); // Чистимо зайві пробіли і лапки
}

function highlight(text, query) {
    if (!query || !text) return text;
    // Екрануємо спецсимволи для безпеки regex
    const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${safeQuery})`, "gi");
    return text.replace(regex, "<mark>$1</mark>");
}

function populateRegions(rows) {
    const regions = [...new Set(rows.map(r => r.region).filter(r => r))].sort();
    const select = document.getElementById("regionFilter");
    // Очищаємо старі (крім першого "Всі області")
    select.innerHTML = '<option value="">Всі області</option>';
    
    regions.forEach(region => {
        const option = document.createElement("option");
        option.value = region;
        option.textContent = region;
        select.appendChild(option);
    });
}

// Пошук
document.getElementById("search").addEventListener("input", filterData);
document.getElementById("regionFilter").addEventListener("change", filterData);

function filterData() {
    const searchVal = document.getElementById("search").value.toLowerCase();
    const regionVal = document.getElementById("regionFilter").value;

    const filtered = data.filter(r => {
        const matchesSearch = (r.name + r.email + r.phone + r.address).toLowerCase().includes(searchVal);
        const matchesRegion = regionVal ? r.region === regionVal : true;
        return matchesSearch && matchesRegion;
    });
    
    populateTable(filtered);
}

// Тема
function toggleTheme() {
    document.body.classList.toggle("dark");
    // Можна зберегти вибір користувача
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
}

// Перевірка збереженої теми
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
}

function exportCSV() {
    let csvContent = "№,Назва ТЦК,Область,Адреса,Телефон,Email\n";
    
    data.forEach((row, i) => {
        // Екрануємо коми, щоб CSV не поламався
        const safe = (txt) => `"${(txt || "").replace(/"/g, '""')}"`;
        
        csvContent += `${i + 1},${safe(row.name)},${safe(row.region)},${safe(row.address)},${safe(row.phone)},${safe(row.email)}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "tzk_export.csv";
    link.click();
}
