window.mockData = (function() {
  const users = [
    { id: 'S001', role: 'student', name: 'Alex Wong', department: 'Applied Science' },
    { id: 'S002', role: 'student', name: 'Jamie Lee', department: 'Design' },
    { id: 'S003', role: 'student', name: 'Ivy Chan', department: 'Engineering' },
    { id: 'T010', role: 'staff', name: 'Dr. Chan', department: 'Engineering' },
    { id: 'A001', role: 'admin', name: 'System Admin', department: 'Administration' },
  ];

  const leaderboardIndividual = [
    { rank: 1, name: 'Alex Wong', points: 1500, department: 'Applied Science' },
    { rank: 2, name: 'Jamie Lee', points: 1280, department: 'Design' },
    { rank: 3, name: 'Ivy Chan', points: 1135, department: 'Engineering' },
    { rank: 4, name: 'Tommy Ng', points: 900, department: 'Hotel & Tourism' },
    { rank: 5, name: 'Mandy Ho', points: 860, department: 'Nursing' },
  ];

  const classesClubs = [
    { name: 'ENG-101', points: 560 },
    { name: 'DES-220', points: 540 },
    { name: 'SCI-305', points: 500 },
    { name: 'Green Club', points: 470 },
    { name: 'AI Society', points: 420 },
  ];

  const departmentParticipation = [
    { department: 'Engineering', value: 78 },
    { department: 'Design', value: 65 },
    { department: 'Applied Science', value: 82 },
    { department: 'Business', value: 54 },
    { department: 'Nursing', value: 61 },
  ];

  const waste_records = [
    { user: 'S001', floor: '3/F', category: 'Plastic', points: 15 },
    { user: 'S002', floor: '5/F', category: 'Paper', points: 10 }
  ];

  const energy_usage = [
    { floor: '3/F', kWh: 120 },
    { floor: '5/F', kWh: 90 },
    { floor: '9/F', kWh: 45 }
  ];

  const electricityByDept = [
    { department: 'Engineering', kWh: 320 },
    { department: 'Design', kWh: 240 },
    { department: 'Applied Science', kWh: 180 },
    { department: 'Business', kWh: 120 },
    { department: 'Nursing', kWh: 160 },
  ];

  const floorsWaste = [
    { floor: 'UG/F', items: 40 },
    { floor: '2/F', items: 55 },
    { floor: '3/F', items: 72 },
    { floor: '5/F', items: 60 },
    { floor: '9/F', items: 38 },
    { floor: '14/F', items: 25 },
  ];

  const iotStats = { totalUsers: 1200, totalBins: 75, activeIoT: 52, avgAccuracy: 0.85, submissionsToday: 123 };

  function getUserById(id) {
    return users.find(u => u.id === id);
  }

  function defaultScores() {
    return {
      S001: 1200,
      S002: 980,
      S003: 640,
      T010: 300,
      A001: 0,
    };
  }

  function loadScores() {
    try {
      const raw = localStorage.getItem('scores');
      return raw ? JSON.parse(raw) : defaultScores();
    } catch {
      return defaultScores();
    }
  }

  function saveScores(scores) {
    localStorage.setItem('scores', JSON.stringify(scores));
  }

  function addPoints(userId, pts) {
    const scores = loadScores();
    scores[userId] = (scores[userId] || 0) + pts;
    saveScores(scores);
    return scores[userId];
  }

  function csvFloorReport() {
    const header = ['Floor', 'Bins', 'Filled Ratio', 'Recycling Count'];
    const rows = [
      ['UG/F', 10, '45%', 120],
      ['2/F', 12, '52%', 150],
      ['3/F', 8, '60%', 170],
      ['5/F', 15, '38%', 110],
      ['9/F', 11, '40%', 95],
      ['14/F', 9, '33%', 80],
    ];
    return [header, ...rows].map(r => r.join(',')).join('\n');
  }

  return {
    users,
    leaderboardIndividual,
    classesClubs,
    departmentParticipation,
    waste_records,
    energy_usage,
    electricityByDept,
    floorsWaste,
    iotStats,
    getUserById,
    loadScores,
    addPoints,
    csvFloorReport,
  };
})();

