import FormWrapper from './FormWrapper';
import Employee___Requests_visitor_access_with_visitor_name__company___ from './forms/Employee___Requests_visitor_access_with_visitor_name,_company...';

export default function Employee___Requests_visitor_access_with_visitor_name_companyWrapper() {
  return (
    <FormWrapper
      formType="Employee Requests Visitor Access With Visitor Name, Company"
      apiEndpoint="/employee-requests-visitor-access-with-visitor-name,-company/submit"
    >
      {({ onSubmit, loading }) => (
        <Employee___Requests_visitor_access_with_visitor_name__company___ onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
