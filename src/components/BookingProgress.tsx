// components/BookingProgress.tsx
import React from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';
import type { BookingStep } from '../types';

interface BookingProgressProps {
  steps: BookingStep[];
  currentStep: number;
}

const BookingProgress: React.FC<BookingProgressProps> = ({ steps, currentStep }) => {
  return (
    <div className="bg-transparent z-10 py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center max-w-lg mx-auto">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                  ${step.completed 
                    ? 'bg-green-500 text-white' 
                    : step.active 
                      ? 'bg-[#FFD875] text-black' 
                      : 'bg-slate-600/70 text-gray-300'
                  }
                `}>
                  {step.completed ? (
                    <CheckIcon className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="ml-2 hidden sm:block">
                  <div className={`text-xs font-medium ${
                    step.active ? 'text-[#FFD875]' : 
                    step.completed ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </div>
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 transition-colors duration-300 ${
                  steps[index + 1].completed || steps[index + 1].active 
                    ? 'bg-[#FFD875]' 
                    : 'bg-slate-600/70'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookingProgress;
