import { FC, ReactNode, useMemo, useState } from 'react'
import { isDev } from '../../lib/constants'
import Steps from './Steps'

export type StepRenderFunc = (props: {
  steps: ReactNode
  onAdvance: () => void
  onBack: () => void
}) => ReactNode

export type Step = {
  name: string
  content: StepRenderFunc | ReactNode
}

function isContentRenderFunc(value: Step['content']): value is StepRenderFunc {
  return typeof value === 'function'
}

type StepperProps = {
  steps?: Step[]
  customStepperUIPlacement?: boolean
  contentWrapperElement?: FC
  onComplete?: () => void
}

const Stepper = ({
  steps = [],
  onComplete,
  customStepperUIPlacement = false,
  contentWrapperElement: ContentWrapper = ({ children }) => (
    <div>{children}</div>
  ),
}: StepperProps) => {
  const [activeStep, setActiveStep] = useState<number>(0)

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      const nextUp = activeStep + 1
      setActiveStep(nextUp)
    } else if (onComplete) {
      onComplete()
    }
  }

  const handleBack = () => {
    if (activeStep > 0) {
      const nextUp = activeStep - 1
      setActiveStep(nextUp)
    } else if (isDev) {
      console.warn('Attempting to go back on step 0')
    }
  }

  const currentStep = useMemo(() => steps[activeStep], [steps, activeStep])

  const stepsUI = (
    <Steps
      currentStep={activeStep}
      stepCount={steps.length}
      setStep={(val) => {
        setActiveStep(val)
      }}
    />
  )

  return (
    <div>
      <ContentWrapper>
        {currentStep?.content && (
          <>
            {isContentRenderFunc(currentStep.content)
              ? currentStep.content({
                  steps: stepsUI,
                  onAdvance: handleNext,
                  onBack: handleBack,
                })
              : currentStep.content}
          </>
        )}
      </ContentWrapper>
      {!customStepperUIPlacement && stepsUI}
    </div>
  )
}

export default Stepper
