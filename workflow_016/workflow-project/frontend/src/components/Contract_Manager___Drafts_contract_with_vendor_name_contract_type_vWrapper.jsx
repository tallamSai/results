import FormWrapper from './FormWrapper';
import Contract_Manager___Drafts_contract_with_vendor_name__contract_type__v___ from './forms/Contract_Manager___Drafts_contract_with_vendor_name,_contract_type,_v...';

export default function Contract_Manager___Drafts_contract_with_vendor_name_contract_type_vWrapper() {
  return (
    <FormWrapper
      formType="Contract Manager   Drafts Contract With Vendor Name, Contract Type, V..."
      apiEndpoint="/contract-manager---drafts-contract-with-vendor-name,-contract-type,-v.../submit"
    >
      {({ onSubmit, loading }) => (
        <Contract_Manager___Drafts_contract_with_vendor_name__contract_type__v___ onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
