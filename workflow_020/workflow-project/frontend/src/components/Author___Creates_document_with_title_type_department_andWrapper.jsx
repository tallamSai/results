import FormWrapper from './FormWrapper';
import Author___Creates_document_with_title__type__department__and___ from './forms/Author___Creates_document_with_title,_type,_department,_and...';

export default function Author___Creates_document_with_title_type_department_andWrapper() {
  return (
    <FormWrapper
      formType="Author   Creates Document With Title, Type, Department, And..."
      apiEndpoint="/author---creates-document-with-title,-type,-department,-and.../submit"
    >
      {({ onSubmit, loading }) => (
        <Author___Creates_document_with_title__type__department__and___ onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
