let threatChart, sourceChart;
let activeTab = 'pending';  // Default start tab

function updateTimestamp() {
    const now = new Date();
    document.getElementById('timestamp').innerText = now.toLocaleString();
}

function fetchThreats() {
    fetch("/data")
        .then(res => res.json())
        .then(data => {
            const tbody = document.querySelector("tbody");
            tbody.innerHTML = "";

            const sourceCount = {};
            const typeCount = {};
            let threatCount = 0;

            data.forEach(t => {
                const threatStatus = t[6];

                // Count Threats
                if (threatStatus === 'confirmed') {
                    threatCount++;
                }

                // Tab filtering
                if (activeTab && activeTab !== threatStatus) {
                    return;
                }

                const row = document.createElement("tr");
                row.className = "status-" + t[6];

                row.innerHTML = `
                    <td>${t[1]}</td>
                    <td>${t[2]}</td>
                    <td>${t[3]}</td>
                    <td>${t[4]}</td>
                    <td>${t[5]}</td>
                    <td>${t[6]}</td>
                    <td>${t[8]}</td>
                    <td>${t[7]}</td>
                    <td>
                        <button onclick="markThreat(${t[0]}, 'confirmed')">✔️ Threat</button>
                        <button onclick="markThreat(${t[0]}, 'safe')">❌ Safe</button>
                    </td>
                `;

                tbody.appendChild(row);

                sourceCount[t[2]] = (sourceCount[t[2]] || 0) + 1;
                typeCount[t[3]] = (typeCount[t[3]] || 0) + 1;
            });

            updateGraphs(sourceCount, typeCount);
            updateThreatTab(threatCount);
        });
}

function markThreat(id, status) {
    fetch("/update_status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id, status: status })
    }).then(() => {
        fetchThreats();
    });
}

function updateGraphs(sourceData, typeData) {
    if (threatChart) threatChart.destroy();
    if (sourceChart) sourceChart.destroy();

    const ctx1 = document.getElementById('threatChart').getContext('2d');
    const ctx2 = document.getElementById('sourceChart').getContext('2d');

    threatChart = new Chart(ctx1, {
        type: 'pie',
        data: {
            labels: Object.keys(typeData),
            datasets: [{
                data: Object.values(typeData),
                backgroundColor: ['#ff1744', '#00c853', '#ffab00', '#00bcd4', '#f50057']
            }]
        }
    });

    sourceChart = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: Object.keys(sourceData),
            datasets: [{
                label: 'Threats by Source',
                data: Object.values(sourceData),
                backgroundColor: '#00bcd4'
            }]
        }
    });
}

function setTab(tab) {
    activeTab = tab;

    document.querySelectorAll(".tab").forEach(btn => btn.classList.remove('active'));
    document.getElementById('tab-' + (tab === 'confirmed' ? 'threats' : tab)).classList.add('active');

    fetchThreats();
}

function updateThreatTab(count) {
    const threatTab = document.getElementById('tab-threats');
    if (count > 0) {
        threatTab.innerText = `Threats (${count})`;
        threatTab.classList.add('red-alert');
    } else {
        threatTab.innerText = 'Threats';
        threatTab.classList.remove('red-alert');
    }
}

setInterval(updateTimestamp, 1000);
setInterval(fetchThreats, 10000);
window.onload = () => {
    updateTimestamp();
    fetchThreats();
};
