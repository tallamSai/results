import FormWrapper from './FormWrapper';
import Procurement_Officer___Sends_RFQ_to_approved_vendors from './forms/Procurement_Officer___Sends_RFQ_to_approved_vendors';

export default function Procurement_Officer___Sends_RFQ_to_approved_vendorsWrapper() {
  return (
    <FormWrapper
      formType="Procurement Officer Sends Rfq To Approved Vendors"
      apiEndpoint="/procurement-officer-sends-rfq-to-approved-vendors/submit"
    >
      {({ onSubmit, loading }) => (
        <Procurement_Officer___Sends_RFQ_to_approved_vendors onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
