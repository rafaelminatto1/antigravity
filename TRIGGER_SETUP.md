# Configuração do Trigger.dev

## ✅ Arquivos Criados

- `trigger.config.ts` - Arquivo de configuração do Trigger.dev (v4.1.2)
- `src/trigger/` - Diretório para suas tasks

### Configurações Importantes

- **maxDuration**: Configurado para 300 segundos (5 minutos) - obrigatório na v4.1.2+
- **runtime**: Usa o runtime padrão do Trigger.dev (não precisa ser especificado)
- **dirs**: `./src/trigger` - onde suas tasks devem ser criadas
- **project**: `proj_rrifzwqeavqexqyedenv` - ID do projeto no Trigger.dev

## 📦 Próximos Passos

### 1. Instalar as Dependências

```bash
npm install --legacy-peer-deps
```

**Nota:** Usamos `--legacy-peer-deps` porque há um conflito de versões entre `zod@^4.1.13` (usado no projeto) e `zod@^3.0.0` (requerido pelo Trigger.dev SDK). O `overrides` no `package.json` resolve isso, mas o npm ainda precisa do flag `--legacy-peer-deps` para instalar.

Isso instalará o pacote `@trigger.dev/sdk` que foi adicionado ao `package.json`.

### 2. Inicializar o Projeto no Trigger.dev

Você já está logado no Trigger.dev (conforme mostrado no terminal). Agora você precisa:

**Opção A: Usar o comando init (recomendado)**
```bash
npx trigger.dev@latest init
```

Este comando irá:
- Criar um novo projeto no Trigger.dev (se necessário)
- Configurar o `trigger.config.ts` com o ID do projeto correto
- Criar um arquivo `.env.local` com as variáveis necessárias

**Opção B: Usar o projeto existente**
Se você já tem um projeto no Trigger.dev, você pode:
1. Acessar o dashboard: https://cloud.trigger.dev
2. Copiar o Project ID
3. Adicionar ao `.env.local`:
   ```
   TRIGGER_PROJECT_ID=seu-project-id-aqui
   ```

### 3. Executar o Dev Server

Após a configuração, você pode executar:

```bash
npm run trigger:dev
```

ou

```bash
npx trigger.dev@latest dev
```

## 📝 Primeira Task Criada

Uma task de exemplo já foi criada em `src/trigger/example.ts`. Você pode usá-la como referência para criar suas próprias tasks.

### Testando a Task

1. Certifique-se de que o dev server está rodando:
   ```bash
   npx trigger.dev@latest dev
   ```

2. Acesse o [Dashboard do Trigger.dev](https://cloud.trigger.dev)
3. Navegue até o projeto "antigravity"
4. Encontre a task "example-task"
5. Clique em "Run test" e forneça o payload:
   ```json
   {
     "message": "Olá do Trigger.dev!"
   }
   ```

### Criando Novas Tasks

Crie novos arquivos em `src/trigger/` seguindo o padrão:

```typescript
import { task } from "@trigger.dev/sdk/v3";

export const minhaTask = task({
  id: "minha-task-unica",
  run: async (payload: { dados: string }, { ctx }) => {
    // Sua lógica aqui
    return { resultado: "sucesso" };
  },
});
```

## 🔗 Recursos

- [Documentação do Trigger.dev](https://trigger.dev/docs)
- [Dashboard](https://cloud.trigger.dev)
- [Exemplos de Tasks](https://trigger.dev/docs/examples)

