import FormWrapper from './FormWrapper';
import Finance_Officer___Sets_up_vendor_in_payment_system_with_bank_details___ from './forms/Finance_Officer___Sets_up_vendor_in_payment_system_with_bank_details...';

export default function Finance_Officer___Sets_up_vendor_in_payment_system_with_bank_detailsWrapper() {
  return (
    <FormWrapper
      formType="Finance Officer   Sets Up Vendor In Payment System With Bank Details..."
      apiEndpoint="/finance-officer---sets-up-vendor-in-payment-system-with-bank-details.../submit"
    >
      {({ onSubmit, loading }) => (
        <Finance_Officer___Sets_up_vendor_in_payment_system_with_bank_details___ onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
