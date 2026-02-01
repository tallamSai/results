import FormWrapper from './FormWrapper';
import Hiring_Manager___Reviews_the_submission from './forms/Hiring_Manager___Reviews_the_submission';

export default function Hiring_Manager___Reviews_the_submissionWrapper() {
  return (
    <FormWrapper
      formType="Hiring Manager Reviews The Submission"
      apiEndpoint="/hiring-manager-reviews-the-submission/submit"
    >
      {({ onSubmit, loading }) => (
        <Hiring_Manager___Reviews_the_submission onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
