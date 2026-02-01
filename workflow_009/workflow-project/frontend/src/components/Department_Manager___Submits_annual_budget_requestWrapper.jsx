import FormWrapper from './FormWrapper';
import Department_Manager___Submits_annual_budget_request from './forms/Department_Manager___Submits_annual_budget_request';

export default function Department_Manager___Submits_annual_budget_requestWrapper() {
  return (
    <FormWrapper
      formType="Department Manager Submits Annual Budget Request"
      apiEndpoint="/department-manager-submits-annual-budget-request/submit"
    >
      {({ onSubmit, loading }) => (
        <Department_Manager___Submits_annual_budget_request onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
