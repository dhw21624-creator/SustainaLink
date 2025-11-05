// Core SPA state and routing
(function() {
  const appEl = document.getElementById('app');
  const langBtn = document.getElementById('langToggle');
  const logoutBtn = document.getElementById('logoutBtn');

  const state = {
    user: null,
    role: null,
    scores: mockData.loadScores(),
    rankingMode: 'weekly',
  };

  // Language toggle
  langBtn.addEventListener('click', () => {
    const next = i18n.lang === 'en' ? 'zh' : 'en';
    i18n.setLanguage(next);
    renderRoute();
  });

  logoutBtn.addEventListener('click', () => {
    state.user = null;
    state.role = null;
    logoutBtn.style.display = 'none';
    location.hash = '#/login';
  });

  // Helpers
  function mount(html) { appEl.innerHTML = html; }
  function ensureLogoutVisible() { logoutBtn.style.display = state.user ? 'inline-block' : 'none'; }
  function points(userId) { return state.scores[userId] || 0; }
  function setPoints(userId, pts) { state.scores[userId] = pts; localStorage.setItem('scores', JSON.stringify(state.scores)); }
  function addPoints(userId, pts) { const v = mockData.addPoints(userId, pts); state.scores = mockData.loadScores(); return v; }

  function routeGuard(target) {
    if (!state.user && target !== 'login') {
      location.hash = '#/login';
      return false;
    }
    return true;
  }

  // Pages
  function renderLogin() {
    i18n.setLanguage(i18n.lang); // refresh header/footer text
    const t = i18n.t;
    mount(`
      <div class="grid grid-2">
        <section class="card">
          <div class="card-title">${t('title')}</div>
          <div class="muted">West Kowloon campus • Mock prototype</div>
        </section>
        <section class="card">
          <div class="card-title">${t('login')}</div>
          <div style="display:grid; gap:10px; margin-top:8px">
            <label>
              <span>${t('userId')}</span>
              <input id="loginId" class="input" placeholder="e.g. S001" />
            </label>
            <label>
              <span>${t('role')}</span>
              <select id="loginRole">
                <option value="student">${t('student')}</option>
                <option value="staff">${t('staff')}</option>
                <option value="admin">${t('admin')}</option>
              </select>
            </label>
            <button id="loginBtn" class="btn">${t('login')}</button>
            <div class="muted">Example IDs: S001, S002, S003, T010, A001</div>
          </div>
        </section>
      </div>
    `);

    document.getElementById('loginBtn').addEventListener('click', () => {
      const id = document.getElementById('loginId').value.trim();
      const roleSel = document.getElementById('loginRole').value;
      const user = mockData.getUserById(id);
      if (!user || user.role !== roleSel) {
        alert('Invalid ID or role selection.');
        return;
      }
      state.user = user;
      state.role = roleSel;
      ensureLogoutVisible();
      if (roleSel === 'student') location.hash = '#/student';
      else if (roleSel === 'staff') location.hash = '#/staff';
      else location.hash = '#/admin';
    });
  }

  function renderStudent() {
    const t = i18n.t;
    const score = points(state.user.id);
    mount(`
      <div class="grid grid-2">
        <section class="card">
          <div class="card-title">${t('points')}</div>
          <div style="font-size:32px; font-weight:800; color:var(--green-600)">${score}</div>
          <div class="icon-row">🏆 <span class="badge">${t('ecoHero')}</span> <span class="badge">${t('plasticMaster')}</span></div>
        </section>
        <section class="card">
          <div class="card-title">${t('weeklyProgress')}</div>
          <div class="chart-container"><canvas id="weeklyChart"></canvas></div>
        </section>
      </div>

      <div class="grid grid-2" style="margin-top:16px">
        <section class="card">
          <button id="startChallenge" class="btn">${t('startChallenge')} ⚡</button>
        </section>
        <section class="card">
          <div class="card-title">${t('topLeaderboard')}</div>
          <div class="list" id="lbList"></div>
        </section>
      </div>
    `);

    // Chart: weekly progress (mock)
    const ctx = document.getElementById('weeklyChart');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
        datasets: [{
          label: t('points'),
          data: [10, 20, 25, 40, 50, 55, score % 80],
          borderColor: '#1e88e5',
          backgroundColor: 'rgba(30,136,229,0.2)',
          tension: 0.3,
        }]
      },
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });

    // Leaderboard top 5
    const listEl = document.getElementById('lbList');
    mockData.leaderboardIndividual.slice(0,5).forEach(item => {
      const div = document.createElement('div');
      div.className = 'list-item';
      div.innerHTML = `<span class="rank">#${item.rank}</span><span class="name">${item.name}</span><span class="points">${item.points}</span>`;
      listEl.appendChild(div);
    });

    document.getElementById('startChallenge').addEventListener('click', () => {
      location.hash = '#/quiz';
    });
  }

  function renderQuiz() {
    const t = i18n.t;
    const detected = { item: 'Plastic Bottle', confidence: 82 };
    mount(`
      <div class="grid grid-2">
        <section class="card">
          <div class="card-title">${t('uploadPhoto')} ♻️</div>
          <input type="file" accept="image/*" class="input" />
          <div style="margin-top:10px" class="muted">${t('aiDetected')}: ${detected.item} (${t('confidence')}: ${detected.confidence}%)</div>
        </section>
        <section class="card">
          <div class="card-title">${t('quiz')} 🧠</div>
          <div style="display:grid; gap:12px">
            <div>
              <div style="font-weight:600">${t('whichCategory')}</div>
              <div class="tabs">
                <button class="tab" data-q1="Paper">${t('categoryPaper')}</button>
                <button class="tab" data-q1="Plastic">${t('categoryPlastic')}</button>
                <button class="tab" data-q1="Metal">${t('categoryMetal')}</button>
              </div>
            </div>
            <div>
              <div style="font-weight:600">${t('isRecyclable')}</div>
              <div class="tabs">
                <button class="tab" data-q2="Yes">${t('yes')}</button>
                <button class="tab" data-q2="No">${t('no')}</button>
              </div>
            </div>
            <div style="display:flex; gap:10px">
              <button id="submitQuiz" class="btn blue">Submit</button>
              <button id="tapRfid" class="btn">${t('tapRfid')} 📶</button>
              <button id="backDash" class="btn ghost-dark">${t('backToDashboard')}</button>
            </div>
            <div id="quizResult" class="success" aria-live="polite"></div>
          </div>
        </section>
      </div>
    `);

    let q1 = null, q2 = null;
    document.querySelectorAll('[data-q1]').forEach(btn => btn.addEventListener('click', () => {
      q1 = btn.dataset.q1; document.querySelectorAll('[data-q1]').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
    }));
    document.querySelectorAll('[data-q2]').forEach(btn => btn.addEventListener('click', () => {
      q2 = btn.dataset.q2; document.querySelectorAll('[data-q2]').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
    }));

    document.getElementById('submitQuiz').addEventListener('click', () => {
      const correct1 = (q1 === 'Plastic');
      const correct2 = (q2 === 'Yes');
      let gained = 0;
      if (correct1) gained += 5;
      if (correct2) gained += 5;
      if (gained > 0) {
        const total = addPoints(state.user.id, 10); // per spec: +10 upon correct answers
        document.getElementById('quizResult').textContent = `✔ +10 points! Total: ${total}`;
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      } else {
        document.getElementById('quizResult').textContent = `✖ Try again`;
      }
    });

    document.getElementById('tapRfid').addEventListener('click', () => {
      const total = addPoints(state.user.id, 5);
      document.getElementById('quizResult').textContent = `✔ RFID +5! Total: ${total}`;
    });

    document.getElementById('backDash').addEventListener('click', () => {
      location.hash = '#/student';
    });
  }

  function renderLeaderboard() {
    const t = i18n.t;
    mount(`
      <section class="card">
        <div class="tabs" id="scopeTabs">
          <button class="tab active" data-scope="individual">${t('tabsIndividual')}</button>
          <button class="tab" data-scope="class">${t('tabsClass')}</button>
          <button class="tab" data-scope="department">${t('tabsDepartment')}</button>
        </div>
        <div class="tabs" id="rankTabs">
          <button class="tab ${state.rankingMode==='daily'?'active':''}" data-mode="daily">${t('rankingDaily')}</button>
          <button class="tab ${state.rankingMode==='weekly'?'active':''}" data-mode="weekly">${t('rankingWeekly')}</button>
          <button class="tab ${state.rankingMode==='semester'?'active':''}" data-mode="semester">${t('rankingSemester')}</button>
        </div>
        <div class="list" id="leaderList"></div>
      </section>
    `);

    function renderList(scope) {
      const listEl = document.getElementById('leaderList');
      listEl.innerHTML = '';
      if (scope === 'individual') {
        mockData.leaderboardIndividual.forEach(item => {
          const div = document.createElement('div');
          div.className = 'list-item';
          div.innerHTML = `<span class="rank">#${item.rank}</span><span class="name">${item.name}</span><span class="muted">${item.department}</span><span class="points">${item.points} 🏆</span>`;
          listEl.appendChild(div);
        });
      } else if (scope === 'class') {
        mockData.classesClubs.forEach((c, i) => {
          const div = document.createElement('div');
          div.className = 'list-item';
          div.innerHTML = `<span class="rank">#${i+1}</span><span class="name">${c.name}</span><span class="points">${c.points} 🌱</span>`;
          listEl.appendChild(div);
        });
      } else {
        mockData.departmentParticipation
          .slice().sort((a,b)=>b.value-a.value).forEach((d, i) => {
          const div = document.createElement('div');
          div.className = 'list-item';
          div.innerHTML = `<span class="rank">#${i+1}</span><span class="name">${d.department}</span><span class="points">${d.value}% ⚡</span>`;
          listEl.appendChild(div);
        });
      }
    }

    let currentScope = 'individual';
    renderList(currentScope);
    document.querySelectorAll('#scopeTabs .tab').forEach(btn => btn.addEventListener('click', () => {
      document.querySelectorAll('#scopeTabs .tab').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      currentScope = btn.dataset.scope;
      renderList(currentScope);
    }));
    document.querySelectorAll('#rankTabs .tab').forEach(btn => btn.addEventListener('click', () => {
      document.querySelectorAll('#rankTabs .tab').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      state.rankingMode = btn.dataset.mode;
    }));
  }

  function renderStaff() {
    const t = i18n.t;
    mount(`
      <div class="grid grid-2">
        <section class="card">
          <div class="card-title">${t('deptParticipation')} 📈</div>
          <div class="chart-container"><canvas id="deptChart"></canvas></div>
        </section>
        <section class="card">
          <div class="card-title">${t('topContributors')} 🏆</div>
          <div class="list" id="classList"></div>
        </section>
      </div>
      <div class="grid grid-2" style="margin-top:16px">
        <section class="card">
          <div class="card-title">${t('createChallenge')} 🌱</div>
          <div style="display:grid; gap:8px">
            <input id="chName" class="input" placeholder="${t('challengeName')}" />
            <input id="chStart" type="date" class="input" placeholder="${t('startDate')}" />
            <input id="chEnd" type="date" class="input" placeholder="${t('endDate')}" />
            <input id="chReward" type="number" class="input" placeholder="${t('pointsReward')}" />
            <textarea id="chDesc" class="input" placeholder="${t('description')}"></textarea>
            <button id="createBtn" class="btn">${t('create')}</button>
            <div id="createMsg" class="success" aria-live="polite"></div>
          </div>
        </section>
        <section class="card">
          <div class="card-title">${t('energyTrends')} ⚡</div>
          <div class="chart-container"><canvas id="energyChart"></canvas></div>
        </section>
      </div>
    `);

    // Dept participation bar chart
    new Chart(document.getElementById('deptChart'), {
      type: 'bar',
      data: {
        labels: mockData.departmentParticipation.map(d => d.department),
        datasets: [{ label: '%', data: mockData.departmentParticipation.map(d => d.value), backgroundColor: '#43a047' }]
      },
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100 } } }
    });

    // Top classes/clubs list
    const listEl = document.getElementById('classList');
    mockData.classesClubs.forEach((c, i) => {
      const div = document.createElement('div');
      div.className = 'list-item';
      div.innerHTML = `<span class="rank">#${i+1}</span><span class="name">${c.name}</span><span class="points">${c.points}</span>`;
      listEl.appendChild(div);
    });

    // Energy usage line chart by floor
    new Chart(document.getElementById('energyChart'), {
      type: 'line',
      data: {
        labels: mockData.energy_usage.map(e => e.floor),
        datasets: [{ label: 'kWh', data: mockData.energy_usage.map(e => e.kWh), borderColor: '#1e88e5', backgroundColor: 'rgba(30,136,229,0.2)', tension: 0.3 }]
      },
      options: { plugins: { legend: { display: false } } }
    });

    document.getElementById('createBtn').addEventListener('click', () => {
      const name = document.getElementById('chName').value.trim();
      const reward = Number(document.getElementById('chReward').value || '0');
      if (!name) return alert('Please enter challenge name');
      document.getElementById('createMsg').textContent = `✔ Created: ${name} (+${reward} pts)`;
    });
  }

  function renderAdmin() {
    const t = i18n.t;
    mount(`
      <div class="grid grid-3">
        <section class="card"><div class="card-title">${t('totalUsers')}</div><div style="font-size:28px; font-weight:800">${mockData.iotStats.totalUsers}</div></section>
        <section class="card"><div class="card-title">${t('totalBins')}</div><div style="font-size:28px; font-weight:800">${mockData.iotStats.totalBins}</div></section>
        <section class="card"><div class="card-title">${t('activeIoT')}</div><div style="font-size:28px; font-weight:800">${mockData.iotStats.activeIoT}</div></section>
      </div>
      <div class="grid grid-3" style="margin-top:12px">
        <section class="card"><div class="card-title">${t('avgAccuracy')}</div><div style="font-size:28px; font-weight:800">${Math.round(mockData.iotStats.avgAccuracy*100)}%</div></section>
        <section class="card"><div class="card-title">${t('submissionsToday')}</div><div style="font-size:28px; font-weight:800">${mockData.iotStats.submissionsToday}</div></section>
        <section class="card">
          <button id="exportCsv" class="btn blue">${t('exportCsv')}</button>
        </section>
      </div>

      <section class="card" style="margin-top:16px">
        <div class="tabs">
          <button class="tab active" data-admin="users">${t('tabUserMgmt')}</button>
          <button class="tab" data-admin="ai">${t('tabAiLog')}</button>
          <button class="tab" data-admin="floor">${t('tabFloorReports')}</button>
        </div>
        <div id="adminBody"></div>
      </section>
    `);

    const adminBody = document.getElementById('adminBody');
    function renderUsers() {
      adminBody.innerHTML = `
        <div style="display:flex; gap:8px; margin-bottom:8px">
          <input id="newId" class="input" placeholder="ID" />
          <input id="newName" class="input" placeholder="Name" />
          <select id="newRole" class="input">
            <option value="student">${i18n.t('student')}</option>
            <option value="staff">${i18n.t('staff')}</option>
            <option value="admin">${i18n.t('admin')}</option>
          </select>
          <button id="addUser" class="btn">${i18n.t('addUser')}</button>
        </div>
        <div class="list" id="userList"></div>
      `;
      const listEl = document.getElementById('userList');
      listEl.innerHTML = '';
      mockData.users.forEach(u => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `<span class="name">${u.id} • ${u.name}</span><span class="muted">${u.role}</span>
          <span>
            <button class="tab" data-edit="${u.id}">${i18n.t('edit')}</button>
            <button class="tab" data-del="${u.id}">${i18n.t('delete')}</button>
          </span>`;
        listEl.appendChild(div);
      });
      document.getElementById('addUser').addEventListener('click', () => {
        const id = document.getElementById('newId').value.trim();
        const name = document.getElementById('newName').value.trim();
        const role = document.getElementById('newRole').value;
        if (!id || !name) return alert('Enter ID and Name');
        mockData.users.push({ id, role, name, department: 'Demo' });
        renderUsers();
      });
      listEl.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', () => {
        const id = btn.dataset.edit;
        const user = mockData.users.find(u=>u.id===id);
        const name = prompt('Edit name', user.name);
        if (name) { user.name = name; renderUsers(); }
      }));
      listEl.querySelectorAll('[data-del]').forEach(btn => btn.addEventListener('click', () => {
        const id = btn.dataset.del;
        const idx = mockData.users.findIndex(u=>u.id===id);
        if (idx>=0) { mockData.users.splice(idx,1); renderUsers(); }
      }));
    }

    function renderAiLog() {
      adminBody.innerHTML = `
        <div class="card-subtitle">AI detection accuracy = 85%</div>
        <div class="list">
          <div class="list-item">[12:01] S001 • Plastic Bottle • 82% confidence</div>
          <div class="list-item">[12:05] S002 • Paper Cup • 76% confidence</div>
          <div class="list-item">[12:10] S003 • Aluminum Can • 91% confidence</div>
        </div>
      `;
    }

    function renderFloorReports() {
      const csv = mockData.csvFloorReport();
      adminBody.innerHTML = `
        <div class="grid grid-3">
          <div class="card">
            <div class="card-title">UG/F</div>
            <div class="muted">Bins: 10 • Filled: 45% • Recycling: 120</div>
          </div>
          <div class="card">
            <div class="card-title">3/F</div>
            <div class="muted">Bins: 8 • Filled: 60% • Recycling: 170</div>
          </div>
          <div class="card">
            <div class="card-title">5/F</div>
            <div class="muted">Bins: 15 • Filled: 38% • Recycling: 110</div>
          </div>
        </div>
        <div style="margin-top:12px"><button id="downloadCsv" class="btn blue">${i18n.t('exportCsv')}</button></div>
      `;
      document.getElementById('downloadCsv').addEventListener('click', () => {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'floor_reports.csv'; a.click();
        URL.revokeObjectURL(url);
      });
    }

    // Tabs wiring
    function activate(name) {
      document.querySelectorAll('[data-admin]').forEach(b=>b.classList.remove('active'));
      document.querySelector(`[data-admin="${name}"]`).classList.add('active');
      if (name === 'users') renderUsers();
      if (name === 'ai') renderAiLog();
      if (name === 'floor') renderFloorReports();
    }
    activate('users');
    document.querySelectorAll('[data-admin]').forEach(btn => btn.addEventListener('click', ()=> activate(btn.dataset.admin)));

    document.getElementById('exportCsv').addEventListener('click', () => {
      const csv = mockData.csvFloorReport();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'admin_summary.csv'; a.click(); URL.revokeObjectURL(url);
    });
  }

  function renderEnergyWaste() {
    const t = i18n.t;
    mount(`
      <section class="card">
        <div class="card-title">${t('energyWasteDashboard')}</div>
        <div class="tabs">
          <button class="tab active" data-mode="waste">${t('modeWaste')}</button>
          <button class="tab" data-mode="energy">${t('modeEnergy')}</button>
        </div>
        <div class="grid grid-2">
          <div class="card">
            <div class="card-title">${t('wastePerFloor')} ♻️</div>
            <div class="chart-container"><canvas id="wasteBar"></canvas></div>
          </div>
          <div class="card">
            <div class="card-title">${t('electricityUsageDept')} ⚡</div>
            <div class="chart-container"><canvas id="energyPie"></canvas></div>
          </div>
        </div>
      </section>
    `);

    const wasteCtx = document.getElementById('wasteBar');
    const energyCtx = document.getElementById('energyPie');
    const wasteChart = new Chart(wasteCtx, {
      type: 'bar',
      data: {
        labels: mockData.floorsWaste.map(f => f.floor),
        datasets: [{ label: 'Items', data: mockData.floorsWaste.map(f => f.items), backgroundColor: '#66bb6a' }]
      },
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
    const energyChart = new Chart(energyCtx, {
      type: 'pie',
      data: {
        labels: mockData.electricityByDept.map(d => d.department),
        datasets: [{ data: mockData.electricityByDept.map(d => d.kWh), backgroundColor: ['#42a5f5','#1e88e5','#90caf9','#1565c0','#1976d2'] }]
      }
    });

    document.querySelectorAll('[data-mode]').forEach(btn => btn.addEventListener('click', () => {
      document.querySelectorAll('[data-mode]').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.dataset.mode;
      if (mode === 'waste') {
        wasteChart.data.datasets[0].backgroundColor = '#66bb6a';
        wasteChart.update();
      } else {
        wasteChart.data.datasets[0].backgroundColor = '#42a5f5';
        wasteChart.update();
      }
    }));
  }

  // Router
  function renderRoute() {
    ensureLogoutVisible();
    const hash = location.hash || '#/login';
    if (hash.startsWith('#/login')) return renderLogin();
    if (!routeGuard(hash.slice(2))) return;
    if (hash.startsWith('#/student')) return renderStudent();
    if (hash.startsWith('#/quiz')) return renderQuiz();
    if (hash.startsWith('#/leaderboard')) return renderLeaderboard();
    if (hash.startsWith('#/staff')) return renderStaff();
    if (hash.startsWith('#/admin')) return renderAdmin();
    if (hash.startsWith('#/energy')) return renderEnergyWaste();
    return renderLogin();
  }

  // Initial
  i18n.setLanguage(localStorage.getItem('lang') || 'en');
  ensureLogoutVisible();
  window.addEventListener('hashchange', renderRoute);
  renderRoute();
})();

