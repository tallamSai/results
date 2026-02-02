import FormWrapper from './FormWrapper';
import End_User___Reports_an_issue_by_submitting_a_ticket from './forms/End_User___Reports_an_issue_by_submitting_a_ticket';

export default function End_User___Reports_an_issue_by_submitting_a_ticketWrapper() {
  return (
    <FormWrapper
      formType="End User   Reports An Issue By Submitting A Ticket"
      apiEndpoint="/end-user---reports-an-issue-by-submitting-a-ticket/submit"
    >
      {({ onSubmit, loading }) => (
        <End_User___Reports_an_issue_by_submitting_a_ticket onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
