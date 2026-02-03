import FormWrapper from './FormWrapper';
import Procurement_Officer___Creates_RFQ_with_item_specifications__quantity__de___ from './forms/Procurement_Officer___Creates_RFQ_with_item_specifications,_quantity,_de...';

export default function Procurement_Officer___Creates_RFQ_with_item_specifications_quantity_deWrapper() {
  return (
    <FormWrapper
      formType="Procurement Officer   Creates Rfq With Item Specifications, Quantity, De..."
      apiEndpoint="/procurement-officer---creates-rfq-with-item-specifications,-quantity,-de.../submit"
    >
      {({ onSubmit, loading }) => (
        <Procurement_Officer___Creates_RFQ_with_item_specifications__quantity__de___ onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
