import React, { useState, useEffect } from 'react';
import './LoginPopup.css';
import axios from 'axios';
import { assets } from '../../assets/frontend_assets/assets';
import { useNavigate } from 'react-router-dom';

const LoginPopup = ({ setShowLogin }) => {
    const [currState, setCurrState] = useState("Login");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });
    const [errorMessage, setErrorMessage] = useState("");
    const [emailError, setEmailError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Verificar validade do token
            axios.get('http://localhost:4000/users/verify-token', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then(response => {
                // Token válido, redirecionar para o perfil
                navigate('/profile');
            })
            .catch(error => {
                // Token inválido ou expirado, limpar o localStorage
                localStorage.removeItem('token');
                localStorage.removeItem('userName');
                localStorage.removeItem('userId');
            });
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "email") {
            setFormData({ ...formData, email: value });
            if (!/\S+@\S+\.\S+/.test(value)) {
                setEmailError("Invalid email format.");
            } else {
                setEmailError("");
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const validateForm = () => {
        if (currState === "Sign Up" && !formData.name.trim()) {
            setErrorMessage("Name is required.");
            return false;
        }
        if (!formData.email.trim() || emailError) {
            setErrorMessage("A valid email is required.");
            return false;
        }
        if (formData.password.trim().length < 6) {
            setErrorMessage("Password must be at least 6 characters long.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        setIsLoading(true);
    
        if (!validateForm()) {
            setIsLoading(false);
            return;
        }
    
        try {
            if (currState === "Sign Up") {
                const response = await axios.post('http://localhost:4000/users/register', {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                });
                alert(response.data.message);
                setCurrState("Login");
            } else {
                const response = await axios.post('http://localhost:4000/users/login', {
                    email: formData.email,
                    password: formData.password
                });
    
                // Armazenar o token, o nome e o ID do usuário no localStorage
                const { token, user } = response.data;
                localStorage.setItem('token', token);
                localStorage.setItem('userName', user.name);
                localStorage.setItem('userId', user.id);
                
                alert(`Welcome, ${user.name}!`);
                setShowLogin(false);
                navigate('/profile');
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-popup" role="dialog" aria-modal="true">
            <form className="login-popup-container" onSubmit={handleSubmit}>
                <div className="login-popup-header">
                    <img 
                        className="login-popup-logo" 
                        src={assets.logo} 
                        alt="App Logo" 
                    />
                    <div className="login-popup-title">
                        <h2>{currState}</h2>
                        <img 
                            onClick={() => setShowLogin(false)} 
                            src={assets.cross_icon} 
                            alt="Close popup" 
                            aria-label="Close login popup" 
                        />
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
                            aria-label="Name"
                            required
 
                            />
                    )}
                    <input
                        type="email"
                        name="email"
                        placeholder="Your Email"
                        value={formData.email}
                        onChange={handleChange}
                        aria-label="Email"
                        required
                    />
                    {emailError && <p className="error-message">{emailError}</p>}
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        aria-label="Password"
                        required
                    />
                </div>

                {errorMessage && <p className="error-message">{errorMessage}</p>}

                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Loading..." : currState === "Sign Up" ? "Create Account" : "Login"}
                </button>

                <div className="login-popup-condition">
                    <input type="checkbox" required aria-label="Agree to terms" />
                    <p>
                        By continuing, I agree to the <a href="/terms">terms of use</a> & <a href="/privacy">privacy policy</a>.
                    </p>
                </div>

                {currState === "Login" ? (
                    <p>
                        Don't have an account?{" "}
                        <span onClick={() => setCurrState("Sign Up")} className="toggle-state">
                            Sign up here
                        </span>
                    </p>
                ) : (
                    <p>
                        Already have an account?{" "}
                        <span onClick={() => setCurrState("Login")} className="toggle-state">
                            Login here
                        </span>
                    </p>
                )}
            </form>
        </div>
    );
};

export default LoginPopup;
