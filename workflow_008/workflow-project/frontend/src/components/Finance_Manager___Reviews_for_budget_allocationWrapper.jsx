import FormWrapper from './FormWrapper';
import Finance_Manager___Reviews_for_budget_allocation from './forms/Finance_Manager___Reviews_for_budget_allocation';

export default function Finance_Manager___Reviews_for_budget_allocationWrapper() {
  return (
    <FormWrapper
      formType="Finance Manager   Reviews For Budget Allocation"
      apiEndpoint="/finance-manager---reviews-for-budget-allocation/submit"
    >
      {({ onSubmit, loading }) => (
        <Finance_Manager___Reviews_for_budget_allocation onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
