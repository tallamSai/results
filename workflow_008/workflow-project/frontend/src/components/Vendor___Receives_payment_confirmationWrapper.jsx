import FormWrapper from './FormWrapper';
import Vendor___Receives_payment_confirmation from './forms/Vendor___Receives_payment_confirmation';

export default function Vendor___Receives_payment_confirmationWrapper() {
  return (
    <FormWrapper
      formType="Vendor   Receives Payment Confirmation"
      apiEndpoint="/vendor---receives-payment-confirmation/submit"
    >
      {({ onSubmit, loading }) => (
        <Vendor___Receives_payment_confirmation onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
