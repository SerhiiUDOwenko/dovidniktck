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
  rows.forEach((row, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td data-label="№">${i + 1}</td>
      <td data-label="Назва ТЦК">${row.name}</td>
      <td data-label="Телефон, Email">${row.phone} ${row.email}</td>
      <td data-label="Область">${row.region}</td>
    `;
    tbody.appendChild(tr);
  });
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

document.getElementById("search").addEventListener("input", e => {
  const val = e.target.value.toLowerCase();
  const filtered = data.filter(r =>
    r.name.toLowerCase().includes(val) ||
    r.email.toLowerCase().includes(val) ||
    r.phone.toLowerCase().includes(val)
  );
  populateTable(filtered);
});

document.getElementById("regionFilter").addEventListener("change", e => {
  const val = e.target.value;
  const filtered = val ? data.filter(r => r.region === val) : data;
  populateTable(filtered);
});
