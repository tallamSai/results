import FormWrapper from './FormWrapper';
import Compliance_Officer___Reviews_visa_and_insurance_requirements from './forms/Compliance_Officer___Reviews_visa_and_insurance_requirements';

export default function Compliance_Officer___Reviews_visa_and_insurance_requirementsWrapper() {
  return (
    <FormWrapper
      formType="Compliance Officer   Reviews Visa And Insurance Requirements"
      apiEndpoint="/compliance-officer---reviews-visa-and-insurance-requirements/submit"
    >
      {({ onSubmit, loading }) => (
        <Compliance_Officer___Reviews_visa_and_insurance_requirements onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
