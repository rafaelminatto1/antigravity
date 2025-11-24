"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface TemplateSelectorProps {
  onSelect: (content: string) => void;
}

const templates: { label: string; content: string }[] = [
  {
    label: "Ficha de Avaliação",
    content:
      `<h2>Ficha de Avaliação</h2><p><strong>Queixa principal:</strong></p><p><strong>História clínica:</strong></p>`,
  },
  {
    label: "Evolução de Sessão",
    content:
      `<h2>Evolução</h2><p><strong>Objetivo:</strong></p><p><strong>Intervenções:</strong></p><p><strong>Observações:</strong></p>`,
  },
  {
    label: "Protocolo Padrão",
    content: `<h2>Protocolo</h2><ol><li>Exercício 1</li><li>Exercício 2</li></ol>`,
  },
];

export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setOpen((s) => !s)} className="gap-2">
        Templates
      </Button>
      {open && (
        <div className="absolute z-50 mt-2 w-56 rounded-md border bg-card p-2 shadow">
          <ul className="flex flex-col gap-2">
            {templates.map((t, i) => (
              <li key={i}>
                <button
                  className="w-full text-left rounded px-2 py-1 hover:bg-muted/50"
                  onClick={() => {
                    onSelect(t.content);
                    setOpen(false);
                  }}
                >
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
