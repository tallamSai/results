import FormWrapper from './FormWrapper';
import Finance_Analyst___Reviews_and_provides_recommendations from './forms/Finance_Analyst___Reviews_and_provides_recommendations';

export default function Finance_Analyst___Reviews_and_provides_recommendationsWrapper() {
  return (
    <FormWrapper
      formType="Finance Analyst   Reviews And Provides Recommendations"
      apiEndpoint="/finance-analyst---reviews-and-provides-recommendations/submit"
    >
      {({ onSubmit, loading }) => (
        <Finance_Analyst___Reviews_and_provides_recommendations onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
