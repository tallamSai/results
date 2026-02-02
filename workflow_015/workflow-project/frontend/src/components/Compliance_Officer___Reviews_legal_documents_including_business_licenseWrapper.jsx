import FormWrapper from './FormWrapper';
import Compliance_Officer___Reviews_legal_documents_including_business_license___ from './forms/Compliance_Officer___Reviews_legal_documents_including_business_license...';

export default function Compliance_Officer___Reviews_legal_documents_including_business_licenseWrapper() {
  return (
    <FormWrapper
      formType="Compliance Officer   Reviews Legal Documents Including Business License..."
      apiEndpoint="/compliance-officer---reviews-legal-documents-including-business-license.../submit"
    >
      {({ onSubmit, loading }) => (
        <Compliance_Officer___Reviews_legal_documents_including_business_license___ onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
