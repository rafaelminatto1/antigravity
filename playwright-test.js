// Script de teste Playwright para ser executado via Node.js
// Execute: node playwright-test.js

const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const results = {
    tests: [],
    errors: [],
    warnings: []
  };

  try {
    // Teste 1: Login
    console.log('🔐 Testando login...');
    await page.goto('https://antigravity-phi.vercel.app/login');
    await page.waitForSelector('input[type="email"]');
    
    await page.fill('input[type="email"]', 'rafael.minatto@yahoo.com.br');
    await page.fill('input[type="password"]', 'Yukari30');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      results.errors.push('Login falhou - ainda na página de login');
    } else {
      results.tests.push({ test: 'Login', status: '✅ Passou', url: currentUrl });
      console.log('✅ Login bem-sucedido!');
    }

    // Capturar console messages
    page.on('console', msg => {
      if (msg.type() === 'error') {
        results.errors.push(`Console Error: ${msg.text()}`);
      } else if (msg.type() === 'warning') {
        results.warnings.push(`Console Warning: ${msg.text()}`);
      }
    });

    // Teste 2: Dashboard
    if (!currentUrl.includes('/login')) {
      console.log('📊 Testando Dashboard...');
      await page.goto('https://antigravity-phi.vercel.app/');
      await page.waitForTimeout(2000);
      const dashboardTitle = await page.title();
      results.tests.push({ test: 'Dashboard', status: '✅ Carregou', title: dashboardTitle });
    }

    // Teste 3: Agenda
    console.log('📅 Testando Agenda...');
    await page.goto('https://antigravity-phi.vercel.app/agenda');
    await page.waitForTimeout(3000);
    const agendaUrl = page.url();
    const hasCalendar = await page.locator('[data-testid="calendar"], .fc, [class*="calendar"]').count() > 0;
    results.tests.push({ 
      test: 'Agenda', 
      status: hasCalendar ? '✅ Passou' : '⚠️ Carregou mas sem calendário',
      url: agendaUrl,
      hasCalendar 
    });

    // Teste 4: Pacientes
    console.log('👥 Testando Pacientes...');
    await page.goto('https://antigravity-phi.vercel.app/patients');
    await page.waitForTimeout(2000);
    results.tests.push({ test: 'Pacientes', status: '✅ Carregou', url: page.url() });

    // Teste 5: Verificar erros de console
    console.log('🔍 Verificando erros de console...');
    await page.waitForTimeout(1000);

    console.log('\n📊 RESULTADOS DOS TESTES:');
    console.log('========================');
    results.tests.forEach(t => {
      console.log(`${t.status} - ${t.test}`);
    });
    
    if (results.errors.length > 0) {
      console.log('\n❌ ERROS:');
      results.errors.forEach(e => console.log(`  - ${e}`));
    }
    
    if (results.warnings.length > 0) {
      console.log('\n⚠️ WARNINGS:');
      results.warnings.forEach(w => console.log(`  - ${w}`));
    }

    await browser.close();
  } catch (error) {
    console.error('Erro durante os testes:', error);
    await browser.close();
  }
})();

