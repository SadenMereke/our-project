import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import '../css/dashboard.css';
import Header from './Header';
import Footer from './Footer';
import headerLogo from '../image/Group13.svg';
import tankImage from '../image/tanketto1.svg';
import mapImage from '../image/image10.svg';
import uniform1 from '../image/ФОРМА1.svg';
import uniform2 from '../image/ФОРМА2.svg';
import uniform3 from '../image/ФОРМА3.svg';

function Dashboard() {
    // Состояния
    const [profileDropdownVisible, setProfileDropdownVisible] = useState(false);
    const [headerVisible, setHeaderVisible] = useState(false);
    const [flashMessages, setFlashMessages] = useState([]);

    // Данные пользователя из props или через API
    const [userData, setUserData] = useState({
        username: null,
        isAuthenticated: false,
        profilePhoto: 'user.png',
        isAdmin: false
    });

    useEffect(() => {
        // Инициализация AOS анимаций
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: false,
            disable: 'mobile'
        });

        // Получение данных пользователя при загрузке компонента
        fetchUserData();

        // Получение flash-сообщений из URL параметров
        const urlParams = new URLSearchParams(window.location.search);
        const message = urlParams.get('message');

        if (message) {
            handleFlashMessage(message);
        }

        // Обработчик прокрутки для отображения хедера
        const handleScroll = () => {
            const heroSection = document.querySelector('.hero-section');
            if (heroSection) {
                const heroHeight = heroSection.offsetHeight;
                setHeaderVisible(window.scrollY >= heroHeight);
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Проверка изначального положения прокрутки

        // Очистка обработчиков событий
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Получение данных пользователя с сервера
    const fetchUserData = async () => {
        try {
            const response = await fetch('/api/user_data');
            if (response.ok) {
                const data = await response.json();
                setUserData({
                    username: data.username || null,
                    isAuthenticated: !!data.username,
                    profilePhoto: data.profile_photo || 'user.png',
                    isAdmin: data.is_admin || false
                });
            }
        } catch (error) {
            console.error('Ошибка при получении данных пользователя:', error);
        }
    };

    // Обработка flash-сообщений на основе параметра
    const handleFlashMessage = (messageType) => {
        let message = '';
        let category = 'success';

        switch (messageType) {
            case 'login_success':
                message = 'Вход выполнен успешно!';
                break;
            case 'register_success':
                message = 'Регистрация успешно завершена!';
                break;
            case 'logout_success':
                message = 'Выход выполнен успешно';
                break;
            default:
                return;
        }

        setFlashMessages([{ message, category }]);

        // Автоматическое скрытие сообщения
        setTimeout(() => {
            setFlashMessages([]);
        }, 3000);
    };

    // Переключение видимости выпадающего меню профиля
    const toggleProfileDropdown = () => {
        setProfileDropdownVisible(!profileDropdownVisible);
    };

    // Отображение хедера и смена класса для содержимого
    const mainContentClass = headerVisible ? 'adjusted' : '';

    // Обработчик клика вне выпадающего меню профиля
    useEffect(() => {
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

    return (
        <>
            {/* Добавляем Header компонент */}
            <Header
                isVisible={headerVisible}
                userData={userData}
                onProfileClick={toggleProfileDropdown}
                profileDropdownVisible={profileDropdownVisible}
            />

            {flashMessages.length > 0 && (
                <div className="flash-messages">
                    {flashMessages.map((flash, index) => (
                        <div key={index} className={`flash-message ${flash.category}`}>
                            {flash.message}
                        </div>
                    ))}
                </div>
            )}

            <div className="hero-section">
                <div className="overlay"></div>
                <div className="content">
                    <img src={headerLogo} alt="Casco Bersagliere" className="header-image" />
                    <div className="text-block">
                        <h2 className="main-heading">История, о которой мало кто знает</h2>
                        <p className="description">
                            Мы предлагаем вам взглянуть на историю под совершенно другим углом! Возможно Вы
                            что-то слышали про военные столкновения Италии за последние 200 лет. Но Вы даже не представляете,
                            насколько это интересная и захватывающая тема
                        </p>
                        <a href="#section1" className="btn">Начать изучение!</a>
                    </div>
                </div>
            </div>

            <div className="flag-strip">
                <div className="flag-green"></div>
                <div className="flag-white"></div>
                <div className="flag-red"></div>
            </div>

            {/* Основное содержимое */}
            <div className={`main-content ${mainContentClass}`}>
                {/* Секции остаются без изменений */}
                {/* Секция 1 */}
                <section id="section1" className="section">
                    <div className="container">
                        <div className="section-content">
                            <div className="section-wrapper">
                                <div className="section-text" data-aos="fade-down-right" data-aos-duration="800">
                                    <h1>Тут мы что-нибудь напишем про нас!</h1>
                                    <p>
                                        Мы предлагаем вам взглянуть на историю под совершенно другим углом! Больше всего мы слышали
                                        про военные столкновения Италии за последние 200 лет. Но Вы даже не представляете,
                                        насколько это интересная и захватывающая тема
                                    </p>
                                </div>
                                <a href="#" className="button" data-aos="fade-up-right" data-aos-duration="800" data-aos-delay="200">
                                    Начать изучение!
                                </a>
                            </div>

                            <div className="image-container" data-aos="fade-left" data-aos-duration="1000">
                                <div className="circle-bg" data-aos="zoom-in" data-aos-delay="300"></div>
                                <img src={tankImage} alt="Исторический танк" className="tank-image" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Секция 2 */}
                <section id="section2" className="section">
                    <div className="container">
                        <div className="section-content">
                            <div className="section-wrapper">
                                <div className="section-text" data-aos="fade-down-left" data-aos-duration="800">
                                    <h2>Тут мы что-нибудь напишем про нас!</h2>
                                    <p>
                                        Мы предлагаем вам взглянуть на историю под совершенно другим углом! Больше всего мы слышали
                                        про военные столкновения Италии за последние 200 лет. Но Вы даже не представляете,
                                        насколько это интересная и захватывающая тема
                                    </p>
                                </div>
                                <a href="#" className="button" data-aos="fade-up-left" data-aos-duration="800" data-aos-delay="200">
                                    Начать изучение!
                                </a>
                            </div>

                            <div className="image-container" data-aos="flip-left" data-aos-duration="1000">
                                <img src={mapImage} alt="Карта Италии" className="map-image" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Секция 3 */}
                <section id="section3" className="section">
                    <div className="container">
                        <div className="section-content">
                            <div className="section-wrapper">
                                <div className="section-text" data-aos="fade-up-right" data-aos-duration="800">
                                    <h2>Тут мы что-нибудь напишем про нас!</h2>
                                    <p>
                                        Мы предлагаем вам взглянуть на историю под совершенно другим углом! Больше всего мы слышали
                                        про военные столкновения Италии за последние 200 лет. Но Вы даже не представляете,
                                        насколько это интересная и захватывающая тема
                                    </p>
                                </div>
                                <a href="#" className="button" data-aos="fade-up-right" data-aos-duration="800" data-aos-delay="200">
                                    Начать изучение!
                                </a>
                            </div>

                            <div className="uniforms-container">
                                <img
                                    src={uniform1}
                                    alt="Военная форма 1"
                                    className="uniform"
                                    data-aos="zoom-in-up"
                                    data-aos-delay="100"
                                    data-aos-duration="500"
                                    onAnimationEnd={(e) => {
                                        if (e.animationName.includes('zoom-in-up')) {
                                            e.target.style.animation = 'float-1 3.5s ease-in-out infinite';
                                        }
                                    }}
                                />
                                <img
                                    src={uniform2}
                                    alt="Военная форма 2"
                                    className="uniform"
                                    data-aos="zoom-in-up"
                                    data-aos-delay="300"
                                    data-aos-duration="500"
                                    onAnimationEnd={(e) => {
                                        if (e.animationName.includes('zoom-in-up')) {
                                            e.target.style.animation = 'float-2 4s ease-in-out infinite';
                                        }
                                    }}
                                />
                                <img
                                    src={uniform3}
                                    alt="Военная форма 3"
                                    className="uniform"
                                    data-aos="zoom-in-up"
                                    data-aos-delay="500"
                                    data-aos-duration="500"
                                    onAnimationEnd={(e) => {
                                        if (e.animationName.includes('zoom-in-up')) {
                                            e.target.style.animation = 'float-3 4.5s ease-in-out infinite';
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
}

export default Dashboard;