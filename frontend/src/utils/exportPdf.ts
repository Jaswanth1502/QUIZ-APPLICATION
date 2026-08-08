import jsPDF from 'jspdf';

export type UserAnalyticsForPdf = {
  fullName: string;
  username: string;
  email: string;
  status: string;
  totalAttempts: number;
  passRate: number;
  averageScore: number;
  passedAttempts: number;
  failedAttempts: number;
  quizBreakdown: Array<{
    quizTitle: string;
    attempts: number;
    avgScore: number;
    passed: number;
    failed: number;
  }>;
  recentAttempts: Array<{
    attemptId: number;
    quizTitle: string;
    percentage: number;
    score: number;
    maximumScore: number;
    correctAnswers: number;
    totalQuestions: number;
    status: string;
    submittedAt: string;
    timeTakenSeconds: number;
  }>;
};

export function exportUserAnalyticsPdf(analytics: UserAnalyticsForPdf) {
  try {
    const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // 1. Header Banner — Emerald Oasis Deep Forest Dark
    doc.setFillColor(24, 28, 27); // #181c1b
    doc.rect(0, 0, pageWidth, 70, 'F');

    // Gold accent bar
    doc.setFillColor(212, 175, 55); // #D4AF37
    doc.rect(0, 70, pageWidth, 4, 'F');

    // Brand title & Header text
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('QuizForge', 40, 42);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(208, 229, 214);
    doc.text('Academic Performance & Participant Analytics Report', 145, 42);

    let y = 95;

    // 2. Participant Metadata Box
    doc.setDrawColor(208, 197, 175);
    doc.setFillColor(247, 250, 248);
    doc.rect(40, y, pageWidth - 80, 55, 'FD');

    doc.setTextColor(24, 28, 27);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    const nameText = String(analytics.fullName || analytics.username || 'User');
    doc.text(nameText, 55, y + 25);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(77, 70, 53);
    const metaText = `Username: @${String(analytics.username || '')}   |   Email: ${String(
      analytics.email || ''
    )}   |   Status: ${String(analytics.status || 'ACTIVE')}`;
    doc.text(metaText, 55, y + 42);

    y += 75;

    // 3. Metric Summary Cards (4 Cards)
    const cardWidth = (pageWidth - 80 - 30) / 4;
    const metrics = [
      { label: 'TOTAL ATTEMPTS', value: `${analytics.totalAttempts || 0}` },
      { label: 'PASS RATE', value: `${analytics.passRate || 0}%` },
      { label: 'AVERAGE SCORE', value: `${analytics.averageScore || 0}%` },
      { label: 'PASSED / FAILED', value: `${analytics.passedAttempts || 0} P / ${analytics.failedAttempts || 0} F` },
    ];

    metrics.forEach((m, i) => {
      const x = 40 + i * (cardWidth + 10);
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(208, 197, 175);
      doc.rect(x, y, cardWidth, 50, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(91, 117, 100);
      doc.text(m.label, x + 10, y + 18);

      doc.setFontSize(13);
      doc.setTextColor(24, 28, 27);
      doc.text(m.value, x + 10, y + 38);
    });

    y += 70;

    // 4. Quiz Performance Breakdown Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(24, 28, 27);
    doc.text('Quiz Performance & Score Distribution', 40, y);
    y += 15;

    if (analytics.quizBreakdown && analytics.quizBreakdown.length) {
      analytics.quizBreakdown.forEach(qb => {
        if (y > pageHeight - 60) {
          doc.addPage();
          y = 40;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(24, 28, 27);
        doc.text(String(qb.quizTitle || 'Quiz'), 40, y);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(115, 92, 0);
        const qbStats = `${qb.avgScore}% avg (${qb.attempts} attempt${qb.attempts > 1 ? 's' : ''})`;
        doc.text(qbStats, pageWidth - 40, y, { align: 'right' });

        y += 6;
        doc.setFillColor(224, 227, 225);
        doc.rect(40, y, pageWidth - 80, 6, 'F');
        const scoreVal = Number(qb.avgScore) || 0;
        const barW = Math.max(0, Math.min(1, scoreVal / 100)) * (pageWidth - 80);
        if (barW > 0) {
          doc.setFillColor(212, 175, 55);
          doc.rect(40, y, barW, 6, 'F');
        }

        y += 18;
      });
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('No quiz attempts recorded.', 40, y);
      y += 20;
    }

    y += 20;

    // 5. Recent Attempts Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(24, 28, 27);
    doc.text('Recent Quiz Attempts Roster', 40, y);
    y += 15;

    // Table Headers
    doc.setFillColor(235, 239, 237);
    doc.rect(40, y, pageWidth - 80, 22, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(77, 70, 53);
    doc.text('QUIZ TITLE', 50, y + 14);
    doc.text('SCORE %', 240, y + 14);
    doc.text('CORRECT', 320, y + 14);
    doc.text('TIME TAKEN', 410, y + 14);
    doc.text('RESULT STATUS', 500, y + 14);

    y += 22;

    if (analytics.recentAttempts && analytics.recentAttempts.length) {
      analytics.recentAttempts.forEach(att => {
        if (y > pageHeight - 60) {
          doc.addPage();
          y = 40;
        }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(24, 28, 27);
        doc.text(String(att.quizTitle || 'Quiz'), 50, y + 14);

        doc.setFont('helvetica', 'bold');
        doc.text(`${Number(att.percentage || 0).toFixed(1)}%`, 240, y + 14);

        doc.setFont('helvetica', 'normal');
        doc.text(`${att.correctAnswers || 0} / ${att.totalQuestions || 0}`, 320, y + 14);

        const mins = Math.floor((att.timeTakenSeconds || 0) / 60);
        const secs = (att.timeTakenSeconds || 0) % 60;
        doc.text(`${mins}m ${secs}s`, 410, y + 14);

        if (att.status === 'PASS') {
          doc.setTextColor(54, 76, 62);
        } else {
          doc.setTextColor(138, 46, 46);
        }
        doc.setFont('helvetica', 'bold');
        doc.text(String(att.status || 'COMPLETED'), 500, y + 14);

        y += 20;
        doc.setDrawColor(230, 233, 231);
        doc.line(40, y, pageWidth - 40, y);
      });
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('No recent attempt history available.', 50, y + 14);
    }

    // 6. Footer page numbers (safe getNumberOfPages API)
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);
      doc.text(`Generated — QuizForge Academic Systems`, 40, pageHeight - 20);
      doc.text(`Page ${p} of ${totalPages}`, pageWidth - 40, pageHeight - 20, {
        align: 'right',
      });
    }

    const fileName = `${String(analytics.username || 'user')}_analytics_report.pdf`;
    doc.save(fileName);
  } catch (err) {
    console.error('PDF generation error:', err);
    // Fallback: Open printable window report
    openPrintableUserReport(analytics);
  }
}

export function openPrintableUserReport(analytics: UserAnalyticsForPdf) {
  const win = window.open('', '_blank');
  if (!win) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${analytics.username} - Performance Report</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #181c1b; margin: 30px; }
          .header { background: #181c1b; color: #fff; padding: 20px; border-bottom: 4px solid #D4AF37; }
          .header h1 { margin: 0; font-size: 24px; }
          .meta { background: #f7faf8; border: 1px solid #d0c5af; padding: 15px; margin: 20px 0; }
          .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
          .card { border: 1px solid #d0c5af; padding: 15px; background: #fff; }
          .card-title { font-size: 11px; font-weight: bold; color: #5B7564; text-transform: uppercase; }
          .card-val { font-size: 24px; font-weight: bold; margin-top: 5px; color: #181c1b; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #e0e3e1; padding: 10px; text-align: left; font-size: 12px; }
          th { background: #ebefed; font-size: 11px; text-transform: uppercase; color: #4d4635; }
          .pass { color: #364c3e; font-weight: bold; }
          .fail { color: #8A2E2E; font-weight: bold; }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>QuizForge Academic Report</h1>
          <p style="margin: 5px 0 0 0; color: #d0e9d6; font-size: 12px;">Participant Analytics & Performance Record</p>
        </div>

        <div class="meta">
          <h2>${analytics.fullName || analytics.username}</h2>
          <p>Username: @${analytics.username} | Email: ${analytics.email} | Status: ${analytics.status}</p>
        </div>

        <div class="grid">
          <div class="card"><div class="card-title">Total Attempts</div><div class="card-val">${analytics.totalAttempts}</div></div>
          <div class="card"><div class="card-title">Pass Rate</div><div class="card-val">${analytics.passRate}%</div></div>
          <div class="card"><div class="card-title">Average Score</div><div class="card-val">${analytics.averageScore}%</div></div>
          <div class="card"><div class="card-title">Passed / Failed</div><div class="card-val">${analytics.passedAttempts} P / ${analytics.failedAttempts} F</div></div>
        </div>

        <h3>Quiz Performance Breakdown</h3>
        <table>
          <thead><tr><th>Quiz Title</th><th>Attempts</th><th>Average Score</th><th>Status</th></tr></thead>
          <tbody>
            ${analytics.quizBreakdown.map(q => `
              <tr>
                <td>${q.quizTitle}</td>
                <td>${q.attempts}</td>
                <td>${q.avgScore}%</td>
                <td>${q.avgScore >= 70 ? '<span class="pass">HIGH</span>' : '<span class="fail">REVIEW</span>'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3>Recent Quiz Attempts</h3>
        <table>
          <thead><tr><th>Quiz Title</th><th>Score %</th><th>Correct</th><th>Time Taken</th><th>Result</th></tr></thead>
          <tbody>
            ${analytics.recentAttempts.map(a => `
              <tr>
                <td>${a.quizTitle}</td>
                <td>${Number(a.percentage).toFixed(1)}%</td>
                <td>${a.correctAnswers} / ${a.totalQuestions}</td>
                <td>${Math.floor((a.timeTakenSeconds || 0) / 60)}m ${(a.timeTakenSeconds || 0) % 60}s</td>
                <td class="${a.status === 'PASS' ? 'pass' : 'fail'}">${a.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
    </html>
  `;

  win.document.write(html);
  win.document.close();
}
