import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/register.css';
import logoImage from '../image/Group27.png';

const RegisterForm = ({ flashMessages = [] }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        agree: false
    });

    const [errors, setErrors] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });

        // Очищаем ошибку при изменении поля
        if (errors[name]) {
            hideError(name);
        }
    };

    const handleUsernameBlur = async () => {
        const { username } = formData;

        if (username && username.length >= 3) {
            try {
                // В реальном приложении здесь был бы настоящий запрос
                // Симулируем проверку имени пользователя
                const isAvailable = username !== 'admin'; // Пример проверки

                if (!isAvailable) {
                    showError('username', 'Это имя пользователя уже занято');
                }
            } catch (error) {
                console.error('Ошибка при проверке имени пользователя:', error);
            }
        }
    };

    const validateForm = () => {
        let isValid = true;

        // Проверка имени пользователя
        if (!formData.username || formData.username.length < 3) {
            showError('username', 'Имя пользователя должно содержать минимум 3 символа');
            isValid = false;
        } else {
            hideError('username');
        }

        // Проверка email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email || !emailRegex.test(formData.email)) {
            showError('email', 'Введите корректный email');
            isValid = false;
        } else {
            hideError('email');
        }

        // Проверка пароля
        if (!formData.password || formData.password.length < 6) {
            showError('password', 'Пароль должен содержать минимум 6 символов');
            isValid = false;
        } else {
            hideError('password');
        }

        // Проверка подтверждения пароля
        if (formData.password !== formData.confirmPassword) {
            showError('confirmPassword', 'Пароли не совпадают');
            isValid = false;
        } else {
            hideError('confirmPassword');
        }

        return isValid;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            // В реальном приложении здесь был бы запрос на сервер
            console.log('Форма отправлена:', formData);

            // Добавляем flash-сообщение для демонстрации
            setVisibleFlashMessages([
                { category: 'success', message: 'Регистрация успешна!' }
            ]);
        }
    };

    return (
        <div className="register-page-container">
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

            <img src={logoImage} alt="Логотип" className="floating-img-reg" />

            <div className="register-container register-global-styles">
                <h1 className="register-title">Зарегистрироваться</h1>

                <form id="registerForm" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            id="registerUsername"
                            name="username"
                            placeholder="Имя пользователя"
                            value={formData.username}
                            onChange={handleChange}
                            onBlur={handleUsernameBlur}
                            className={errors.username ? 'error' : ''}
                            required
                        />
                        <i className='bx bxs-user'></i>
                        <div
                            className="error-message"
                            id="registerUsernameError"
                            style={{ display: errors.username ? 'block' : 'none' }}
                        >
                            {errors.username}
                        </div>
                    </div>

                    <div className="form-group">
                        <input
                            type="email"
                            id="registerEmail"
                            name="email"
                            placeholder="Ваш email"
                            value={formData.email}
                            onChange={handleChange}
                            className={errors.email ? 'error' : ''}
                            required
                        />
                        <i className='bx bxs-envelope'></i>
                        <div
                            className="error-message"
                            id="registerEmailError"
                            style={{ display: errors.email ? 'block' : 'none' }}
                        >
                            {errors.email}
                        </div>
                    </div>

                    <div className="form-group">
                        <input
                            type="password"
                            id="registerPassword"
                            name="password"
                            placeholder="Ваш пароль"
                            value={formData.password}
                            onChange={handleChange}
                            className={errors.password ? 'error' : ''}
                            required
                        />
                        <i className='bx bxs-lock-alt'></i>
                        <div
                            className="error-message"
                            id="registerPasswordError"
                            style={{ display: errors.password ? 'block' : 'none' }}
                        >
                            {errors.password}
                        </div>
                    </div>

                    <div className="form-group">
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            placeholder="Подтвердите пароль"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={errors.confirmPassword ? 'error' : ''}
                            required
                        />
                        <i className='bx bxs-lock'></i>
                        <div
                            className="error-message"
                            id="confirmPasswordError"
                            style={{ display: errors.confirmPassword ? 'block' : 'none' }}
                        >
                            {errors.confirmPassword}
                        </div>
                    </div>

                    <div className="checkbox-container">
                        <input
                            type="checkbox"
                            id="agree"
                            name="agree"
                            checked={formData.agree}
                            onChange={handleChange}
                            required
                        />
                        <label htmlFor="agree">Я соглашаюсь с правилами сайта</label>
                    </div>

                    <button type="submit" className="register-button">Создать аккаунт</button>

                    <div className="register-link">
                        У Вас уже есть аккаунт? <a href="/login">Войти</a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterForm;