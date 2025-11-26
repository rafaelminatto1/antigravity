// Teste Playwright para criação de notebook
// Execute: node test-notebook-creation.js

const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const results = {
    tests: [],
    errors: [],
    warnings: []
  };

  // Capturar console messages e erros de rede
  page.on('console', msg => {
    if (msg.type() === 'error') {
      results.errors.push(`Console Error: ${msg.text()}`);
      console.error(`❌ Console Error: ${msg.text()}`);
    } else if (msg.type() === 'warning') {
      results.warnings.push(`Console Warning: ${msg.text()}`);
    }
  });

  page.on('response', response => {
    if (response.status() >= 400) {
      const url = response.url();
      if (url.includes('/api/notebooks')) {
        results.errors.push(`API Error ${response.status()}: ${url}`);
        console.error(`❌ API Error ${response.status()}: ${url}`);
      }
    }
  });

  try {
    console.log('🚀 Iniciando teste de criação de notebook...\n');

    // Teste 1: Login
    console.log('🔐 [1/5] Fazendo login...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('input#email', { timeout: 15000 });
    
    await page.fill('input#email', 'rafael.minatto@yahoo.com.br');
    await page.fill('input#password', 'Yukari30');
    
    // Clicar no botão "Entrar"
    const loginButton = page.locator('button:has-text("Entrar")').first();
    await loginButton.waitFor({ timeout: 10000 });
    
    // Aguardar navegação após clicar
    await Promise.all([
      page.waitForURL('**/', { timeout: 10000 }).catch(() => page.waitForURL('**/notebooks', { timeout: 10000 }).catch(() => {})),
      loginButton.click()
    ]);
    
    // Aguardar um pouco mais para garantir que o redirecionamento aconteceu
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    
    if (currentUrl.includes('/login')) {
      // Verificar se há erro de login
      await page.waitForTimeout(2000);
      const errorToast = page.locator('text=/Email ou senha|Erro ao fazer login|Invalid/i');
      if (await errorToast.count() > 0) {
        const errorText = await errorToast.first().textContent();
        throw new Error(`Login falhou - ${errorText}`);
      }
      throw new Error('Login falhou - ainda na página de login');
    } else {
      console.log(`✅ Login bem-sucedido! Redirecionado para: ${currentUrl}`);
    }

    results.tests.push({ test: 'Login', status: '✅ Passou' });
    console.log('✅ Login concluído\n');

    // Teste 2: Navegar para Notebooks
    console.log('📚 [2/5] Navegando para página de Notebooks...');
    await page.goto('http://localhost:3000/notebooks', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // Verificar se a página carregou - procurar por vários indicadores
    const hasNotebooksTitle = (await page.locator('h1:has-text("Notebooks")').count() > 0) || 
                              (await page.locator('h2:has-text("Notebooks")').count() > 0) ||
                              (await page.locator('text=/Notebooks/i').count() > 0);
    const hasNewButton = (await page.locator('button:has-text("Novo")').count() > 0) || 
                        (await page.locator('button:has-text("Criar")').count() > 0);
    const urlIsCorrect = page.url().includes('/notebooks');
    
    if (!hasNotebooksTitle && !hasNewButton && !urlIsCorrect) {
      console.log(`URL atual: ${page.url()}`);
      console.log(`Título encontrado: ${hasNotebooksTitle}`);
      console.log(`Botão Novo encontrado: ${hasNewButton}`);
      throw new Error('Página de notebooks não carregou corretamente');
    }
    
    results.tests.push({ test: 'Navegação para Notebooks', status: '✅ Passou' });
    console.log('✅ Página de Notebooks carregada\n');

    // Teste 3: Abrir modal de criação
    console.log('➕ [3/5] Abrindo modal de criação de notebook...');
    
    // Procurar pelo botão "Novo" ou "Criar Novo Notebook"
    const novoButton = page.locator('button:has-text("Novo"), button:has-text("Criar Novo Notebook")').first();
    await novoButton.waitFor({ timeout: 5000 });
    await novoButton.click();
    
    // Aguardar o modal aparecer
    await page.waitForSelector('text=Criar Novo Notebook', { timeout: 5000 });
    await page.waitForTimeout(500);
    
    results.tests.push({ test: 'Abrir modal de criação', status: '✅ Passou' });
    console.log('✅ Modal aberto\n');

    // Teste 4: Preencher formulário
    console.log('✍️ [4/5] Preenchendo formulário...');
    
    const timestamp = Date.now();
    const notebookTitle = `Teste Notebook ${timestamp}`;
    const notebookContent = `Este é um notebook de teste criado em ${new Date().toLocaleString('pt-BR')}`;
    
    // Preencher título
    const titleInput = page.locator('input#title, input[placeholder*="título"], input[placeholder*="Título"]').first();
    await titleInput.waitFor({ timeout: 5000 });
    await titleInput.fill(notebookTitle);
    
    // Preencher conteúdo (opcional)
    const contentTextarea = page.locator('textarea#content, textarea[placeholder*="escrever"]').first();
    if (await contentTextarea.count() > 0) {
      await contentTextarea.fill(notebookContent);
    }
    
    await page.waitForTimeout(500);
    
    results.tests.push({ test: 'Preencher formulário', status: '✅ Passou', data: { title: notebookTitle } });
    console.log(`✅ Formulário preenchido: "${notebookTitle}"\n`);

    // Teste 5: Criar notebook
    console.log('💾 [5/5] Criando notebook...');
    
    // Clicar no botão "Criar Notebook"
    const createButton = page.locator('button:has-text("Criar Notebook")').first();
    await createButton.waitFor({ timeout: 5000 });
    await createButton.click();
    
    // Aguardar a criação - pode mostrar toast de sucesso, redirecionar ou atualizar a lista
    await page.waitForTimeout(5000);
    
    // Verificar se houve erro na API
    const apiErrors = results.errors.filter(e => e.includes('/api/notebooks') && e.includes('500'));
    if (apiErrors.length > 0) {
      throw new Error(`Erro na API: ${apiErrors[0]}`);
    }
    
    // Verificar múltiplas formas de sucesso:
    // 1. URL mudou para incluir ?id=
    const urlHasId = page.url().includes('?id=');
    
    // 2. Toast de sucesso apareceu
    const successToast = page.locator('text=/sucesso|created|notebook criado/i');
    const hasSuccessToast = await successToast.count() > 0;
    
    // 3. Notebook aparece na lista
    await page.waitForTimeout(2000); // Aguardar lista atualizar
    const notebookInList = await page.locator(`text=${notebookTitle}`).count() > 0;
    
    // 4. Modal foi fechado (indica sucesso)
    const modalClosed = await page.locator('text=Criar Novo Notebook').count() === 0;
    
    if (urlHasId || hasSuccessToast || notebookInList || modalClosed) {
      results.tests.push({ test: 'Criar notebook', status: '✅ Passou', notebookTitle });
      console.log('✅ Notebook criado com sucesso!\n');
      console.log(`   URL: ${page.url()}`);
      console.log(`   Toast de sucesso: ${hasSuccessToast}`);
      console.log(`   Na lista: ${notebookInList}`);
    } else {
      // Verificar se há mensagem de erro
      const errorMessage = page.locator('[role="alert"], .toast, [class*="error"]').or(page.locator('text=/erro|error|falhou/i'));
      if (await errorMessage.count() > 0) {
        const errorText = await errorMessage.first().textContent();
        throw new Error(`Erro ao criar notebook: ${errorText}`);
      } else {
        // Verificar URL atual para debug
        console.log(`URL atual: ${page.url()}`);
        console.log(`Título procurado: ${notebookTitle}`);
        throw new Error('Notebook não foi criado - não apareceu na lista nem redirecionou');
      }
    }

    // Aguardar um pouco para ver o resultado
    await page.waitForTimeout(2000);

    console.log('\n📊 RESULTADOS DOS TESTES:');
    console.log('========================');
    results.tests.forEach(t => {
      console.log(`${t.status} - ${t.test}`);
      if (t.data) {
        console.log(`   Dados: ${JSON.stringify(t.data)}`);
      }
    });
    
    if (results.errors.length > 0) {
      console.log('\n❌ ERROS:');
      results.errors.forEach(e => console.log(`  - ${e}`));
    }
    
    if (results.warnings.length > 0) {
      console.log('\n⚠️ WARNINGS:');
      results.warnings.forEach(w => console.log(`  - ${w}`));
    }

    console.log('\n✅ Teste concluído! Mantendo o navegador aberto por 5 segundos para inspeção...');
    await page.waitForTimeout(5000);

    await browser.close();
  } catch (error) {
    console.error('\n❌ ERRO DURANTE O TESTE:', error.message);
    console.error('\nStack trace:', error.stack);
    
    if (results.errors.length > 0) {
      console.log('\n❌ ERROS CAPTURADOS:');
      results.errors.forEach(e => console.log(`  - ${e}`));
    }
    
    console.log('\n📸 Capturando screenshot do erro...');
    await page.screenshot({ path: 'test-error-screenshot.png', fullPage: true });
    console.log('✅ Screenshot salvo em: test-error-screenshot.png');
    
    console.log('\n⏳ Mantendo o navegador aberto por 10 segundos para inspeção...');
    await page.waitForTimeout(10000);
    
    await browser.close();
    process.exit(1);
  }
})();

