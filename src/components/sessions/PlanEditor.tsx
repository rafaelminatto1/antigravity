"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PlanCategory {
  name: string;
  items: string[];
}

interface PlanEditorProps {
  plan: {
    categories?: PlanCategory[];
  };
  onChange: (plan: { categories: PlanCategory[] }) => void;
}

const defaultCategories = [
  { name: "Terapia Manual", items: [] },
  { name: "Eletroterapia", items: [] },
  { name: "Exercícios", items: [] },
  { name: "Orientações", items: [] },
];

export function PlanEditor({ plan, onChange }: PlanEditorProps) {
  const categories = plan.categories && plan.categories.length > 0 
    ? plan.categories 
    : defaultCategories;

  const updateCategory = (index: number, updates: Partial<PlanCategory>) => {
    const newCategories = [...categories];
    newCategories[index] = { ...newCategories[index], ...updates };
    onChange({ categories: newCategories });
  };

  const addItem = (categoryIndex: number) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].items.push("");
    onChange({ categories: newCategories });
  };

  const updateItem = (categoryIndex: number, itemIndex: number, value: string) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].items[itemIndex] = value;
    onChange({ categories: newCategories });
  };

  const removeItem = (categoryIndex: number, itemIndex: number) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].items.splice(itemIndex, 1);
    onChange({ categories: newCategories });
  };

  const addCategory = () => {
    onChange({ categories: [...categories, { name: "", items: [] }] });
  };

  const removeCategory = (index: number) => {
    const newCategories = categories.filter((_, i) => i !== index);
    onChange({ categories: newCategories });
  };

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4 pr-4">
        {categories.map((category, categoryIndex) => (
          <Card key={categoryIndex}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Input
                  value={category.name}
                  onChange={(e) => updateCategory(categoryIndex, { name: e.target.value })}
                  placeholder="Nome da categoria"
                  className="font-semibold"
                />
                {categories.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCategory(categoryIndex)}
                    className="ml-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {category.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-start gap-2">
                  <GripVertical className="h-5 w-5 mt-2 text-muted-foreground" />
                  <Textarea
                    value={item}
                    onChange={(e) => updateItem(categoryIndex, itemIndex, e.target.value)}
                    placeholder="Descreva o procedimento, técnica ou exercício..."
                    className="flex-1 min-h-[60px]"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(categoryIndex, itemIndex)}
                    className="mt-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addItem(categoryIndex)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </CardContent>
          </Card>
        ))}

        <Button
          variant="outline"
          onClick={addCategory}
          className="w-full border-dashed"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Categoria
        </Button>
      </div>
    </ScrollArea>
  );
}

