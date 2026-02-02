import FormWrapper from './FormWrapper';
import IT_Staff___Submits_change_request_with_change_title__descript___ from './forms/IT_Staff___Submits_change_request_with_change_title,_descript...';

export default function IT_Staff___Submits_change_request_with_change_title_descriptWrapper() {
  return (
    <FormWrapper
      formType="IT Staff   Submits Change Request With Change Title, Descript..."
      apiEndpoint="/it-staff---submits-change-request-with-change-title,-descript.../submit"
    >
      {({ onSubmit, loading }) => (
        <IT_Staff___Submits_change_request_with_change_title__descript___ onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
