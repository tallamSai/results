import FormWrapper from './FormWrapper';
import Procurement_Manager___Selects_winning_vendor from './forms/Procurement_Manager___Selects_winning_vendor';

export default function Procurement_Manager___Selects_winning_vendorWrapper() {
  return (
    <FormWrapper
      formType="Procurement Manager   Selects Winning Vendor"
      apiEndpoint="/procurement-manager---selects-winning-vendor/submit"
    >
      {({ onSubmit, loading }) => (
        <Procurement_Manager___Selects_winning_vendor onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
