import FormWrapper from './FormWrapper';
import Finance_Officer___Processes_payment from './forms/Finance_Officer___Processes_payment';

export default function Finance_Officer___Processes_paymentWrapper() {
  return (
    <FormWrapper
      formType="Finance Officer   Processes Payment"
      apiEndpoint="/finance-officer---processes-payment/submit"
    >
      {({ onSubmit, loading }) => (
        <Finance_Officer___Processes_payment onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
