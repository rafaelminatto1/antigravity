# Tests

Esta pasta contém todos os testes do sistema.

## Estrutura

- `unit/` - Testes unitários de componentes e funções
- `integration/` - Testes de integração entre módulos
- `e2e/` - Testes end-to-end do sistema completo

## Configuração

Os testes devem ser configurados usando:
- Jest para testes unitários
- Playwright ou Cypress para testes e2e

## Exemplo de Teste Unitário

```typescript
// tests/unit/services/patientService.test.ts
import { describe, it, expect } from '@jest/globals'
import { getPatients } from '@/lib/services/patientService'

describe('PatientService', () => {
  it('should fetch patients', async () => {
    const patients = await getPatients()
    expect(Array.isArray(patients)).toBe(true)
  })
})
```

