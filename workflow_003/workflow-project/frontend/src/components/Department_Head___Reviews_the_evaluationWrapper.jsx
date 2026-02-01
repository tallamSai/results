import FormWrapper from './FormWrapper';
import Department_Head___Reviews_the_evaluation from './forms/Department_Head___Reviews_the_evaluation';

export default function Department_Head___Reviews_the_evaluationWrapper() {
  return (
    <FormWrapper
      formType="Department Head Reviews The Evaluation"
      apiEndpoint="/department-head-reviews-the-evaluation/submit"
    >
      {({ onSubmit, loading }) => (
        <Department_Head___Reviews_the_evaluation onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
