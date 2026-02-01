import FormWrapper from './FormWrapper';
import HR_Representative___Updates_leave_balance_and_records_approved_leave_i___ from './forms/HR_Representative___Updates_leave_balance_and_records_approved_leave_i...';

export default function HR_Representative___Updates_leave_balance_and_records_approved_leave_iWrapper() {
  return (
    <FormWrapper
      formType="HR_Representative___Updates_leave_balance_and_records_approved_leave_i..."
      apiEndpoint="/hr-representative---updates-leave-balance-and-records-approved-leave-i.../submit"
    >
      {({ onSubmit, loading }) => (
        <HR_Representative___Updates_leave_balance_and_records_approved_leave_i___ onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
