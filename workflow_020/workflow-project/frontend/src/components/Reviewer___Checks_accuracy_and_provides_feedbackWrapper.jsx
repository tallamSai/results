import FormWrapper from './FormWrapper';
import Reviewer___Checks_accuracy_and_provides_feedback from './forms/Reviewer___Checks_accuracy_and_provides_feedback';

export default function Reviewer___Checks_accuracy_and_provides_feedbackWrapper() {
  return (
    <FormWrapper
      formType="Reviewer   Checks Accuracy And Provides Feedback"
      apiEndpoint="/reviewer---checks-accuracy-and-provides-feedback/submit"
    >
      {({ onSubmit, loading }) => (
        <Reviewer___Checks_accuracy_and_provides_feedback onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
