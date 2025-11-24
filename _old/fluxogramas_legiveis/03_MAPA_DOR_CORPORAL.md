# 🩺 Fluxograma: Mapa de Dor Corporal

## 🎯 Visão Geral

Sistema de mapa de dor corporal realista que permite:
- Registrar dor em regiões específicas do corpo
- Visualizar intensidade por cores
- Comparar evolução entre sessões
- Exportar PDF para paciente

**Diferencial:** Anatomia humana realista (nenhum concorrente tem)

---

## 🎨 Fluxo 1: Abrir Mapa de Dor

```
┌─────────────────────────────────────────┐
│  Fisioterapeuta em "Evolução de Sessão" │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Clicar em "Mapa de Dor"                │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│      MAPA DE DOR CORPORAL               │
├─────────────────────────────────────────┤
│                                         │
│  Paciente: João Silva                   │
│  Sessão #5 - 06/11/2025                 │
│                                         │
│  ┌─────────────┐   ┌─────────────┐     │
│  │   FRENTE    │   │   COSTAS    │     │
│  │             │   │             │     │
│  │     🧍      │   │      🧍     │     │
│  │             │   │             │     │
│  │             │   │             │     │
│  └─────────────┘   └─────────────┘     │
│                                         │
│  Legenda de Intensidade:                │
│  🟢 0-2 (Leve)                          │
│  🟡 3-4 (Moderada)                      │
│  🟠 5-7 (Forte)                         │
│  🔴 8-10 (Intensa)                      │
│                                         │
│  [Novo Registro] [Ver Histórico]        │
│  [Comparar] [Exportar PDF]              │
└─────────────────────────────────────────┘
```

**Regiões Clicáveis (30+):**

**Frente:**
- Cabeça/Face
- Pescoço
- Ombro D/E
- Braço D/E
- Cotovelo D/E
- Antebraço D/E
- Punho D/E
- Mão D/E
- Tórax
- Abdômen
- Quadril D/E
- Coxa D/E
- Joelho D/E
- Perna D/E
- Tornozelo D/E
- Pé D/E

**Costas:**
- Cervical
- Trapézio D/E
- Escapular D/E
- Torácica
- Lombar
- Sacral
- Glúteo D/E
- Posterior Coxa D/E
- Panturrilha D/E

---

## ➕ Fluxo 2: Novo Registro de Dor

```
MAPA DE DOR → Clicar em uma região (ex: Lombar)
                  ↓
┌─────────────────────────────────────────┐
│  REGISTRAR DOR - REGIÃO LOMBAR          │
├─────────────────────────────────────────┤
│                                         │
│  Intensidade da Dor (0-10):             │
│                                         │
│  0 ●━━━━━━━━━━━━━━━━━━━━○ 10          │
│  │                                      │
│  └─ Arraste o controle                  │
│                                         │
│  Tipo de Dor:                           │
│  ○ Aguda/Pontada                        │
│  ○ Latejante                            │
│  ● Queimação                            │
│  ○ Formigamento                         │
│  ○ Dormência                            │
│  ○ Rigidez                              │
│  ○ Outro                                │
│                                         │
│  Observações:                           │
│  ┌─────────────────────────────────┐   │
│  │ Dor piora ao sentar por muito   │   │
│  │ tempo. Melhora com alongamento. │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Cancelar]  [Salvar]                   │
└─────────────────────────────────────────┘
                  ↓
        Clicar em "Salvar"
                  ↓
┌─────────────────────────────────────────┐
│  Determinar Cor pela Intensidade        │
│                                         │
│  Intensidade: 6 → Cor: Laranja 🟠      │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Colorir Região no Mapa                 │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│      MAPA ATUALIZADO                    │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────┐   ┌─────────────┐     │
│  │   FRENTE    │   │   COSTAS    │     │
│  │             │   │             │     │
│  │     🧍      │   │      🧍     │     │
│  │             │   │   [🟠]      │     │
│  │             │   │   Lombar    │     │
│  └─────────────┘   └─────────────┘     │
│                                         │
│  Regiões com Dor:                       │
│  🟠 Lombar - Intensidade 6/10           │
│                                         │
│  [Adicionar Mais] [Salvar Mapa]         │
└─────────────────────────────────────────┘
                  ↓
        Adicionar mais regiões ou Salvar
                  ↓
┌─────────────────────────────────────────┐
│  Salvar no Banco de Dados               │
│  - session_id                           │
│  - patient_id                           │
│  - regions (JSON)                       │
│  - created_at                           │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  ✅ Mapa de Dor Salvo!                  │
│                                         │
│  Total de regiões: 1                    │
│  Intensidade média: 6/10                │
│                                         │
│  [Ver Resumo] [Voltar para Evolução]    │
└─────────────────────────────────────────┘
```

**Escala de Cores:**
| Intensidade | Cor | Hex |
|-------------|-----|-----|
| 0-2 | 🟢 Verde | #10B981 |
| 3-4 | 🟡 Amarelo | #FBBF24 |
| 5-7 | 🟠 Laranja | #F97316 |
| 8-10 | 🔴 Vermelho | #EF4444 |

---

## 📜 Fluxo 3: Ver Histórico

```
MAPA DE DOR → Clicar em "Ver Histórico"
                  ↓
┌─────────────────────────────────────────┐
│      HISTÓRICO DE MAPAS                 │
├─────────────────────────────────────────┤
│                                         │
│  Paciente: João Silva                   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  📅 Sessão #5 - 06/11/2025      │   │
│  │  Regiões: 1                     │   │
│  │  Intensidade média: 6/10        │   │
│  │  [Ver Detalhes]                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  📅 Sessão #4 - 30/10/2025      │   │
│  │  Regiões: 2                     │   │
│  │  Intensidade média: 7/10        │   │
│  │  [Ver Detalhes]                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  📅 Sessão #3 - 23/10/2025      │   │
│  │  Regiões: 3                     │   │
│  │  Intensidade média: 8/10        │   │
│  │  [Ver Detalhes]                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Voltar]                               │
└─────────────────────────────────────────┘
                  ↓
        Clicar em "Ver Detalhes" (Sessão #3)
                  ↓
┌─────────────────────────────────────────┐
│      MAPA - SESSÃO #3 (23/10)           │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────┐   ┌─────────────┐     │
│  │   FRENTE    │   │   COSTAS    │     │
│  │   [🟡]      │   │   [🔴]      │     │
│  │   Joelho D  │   │   Lombar    │     │
│  │     🧍      │   │      🧍     │     │
│  │             │   │   [🟠]      │     │
│  │             │   │   Trapézio  │     │
│  └─────────────┘   └─────────────┘     │
│                                         │
│  Detalhes:                              │
│  🔴 Lombar - 8/10 - Queimação           │
│  🟠 Trapézio D - 6/10 - Rigidez         │
│  🟡 Joelho D - 4/10 - Latejante         │
│                                         │
│  [Exportar PDF] [Voltar]                │
└─────────────────────────────────────────┘
```

---

## 🔄 Fluxo 4: Comparar Sessões

```
MAPA DE DOR → Clicar em "Comparar"
                  ↓
┌─────────────────────────────────────────┐
│      COMPARAR SESSÕES                   │
├─────────────────────────────────────────┤
│                                         │
│  Selecione 2 sessões para comparar:     │
│                                         │
│  Sessão 1:                              │
│  ┌─────────────────────────────────┐   │
│  │  [v] Sessão #3 - 23/10/2025     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Sessão 2:                              │
│  ┌─────────────────────────────────┐   │
│  │  [v] Sessão #5 - 06/11/2025     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Cancelar]  [Comparar]                 │
└─────────────────────────────────────────┘
                  ↓
        Clicar em "Comparar"
                  ↓
┌─────────────────────────────────────────────────────────────┐
│      COMPARAÇÃO: SESSÃO #3 vs SESSÃO #5                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Sessão #3 (23/10)          |          Sessão #5 (06/11)   │
│                             |                               │
│  ┌───────────┐             |             ┌───────────┐     │
│  │  FRENTE   │             |             │  FRENTE   │     │
│  │  [🟡]     │             |             │           │     │
│  │  Joelho D │             |             │           │     │
│  │    🧍     │             |             │    🧍     │     │
│  └───────────┘             |             └───────────┘     │
│                             |                               │
│  ┌───────────┐             |             ┌───────────┐     │
│  │  COSTAS   │             |             │  COSTAS   │     │
│  │  [🔴]     │             |             │  [🟠]     │     │
│  │  Lombar   │             |             │  Lombar   │     │
│  │    🧍     │             |             │    🧍     │     │
│  │  [🟠]     │             |             │           │     │
│  │  Trapézio │             |             │           │     │
│  └───────────┘             |             └───────────┘     │
│                             |                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  EVOLUÇÃO POR REGIÃO:                                       │
│                                                             │
│  ✅ Lombar:      8/10 → 6/10  (-2 pontos, -25% melhora)    │
│  ✅ Trapézio D:  6/10 → 0/10  (-6 pontos, 100% melhora)    │
│  ✅ Joelho D:    4/10 → 0/10  (-4 pontos, 100% melhora)    │
│                                                             │
│  RESUMO:                                                    │
│  Intensidade média: 6.0 → 2.0 (-67% melhora)               │
│  Regiões com dor: 3 → 1 (-2 regiões)                       │
│                                                             │
│  [Ver Gráfico] [Exportar PDF] [Voltar]                     │
└─────────────────────────────────────────────────────────────┘
                  ↓
        Clicar em "Ver Gráfico"
                  ↓
┌─────────────────────────────────────────┐
│      GRÁFICO DE EVOLUÇÃO                │
├─────────────────────────────────────────┤
│                                         │
│  Intensidade Média por Sessão           │
│                                         │
│  10│                                    │
│   9│                                    │
│   8│        ●                           │
│   7│                                    │
│   6│                 ●                  │
│   5│                                    │
│   4│                          ●         │
│   3│                                    │
│   2│                                ●   │
│   1│                                    │
│   0└─────────────────────────────────   │
│     S1    S2    S3    S4    S5          │
│                                         │
│  Tendência: ↓ Melhora Progressiva       │
│                                         │
│  [Exportar] [Voltar]                    │
└─────────────────────────────────────────┘
```

**Análise Automática:**
- Melhora: Verde ✅
- Piora: Vermelho ⚠️
- Estável: Amarelo ⏸️

---

## 📄 Fluxo 5: Exportar PDF

```
MAPA DE DOR → Clicar em "Exportar PDF"
                  ↓
┌─────────────────────────────────────────┐
│  Gerar PDF do Mapa de Dor               │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Montar Documento:                      │
│  - Cabeçalho (Paciente, Data)           │
│  - Imagem do Corpo Colorido             │
│  - Legenda de Cores                     │
│  - Tabela de Regiões                    │
│  - Observações                          │
│  - Rodapé (Clínica, Fisioterapeuta)     │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Salvar PDF                             │
│  mapa_dor_joao_silva_06_11_2025.pdf     │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  ✅ PDF Gerado!                         │
│                                         │
│  [📥 Download]  [✉️ Enviar por E-mail]  │
└─────────────────────────────────────────┘
```

**Exemplo de PDF:**

```
┌─────────────────────────────────────────┐
│  MAPA DE DOR CORPORAL                   │
│                                         │
│  Paciente: João Silva                   │
│  Data: 06/11/2025                       │
│  Sessão: #5                             │
│  Fisioterapeuta: Dr. Silva              │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  [Imagem do Corpo com Regiões Coloridas]│
│                                         │
│  Frente              Costas             │
│   🧍                  🧍                 │
│                     [🟠]                │
│                     Lombar              │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  LEGENDA:                               │
│  🟢 0-2 Leve                            │
│  🟡 3-4 Moderada                        │
│  🟠 5-7 Forte                           │
│  🔴 8-10 Intensa                        │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  DETALHES DAS REGIÕES:                  │
│                                         │
│  Região      | Intensidade | Tipo      │
│  ──────────────────────────────────────│
│  Lombar      | 6/10        | Queimação │
│                                         │
│  OBSERVAÇÕES:                           │
│  Dor piora ao sentar por muito tempo.   │
│  Melhora com alongamento.               │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  Clínica Activity Fisioterapia          │
│  Dr. Silva - CREFITO 3/12345-F          │
│  (11) 98765-4321                        │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔧 Tecnologias Utilizadas

**Frontend:**
- SVG interativo (corpo humano)
- Canvas API (desenho)
- React (componentes)

**Backend:**
- Supabase (Banco de dados)
- jsPDF (Geração de PDF)

**Design:**
- Anatomia humana realista
- Músculos visíveis
- Proporções corretas

---

## 📊 Estrutura do Banco de Dados

```sql
CREATE TABLE pain_maps (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES sessions(id),
  patient_id UUID REFERENCES patients(id),
  regions JSONB, -- Array de regiões
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Exemplo de regions JSONB:
{
  "regions": [
    {
      "name": "Lombar",
      "intensity": 6,
      "type": "Queimação",
      "notes": "Dor piora ao sentar",
      "color": "#F97316"
    }
  ]
}
```

---

## 🎯 Benefícios

**Para o Fisioterapeuta:**
- Registro visual e preciso
- Comparação fácil entre sessões
- Documentação profissional
- Exportação para paciente

**Para o Paciente:**
- Visualização clara da evolução
- PDF para compartilhar
- Motivação ao ver melhora

**Para a Clínica:**
- Diferencial competitivo
- Profissionalismo
- Documentação completa

---

## 📊 Métricas de Sucesso

- Uso em > 80% das sessões
- Tempo de registro < 2 minutos
- Satisfação do fisioterapeuta > 90%
- Pacientes compartilham PDF

---

## ✅ Checklist de Implementação

- [ ] Criar SVG do corpo humano
- [ ] Implementar regiões clicáveis
- [ ] Sistema de cores
- [ ] Modal de registro
- [ ] Salvar no banco
- [ ] Histórico de mapas
- [ ] Comparação entre sessões
- [ ] Gráfico de evolução
- [ ] Geração de PDF
- [ ] Testes com fisioterapeutas

---

**Tempo de Implementação:** 3-4 semanas  
**Prioridade:** 🔴 CRÍTICA  
**Diferencial:** ⭐⭐⭐⭐⭐ (Único no Brasil)
