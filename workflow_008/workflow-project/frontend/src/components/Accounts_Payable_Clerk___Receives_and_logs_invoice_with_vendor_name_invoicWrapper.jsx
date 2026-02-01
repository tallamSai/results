import FormWrapper from './FormWrapper';
import Accounts_Payable_Clerk___Receives_and_logs_invoice_with_vendor_name__invoic___ from './forms/Accounts_Payable_Clerk___Receives_and_logs_invoice_with_vendor_name,_invoic...';

export default function Accounts_Payable_Clerk___Receives_and_logs_invoice_with_vendor_name_invoicWrapper() {
  return (
    <FormWrapper
      formType="Accounts Payable Clerk   Receives And Logs Invoice With Vendor Name, Invoic..."
      apiEndpoint="/accounts-payable-clerk---receives-and-logs-invoice-with-vendor-name,-invoic.../submit"
    >
      {({ onSubmit, loading }) => (
        <Accounts_Payable_Clerk___Receives_and_logs_invoice_with_vendor_name__invoic___ onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
