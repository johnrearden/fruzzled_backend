import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import styles from "../../styles/SignInUpForm.module.css";
import btnStyles from "../../styles/Button.module.css";
import appStyles from "../../App.module.css";

import { Form, Button, Col, Row, Container, Alert } from "react-bootstrap";
import axios from "axios";
import { useSetCurrentUser } from "../../contexts/CurrentUserContext";
import { useRedirect } from "../../hooks/useRedirect";
import { setTokenTimestamp } from "../../utils/utils";

// comment

const SignInForm = () => {

    useRedirect('loggedIn');

    const setCurrentUser = useSetCurrentUser();

    const [signInData, setSignInData] = useState({
        username: '',
        password: '',
    });
    const { username, password } = signInData;

    const [errors, setErrors] = useState({});

    const navigate = useNavigate();

    const handleChange = (event) => {
        setSignInData({
            ...signInData,
            [event.target.name]: event.target.value, // computed property name
        })
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const { data } = await axios.post('/dj-rest-auth/login/', signInData);
            setCurrentUser(data.user);
            setTokenTimestamp(data);
            navigate(-1);
        } catch (err) {
            console.log(err.message);
            setErrors(err.response?.data);
        }
    }

    return (
        <Row className={styles.Row}>
            <Col className="my-auto py-2 p-md-2" md={{ size: 6 }}>
                <Container className={`${appStyles.Content}`}>
                    <h1 className={styles.Header}>Sign In</h1>
                    <Row className="d-flex justify-content-center">
                        <Form onSubmit={handleSubmit} className="text-center">
                            <Form.Group controlId="username">
                                <Form.Label className="d-none">User Name</Form.Label>
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

                            <Form.Group controlId="password">
                                <Form.Label className="d-none">Password</Form.Label>
                                <Form.Control
                                    className={`${styles.Input} rounded`}
                                    type="password"
                                    placeholder="Password"
                                    name="password"
                                    value={password}
                                    onChange={handleChange} />
                            </Form.Group>
                            {errors.password1?.map((message, idx) => (
                                <Alert variant="warning" key={idx}>{message}</Alert>
                            ))}

                            <Button className={`${btnStyles.Button} ${styles.HalfWidth}`} type="submit">
                                Sign In
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
                        Already have an account? 
                    </Link>
                </Container>
            </Col>
        </Row>
    );
};

export default SignInForm;