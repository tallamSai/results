import FormWrapper from './FormWrapper';
import Reception_Desk___Prepares_visitor_badge from './forms/Reception_Desk___Prepares_visitor_badge';

export default function Reception_Desk___Prepares_visitor_badgeWrapper() {
  return (
    <FormWrapper
      formType="Reception Desk Prepares Visitor Badge"
      apiEndpoint="/reception-desk-prepares-visitor-badge/submit"
    >
      {({ onSubmit, loading }) => (
        <Reception_Desk___Prepares_visitor_badge onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
