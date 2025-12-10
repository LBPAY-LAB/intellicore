'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InteractiveMessageProps {
  type: 'select' | 'multiselect' | 'confirm';
  options?: string[];
  onResponse: (response: string | string[]) => void;
  disabled?: boolean;
}

export function InteractiveMessage({
  type,
  options = [],
  onResponse,
  disabled = false
}: InteractiveMessageProps) {
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleSelect = (option: string) => {
    if (disabled) return;

    if (type === 'select') {
      setSelectedOption(option);
      onResponse(option);
    } else if (type === 'multiselect') {
      const newSelected = new Set(selectedOptions);
      if (newSelected.has(option)) {
        newSelected.delete(option);
      } else {
        newSelected.add(option);
      }
      setSelectedOptions(newSelected);
    }
  };

  const handleMultiselectSubmit = () => {
    if (disabled) return;
    onResponse(Array.from(selectedOptions));
  };

  const handleConfirm = (confirmed: boolean) => {
    if (disabled) return;
    onResponse(confirmed ? 'Sim' : 'Não');
  };

  if (type === 'confirm') {
    return (
      <div className="flex gap-3 justify-start ml-11">
        <Button
          onClick={() => handleConfirm(true)}
          variant="default"
          disabled={disabled}
          className="bg-green-600 hover:bg-green-700"
        >
          <Check className="mr-2 h-4 w-4" />
          Sim
        </Button>
        <Button
          onClick={() => handleConfirm(false)}
          variant="outline"
          disabled={disabled}
        >
          Não
        </Button>
      </div>
    );
  }

  if (type === 'select') {
    return (
      <div className="flex flex-col gap-2 ml-11 max-w-md">
        {options.map((option) => (
          <Button
            key={option}
            onClick={() => handleSelect(option)}
            variant={selectedOption === option ? 'default' : 'outline'}
            disabled={disabled}
            className="justify-start text-left h-auto py-3 px-4"
          >
            {option}
          </Button>
        ))}
      </div>
    );
  }

  if (type === 'multiselect') {
    return (
      <div className="flex flex-col gap-3 ml-11 max-w-md">
        <Card className="p-3">
          <div className="flex flex-col gap-2">
            {options.map((option) => {
              const isSelected = selectedOptions.has(option);
              return (
                <button
                  key={option}
                  onClick={() => handleSelect(option)}
                  disabled={disabled}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-md border transition-colors text-left",
                    isSelected
                      ? "bg-blue-50 border-blue-500"
                      : "bg-white border-slate-200 hover:bg-slate-50",
                    disabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div
                    className={cn(
                      "flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                      isSelected
                        ? "bg-blue-500 border-blue-500"
                        : "border-slate-300"
                    )}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm">{option}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {selectedOptions.size > 0 && (
          <div className="flex items-center gap-2">
            <Button
              onClick={handleMultiselectSubmit}
              disabled={disabled}
              className="flex-1"
            >
              Continuar ({selectedOptions.size} selecionado{selectedOptions.size > 1 ? 's' : ''})
            </Button>
          </div>
        )}

        {selectedOptions.size > 0 && (
          <div className="flex flex-wrap gap-2">
            {Array.from(selectedOptions).map((option) => (
              <Badge key={option} variant="secondary">
                {option}
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}
