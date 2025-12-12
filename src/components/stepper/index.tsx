import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';



interface stepProps{
  step: string[];
  activeNumberStep: number;
}


export default function HorizontalLinearAlternativeLabelStepper({step, activeNumberStep}: stepProps) {
  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeNumberStep} alternativeLabel>
        {step.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}
