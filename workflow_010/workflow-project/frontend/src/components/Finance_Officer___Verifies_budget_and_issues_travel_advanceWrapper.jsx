import FormWrapper from './FormWrapper';
import Finance_Officer___Verifies_budget_and_issues_travel_advance from './forms/Finance_Officer___Verifies_budget_and_issues_travel_advance';

export default function Finance_Officer___Verifies_budget_and_issues_travel_advanceWrapper() {
  return (
    <FormWrapper
      formType="Finance Officer Verifies Budget And Issues Travel Advance"
      apiEndpoint="/finance-officer-verifies-budget-and-issues-travel-advance/submit"
    >
      {({ onSubmit, loading }) => (
        <Finance_Officer___Verifies_budget_and_issues_travel_advance onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
