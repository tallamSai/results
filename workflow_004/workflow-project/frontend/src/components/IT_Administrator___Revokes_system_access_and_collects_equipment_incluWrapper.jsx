import FormWrapper from './FormWrapper';
import IT_Administrator___Revokes_system_access_and_collects_equipment_inclu___ from './forms/IT_Administrator___Revokes_system_access_and_collects_equipment_inclu...';

export default function IT_Administrator___Revokes_system_access_and_collects_equipment_incluWrapper() {
  return (
    <FormWrapper
      formType="IT Administrator   Revokes System Access And Collects Equipment Inclu..."
      apiEndpoint="/it-administrator---revokes-system-access-and-collects-equipment-inclu.../submit"
    >
      {({ onSubmit, loading }) => (
        <IT_Administrator___Revokes_system_access_and_collects_equipment_inclu___ onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
