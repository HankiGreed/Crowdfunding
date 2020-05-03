import React from 'react';
import {Header, Form, Button} from 'semantic-ui-react';
import history from '../history';

const Home = () => {
  const [address, setAddress] = React.useState('');
  const formControl = (event) => {
    event.preventDefault();
    setAddress(event.target.value);
  };
  const navigateToAddress = () => {
    history.push(`/campaign/${address}`);
  };
  return (
    <React.Fragment>
      <Header as="h1">Crowdfunding Application !</Header>
      <Form>
        <Form.Input
          label="Contract Address"
          type="text"
          value={address}
          onChange={formControl}
        />
        <Button type="submit" onClick={navigateToAddress}>
          Submit
        </Button>
      </Form>
    </React.Fragment>
  );
};

export default Home;
