import FormWrapper from './FormWrapper';
import Legal_Counsel___Reviews_and_suggests_modifications from './forms/Legal_Counsel___Reviews_and_suggests_modifications';

export default function Legal_Counsel___Reviews_and_suggests_modificationsWrapper() {
  return (
    <FormWrapper
      formType="Legal Counsel   Reviews And Suggests Modifications"
      apiEndpoint="/legal-counsel---reviews-and-suggests-modifications/submit"
    >
      {({ onSubmit, loading }) => (
        <Legal_Counsel___Reviews_and_suggests_modifications onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
