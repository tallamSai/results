import FormWrapper from './FormWrapper';
import Employee___Submits_maintenance_request_with_location__issue_t___ from './forms/Employee___Submits_maintenance_request_with_location,_issue_t...';

export default function Employee___Submits_maintenance_request_with_location_issue_tWrapper() {
  return (
    <FormWrapper
      formType="Employee   Submits Maintenance Request With Location, Issue T..."
      apiEndpoint="/employee---submits-maintenance-request-with-location,-issue-t.../submit"
    >
      {({ onSubmit, loading }) => (
        <Employee___Submits_maintenance_request_with_location__issue_t___ onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
