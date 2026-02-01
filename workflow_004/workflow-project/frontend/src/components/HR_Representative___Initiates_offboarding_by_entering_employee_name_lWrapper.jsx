import FormWrapper from './FormWrapper';
import HR_Representative___Initiates_offboarding_by_entering_employee_name__l___ from './forms/HR_Representative___Initiates_offboarding_by_entering_employee_name,_l...';

export default function HR_Representative___Initiates_offboarding_by_entering_employee_name_lWrapper() {
  return (
    <FormWrapper
      formType="HR Representative   Initiates Offboarding By Entering Employee Name, L..."
      apiEndpoint="/hr-representative---initiates-offboarding-by-entering-employee-name,-l.../submit"
    >
      {({ onSubmit, loading }) => (
        <HR_Representative___Initiates_offboarding_by_entering_employee_name__l___ onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
