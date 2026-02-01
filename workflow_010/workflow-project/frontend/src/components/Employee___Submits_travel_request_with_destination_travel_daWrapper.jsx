import FormWrapper from './FormWrapper';
import Employee___Submits_travel_request_with_destination__travel_da___ from './forms/Employee___Submits_travel_request_with_destination,_travel_da...';

export default function Employee___Submits_travel_request_with_destination_travel_daWrapper() {
  return (
    <FormWrapper
      formType="Employee Submits Travel Request With Destination, Travel Da..."
      apiEndpoint="/employee-submits-travel-request-with-destination,-travel-da.../submit"
    >
      {({ onSubmit, loading }) => (
        <Employee___Submits_travel_request_with_destination__travel_da___ onSubmit={onSubmit} loading={loading} />
      )}
    </FormWrapper>
  );
}
