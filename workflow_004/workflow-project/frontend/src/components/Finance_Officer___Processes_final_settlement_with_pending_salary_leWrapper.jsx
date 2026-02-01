import FormWrapper from './FormWrapper';
import Finance_Officer___Processes_final_settlement_with_pending_salary__le___ from './forms/Finance_Officer___Processes_final_settlement_with_pending_salary,_le...';

export default function Finance_Officer___Processes_final_settlement_with_pending_salary_leWrapper() {
  return (
    <FormWrapper
      formType="Finance Officer   Processes Final Settlement With Pending Salary, Le..."
      apiEndpoint="/finance-officer---processes-final-settlement-with-pending-salary,-le.../submit"
    >
      {({ onSubmit, loading }) => (
        <Finance_Officer___Processes_final_settlement_with_pending_salary__le___ onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
