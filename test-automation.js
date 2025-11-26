// Script de teste automatizado para ser executado no console do navegador
// Execute este script no console do navegador após carregar a página de login

async function automatedLoginTest() {
  console.log('🚀 Iniciando testes automatizados...');
  
  // Preencher formulário de login
  const emailInput = document.querySelector('input[type="email"]');
  const passwordInput = document.querySelector('input[type="password"]');
  const submitButton = document.querySelector('button[type="submit"]');
  
  if (!emailInput || !passwordInput || !submitButton) {
    console.error('❌ Elementos do formulário não encontrados');
    return;
  }
  
  // Preencher campos
  emailInput.value = 'rafael.minatto@yahoo.com.br';
  emailInput.dispatchEvent(new Event('input', { bubbles: true }));
  emailInput.dispatchEvent(new Event('change', { bubbles: true }));
  
  passwordInput.value = 'Yukari30';
  passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
  passwordInput.dispatchEvent(new Event('change', { bubbles: true }));
  
  // Aguardar um pouco
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Clicar no botão de submit
  submitButton.click();
  
  console.log('✅ Formulário preenchido e submetido');
  
  // Aguardar redirecionamento
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  return {
    success: window.location.pathname !== '/login',
    currentUrl: window.location.href
  };
}

// Executar teste
automatedLoginTest().then(result => {
  console.log('Resultado do teste:', result);
});

