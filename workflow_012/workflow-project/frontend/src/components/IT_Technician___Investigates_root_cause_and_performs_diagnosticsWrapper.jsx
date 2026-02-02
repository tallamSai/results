import FormWrapper from './FormWrapper';
import IT_Technician___Investigates_root_cause_and_performs_diagnostics____ from './forms/IT_Technician___Investigates_root_cause_and_performs_diagnostics,...';

export default function IT_Technician___Investigates_root_cause_and_performs_diagnosticsWrapper() {
  return (
    <FormWrapper
      formType="IT Technician Investigates Root Cause And Performs Diagnostics"
      apiEndpoint="/it-technician-investigates-root-cause-and-performs-diagnostics/submit"
    >
      {({ onSubmit, loading }) => (
        <IT_Technician___Investigates_root_cause_and_performs_diagnostics____ onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
