interface Step {
  id: string
  title: string
}

interface StepsProps {
  steps: Step[]
  currentStep: number
}

export function Steps({ steps, currentStep }: StepsProps) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className={`
            flex h-8 w-8 items-center justify-center rounded-full
            ${index <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted'}
          `}>
            {index + 1}
          </div>
          {index < steps.length - 1 && (
            <div className={`h-px w-8 ${index < currentStep ? 'bg-primary' : 'bg-muted'}`} />
          )}
        </div>
      ))}
    </div>
  )
} 