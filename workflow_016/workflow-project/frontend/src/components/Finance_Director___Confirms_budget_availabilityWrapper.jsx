import FormWrapper from './FormWrapper';
import Finance_Director___Confirms_budget_availability from './forms/Finance_Director___Confirms_budget_availability';

export default function Finance_Director___Confirms_budget_availabilityWrapper() {
  return (
    <FormWrapper
      formType="Finance Director   Confirms Budget Availability"
      apiEndpoint="/finance-director---confirms-budget-availability/submit"
    >
      {({ onSubmit, loading }) => (
        <Finance_Director___Confirms_budget_availability onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
