import FormWrapper from './FormWrapper';
import Employee___Requests_system_access_with_system_name__access_ty___ from './forms/Employee___Requests_system_access_with_system_name,_access_ty...';

export default function Employee___Requests_system_access_with_system_name_access_tyWrapper() {
  return (
    <FormWrapper
      formType="Employee   Requests System Access With System Name, Access Ty..."
      apiEndpoint="/employee---requests-system-access-with-system-name,-access-ty.../submit"
    >
      {({ onSubmit, loading }) => (
        <Employee___Requests_system_access_with_system_name__access_ty___ onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
