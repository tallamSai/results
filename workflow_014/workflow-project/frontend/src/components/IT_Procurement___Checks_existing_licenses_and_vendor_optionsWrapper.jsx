import FormWrapper from './FormWrapper';
import IT_Procurement___Checks_existing_licenses_and_vendor_options from './forms/IT_Procurement___Checks_existing_licenses_and_vendor_options';

export default function IT_Procurement___Checks_existing_licenses_and_vendor_optionsWrapper() {
  return (
    <FormWrapper
      formType="It Procurement Checks Existing Licenses And Vendor Options"
      apiEndpoint="/it-procurement-checks-existing-licenses-and-vendor-options/submit"
    >
      {({ onSubmit, loading }) => (
        <IT_Procurement___Checks_existing_licenses_and_vendor_options onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
