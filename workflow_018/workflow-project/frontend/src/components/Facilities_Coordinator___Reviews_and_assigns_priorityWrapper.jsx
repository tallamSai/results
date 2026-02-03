import FormWrapper from './FormWrapper';
import Facilities_Coordinator___Reviews_and_assigns_priority from './forms/Facilities_Coordinator___Reviews_and_assigns_priority';

export default function Facilities_Coordinator___Reviews_and_assigns_priorityWrapper() {
  return (
    <FormWrapper
      formType="Facilities Coordinator   Reviews And Assigns Priority"
      apiEndpoint="/facilities-coordinator---reviews-and-assigns-priority/submit"
    >
      {({ onSubmit, loading }) => (
        <Facilities_Coordinator___Reviews_and_assigns_priority onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
