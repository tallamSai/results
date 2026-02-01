import FormWrapper from './FormWrapper';
import HR_Representative___Collects_new_hire_information__Sends_welcome_packa___ from './forms/HR_Representative___Collects_new_hire_information,_Sends_welcome_packa...';

export default function HR_Representative___Collects_new_hire_information_Sends_welcome_packaWrapper() {
  return (
    <FormWrapper
      formType="HR Representative - Collects New Hire Information, Sends Welcome Packa..."
      apiEndpoint="/hr-representative---collects-new-hire-information,-sends-welcome-packa.../submit"
    >
      {({ onSubmit, loading }) => (
        <HR_Representative___Collects_new_hire_information__Sends_welcome_packa___ onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
