import FormWrapper from './FormWrapper';
import Security_Officer___Runs_background_check_for_sensitive_areas from './forms/Security_Officer___Runs_background_check_for_sensitive_areas';

export default function Security_Officer___Runs_background_check_for_sensitive_areasWrapper() {
  return (
    <FormWrapper
      formType="Security Officer Runs Background Check For Sensitive Areas"
      apiEndpoint="/security-officer-runs-background-check-for-sensitive-areas/submit"
    >
      {({ onSubmit, loading }) => (
        <Security_Officer___Runs_background_check_for_sensitive_areas onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
