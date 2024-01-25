import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import styles from "../../styles/SignInUpForm.module.css";
import btnStyles from "../../styles/Button.module.css";
import appStyles from "../../App.module.css";

import { Form, Button, Col, Row, Container, Alert } from "react-bootstrap";
import axios from "axios";
import { useRedirect } from "../../hooks/useRedirect";

const SignUpForm = () => {

    useRedirect('loggedIn');

    const [signUpData, setSignUpData] = useState({
        username: '',
        password1: '',
        password2: '',
    });
    const { username, password1, password2 } = signUpData;

    const [errors, setErrors] = useState({});

    const navigate = useNavigate();

    const handleChange = (event) => {
        setSignUpData({
            ...signUpData,
            [event.target.name]: event.target.value,
        })
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await axios.post('/dj-rest-auth/registration/', signUpData);
            navigate('/signin');
        } catch (err) {
            setErrors(err.response?.data);
        }
    }

    return (
        <Row className={styles.Row}>
            <Col className="my-auto py-2 p-md-2" md={{ size: 6 }}>
                <Container className={`${appStyles.Content} p-4 `}>
                    <h1 className={styles.Header}>sign up</h1>
                    <Row className="d-flex justify-content-center">
                        <Form onSubmit={handleSubmit} className="text-center">
                            <Form.Group controlId="username">
                                <Form.Label className="d-none">Email address</Form.Label>
                                <Form.Control
                                    className={`${styles.Input} rounded`}
                                    type="text"
                                    placeholder="Username"
                                    name="username"
                                    value={username}
                                    onChange={handleChange} />
                            </Form.Group>
                            {errors.username?.map((message, idx) => (
                                <Alert variant="warning" key={idx}>{message}</Alert>
                            ))}

                            <Form.Group controlId="password1">
                                <Form.Label className="d-none">Password</Form.Label>
                                <Form.Control
                                    className={`${styles.Input} rounded`}
                                    type="password"
                                    placeholder="Password"
                                    name="password1"
                                    value={password1}
                                    onChange={handleChange} />
                            </Form.Group>
                            {errors.password1?.map((message, idx) => (
                                <Alert variant="warning" key={idx}>{message}</Alert>
                            ))}

                            <Form.Group controlId="password2">
                                <Form.Label className="d-none">Confirm Password</Form.Label>
                                <Form.Control
                                    className={`${styles.Input} rounded`}
                                    type="password"
                                    placeholder="Confirm Password"
                                    name="password2"
                                    value={password2}
                                    onChange={handleChange} />
                            </Form.Group>
                            {errors.password2?.map((message, idx) => (
                                <Alert variant="warning" key={idx}>{message}</Alert>
                            ))}

                            <Button className={`${btnStyles.Button} ${styles.HalfWidth}`} type="submit">
                                Sign Up
                            </Button>
                            {errors.non_field_errors?.map((message, idx) => (
                                <Alert key={idx} variant="warning" className="mt-3">
                                    {message}
                                </Alert>
                            ))}
                        </Form>
                    </Row>
                </Container>
                <Container className={`mt-3 ${appStyles.Content}`}>
                    <Link className={styles.Link} to="/signin">
                        Already have an account? <span>Sign in</span>
                    </Link>
                </Container>
            </Col>

        </Row>
    );
};

export default SignUpForm;