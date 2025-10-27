(function(){
  const API = 'http://localhost:3000/api/admin/ph-sector-estimates';

  let charts = {};

  function el(id){ return document.getElementById(id); }

  function mkChart(elId, seriesName, labels, data){
    if (charts[elId]) { try{ charts[elId].destroy(); }catch(_){} }
    const node = document.querySelector('#' + elId);
    if (!labels.length){ node.innerHTML = '<div class="flex items-center justify-center h-80 text-sm text-base-content/60">No data available.</div>'; return; }
    const options = {
      chart: { type: 'bar', height: '100%', toolbar: { show: false } },
      series: [{ name: seriesName, data }],
      xaxis: { labels: { style: { colors: '#6b7280' } } },
      yaxis: {
        categories: labels,
        labels: {
          style: { colors: '#6b7280', fontSize: '11px' },
          formatter: (val) => typeof val === 'string' && val.length > 36 ? val.slice(0,36) + '…' : val
        }
      },
      plotOptions: { bar: { borderRadius: 6, barHeight: '70%', horizontal: true } },
      dataLabels: { enabled: false },
      colors: ['#22c55e'],
      grid: { borderColor: 'rgba(156,163,175,0.08)', padding: { top: 8, right: 8, bottom: 8, left: 160 } },
      tooltip: {
        x: { formatter: (val, opts) => (opts?.globals?.labels?.[opts?.dataPointIndex]) || val },
        y: { formatter: v => `${Number(v).toFixed(2)} kg CO₂e` }
      }
    };
    charts[elId] = new ApexCharts(node, options);
    charts[elId].render();
  }

  async function load(){
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '../../login.html'; return; }
    try {
      const amount = Number(el('amountInput')?.value || 500) || 500;
      const unit = (el('unitSelect')?.value || 'usd');
      const res = await fetch(`${API}?money=${encodeURIComponent(amount)}&unit=${encodeURIComponent(unit)}`, { headers: { Authorization: `Bearer ${token}` } });
      const payload = await res.json();
      if (!res.ok || payload.status !== 'success') throw new Error(payload.message || 'Failed');
      const list = payload.data.items || [];
      const missing = payload.data.missingActivities || [];
      const alertBox = document.getElementById('missingAlert');
      const alertText = document.getElementById('missingText');
      if (missing.length && alertBox && alertText) {
        alertText.textContent = `No data from Climatiq for: ${missing.join(', ')}`;
        alertBox.classList.remove('hidden');
      } else if (alertBox) {
        alertBox.classList.add('hidden');
      }

      const labels = list.map(x => x.label || x.id);
      const values = list.map(x => Number(x.co2e || 0));
      mkChart('sectorChart', 'kg CO₂e', labels, values);

      const tbody = el('sectorTableBody');
      if (!list.length){
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-base-content/60">No data</td></tr>';
      } else {
        tbody.innerHTML = list
          .map((x, i) => (
          `<tr>
            <td>${i+1}</td>
            <td title="${x.id}">${x.label || x.id}</td>
            <td>${Number(x.co2e||0).toFixed(2)}</td>
            <td>${x.co2e_unit || 'kg'}</td>
          </tr>`)).join('');
      }
    } catch (e) {
      console.error('Sector stats load error', e);
      document.querySelector('#sectorChart').innerHTML = '<div class="flex items-center justify-center h-80 text-sm text-error">Failed to load</div>';
      el('sectorTableBody').innerHTML = '<tr><td colspan="4" class="text-center text-error">Failed to load</td></tr>';
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    load();
    const btn = document.getElementById('btnRefresh');
    if (btn) btn.addEventListener('click', load);
    const unitSel = document.getElementById('unitSelect');
    if (unitSel) unitSel.addEventListener('change', load);
    const amountInp = document.getElementById('amountInput');
    if (amountInp) amountInp.addEventListener('change', load);
  });
})();
