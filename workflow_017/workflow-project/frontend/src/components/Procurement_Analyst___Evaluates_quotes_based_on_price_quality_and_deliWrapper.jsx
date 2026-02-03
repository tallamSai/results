import FormWrapper from './FormWrapper';
import Procurement_Analyst___Evaluates_quotes_based_on_price__quality__and_deli___ from './forms/Procurement_Analyst___Evaluates_quotes_based_on_price,_quality,_and_deli...';

export default function Procurement_Analyst___Evaluates_quotes_based_on_price_quality_and_deliWrapper() {
  return (
    <FormWrapper
      formType="Procurement Analyst   Evaluates Quotes Based On Price, Quality, And Deli..."
      apiEndpoint="/procurement-analyst---evaluates-quotes-based-on-price,-quality,-and-deli.../submit"
    >
      {({ onSubmit, loading }) => (
        <Procurement_Analyst___Evaluates_quotes_based_on_price__quality__and_deli___ onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
