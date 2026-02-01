import FormWrapper from './FormWrapper';
import Finance_Officer___Processes_payment_by_entering_payment_date_and_tra___ from './forms/Finance_Officer___Processes_payment_by_entering_payment_date_and_tra...';

export default function Finance_Officer___Processes_payment_by_entering_payment_date_and_traWrapper() {
  return (
    <FormWrapper
      formType="Finance Officer   Processes Payment By Entering Payment Date And Tra..."
      apiEndpoint="/finance-officer---processes-payment-by-entering-payment-date-and-tra.../submit"
    >
      {({ onSubmit, loading }) => (
        <Finance_Officer___Processes_payment_by_entering_payment_date_and_tra___ onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
