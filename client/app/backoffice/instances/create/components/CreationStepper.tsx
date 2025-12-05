/**
 * CreationStepper Component
 * Sprint 11 - US-056: Instance Creation Flow
 *
 * Visual stepper showing the progress through instance creation steps.
 */

'use client';

import React from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';

export type CreationStep = 'select' | 'input' | 'extract' | 'validate' | 'confirm';

interface StepConfig {
  id: CreationStep;
  label: string;
  description: string;
}

const STEPS: StepConfig[] = [
  { id: 'select', label: 'Tipo', description: 'Selecionar tipo de objeto' },
  { id: 'input', label: 'Entrada', description: 'Informar dados' },
  { id: 'extract', label: 'Extração', description: 'Extrair campos' },
  { id: 'validate', label: 'Validação', description: 'Validar dados' },
  { id: 'confirm', label: 'Confirmar', description: 'Criar instância' },
];

interface CreationStepperProps {
  currentStep: CreationStep;
  completedSteps: CreationStep[];
  onStepClick?: (step: CreationStep) => void;
  className?: string;
}

export function CreationStepper({
  currentStep,
  completedSteps,
  onStepClick,
  className = '',
}: CreationStepperProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <nav aria-label="Progress" className={className}>
      <ol className="flex items-center">
        {STEPS.map((step, stepIdx) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStep;
          const isPast = stepIdx < currentIndex;
          const isClickable = onStepClick && (isCompleted || isPast);

          return (
            <li
              key={step.id}
              className={`relative ${stepIdx !== STEPS.length - 1 ? 'flex-1 pr-8' : ''}`}
            >
              {/* Connector Line */}
              {stepIdx !== STEPS.length - 1 && (
                <div
                  className="absolute top-4 left-8 w-full h-0.5 -translate-y-1/2"
                  aria-hidden="true"
                >
                  <div
                    className={`h-full ${
                      isCompleted || isPast ? 'bg-blue-500' : 'bg-gray-200'
                    }`}
                  />
                </div>
              )}

              {/* Step Circle + Content */}
              <button
                type="button"
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={`
                  group flex items-center gap-3 relative z-10
                  ${isClickable ? 'cursor-pointer' : 'cursor-default'}
                `}
              >
                {/* Circle */}
                <span
                  className={`
                    flex items-center justify-center w-8 h-8 rounded-full
                    text-sm font-medium transition-colors
                    ${
                      isCompleted
                        ? 'bg-blue-600 text-white'
                        : isCurrent
                        ? 'bg-blue-600 text-white ring-2 ring-blue-500 ring-offset-2 ring-offset-white'
                        : 'bg-gray-200 text-gray-500'
                    }
                    ${isClickable ? 'group-hover:bg-blue-500' : ''}
                  `}
                >
                  {isCompleted ? (
                    <CheckIcon className="w-5 h-5" />
                  ) : (
                    <span>{stepIdx + 1}</span>
                  )}
                </span>

                {/* Label */}
                <div className="hidden sm:block">
                  <p
                    className={`text-sm font-medium ${
                      isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default CreationStepper;
