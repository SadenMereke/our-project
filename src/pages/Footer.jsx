import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../css/footer.css';
import logoImage from '../image/Group27.png';

function Footer() {
    return (
        <footer className="main-footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-logo">
                        <img src="/image/Group13.svg" alt="Логотип" className="footer-logo-img" />
                    </div>
                    <div className="footer-links">
                        <div className="footer-links-section">
                            <h4>О нас</h4>
                            <ul>
                                <li><a href="/about">О проекте</a></li>
                                <li><a href="/team">Команда</a></li>
                                <li><a href="/contacts">Контакты</a></li>
                            </ul>
                        </div>
                        <div className="footer-links-section">
                            <h4>Разделы</h4>
                            <ul>
                                <li><a href="/history">История</a></li>
                                <li><a href="/gallery">Галерея</a></li>
                                <li><a href="/articles">Статьи</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="footer-social">
                        <h4>Мы в соцсетях</h4>
                        <div className="social-icons">
                            <a href="#" aria-label="Вконтакте"><i className="fa fa-vk"></i></a>
                            <a href="#" aria-label="Телеграм"><i className="fa fa-telegram"></i></a>
                            <a href="#" aria-label="Ютуб"><i className="fa fa-youtube"></i></a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>© 2025 Военная История. Все права защищены.</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;