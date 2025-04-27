import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/login.css';
import logoImage from '../image/Group27.png';

const LoginForm = ({ flashMessages = [] }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [errors, setErrors] = useState({ username: '', password: '' });
    const [visibleFlashMessages, setVisibleFlashMessages] = useState(flashMessages);

    const navigate = useNavigate();

    useEffect(() => {
        // Скрываем flash-сообщения через 5 секунд
        if (visibleFlashMessages.length > 0) {
            const timer = setTimeout(() => {
                setVisibleFlashMessages([]);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [visibleFlashMessages]);

    const goBack = () => {
        navigate(-1);
    };

    const showError = (field, message) => {
        setErrors(prev => ({ ...prev, [field]: message }));
    };

    const hideError = (field) => {
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        let isValid = true;

        if (!username) {
            showError('username', 'Введите имя пользователя или email');
            isValid = false;
        } else {
            hideError('username');
        }

        if (!password) {
            showError('password', 'Введите пароль');
            isValid = false;
        } else {
            hideError('password');
        }

        if (isValid) {
            // Здесь можно добавить логику отправки формы на сервер
            // Например с использованием fetch или axios
            console.log('Форма отправлена:', { username, password, remember });
        }
    };

    return (
        <div className="login-page-container">
            {/* Flash сообщения */}
            {visibleFlashMessages.length > 0 && (
                <div className="flash-messages">
                    {visibleFlashMessages.map((flash, index) => (
                        <div key={index} className={`flash-message ${flash.category}`}>
                            {flash.message}
                        </div>
                    ))}
                </div>
            )}

            <button className="back-button" onClick={goBack}>
                <i className='bx bxs-left-arrow'></i> Назад
            </button>

            <img src={logoImage} alt="Логотип" className="floating-img-log" />

            <div className="login-container">
                <h1 className="login-title">Войти</h1>

                <form id="loginForm" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            id="loginUsername"
                            name="username"
                            placeholder="Имя пользователя или Email"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={errors.username ? 'error' : ''}
                            required
                        />
                        <i className='bx bxs-user'></i>
                        <div
                            className="error-message"
                            id="loginUsernameError"
                            style={{ display: errors.username ? 'block' : 'none' }}
                        >
                            {errors.username}
                        </div>
                    </div>

                    <div className="form-group">
                        <input
                            type="password"
                            id="loginPassword"
                            name="password"
                            placeholder="Ваш пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={errors.password ? 'error' : ''}
                            required
                        />
                        <i className='bx bxs-lock-alt'></i>
                        <div
                            className="error-message"
                            id="loginPasswordError"
                            style={{ display: errors.password ? 'block' : 'none' }}
                        >
                            {errors.password}
                        </div>
                    </div>

                    <div className="checkbox-container">
                        <input
                            type="checkbox"
                            id="remember"
                            name="remember"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                        />
                        <label htmlFor="remember">Я помню все это хорошо</label>
                    </div>

                    <button type="submit" className="login-button">Войти</button>

                    <div className="register-link">
                        У Вас ещё нет аккаунта? <a href="/register">Зарегистрироваться</a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;