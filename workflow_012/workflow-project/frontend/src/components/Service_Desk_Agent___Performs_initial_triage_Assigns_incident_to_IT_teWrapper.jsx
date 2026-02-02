import FormWrapper from './FormWrapper';
import Service_Desk_Agent___Performs_initial_triage__Assigns_incident_to_IT_te___ from './forms/Service_Desk_Agent___Performs_initial_triage,_Assigns_incident_to_IT_te...';

export default function Service_Desk_Agent___Performs_initial_triage_Assigns_incident_to_IT_teWrapper() {
  return (
    <FormWrapper
      formType="Service Desk Agent   Performs Initial Triage, Assigns Incident To It Te..."
      apiEndpoint="/service-desk-agent---performs-initial-triage,-assigns-incident-to-it-te.../submit"
    >
      {({ onSubmit, loading }) => (
        <Service_Desk_Agent___Performs_initial_triage__Assigns_incident_to_IT_te___ onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
