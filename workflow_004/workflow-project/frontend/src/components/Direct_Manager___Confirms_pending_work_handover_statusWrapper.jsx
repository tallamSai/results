import FormWrapper from './FormWrapper';
import Direct_Manager___Confirms_pending_work_handover_status from './forms/Direct_Manager___Confirms_pending_work_handover_status';

export default function Direct_Manager___Confirms_pending_work_handover_statusWrapper() {
  return (
    <FormWrapper
      formType="Direct Manager   Confirms Pending Work Handover Status"
      apiEndpoint="/direct-manager---confirms-pending-work-handover-status/submit"
    >
      {({ onSubmit, loading }) => (
        <Direct_Manager___Confirms_pending_work_handover_status onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
