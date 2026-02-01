import FormWrapper from './FormWrapper';
import Finance_Analyst___Allocates_budget_in_the_system from './forms/Finance_Analyst___Allocates_budget_in_the_system';

export default function Finance_Analyst___Allocates_budget_in_the_systemWrapper() {
  return (
    <FormWrapper
      formType="Finance Analyst Allocates Budget In The System"
      apiEndpoint="/finance-analyst-allocates-budget-in-the-system/submit"
    >
      {({ onSubmit, loading }) => (
        <Finance_Analyst___Allocates_budget_in_the_system onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
