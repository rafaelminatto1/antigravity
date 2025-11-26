# Validators

Esta pasta contém schemas de validação usando Zod para formulários e dados do sistema.

## Estrutura Esperada

- Schemas de validação para pacientes
- Schemas de validação para agendamentos
- Schemas de validação para sessões
- Schemas de validação para outros módulos

## Exemplo de Uso

```typescript
import { z } from 'zod'

export const patientSchema = z.object({
  full_name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
})
```

