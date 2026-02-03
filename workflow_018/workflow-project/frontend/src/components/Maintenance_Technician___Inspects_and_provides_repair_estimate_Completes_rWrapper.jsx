import FormWrapper from './FormWrapper';
import Maintenance_Technician___Inspects_and_provides_repair_estimate__Completes_r___ from './forms/Maintenance_Technician___Inspects_and_provides_repair_estimate,_Completes_r...';

export default function Maintenance_Technician___Inspects_and_provides_repair_estimate_Completes_rWrapper() {
  return (
    <FormWrapper
      formType="Maintenance Technician   Inspects And Provides Repair Estimate, Completes R..."
      apiEndpoint="/maintenance-technician---inspects-and-provides-repair-estimate,-completes-r.../submit"
    >
      {({ onSubmit, loading }) => (
        <Maintenance_Technician___Inspects_and_provides_repair_estimate__Completes_r___ onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
