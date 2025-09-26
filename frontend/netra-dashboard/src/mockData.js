// small mock dataset used by components — replace with API calls (axios) later
export const metrics = {
  activeThreats: 4,
  activeChange: 12, // percent
  iocsProcessed: 4,
  blockedIPs: 1,
  feedSources: 2
};

export const trendData = [
  { time: '07:56 PM', threatsDetected: 0, blockedAttacks: 0 },
  { time: '11:56 PM', threatsDetected: 0, blockedAttacks: 0 },
  { time: '03:56 AM', threatsDetected: 0, blockedAttacks: 1 },
  { time: '07:56 AM', threatsDetected: 0, blockedAttacks: 0 },
  { time: '11:56 AM', threatsDetected: 0, blockedAttacks: 0 },
  { time: '03:56 PM', threatsDetected: 4, blockedAttacks: 2 },
];

export const geoThreats = [
  { id: 't1', source: 'AbuseIPDB', severity: 'high', indicator: '192.168.1.100', geo: { latitude: 21.1458, longitude: 79.0882 } }, // Nagpur
  { id: 't2', source: 'VirusTotal', severity: 'critical', indicator: 'malware.example.com', geo: { latitude: 21.1460, longitude: 79.09 } }
];

export const topCauses = [
  { name: 'Malicious Email Attachments', percent: 34.2, color: 'red' },
  { name: 'Compromised Credentials', percent: 28.7, color: 'orange' },
  { name: 'Vulnerable Web Applications', percent: 18.4, color: 'blue' },
  { name: 'Insider Threats', percent: 10.3, color: 'purple' },
  { name: 'Supply Chain Attacks', percent: 8.4, color: 'pink' },
];

export const mitigations = [
  { title: 'Implement Email Security Gateway', detail: 'Deploy advanced email filtering to block malicious attachments and links', priority: 'High' },
  { title: 'Enforce MFA for All Accounts', detail: 'Multi-factor authentication reduces credential compromise risk', priority: 'Medium' },
  { title: 'Web Application Firewall', detail: 'Protect web applications from common attacks', priority: 'Medium' },
  { title: 'Security Awareness Training', detail: 'Regular training to help employees identify threats', priority: 'Low' },
];

export const recentThreats = [
  { id: 'r1', severity: 'high', indicator: '192.168.1.100', desc: 'Malicious IP attempting brute force attacks', source: 'AbuseIPDB', time: 'Just now' },
  { id: 'r2', severity: 'critical', indicator: 'malware.example.com', desc: 'Known C&C domain distributing malware', source: 'VirusTotal', time: 'Just now' },
  { id: 'r3', severity: 'medium', indicator: 'suspicious-site.net', desc: 'Phishing domain targeting local organizations', source: 'Threat Intelligence', time: 'Just now' },
  { id: 'r4', severity: 'low', indicator: '203.0.113.45', desc: 'Suspicious scanning activity detected', source: 'Internal', time: 'Just now' },
];

export const mitre = [
  { id: 'T1566', name: 'Phishing', count: 47 },
  { id: 'T1055', name: 'Process Injection', count: 23 },
  { id: 'T1078', name: 'Valid Accounts', count: 18 },
];
