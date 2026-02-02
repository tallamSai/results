import FormWrapper from './FormWrapper';
import Procurement_Officer___Initiates_vendor_registration_with_company_name__c___ from './forms/Procurement_Officer___Initiates_vendor_registration_with_company_name,_c...';

export default function Procurement_Officer___Initiates_vendor_registration_with_company_name_cWrapper() {
  return (
    <FormWrapper
      formType="Procurement Officer   Initiates Vendor Registration With Company Name, C..."
      apiEndpoint="/procurement-officer---initiates-vendor-registration-with-company-name,-c.../submit"
    >
      {({ onSubmit, loading }) => (
        <Procurement_Officer___Initiates_vendor_registration_with_company_name__c___ onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
