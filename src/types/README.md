# Types

Esta pasta contém definições de tipos TypeScript para o sistema.

## Estrutura Esperada

- Tipos de domínio (Patient, Appointment, Session, etc.)
- Tipos de API
- Tipos de componentes
- Tipos compartilhados

## Exemplo de Uso

```typescript
export type Patient = {
  id: string
  full_name: string
  email?: string
  phone?: string
  created_at: string
}
```

