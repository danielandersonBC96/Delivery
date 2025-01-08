import React, { useState } from 'react';
import './LoginPopup.css';
import axios from 'axios';
import { assets } from '../../assets/frontend_assets/assets';

const LoginPopup = ({ setShowLogin }) => {
    const [currState, setCurrState] = useState("Login"); // Inicializado como "Login"
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });
    const [errorMessage, setErrorMessage] = useState("");

    // Função para manipular mudanças nos inputs
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Função para enviar dados ao servidor
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currState === "Sign Up") {
                // Rota de registro
                const response = await axios.post('http://localhost:4000/users/register', {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                });
                alert(response.data.message); // Sucesso
                setCurrState("Login"); // Volta para o estado de login após o registro
            } else {
                // Rota de login
                const response = await axios.post('http://localhost:4000/users/login', {
                    email: formData.email,
                    password: formData.password
                });
                alert(`Welcome, ${response.data.user.name}!`);
                setShowLogin(false); // Fecha o popup após login
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "An error occurred. Please try again.");
        }
    };

    return (
        <div className="login-popup">
            <form className="login-popup-container" onSubmit={handleSubmit}>
                <div className="login-popup-header">
                    <img className="login-popup-logo" src={assets.logo} alt="Logo" />
                    <div className="login-popup-title">
                        <h2>{currState}</h2>
                        <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="Close" />
                    </div>
                </div>

                <div className="login-popup-inputs">
                    {currState === "Sign Up" && (
                        <input
                            type="text"
                            name="name"
                            placeholder="Your Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    )}
                    <input
                        type="email"
                        name="email"
                        placeholder="Your Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button type="submit">
                    {currState === "Sign Up" ? "Create account" : "Login"}
                </button>

                {errorMessage && <p className="error-message">{errorMessage}</p>}

                <div className="login-popup-condition">
                    <input type="checkbox" required />
                    <p>By continuing, I agree to the terms of use & privacy policy</p>
                </div>

                {currState === "Login" ? (
                    <p>
                        Create a new account? <span onClick={() => setCurrState("Sign Up")}>Click here</span>
                    </p>
                ) : (
                    <p>
                        Already have an account? <span onClick={() => setCurrState("Login")}>Login Here</span>
                    </p>
                )}
            </form>
        </div>
    );
};

export default LoginPopup;
