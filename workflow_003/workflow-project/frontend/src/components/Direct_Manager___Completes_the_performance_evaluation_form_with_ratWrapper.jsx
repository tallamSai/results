import FormWrapper from './FormWrapper';
import Direct_Manager___Completes_the_performance_evaluation_form_with_rat___ from './forms/Direct_Manager___Completes_the_performance_evaluation_form_with_rat...';

export default function Direct_Manager___Completes_the_performance_evaluation_form_with_ratWrapper() {
  return (
    <FormWrapper
      formType="Direct Manager   Completes The Performance Evaluation Form With Rat..."
      apiEndpoint="/direct-manager---completes-the-performance-evaluation-form-with-rat.../submit"
    >
      {({ onSubmit, loading }) => (
        <Direct_Manager___Completes_the_performance_evaluation_form_with_rat___ onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
