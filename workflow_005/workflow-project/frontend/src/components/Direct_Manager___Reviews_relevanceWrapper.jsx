import FormWrapper from './FormWrapper';
import Direct_Manager___Reviews_relevance from './forms/Direct_Manager___Reviews_relevance';

export default function Direct_Manager___Reviews_relevanceWrapper() {
  return (
    <FormWrapper
      formType="Direct Manager   Reviews Relevance"
      apiEndpoint="/direct-manager---reviews-relevance/submit"
    >
      {({ onSubmit, loading }) => (
        <Direct_Manager___Reviews_relevance onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
