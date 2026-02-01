import FormWrapper from './FormWrapper';
import Department_Manager___Verifies_goods_or_services_received from './forms/Department_Manager___Verifies_goods_or_services_received';

export default function Department_Manager___Verifies_goods_or_services_receivedWrapper() {
  return (
    <FormWrapper
      formType="Department Manager Verifies Goods Or Services Received"
      apiEndpoint="/department-manager-verifies-goods-or-services-received/submit"
    >
      {({ onSubmit, loading }) => (
        <Department_Manager___Verifies_goods_or_services_received onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
