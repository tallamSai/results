import FormWrapper from './FormWrapper';
import IT_Administrator___Provisions_system_access from './forms/IT_Administrator___Provisions_system_access';

export default function IT_Administrator___Provisions_system_accessWrapper() {
  return (
    <FormWrapper
      formType="IT Administrator   Provisions System Access"
      apiEndpoint="/it-administrator---provisions-system-access/submit"
    >
      {({ onSubmit, loading }) => (
        <IT_Administrator___Provisions_system_access onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
