import FormWrapper from './FormWrapper';
import HR_Representative___Enrolls_the_employee_and_sends_confirmation_with_t___ from './forms/HR_Representative___Enrolls_the_employee_and_sends_confirmation_with_t...';

export default function HR_Representative___Enrolls_the_employee_and_sends_confirmation_with_tWrapper() {
  return (
    <FormWrapper
      formType="HR Representative Enrolls the Employee and Sends Confirmation With T..."
      apiEndpoint="/hr-representative-enrolls-the-employee-and-sends-confirmation-with-t.../submit"
    >
      {({ onSubmit, loading }) => (
        <HR_Representative___Enrolls_the_employee_and_sends_confirmation_with_t___ onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
