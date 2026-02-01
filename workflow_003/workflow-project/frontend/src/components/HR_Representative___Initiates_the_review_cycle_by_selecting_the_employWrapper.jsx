import FormWrapper from './FormWrapper';
import HR_Representative___Initiates_the_review_cycle_by_selecting_the_employ___ from './forms/HR_Representative___Initiates_the_review_cycle_by_selecting_the_employ...';

export default function HR_Representative___Initiates_the_review_cycle_by_selecting_the_employWrapper() {
  return (
    <FormWrapper
      formType="HR Representative   Initiates The Review Cycle By Selecting The Employ..."
      apiEndpoint="/hr-representative---initiates-the-review-cycle-by-selecting-the-employ.../submit"
    >
      {({ onSubmit, loading }) => (
        <HR_Representative___Initiates_the_review_cycle_by_selecting_the_employ___ onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
