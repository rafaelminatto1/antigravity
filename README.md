# FisioFlow Pro

Sistema completo de gestão para clínicas de fisioterapia, desenvolvido com Next.js 16, Supabase e TypeScript.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter:

- Node.js 18+ instalado
- Git instalado
- Conta GitHub
- Conta Vercel Pro (para deploy)
- Conta Supabase (para banco de dados)

## 🚀 Quick Start

Para uma configuração rápida e completa, consulte o **Quick Start Guide** na documentação do projeto.

### Setup Básico

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/fisioflow.git
cd fisioflow
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp env.example .env.local
```

Edite `.env.local` e adicione suas credenciais do Supabase e outras configurações necessárias.

4. **Execute o servidor de desenvolvimento**
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 📚 Documentação

- **Quick Start Guide**: Consulte a documentação completa para setup detalhado
- **Schema do Banco**: Ver `COMPLETE_SCHEMA.sql` para estrutura completa do banco de dados
- **Variáveis de Ambiente**: Ver `env.example` para todas as variáveis necessárias

## 🏗️ Estrutura do Projeto

```
src/
├── app/              # Rotas e páginas (App Router)
│   ├── (auth)/       # Páginas de autenticação
│   ├── (dashboard)/  # Páginas do dashboard
│   └── api/          # API routes
├── components/       # Componentes React
├── lib/              # Utilitários e serviços
│   ├── supabase/    # Cliente Supabase
│   ├── services/    # Serviços de negócio
│   └── validators/  # Validações Zod
└── types/            # Tipos TypeScript
```

## 🗄️ Banco de Dados

O projeto usa Supabase (PostgreSQL) com as seguintes tabelas principais:

- `organizations` - Clínicas (multi-tenant)
- `profiles` - Usuários
- `patients` - Pacientes
- `appointments` - Agendamentos
- `sessions` - Evoluções SOAP
- `body_pain_maps` - Mapas de dor
- `waitlist` - Lista de espera
- `session_templates` - Templates de condutas
- `treatment_procedures` - Biblioteca de procedimentos
- `notifications` - Notificações
- `analytics_events` - Analytics
- `notebooks` - Blocos de notas
- `knowledge_documents` - Documentos da knowledge base
- `knowledge_search_history` - Histórico de buscas

## 🔧 Tecnologias

- **Framework**: Next.js 16 (App Router)
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **UI**: Tailwind CSS + shadcn/ui
- **Validação**: Zod + React Hook Form
- **Estado**: Zustand + TanStack Query
- **TypeScript**: Tipagem completa

## 📦 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Servidor de produção
npm run lint         # Executar ESLint
npm run trigger:dev  # Trigger.dev em desenvolvimento
```

## 🔐 Autenticação

O sistema usa Supabase Auth com middleware para proteção de rotas. As rotas de autenticação estão em `/auth/login` e `/auth/register`.

## 📝 Próximos Passos

Após o setup inicial:

1. Configure o schema completo no Supabase (ver `COMPLETE_SCHEMA.sql`)
2. Configure as variáveis de ambiente necessárias
3. Crie um usuário de teste no Supabase Dashboard
4. Teste o login e acesso ao dashboard

## 🤝 Contribuindo

Este é um projeto privado. Para dúvidas ou sugestões, consulte a documentação completa do projeto.

## 📄 Licença

Proprietário - Todos os direitos reservados.
