import FormWrapper from './FormWrapper';
import Employee___Requests_software_with_software_name__version__bus___ from './forms/Employee___Requests_software_with_software_name,_version,_bus...';

export default function Employee___Requests_software_with_software_name_version_busWrapper() {
  return (
    <FormWrapper
      formType="Employee   Requests Software With Software Name, Version, Bus..."
      apiEndpoint="/employee---requests-software-with-software-name,-version,-bus.../submit"
    >
      {({ onSubmit, loading }) => (
        <Employee___Requests_software_with_software_name__version__bus___ onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
