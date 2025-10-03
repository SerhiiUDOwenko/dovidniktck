let data = [];

fetch('tzk.json')
  .then(res => res.json())
  .then(json => {
    data = json;
    populateTable(data);
    populateRegions(data);
  });

function populateTable(rows) {
  const tbody = document.querySelector("#tzkTable tbody");
  tbody.innerHTML = "";
  const query = document.getElementById("search").value.toLowerCase();

  rows.forEach((row, i) => {
    const name = highlight(row.name, query);
    const phone = highlight(row.phone, query);
    const email = highlight(row.email, query);
    const region = highlight(row.region, query);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td data-label="№">${i + 1}</td>
      <td data-label="Назва ТЦК">${name}</td>
      <td data-label="Телефон">${phone}</td>
      <td data-label="Email">${email}</td>
      <td data-label="Область">${region}</td>
    `;
    tbody.appendChild(tr);
  });
}

function highlight(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}

function populateRegions(rows) {
  const regions = [...new Set(rows.map(r => r.region))].sort();
  const select = document.getElementById("regionFilter");
  regions.forEach(region => {
    const option = document.createElement("option");
    option.value = region;
    option.textContent = region;
    select.appendChild(option);
  });
}

document.getElementById("search").addEventListener("input", () => {
  const val = document.getElementById("search").value.toLowerCase();
  const region = document.getElementById("regionFilter").value;
  const filtered = data.filter(r =>
    (r.name + r.email + r.phone).toLowerCase().includes(val) &&
    (region ? r.region === region : true)
  );
  populateTable(filtered);
});

document.getElementById("regionFilter").addEventListener("change", () => {
  const val = document.getElementById("regionFilter").value;
  const query = document.getElementById("search").value.toLowerCase();
  const filtered = data.filter(r =>
    (query ? (r.name + r.email + r.phone).toLowerCase().includes(query) : true) &&
    (val ? r.region === val : true)
  );
  populateTable(filtered);
});

function toggleTheme() {
  document.body.classList.toggle("dark");
}

function exportCSV() {
  let csv = "№,Назва ТЦК,Телефон,Email,Область\n";
  data.forEach((row, i) => {
    csv += `"${i + 1}","${row.name}","${row.phone}","${row.email}","${row.region}"\n`;
  });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "tzk.csv";
  link.click();
}
