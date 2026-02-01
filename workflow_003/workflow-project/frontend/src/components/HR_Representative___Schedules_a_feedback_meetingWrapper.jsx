import FormWrapper from './FormWrapper';
import HR_Representative___Schedules_a_feedback_meeting from './forms/HR_Representative___Schedules_a_feedback_meeting';

export default function HR_Representative___Schedules_a_feedback_meetingWrapper() {
  return (
    <FormWrapper
      formType="Hr Representative Schedules A Feedback Meeting"
      apiEndpoint="/hr-representative-schedules-a-feedback-meeting/submit"
    >
      {({ onSubmit, loading }) => (
        <HR_Representative___Schedules_a_feedback_meeting onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
