import FormWrapper from './FormWrapper';
import Employee___Submits_expense_claim_with_expense_type__amount__d___ from './forms/Employee___Submits_expense_claim_with_expense_type,_amount,_d...';

export default function Employee___Submits_expense_claim_with_expense_type_amount_dWrapper() {
  return (
    <FormWrapper
      formType="Employee   Submits Expense Claim With Expense Type, Amount, D..."
      apiEndpoint="/employee---submits-expense-claim-with-expense-type,-amount,-d.../submit"
    >
      {({ onSubmit, loading }) => (
        <Employee___Submits_expense_claim_with_expense_type__amount__d___ onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
