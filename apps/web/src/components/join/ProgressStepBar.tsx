interface ProgressStepBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressStepBar({ currentStep, totalSteps }: ProgressStepBarProps) {
  return (
    <div>
      <div
        className="flex gap-1"
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-label={`Step ${currentStep} of ${totalSteps}`}
      >
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-colors duration-normal"
            style={{ backgroundColor: i < currentStep ? '#4F46E5' : '#E2E8F0' }}
          />
        ))}
      </div>
      <p className="mt-1 text-right text-xs font-semibold text-neutral-500">
        Step {currentStep} of {totalSteps}
      </p>
    </div>
  );
}
