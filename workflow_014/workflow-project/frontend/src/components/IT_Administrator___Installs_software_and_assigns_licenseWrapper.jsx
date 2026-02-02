import FormWrapper from './FormWrapper';
import IT_Administrator___Installs_software_and_assigns_license from './forms/IT_Administrator___Installs_software_and_assigns_license';

export default function IT_Administrator___Installs_software_and_assigns_licenseWrapper() {
  return (
    <FormWrapper
      formType="IT Administrator Installs Software And Assigns License"
      apiEndpoint="/it-administrator-installs-software-and-assigns-license/submit"
    >
      {({ onSubmit, loading }) => (
        <IT_Administrator___Installs_software_and_assigns_license onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
