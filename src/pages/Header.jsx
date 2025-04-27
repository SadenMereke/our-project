import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../css/header.css';
// Импортируем логотип
import logoImage from '../image/Group27.png';

function Header({ isVisible }) {
    const [user, setUser] = useState(null);
    const [profileDropdownVisible, setProfileDropdownVisible] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Запрос данных пользователя при монтировании компонента
        fetch("/api/user_profile")
            .then((response) => response.json())
            .then((data) => {
                if (data.username) {
                    setUser(data);
                }
            })
            .catch((error) => {
                console.error("Error fetching user profile:", error);
            });

        // Обработчик клика вне выпадающего меню профиля
        function handleClickOutside(event) {
            const dropdown = document.getElementById('profileDropdown');
            const trigger = document.getElementById('profileImageTrigger');

            if (dropdown && trigger &&
                !dropdown.contains(event.target) &&
                !trigger.contains(event.target)) {
                setProfileDropdownVisible(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Обработчик нажатия на изображение профиля
    const toggleProfileDropdown = () => {
        setProfileDropdownVisible(!profileDropdownVisible);
    };

    // Функция для навигации
    const navigateTo = (path) => {
        navigate(path);
    };

    return (
        <header className={`main-header ${isVisible ? 'visible' : ''}`}>
            <div className="nav-left">
                <button onClick={() => navigateTo("/articles")}>Список статей</button>
                <button onClick={() => navigateTo("/about")}>О нас</button>
            </div>

            <div className="logo">
                <img src={logoImage} alt="Логотип" onClick={() => navigateTo("/")} />
            </div>

            <div className="nav-right">
                {user ? (
                    <div className="profile-container">
                        <div
                            className="profile-image"
                            id="profileImageTrigger"
                            onClick={toggleProfileDropdown}
                        >
                            <img
                                src={`/static/uploads/${user.profile_photo}`}
                                alt="Профиль"
                            />
                        </div>
                        {profileDropdownVisible && (
                            <div className="profile-dropdown" id="profileDropdown">
                                <div className="profile-info">
                                    <img
                                        src={`/static/uploads/${user.profile_photo}`}
                                        alt="Профиль"
                                    />
                                    <span className="username">{user.username}</span>
                                </div>
                                <div className="profile-actions">
                                    <button onClick={() => navigateTo("/profile")}>
                                        Управление профилем
                                    </button>
                                    {user.is_admin ? (
                                        <button onClick={() => navigateTo("/admin")}>
                                            Панель админа
                                        </button>
                                    ) : (
                                        <button onClick={() => navigateTo("/create_article")}>
                                            Создать статью
                                        </button>
                                    )}
                                    <button onClick={() => navigateTo("/logout")}>
                                        Выйти
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="auth-buttons">
                        <button
                            className="auth-button"
                            onClick={() => navigateTo("/login")}
                        >
                            Вход
                        </button>
                        <button
                            className="auth-button register"
                            onClick={() => navigateTo("/register")}
                        >
                            Регистрация
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}

export default Header;