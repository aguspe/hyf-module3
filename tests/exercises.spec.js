const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

// ── Exercise 1: Plan vs Strategy ─────────────────────────────────────────────
test.describe('Exercise 1 — Plan vs Strategy', () => {
  test('shows warning when nothing selected', async ({ page }) => {
    await page.click('button:has-text("Submit"):near(#ex1)');
    // Should show feedback with 0/8 or still show without crashing
    const fp = page.locator('#ex1-fp');
    await expect(fp).toBeVisible();
  });

  test('perfect score: all 8 correct answers', async ({ page }) => {
    const answers = { ex1q1: 'S', ex1q2: 'P', ex1q3: 'S', ex1q4: 'P', ex1q5: 'S', ex1q6: 'P', ex1q7: 'S', ex1q8: 'P' };
    for (const [name, val] of Object.entries(answers)) {
      await page.locator(`input[name="${name}"][value="${val}"]`).check();
    }
    await page.locator('#ex1 button.btn-submit').click();
    await expect(page.locator('#ex1-fp')).toContainText('Perfect');
    await expect(page.locator('#ex1-badge')).toContainText('8/8');
  });

  test('wrong answer shows inline explanation', async ({ page }) => {
    // Q1 correct is S, select P (wrong)
    await page.locator('input[name="ex1q1"][value="P"]').check();
    await page.locator('#ex1 button.btn-submit').click();
    const expl = page.locator('#ex1-q1 .q-expl');
    await expect(expl).toBeVisible();
    await expect(expl).toHaveClass(/wrong/);
    await expect(expl).toContainText('Explanation');
  });

  test('correct answer shows green explanation', async ({ page }) => {
    await page.locator('input[name="ex1q1"][value="S"]').check();
    await page.locator('#ex1 button.btn-submit').click();
    const expl = page.locator('#ex1-q1 .q-expl');
    await expect(expl).toBeVisible();
    await expect(expl).toHaveClass(/ok/);
  });

  test('reset clears selections and explanations', async ({ page }) => {
    await page.locator('input[name="ex1q1"][value="S"]').check();
    await page.locator('#ex1 button.btn-submit').click();
    await expect(page.locator('#ex1-q1 .q-expl')).toBeVisible();
    await page.locator('#ex1 button.btn-reset').click();
    await expect(page.locator('#ex1-q1 .q-expl')).not.toBeVisible();
    await expect(page.locator('#ex1-fp')).not.toBeVisible();
  });
});

// ── Exercise 2: Test Levels ──────────────────────────────────────────────────
test.describe('Exercise 2 — Test Levels', () => {
  test('all correct answers: shows perfect score', async ({ page }) => {
    const answers = { ex2q1: 'Unit', ex2q2: 'Integration', ex2q3: 'System', ex2q4: 'Acceptance (UAT)', ex2q5: 'Integration', ex2q6: 'Unit' };
    for (const [id, val] of Object.entries(answers)) {
      await page.locator(`#${id}`).selectOption(val);
    }
    await page.locator('#ex2 button.btn-submit').click();
    await expect(page.locator('#ex2-fp')).toContainText('All correct');
    await expect(page.locator('#ex2-badge')).toContainText('6/6');
  });

  test('wrong answer shows inline explanation', async ({ page }) => {
    await page.locator('#ex2q1').selectOption('System'); // wrong (correct: Unit)
    await page.locator('#ex2 button.btn-submit').click();
    const expl = page.locator('#ex2-q1 .q-expl');
    await expect(expl).toBeVisible();
    await expect(expl).toHaveClass(/wrong/);
  });

  test('reset clears state', async ({ page }) => {
    await page.locator('#ex2q1').selectOption('Unit');
    await page.locator('#ex2 button.btn-submit').click();
    await page.locator('#ex2 button.btn-reset').click();
    await expect(page.locator('#ex2-fp')).not.toBeVisible();
    await expect(page.locator('#ex2-q1 .q-expl')).not.toBeVisible();
  });
});

// ── Exercise 3: Risk Scoring ─────────────────────────────────────────────────
test.describe('Exercise 3 — Risk Scoring', () => {
  test('auto-calculates score on input', async ({ page }) => {
    await page.locator('.risk-l[data-row="1"]').fill('4');
    await page.locator('.risk-i[data-row="1"]').fill('5');
    await page.locator('.risk-i[data-row="1"]').dispatchEvent('input');
    await expect(page.locator('#score1')).toHaveText('20');
  });

  test('submit with all fields shows suggested answers', async ({ page }) => {
    for (let i = 1; i <= 6; i++) {
      await page.locator(`.risk-l[data-row="${i}"]`).fill('3');
      await page.locator(`.risk-i[data-row="${i}"]`).fill('3');
      await page.locator(`.risk-i[data-row="${i}"]`).dispatchEvent('input');
      await page.locator(`#pri${i}`).selectOption('Medium');
    }
    await page.locator('#ex3 button.btn-submit').click();
    await expect(page.locator('#ex3-fp')).toBeVisible();
    await expect(page.locator('#ex3-fp')).toContainText('Suggested Answers');
    await expect(page.locator('#ex3-badge')).toContainText('Reviewed');
  });

  test('reset clears all inputs and scores', async ({ page }) => {
    await page.locator('.risk-l[data-row="1"]').fill('4');
    await page.locator('.risk-i[data-row="1"]').fill('5');
    await page.locator('.risk-i[data-row="1"]').dispatchEvent('input');
    await page.locator('#ex3 button.btn-reset').click();
    await expect(page.locator('#score1')).toHaveText('—');
  });
});

// ── Exercise 4: Test Plan Puzzle ─────────────────────────────────────────────
test.describe('Exercise 4 — Test Plan Puzzle', () => {
  test('all correct: perfect score with inline explanations', async ({ page }) => {
    const answers = {
      ex4q1: 'Objectives', ex4q2: 'Test Environments', ex4q3: 'Test Approach',
      ex4q4: 'Risk Analysis', ex4q5: 'Deliverables', ex4q6: 'Test Schedule',
      ex4q7: 'Scope', ex4q8: 'Roles & Responsibilities'
    };
    for (const [id, val] of Object.entries(answers)) {
      await page.locator(`#${id}`).selectOption(val);
    }
    await page.locator('#ex4 button.btn-submit').click();
    await expect(page.locator('#ex4-fp')).toContainText('Perfect');
    await expect(page.locator('#ex4-badge')).toContainText('8/8');
    await expect(page.locator('#ex4-q1 .q-expl')).toBeVisible();
    await expect(page.locator('#ex4-q1 .q-expl')).toHaveClass(/ok/);
  });

  test('wrong answer shows explanation with correct answer', async ({ page }) => {
    await page.locator('#ex4q1').selectOption('Scope'); // wrong
    await page.locator('#ex4 button.btn-submit').click();
    const expl = page.locator('#ex4-q1 .q-expl');
    await expect(expl).toBeVisible();
    await expect(expl).toHaveClass(/wrong/);
    await expect(expl).toContainText('Objectives');
  });

  test('reset clears state', async ({ page }) => {
    await page.locator('#ex4q1').selectOption('Objectives');
    await page.locator('#ex4 button.btn-submit').click();
    await page.locator('#ex4 button.btn-reset').click();
    await expect(page.locator('#ex4-fp')).not.toBeVisible();
    await expect(page.locator('#ex4-q1 .q-expl')).not.toBeVisible();
  });
});

// ── Exercise 5: RACI Builder ─────────────────────────────────────────────────
test.describe('Exercise 5 — RACI Builder', () => {
  test('valid RACI passes validation', async ({ page }) => {
    // Each row needs exactly 1 A and at least 1 R
    const model = [
      ['A','R','C','I','C'],
      ['A','R','C','I','C'],
      ['A','R','I','I','I'],
      ['A','R','C','C','I'],
      ['C','R','I','C','A'],
    ];
    const roles = ['ql','qe','dev','pm','po'];
    for (let ti = 0; ti < 5; ti++) {
      for (let ri = 0; ri < 5; ri++) {
        await page.locator(`#raci_t${ti}_${roles[ri]}`).selectOption(model[ti][ri]);
      }
    }
    await page.locator('#ex5 button.btn-submit').click();
    await expect(page.locator('#ex5-fp')).toContainText('valid');
    await expect(page.locator('#ex5-badge')).toContainText('Valid');
  });

  test('missing A in a row shows error', async ({ page }) => {
    // Row 0: assign only R, no A
    await page.locator('#raci_t0_ql').selectOption('R');
    await page.locator('#ex5 button.btn-submit').click();
    await expect(page.locator('#ex5-fp')).toContainText('issue');
  });

  test('reset clears all selects', async ({ page }) => {
    await page.locator('#raci_t0_ql').selectOption('R');
    await page.locator('#ex5 button.btn-reset').click();
    await expect(page.locator('#ex5-fp')).not.toBeVisible();
    await expect(page.locator('#raci_t0_ql')).toHaveValue('');
  });
});

// ── Exercise 6: E-commerce Challenge ─────────────────────────────────────────
test.describe('Exercise 6 — E-commerce Challenge', () => {
  test('empty fields show warning', async ({ page }) => {
    await page.locator('#ex6 button.btn-submit').click();
    await expect(page.locator('#ex6-fp')).toContainText('fill in');
  });

  test('filled fields show model answer', async ({ page }) => {
    await page.locator('#ex6a1').fill('Verify checkout works');
    await page.locator('#ex6a2').fill('In scope: products');
    await page.locator('#ex6a3').fill('What is the peak load?');
    await page.locator('#ex6 button.btn-submit').click();
    await expect(page.locator('#ex6-fp')).toContainText('Model Answer');
    await expect(page.locator('#ex6-badge')).toContainText('Submitted');
  });

  test('reset clears textareas', async ({ page }) => {
    await page.locator('#ex6a1').fill('test');
    await page.locator('#ex6 button.btn-reset').click();
    await expect(page.locator('#ex6a1')).toHaveValue('');
  });
});

// ── Exercise 7: Apply RBT ─────────────────────────────────────────────────────
test.describe('Exercise 7 — Apply RBT', () => {
  test('missing justifications show warning', async ({ page }) => {
    await page.locator('#ex7 button.btn-submit').click();
    await expect(page.locator('#ex7-fp')).toContainText('justification');
  });

  test('filled justifications reveal model answer and suggested ranks', async ({ page }) => {
    await page.locator('#ex7just1').fill('Insurance API is external and can fail');
    await page.locator('#ex7just2').fill('Patient login is security critical');
    await page.locator('#ex7just3').fill('Payments affect revenue directly');
    await page.locator('#ex7 button.btn-submit').click();
    await expect(page.locator('#ex7-fp')).toContainText('Model Ranking');
    await expect(page.locator('#srank1')).not.toHaveText('—');
    await expect(page.locator('#ex7-badge')).toContainText('Submitted');
  });

  test('reset clears all fields and hides ranks', async ({ page }) => {
    await page.locator('#ex7just1').fill('test');
    await page.locator('#ex7 button.btn-submit').click();
    await page.locator('#ex7 button.btn-reset').click();
    await expect(page.locator('#srank1')).toHaveText('—');
    await expect(page.locator('#ex7-fp')).not.toBeVisible();
  });
});

// ── Exercise 8: Severity vs Priority ─────────────────────────────────────────
test.describe('Exercise 8 — Severity vs Priority', () => {
  test('all correct: shows 6/6', async ({ page }) => {
    const answers = [
      ['Critical','Critical'], ['Low','Low'], ['Medium','Low'],
      ['High','Medium'], ['Low','High'], ['Critical','Critical']
    ];
    for (let i = 1; i <= 6; i++) {
      await page.locator(`#ex8s${i}`).selectOption(answers[i-1][0]);
      await page.locator(`#ex8p${i}`).selectOption(answers[i-1][1]);
    }
    await page.locator('#ex8 button.btn-submit').click();
    await expect(page.locator('#ex8-fp')).toContainText('All correct');
    await expect(page.locator('#ex8-badge')).toContainText('6/6');
  });

  test('reset clears selects', async ({ page }) => {
    await page.locator('#ex8s1').selectOption('Critical');
    await page.locator('#ex8 button.btn-reset').click();
    await expect(page.locator('#ex8s1')).toHaveValue('');
    await expect(page.locator('#ex8-fp')).not.toBeVisible();
  });
});

// ── Exercise 9: Test Types ────────────────────────────────────────────────────
test.describe('Exercise 9 — Test Types', () => {
  test('all correct: shows 6/6 with ok explanations', async ({ page }) => {
    const answers = {
      ex9q1: 'Smoke Testing', ex9q2: 'Regression Testing', ex9q3: 'Exploratory Testing',
      ex9q4: 'Performance Testing', ex9q5: 'Security Testing', ex9q6: 'Usability Testing'
    };
    for (const [id, val] of Object.entries(answers)) {
      await page.locator(`#${id}`).selectOption(val);
    }
    await page.locator('#ex9 button.btn-submit').click();
    await expect(page.locator('#ex9-fp')).toContainText('All correct');
    await expect(page.locator('#ex9-badge')).toContainText('6/6');
    await expect(page.locator('#ex9-q1 .q-expl')).toHaveClass(/ok/);
  });

  test('wrong answer shows inline explanation', async ({ page }) => {
    await page.locator('#ex9q1').selectOption('Regression Testing'); // wrong
    await page.locator('#ex9 button.btn-submit').click();
    const expl = page.locator('#ex9-q1 .q-expl');
    await expect(expl).toBeVisible();
    await expect(expl).toHaveClass(/wrong/);
  });

  test('reset clears state', async ({ page }) => {
    await page.locator('#ex9q1').selectOption('Smoke Testing');
    await page.locator('#ex9 button.btn-submit').click();
    await page.locator('#ex9 button.btn-reset').click();
    await expect(page.locator('#ex9-fp')).not.toBeVisible();
    await expect(page.locator('#ex9-q1 .q-expl')).not.toBeVisible();
  });
});

// ── Exercise 10: Bug Report ───────────────────────────────────────────────────
test.describe('Exercise 10 — Bug Report Writing', () => {
  test('empty fields show warning', async ({ page }) => {
    await page.locator('#ex10 button.btn-submit').click();
    await expect(page.locator('#ex10-fp')).toContainText('fill in');
  });

  test('filled fields show model bug report', async ({ page }) => {
    await page.locator('#ex10-title').fill('Cart shows wrong price');
    await page.locator('#ex10-steps').fill('1. Filter products\n2. Add to cart\n3. Open cart');
    await page.locator('#ex10-expected').fill('Filtered price shown');
    await page.locator('#ex10-actual').fill('Original price shown');
    await page.locator('#ex10-justify').fill('Core checkout feature');
    await page.locator('#ex10-env').fill('Chrome, QA environment');
    await page.locator('#ex10-sev').selectOption('High');
    await page.locator('#ex10-pri').selectOption('High');
    await page.locator('#ex10 button.btn-submit').click();
    await expect(page.locator('#ex10-fp')).toContainText('Model Bug Report');
    await expect(page.locator('#ex10-badge')).toContainText('Submitted');
  });

  test('reset clears all fields', async ({ page }) => {
    await page.locator('#ex10-title').fill('test');
    await page.locator('#ex10 button.btn-reset').click();
    await expect(page.locator('#ex10-title')).toHaveValue('');
    await expect(page.locator('#ex10-fp')).not.toBeVisible();
  });
});

// ── Exercise 11: Equivalence Partitioning ────────────────────────────────────
test.describe('Exercise 11 — Equivalence Partitioning', () => {
  test('empty fields show warning', async ({ page }) => {
    await page.locator('#ex11 button.btn-submit').click();
    await expect(page.locator('#ex11-fp')).toContainText('fill in');
  });

  test('filled fields show model answer', async ({ page }) => {
    await page.locator('#ex11-v1').fill('8-20 chars with uppercase and number');
    await page.locator('#ex11-i1').fill('Too short (<8)');
    await page.locator('#ex11-i2').fill('Too long (>20)');
    await page.locator('#ex11-i3').fill('No uppercase');
    await page.locator('#ex11-i4').fill('No number');
    await page.locator('#ex11-b1').fill('7');
    await page.locator('#ex11-b2').fill('8');
    await page.locator('#ex11-b3').fill('20');
    await page.locator('#ex11-b4').fill('21');
    await page.locator('#ex11 button.btn-submit').click();
    await expect(page.locator('#ex11-fp')).toContainText('Model Answer');
    await expect(page.locator('#ex11-badge')).toContainText('Submitted');
  });

  test('reset clears fields', async ({ page }) => {
    await page.locator('#ex11-v1').fill('test');
    await page.locator('#ex11 button.btn-reset').click();
    await expect(page.locator('#ex11-v1')).toHaveValue('');
    await expect(page.locator('#ex11-fp')).not.toBeVisible();
  });
});

// ── Exercise 12: Missing Test Cases ──────────────────────────────────────────
test.describe('Exercise 12 — Find Missing Test Cases', () => {
  test('empty textarea shows warning', async ({ page }) => {
    await page.locator('#ex12 button.btn-submit').click();
    await expect(page.locator('#ex12-fp')).toContainText('write your answer');
  });

  test('filled textarea shows model answer', async ({ page }) => {
    await page.locator('#ex12-answer').fill('Empty password, locked account, SQL injection');
    await page.locator('#ex12 button.btn-submit').click();
    await expect(page.locator('#ex12-fp')).toContainText('Missing Test Cases');
    await expect(page.locator('#ex12-badge')).toContainText('Submitted');
  });

  test('reset clears textarea', async ({ page }) => {
    await page.locator('#ex12-answer').fill('test');
    await page.locator('#ex12 button.btn-reset').click();
    await expect(page.locator('#ex12-answer')).toHaveValue('');
    await expect(page.locator('#ex12-fp')).not.toBeVisible();
  });
});

// ── Exercise 13: Entry & Exit Criteria ───────────────────────────────────────
test.describe('Exercise 13 — Entry & Exit Criteria', () => {
  test('missing fields show warning', async ({ page }) => {
    await page.locator('#ex13 button.btn-submit').click();
    await expect(page.locator('#ex13-fp')).toContainText('fill in');
  });

  test('filled fields show model answer', async ({ page }) => {
    await page.locator('#ex13-entry').fill('Feature deployed in QA, test cases written');
    await page.locator('#ex13-exit').fill('100% test cases executed, zero Critical bugs');
    await page.locator('#ex13 button.btn-submit').click();
    await expect(page.locator('#ex13-fp')).toContainText('Model Answer');
    await expect(page.locator('#ex13-badge')).toContainText('Submitted');
  });

  test('reset clears textareas', async ({ page }) => {
    await page.locator('#ex13-entry').fill('test');
    await page.locator('#ex13 button.btn-reset').click();
    await expect(page.locator('#ex13-entry')).toHaveValue('');
    await expect(page.locator('#ex13-fp')).not.toBeVisible();
  });
});

// ── Exercise 14: Sprint Test Plan ────────────────────────────────────────────
test.describe('Exercise 14 — Sprint Test Plan', () => {
  test('empty sections show warning', async ({ page }) => {
    await page.locator('#ex14 button.btn-submit').click();
    await expect(page.locator('#ex14-fp')).toContainText('complete all sections');
  });

  test('all sections filled show model answer', async ({ page }) => {
    await page.locator('#ex14-obj').fill('Verify wishlist add/remove and persistence');
    await page.locator('#ex14-scope').fill('IN: add, remove, share. OUT: payments');
    await page.locator('#ex14-approach').fill('Functional + exploratory testing');
    await page.locator('#ex14-risks').fill('Risk: share link exposes private data');
    await page.locator('#ex14-schedule').fill('Day 1: test cases. Day 2: execute. Day 3: exploratory. Day 4: regression + sign-off');
    await page.locator('#ex14 button.btn-submit').click();
    await expect(page.locator('#ex14-fp')).toContainText('Model Sprint Test Plan');
    await expect(page.locator('#ex14-badge')).toContainText('Submitted');
  });

  test('reset clears all sections', async ({ page }) => {
    await page.locator('#ex14-obj').fill('test');
    await page.locator('#ex14 button.btn-reset').click();
    await expect(page.locator('#ex14-obj')).toHaveValue('');
    await expect(page.locator('#ex14-fp')).not.toBeVisible();
  });
});

// ── Progress bar ──────────────────────────────────────────────────────────────
test.describe('Progress bar', () => {
  test('updates after submitting exercise 1', async ({ page }) => {
    const answers = { ex1q1: 'S', ex1q2: 'P', ex1q3: 'S', ex1q4: 'P', ex1q5: 'S', ex1q6: 'P', ex1q7: 'S', ex1q8: 'P' };
    for (const [name, val] of Object.entries(answers)) {
      await page.locator(`input[name="${name}"][value="${val}"]`).check();
    }
    await page.locator('#ex1 button.btn-submit').click();
    await expect(page.locator('#prog-text')).toContainText('1 / 14');
  });

  test('header marks submitted after submit', async ({ page }) => {
    await page.locator('#ex12-answer').fill('Empty password, SQL injection');
    await page.locator('#ex12 button.btn-submit').click();
    await expect(page.locator('#ex12-hdr')).toHaveClass(/submitted/);
  });
});
