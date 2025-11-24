# Documento de Requisitos de Sistema - DuduFisio/FisioFlow

**Versão:** 1.0
**Data:** 13 de Novembro de 2025

## 1. Visão Geral e Escopo do Projeto

### 1.1. Objetivo Principal

O objetivo deste projeto é consolidar todas as análises, pesquisas de concorrentes e requisitos funcionais em um único documento mestre. Este documento servirá como a "fonte da verdade" para o desenvolvimento de um sistema de gestão para clínicas de fisioterapia de ponta, daqui em diante referido como **FisioFlow**. O sistema visa ser a solução mais completa do mercado brasileiro, combinando gestão clínica, administrativa, financeira e de relacionamento com o paciente, com uma experiência de usuário moderna e funcionalidades inovadoras baseadas em IA.

### 1.2. Escopo

O escopo do projeto abrange o desenvolvimento de uma aplicação web (PWA) e um aplicativo móvel nativo (iOS/Android) para pacientes, que inclui os seguintes módulos principais:

- **Gestão de Pacientes e Prontuário Eletrônico:** Cadastro, avaliações, evoluções, mapa de dor, e histórico completo.
- **Agendamento e Calendário:** Agenda visual, agendamento online, lista de espera e confirmações automáticas.
- **Financeiro:** Controle de pacotes, pagamentos, faturamento e relatórios.
- **Marketing e Comunicação:** Automação de lembretes, campanhas e pesquisas de satisfação.
- **Biblioteca de Conteúdo:** Exercícios, protocolos e materiais clínicos.
- **Relatórios e Analytics:** Dashboards para acompanhamento de KPIs clínicos e de negócio.
- **App do Paciente:** Acesso a exercícios, agendamentos e comunicação com a clínica.

---

## 2. Requisitos Funcionais (RF)

### RF01: Módulo de Gestão de Pacientes e Prontuário Eletrônico

#### 1.1. Cadastro de Pacientes
- **RF01.1.1:** O sistema deve permitir o cadastro completo de pacientes com os seguintes campos obrigatórios: Nome completo, CPF (com validação de formato), Data de Nascimento, Telefone/WhatsApp e Email.
- **RF01.1.2:** Campos opcionais devem incluir: Endereço, Profissão, Estado Civil, Contato de Emergência, Foto do Paciente e Observações Gerais.
- **RF01.1.3:** O sistema deve fornecer um link de pré-cadastro para que os pacientes possam preencher suas informações básicas antes da primeira consulta, agilizando o processo na recepção.

#### 1.2. Prontuário Eletrônico do Paciente (PEP)
- **RF01.2.1:** Cada paciente deve ter um prontuário eletrônico centralizado, acessível através de seu perfil.
- **RF01.2.2:** A tela do prontuário deve apresentar uma **visão de 360 graus do paciente**, incluindo um dashboard com: resumo de informações, cirurgias, objetivos, patologias, alertas e próximos agendamentos.
- **RF01.2.3:** O sistema deve permitir o registro de **Anamnese** detalhada, incluindo: Queixa Principal (QP), História da Doença Atual (HDA), História Médica Pregressa, Medicamentos em Uso, Alergias e Cirurgias Anteriores.
- **RF01.2.4:** Deve ser possível registrar o **Exame Físico**, com seções para Inspeção, Palpação, Testes Especiais, Amplitude de Movimento (ADM) e Força Muscular.
- **RF01.2.5:** O sistema deve permitir o upload e anexo de arquivos ao prontuário, como laudos, exames de imagem e outros documentos, com suporte a múltiplos formatos (PDF, JPG, PNG, DOCX).
- **RF01.2.6:** Todas as evoluções, avaliações e registros devem ser apresentados em uma **linha do tempo cronológica** e interativa.

#### 1.3. Evolução da Sessão (SOAP)
- **RF01.3.1:** O registro de evolução de cada sessão deve seguir o modelo **SOAP (Subjetivo, Objetivo, Avaliação, Plano)**.
- **RF01.3.2:** O campo **(S) Subjetivo** deve registrar o relato do paciente, suas queixas e percepções desde a última sessão.
- **RF01.3.3:** O campo **(O) Objetivo** deve registrar as observações e medições objetivas do fisioterapeuta (testes, medições de ADM, etc.).
- **RF01.3.4:** O campo **(A) Avaliação** deve conter a interpretação clínica do profissional sobre o estado atual do paciente.
- **RF01.3.5:** O campo **(P) Plano** deve detalhar a conduta e as intervenções realizadas na sessão. Este campo deve ser estruturado, permitindo adicionar procedimentos de uma biblioteca pré-definida.
- **RF01.3.6:** O sistema deve ter uma funcionalidade de **auto-save** a cada 30-60 segundos para evitar perda de dados durante o preenchimento da evolução.
- **RF01.3.7:** Deve ser possível **replicar a conduta** de sessões anteriores para agilizar o preenchimento.

#### 1.4. Mapa de Dor Corporal Interativo
- **RF01.4.1:** O sistema deve apresentar um mapa corporal anatomicamente realista, com vistas frontal e de costas.
- **RF01.4.2:** O fisioterapeuta deve poder clicar em regiões específicas do corpo para registrar pontos de dor.
- **RF01.4.3:** Para cada ponto de dor, deve ser possível registrar a **intensidade em uma escala de 0 a 10 (EVA)**, que será representada por um sistema de cores (ex: Verde para dor leve, Amarelo para moderada, Vermelho para intensa).
- **RF01.4.4:** O sistema deve salvar o histórico dos mapas de dor, permitindo uma **comparação visual da evolução da dor** entre diferentes sessões.
- **RF01.4.5:** Deve ser possível exportar o mapa de dor (com anotações) para PDF.

#### 1.5. Objetivos e Metas do Paciente
- **RF01.5.1:** O sistema deve permitir o cadastro de objetivos para o paciente (ex: "Correr 5km sem dor", "Retornar ao esporte em 3 meses").
- **RF01.5.2:** Cada objetivo deve ter um título, descrição, data alvo e métricas de progresso.
- **RF01.5.3:** O dashboard do paciente deve exibir os objetivos com uma **barra de progresso** e um **countdown** visual para a data alvo.


### RF02: Módulo de Agendamento e Calendário

#### 2.1. Visualização da Agenda
- **RF02.1.1:** O sistema deve fornecer uma agenda visual interativa com visualizações por dia, semana e mês, similar ao Google Calendar/Outlook.
- **RF02.1.2:** Deve ser possível visualizar a agenda por profissional ou por recurso (sala/equipamento).
- **RF02.1.3:** Os agendamentos devem ser codificados por cores com base no status (ex: Agendado, Confirmado, Realizado, Cancelado, Faltou).

#### 2.2. Gestão de Agendamentos
- **RF02.2.1:** O sistema deve permitir a criação de novos agendamentos clicando em horários livres, com um formulário para preenchimento rápido dos detalhes.
- **RF02.2.2:** O sistema deve suportar o agendamento de múltiplos pacientes no mesmo horário (atendimento em grupo ou simultâneo).
- **RF02.2.3:** A duração padrão da sessão deve ser configurável (ex: 60 minutos), com a opção de ajuste manual para cada agendamento.
- **RF02.2.4:** Deve ser possível editar agendamentos facilmente, incluindo a funcionalidade de arrastar e soltar (drag-and-drop) para remarcações.
- **RF02.2.5:** Ao digitar o nome do paciente, o sistema deve apresentar uma lista de auto-complete com pacientes já cadastrados. Se o paciente não existir, deve haver um atalho para um cadastro rápido.

#### 2.3. Lista de Espera
- **RF02.3.1:** O sistema deve possuir um módulo de Lista de Espera para gerenciar pacientes que desejam um horário que já está ocupado.
- **RF02.3.2:** Quando um horário é cancelado, o sistema deve notificar automaticamente (via WhatsApp/SMS) o próximo paciente na lista de espera, oferecendo a vaga.
- **RF02.3.3:** A lista de espera deve permitir a priorização de pacientes (ex: Urgente, Alta, Normal).

### RF03: Módulo Financeiro

#### 3.1. Gestão de Pagamentos
- **RF03.1.1:** O sistema deve registrar todas as contas a receber (pagamentos de pacientes) e a pagar (despesas da clínica).
- **RF03.1.2:** As transações devem ser categorizadas (ex: Receita de Pacotes, Despesa com Aluguel) para facilitar a análise.
- **RF03.1.3:** O sistema deve suportar múltiplas formas de pagamento, incluindo PIX, Cartão de Crédito, Dinheiro e Transferência.

#### 3.2. Controle de Pacotes e Sessões
- **RF03.2.1:** Deve ser possível criar e gerenciar pacotes de sessões (ex: 10 sessões) com valores e condições específicas.
- **RF03.2.2:** O sistema deve controlar o consumo das sessões de um pacote, debitando uma sessão a cada atendimento realizado.
- **RF03.2.3:** O perfil do paciente deve exibir claramente o saldo de sessões restantes do pacote.
- **RF03.2.4:** O sistema deve permitir o registro de sessões avulsas com valor diferenciado.
- **RF03.2.5:** Deve ser possível configurar e gerenciar planos de parcelamento para pacotes.

#### 3.3. Faturamento e Relatórios
- **RF03.3.1:** O sistema deve ter a capacidade de gerar notas fiscais ou recibos em PDF, com layout personalizável (logo e dados da clínica).
- **RF03.3.2:** Deve gerar relatórios financeiros detalhados, como Fluxo de Caixa, Demonstrativo de Resultados (DRE) e Relatório de Inadimplência.
- **RF03.3.3:** Se aplicável, o sistema deve calcular e gerar relatórios de comissão para os fisioterapeutas com base nos atendimentos realizados.

### RF04: Módulo de Marketing e Comunicação

#### 4.1. Automação de Comunicação
- **RF04.1.1:** O sistema deve enviar lembretes de agendamento automáticos via WhatsApp, SMS e/ou Email, com antecedência configurável (ex: 24 horas antes).
- **RF04.1.2:** A mensagem de lembrete deve permitir que o paciente confirme ou solicite o cancelamento da sessão respondendo diretamente (integração com webhook).
- **RF04.1.3:** O sistema deve enviar mensagens de aniversário automáticas e personalizadas para os pacientes.

#### 4.2. Gestão de Relacionamento
- **RF04.2.1:** O sistema deve identificar e listar pacientes inativos (ex: sem agendamento há mais de 30 dias) para a criação de campanhas de reengajamento.
- **RF04.2.2:** Deve ser possível enviar pesquisas de satisfação (NPS) automatizadas após um número X de sessões ou ao final do tratamento.
- **RF04.2.3:** O cadastro do paciente deve incluir um campo para registrar a "Origem do Paciente" (ex: Indicação, Instagram, Google), permitindo a análise da eficácia dos canais de marketing.

### RF05: Módulo de Biblioteca de Conteúdo

#### 5.1. Biblioteca de Exercícios
- **RF05.1.1:** O sistema deve possuir uma biblioteca de exercícios categorizada (ex: Fortalecimento, Alongamento, Mobilidade, Propriocepção).
- **RF05.1.2:** Cada exercício deve conter: Nome, Descrição, Vídeo demonstrativo, Imagens, Nível de dificuldade, Equipamentos necessários e Variações.
- **RF05.1.3:** Fisioterapeutas devem poder adicionar novos exercícios à biblioteca.

#### 5.2. Prescrição de Treinos
- **RF05.2.1:** O sistema deve permitir a criação de programas de exercícios personalizados para os pacientes, selecionando exercícios da biblioteca.
- **RF05.2.2:** A prescrição deve incluir séries, repetições, frequência e observações específicas para cada exercício.

#### 5.3. Biblioteca de Materiais Clínicos
- **RF05.3.1:** O sistema deve incluir uma biblioteca de materiais clínicos prontos para uso, como fichas de avaliação, escalas validadas (Oswestry, Lysholm, etc.), formulários de anamnese e mapas de dor.
- **RF05.3.2:** Os materiais devem ser organizados por especialidade (Ortopedia, Gerontologia, Esportiva) e facilmente acessíveis para download (PDF) ou uso no sistema.

### RF06: Módulo de Relatórios e Analytics

- **RF06.1:** O sistema deve fornecer um dashboard executivo com os principais indicadores de desempenho (KPIs) da clínica, como: número de pacientes ativos, taxa de ocupação da agenda, receita mensal, taxa de no-show e NPS médio.
- **RF06.2:** Devem ser gerados relatórios clínicos, como relatórios de evolução do paciente, relatórios de alta e laudos para convênios, que podem ser exportados em PDF.
- **RF06.3:** Devem ser gerados relatórios operacionais, como taxa de aderência ao tratamento, tempo médio de tratamento por patologia e exercícios mais prescritos.

### RF07: App do Paciente

- **RF07.1:** Deve ser desenvolvido um aplicativo móvel (nativo para iOS e Android) para os pacientes.
- **RF07.2:** O paciente deve poder fazer login de forma segura (ex: código de 6 dígitos enviado por SMS/Email).
- **RF07.3:** No app, o paciente deve poder visualizar seus próximos agendamentos e seu programa de exercícios prescritos, incluindo vídeos.
- **RF07.4:** O paciente deve poder registrar a realização dos exercícios e fornecer feedback sobre o nível de dor ou dificuldade.
- **RF07.5:** O app deve incluir um canal de comunicação (chat) seguro com o fisioterapeuta responsável.
- **RF07.6:** O app deve apresentar um dashboard com o progresso do paciente em relação aos seus objetivos.

---

## 3. Requisitos Não Funcionais (RNF)

- **RNF01 (Performance):** O tempo de carregamento inicial da aplicação web deve ser inferior a 2 segundos. As atualizações em tempo real devem ocorrer em menos de 500ms.
- **RNF02 (Segurança):** O sistema deve estar em conformidade com a Lei Geral de Proteção de Dados (LGPD). Todos os dados sensíveis dos pacientes devem ser criptografados em repouso e em trânsito. O acesso ao sistema deve ser controlado por perfis e permissões (RBAC).
- **RNF03 (Usabilidade e UI/UX):** A interface deve ser intuitiva, moderna e responsiva, seguindo um design system consistente (inspirado no Monday.com e Vedius). O sistema deve ter um tema escuro (dark mode) como padrão.
- **RNF04 (Compatibilidade):** A aplicação web deve ser compatível com as versões mais recentes dos principais navegadores (Chrome, Firefox, Safari, Edge). O app do paciente deve ser compatível com iOS 14+ e Android 8+.
- **RNF05 (Escalabilidade):** A arquitetura do sistema (Vercel + Supabase) deve ser capaz de suportar o crescimento do número de usuários e dados sem degradação de performance.
- **RNF06 (Disponibilidade):** O sistema deve ter um uptime superior a 99.9%.
