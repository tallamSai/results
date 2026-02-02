import FormWrapper from './FormWrapper';
import Vendor___Receives_confirmation_and_welcome_package from './forms/Vendor___Receives_confirmation_and_welcome_package';

export default function Vendor___Receives_confirmation_and_welcome_packageWrapper() {
  return (
    <FormWrapper
      formType="Vendor Receives Confirmation And Welcome Package"
      apiEndpoint="/vendor-receives-confirmation-and-welcome-package/submit"
    >
      {({ onSubmit, loading }) => (
        <Vendor___Receives_confirmation_and_welcome_package onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
