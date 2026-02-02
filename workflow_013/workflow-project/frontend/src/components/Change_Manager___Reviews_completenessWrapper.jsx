import FormWrapper from './FormWrapper';
import Change_Manager___Reviews_completeness from './forms/Change_Manager___Reviews_completeness';

export default function Change_Manager___Reviews_completenessWrapper() {
  return (
    <FormWrapper
      formType="Change Manager   Reviews Completeness"
      apiEndpoint="/change-manager---reviews-completeness/submit"
    >
      {({ onSubmit, loading }) => (
        <Change_Manager___Reviews_completeness onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
