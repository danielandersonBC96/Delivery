

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
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.get('http://localhost:4000/users/verify-token', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then(() => navigate('/profile'))
            .catch(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('userName');
                localStorage.removeItem('userId');
                alert("Sua sessão expirou. Por favor, faça login novamente.");
            });
        }

        // Preenche e-mail se "lembrar de mim" estiver ativado
        const savedEmail = localStorage.getItem('storedEmail');
        const savedRemember = localStorage.getItem('storedRememberMe');
        if (savedEmail && savedRemember === "true") {
            setFormData(prev => ({ ...prev, email: savedEmail }));
            setRememberMe(true);
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "email") {
            setFormData({ ...formData, email: value });
            if (!/\S+@\S+\.\S+/.test(value)) {
                setEmailError("Formato de e-mail inválido.");
            } else {
                setEmailError("");
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const validateForm = () => {
        if (currState === "Sign Up" && !formData.name.trim()) {
            setErrorMessage("Nome é obrigatório.");
            return false;
        }
        if (!formData.email.trim() || emailError) {
            setErrorMessage("É necessário um e-mail válido.");
            return false;
        }
        if (formData.password.trim().length < 6) {
            setErrorMessage("A senha deve ter pelo menos 6 caracteres.");
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

                if (response.data && response.data.token && response.data.user) {
                    const { token, user } = response.data;

                    localStorage.setItem('token', token);
                    localStorage.setItem('userName', user.name);
                    localStorage.setItem('userId', user.id);

                    // Armazena informações se "lembrar de mim" estiver marcado
                    if (rememberMe) {
                        localStorage.setItem('storedEmail', formData.email);
                        localStorage.setItem('storedRememberMe', "true");
                    } else {
                        localStorage.removeItem('storedEmail');
                        localStorage.removeItem('storedRememberMe');
                    }

                    alert(`Login bem-sucedido! Bem-vindo, ${user.name}!`);
                    setShowLogin(false);
                    navigate('/profile');
                } else {
                    setErrorMessage("Falha no login. Verifique suas credenciais.");
                }
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "Ocorreu um erro inesperado. Tente novamente.");
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
                            placeholder="Seu Nome"
                            value={formData.name}
                            onChange={handleChange}
                            aria-label="Name"
                            required
                        />
                    )}
                    <input
                        type="email"
                        name="email"
                        placeholder="Seu E-mail"
                        value={formData.email}
                        onChange={handleChange}
                        aria-label="Email"
                        required
                    />
                    {emailError && <p className="error-message">{emailError}</p>}
                    <input
                        type="password"
                        name="password"
                        placeholder="Senha"
                        value={formData.password}
                        onChange={handleChange}
                        aria-label="Password"
                        required
                    />
                    {currState === "Login" && (
                        <div className="login-popup-remember">
                            <input
                                type="checkbox"
                                id="rememberMe"
                                checked={rememberMe}
                                onChange={() => setRememberMe(prev => !prev)}
                            />
                            <label htmlFor="rememberMe">Lembrar de mim</label>
                        </div>
                    )}
                </div>

                {errorMessage && <p className="error-message">{errorMessage}</p>}

                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Carregando..." : currState === "Sign Up" ? "Criar Conta" : "Login"}
                </button>

                <div className="login-popup-condition">
                    <input type="checkbox" required aria-label="Agree to terms" />
                    <p>
                        Ao continuar, concordo com os <a href="/terms">termos de uso</a> & <a href="/privacy">política de privacidade</a>.
                    </p>
                </div>

                {currState === "Login" ? (
                    <p>
                        Não tem uma conta?{" "}
                        <span onClick={() => setCurrState("Sign Up")} className="toggle-state">
                            Cadastre-se aqui
                        </span>
                    </p>
                ) : (
                    <p>
                        Já tem uma conta?{" "}
                        <span onClick={() => setCurrState("Login")} className="toggle-state">
                            Faça login aqui
                        </span>
                    </p>
                )}
            </form>
        </div>
    );
};

export default LoginPopup;
