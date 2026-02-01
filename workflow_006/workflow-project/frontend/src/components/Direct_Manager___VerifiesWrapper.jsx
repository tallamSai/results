import FormWrapper from './FormWrapper';
import Direct_Manager___Verifies from './forms/Direct_Manager___Verifies';

export default function Direct_Manager___VerifiesWrapper() {
  return (
    <FormWrapper
      formType="Direct Manager   Verifies"
      apiEndpoint="/direct-manager---verifies/submit"
    >
      {({ onSubmit, loading }) => (
        <Direct_Manager___Verifies onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
