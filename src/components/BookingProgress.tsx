// components/BookingProgress.tsx
import React from "react";
import { CheckIcon } from "@heroicons/react/24/solid";
import type { BookingStep } from "../types";

interface BookingProgressProps {
  steps: BookingStep[];
  currentStep: number;
}

const BookingProgress: React.FC<BookingProgressProps> = ({ steps, currentStep }) => {
  // Không hiển thị thanh tiến trình
  return null;
};

export default BookingProgress;
