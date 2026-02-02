import FormWrapper from './FormWrapper';
import IT_Administrator___Provisions_access_and_sends_credentials from './forms/IT_Administrator___Provisions_access_and_sends_credentials';

export default function IT_Administrator___Provisions_access_and_sends_credentialsWrapper() {
  return (
    <FormWrapper
      formType="IT Administrator   Provisions Access And Sends Credentials"
      apiEndpoint="/it-administrator---provisions-access-and-sends-credentials/submit"
    >
      {({ onSubmit, loading }) => (
        <IT_Administrator___Provisions_access_and_sends_credentials onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
