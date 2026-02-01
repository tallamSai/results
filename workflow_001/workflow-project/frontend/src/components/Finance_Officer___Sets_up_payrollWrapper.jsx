import FormWrapper from './FormWrapper';
import Finance_Officer___Sets_up_payroll from './forms/Finance_Officer___Sets_up_payroll';

export default function Finance_Officer___Sets_up_payrollWrapper() {
  return (
    <FormWrapper
      formType="Finance Officer   Sets Up Payroll"
      apiEndpoint="/finance-officer---sets-up-payroll/submit"
    >
      {({ onSubmit, loading }) => (
        <Finance_Officer___Sets_up_payroll onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
