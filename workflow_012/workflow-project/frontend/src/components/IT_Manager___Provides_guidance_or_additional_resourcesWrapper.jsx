import FormWrapper from './FormWrapper';
import IT_Manager___Provides_guidance_or_additional_resources from './forms/IT_Manager___Provides_guidance_or_additional_resources';

export default function IT_Manager___Provides_guidance_or_additional_resourcesWrapper() {
  return (
    <FormWrapper
      formType="IT Manager   Provides Guidance Or Additional Resources"
      apiEndpoint="/it-manager---provides-guidance-or-additional-resources/submit"
    >
      {({ onSubmit, loading }) => (
        <IT_Manager___Provides_guidance_or_additional_resources onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
