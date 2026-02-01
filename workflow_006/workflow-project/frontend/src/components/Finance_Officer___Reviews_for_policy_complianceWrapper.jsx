import FormWrapper from './FormWrapper';
import Finance_Officer___Reviews_for_policy_compliance from './forms/Finance_Officer___Reviews_for_policy_compliance';

export default function Finance_Officer___Reviews_for_policy_complianceWrapper() {
  return (
    <FormWrapper
      formType="Finance Officer   Reviews For Policy Compliance"
      apiEndpoint="/finance-officer---reviews-for-policy-compliance/submit"
    >
      {({ onSubmit, loading }) => (
        <Finance_Officer___Reviews_for_policy_compliance onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
