import { useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';

function LoginForm(props) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [validationErrors, setValidationErrors] = useState({});

    const handleChangeUsername = (event) => {
        setUsername(event.target.value);

        if("username" in validationErrors) {
            const { username, ...ecc } = validationErrors;
            setValidationErrors(ecc);
        }
    };

    const handleChangePassword = (event) => {
        setPassword(event.target.value);

        if("password" in validationErrors) {
            const { password, ...ecc } = validationErrors;
            setValidationErrors(ecc);
        }
    };

    const validateForm = () => {
        const errors = {};

        if(!username || username.length === 0) {
            errors.username = "Please provide a valid username.";
        }

        if(!password || password.trim() === '') {
            errors.password = "Please provide a valid password.";
        }
        
        return errors;
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const errors = validateForm();

        if(Object.entries(errors).length === 0) {
            const credentials = { username: username, password: password };
            props.login(credentials);
        } else {
            setValidationErrors(errors);
        }
    };

    return (
        <Row>
            <Col></Col>
            <Col xs={4} className="m-2">
                <Form noValidate onSubmit={handleSubmit}>
                    <Form.Group controlId="formUsername">
                        <Form.Label className="formLabel"> Username </Form.Label>
                        <Form.Control className="formControl" required type="text" placeholder="Insert Username here" value={username} onChange={handleChangeUsername} isInvalid={"username" in validationErrors} />
                        <Form.Control.Feedback className="formControlFeedback" type="invalid"> Please insert a valid username. </Form.Control.Feedback> 
                    </Form.Group>

                    <Form.Group controlId="formPassword">
                        <Form.Label className="formLabel"> Password </Form.Label>
                        <Form.Control className="formControl" required type="password" placeholder="Insert Password here" value={password} onChange={handleChangePassword} isInvalid={"password" in validationErrors} />
                        <Form.Control.Feedback className="formControlFeedback" type="invalid"> Please insert a valid password. </Form.Control.Feedback>
                    </Form.Group>

                    <Button variant="outline-light" type="submit"> Login </Button>
                </Form>
            </Col>
            <Col></Col>        
        </Row>
    );
}

export default LoginForm;