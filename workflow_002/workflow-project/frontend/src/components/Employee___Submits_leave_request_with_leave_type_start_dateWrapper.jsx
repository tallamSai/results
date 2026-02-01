import FormWrapper from './FormWrapper';
import Employee___Submits_leave_request_with_leave_type__start_date____ from './forms/Employee___Submits_leave_request_with_leave_type,_start_date,...';

export default function Employee___Submits_leave_request_with_leave_type_start_dateWrapper() {
  return (
    <FormWrapper
      formType="Employee   Submits Leave Request With Leave Type, Start Date,..."
      apiEndpoint="/employee---submits-leave-request-with-leave-type,-start-date,.../submit"
    >
      {({ onSubmit, loading }) => (
        <Employee___Submits_leave_request_with_leave_type__start_date____ onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
