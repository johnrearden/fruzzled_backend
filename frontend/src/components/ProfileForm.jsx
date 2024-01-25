import React, { useRef, useState } from 'react'
import { axiosReq } from '../api/axiosDefaults';
import { Alert, Button, Col, Form, Row } from 'react-bootstrap';
import { COUNTRY_CODES, NICKNAME_AVAILABLE_THROTTLE_TIMEOUT } from '../constants/constants';
import ReactCountryFlag from 'react-country-flag';
import styles from '../styles/ProfileForm.module.css';
import btnStyles from "../styles/Button.module.css";
import { useSetProfile } from '../contexts/ProfileContext';

const ProfileForm = ({ callback }) => {

    const setProfile = useSetProfile();

    const [profileData, setProfileData] = useState({ nickname: '', country: 'AF'});
    const { nickname, country } = profileData;

    const [errors, setErrors] = useState({});
    const [nicknameAvailable, setNicknameAvailable] = useState(true);

    const throttleRef = useRef(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append("nickname", nickname);
        formData.append("country", country);

        try {
            const { data } = await axiosReq.post("create_player_profile/", formData);
            setProfile(data);
            callback();
        } catch (err) {
            console.log(err);
            setErrors(err.response?.data);
        }
    }

    const handleCountryChange = (event) => {
        const key = event.target.value;
        setProfileData(prev => ({
            ...prev,
            country: key
        }));
    }

    const handleNicknameChange = (event) => {

        const checkAvailability = async (value) => {
            try {
                const url = `is_nickname_available?nickname=${value}`;
                const { data } = await axiosReq.get(url);
                console.log('available', JSON.stringify(data.available, null, 2))
                setNicknameAvailable(data.available === 'true' ? true : false);
            } catch (err) {
                console.log(err);
            }
        }

        const value = event.target.value;
        setProfileData({
            ...profileData,
            nickname: value
        });
        clearTimeout(throttleRef.current);
        throttleRef.current = setTimeout(() => {
            checkAvailability(value)
        }, NICKNAME_AVAILABLE_THROTTLE_TIMEOUT);
    }

    const submitButtonActive = nickname.length > 0 && nicknameAvailable;

    return ( 
        <div className={styles.Background}>
            <Form onSubmit={handleSubmit}>
                <Row className="d-flex justify-content-center align-items-center mt-3">
                    <h5 className="mt-2">Your Profile</h5>
                    <ReactCountryFlag
                        className="emojiFlag ml-3"
                        countryCode={country}
                        svg
                        style={{
                            fontSize: '2.5em',
                            lineHeight: '2.5em',
                        }}
                        aria-label="United States"
                    />  
                </Row>
                <Row className="d-flex justify-content-center mt-3">
                    <Col xs={10} md={6}>
                        <Form.Group controlId="nickname" className="my-0">
                            <Form.Control 
                                className={styles.Input}
                                type="text"
                                placeholder="Nickname"
                                onChange={handleNicknameChange}
                            />
                        </Form.Group>
                        {nickname.length > 0 ? nicknameAvailable ? (
                            <span className={styles.Available}>Nickname is available</span>
                        ) : (
                            <span className={styles.Unavailable}>Nickname already in use</span>
                        ) : (
                            <span className={styles.Unavailable}>Can't be blank</span>
                        )}
                        {errors?.nickname?.map((message, idx) => (
                            <Alert variant="warning" key={idx}>
                                {message}
                            </Alert>
                        ))}
                    </Col>
                </Row>
                <Row className="d-flex justify-content-center mt-3 align-items-center">
                    <Col xs={10} md={6}>
                        <Form.Group 
                            controlId="exampleForm.SelectCustom"
                            className="mb-0"
                            >
                            <Form.Control as="select"
                                onChange={handleCountryChange}
                                className={`${styles.Input}`}
                            >
                                {Object.keys(COUNTRY_CODES).map(key => (
                                    <option 
                                        key={key}
                                        value={key}
                                        onChange={handleCountryChange}
                                    >{COUNTRY_CODES[key]}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        {errors?.country?.map((message, idx) => (
                            <Alert variant="warning" key={idx}>
                                {message}
                            </Alert>
                        ))}
                    </Col>
                </Row>
                <Row className="d-flex justify-content-center mt-4 mb-2">
                    <Col xs={10} md={6}>
                        <Button 
                            type="submit"
                            className={`${btnStyles.Button} w-100`}
                            disabled={!submitButtonActive}
                        >Submit</Button>
                    </Col>
                </Row>
            </Form>
        </div>
    )
}

export default ProfileForm