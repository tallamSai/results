import FormWrapper from './FormWrapper';
import Employee___Submits_a_training_request_with_course_name__train___ from './forms/Employee___Submits_a_training_request_with_course_name,_train...';

export default function Employee___Submits_a_training_request_with_course_name_trainWrapper() {
  return (
    <FormWrapper
      formType="Employee   Submits A Training Request With Course Name, Train..."
      apiEndpoint="/employee---submits-a-training-request-with-course-name,-train.../submit"
    >
      {({ onSubmit, loading }) => (
        <Employee___Submits_a_training_request_with_course_name__train___ onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
