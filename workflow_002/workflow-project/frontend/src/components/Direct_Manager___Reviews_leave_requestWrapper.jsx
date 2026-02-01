import FormWrapper from './FormWrapper';
import Direct_Manager___Reviews_leave_request from './forms/Direct_Manager___Reviews_leave_request';

export default function Direct_Manager___Reviews_leave_requestWrapper() {
  return (
    <FormWrapper
      formType="Direct Manager   Reviews Leave Request"
      apiEndpoint="/direct-manager---reviews-leave-request/submit"
    >
      {({ onSubmit, loading }) => (
        <Direct_Manager___Reviews_leave_request onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
