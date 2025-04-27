from flask import (
    Flask,
    render_template,
    request,
    redirect,
    url_for,
    flash,
    session,
    Blueprint,
)
import psycopg2
from psycopg2 import pool
import os
import time
from werkzeug.security import generate_password_hash, check_password_hash
from flask import jsonify


userprofile_bp = Blueprint("userprofile", __name__)

app = Flask(__name__)
app.secret_key = os.urandom(24)  # для работы flash и session

# Создаем пул соединений с базой данных
db_pool = psycopg2.pool.SimpleConnectionPool(
    minconn=1,
    maxconn=10,
    dbname="italy2",
    user="postgres",
    password="123",
    host="localhost",
    port="5432",
)


def get_db_connection():
    """Получение соединения из пула"""
    try:
        conn = db_pool.getconn()
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None


def release_db_connection(conn):
    """Возвращает соединение обратно в пул"""
    db_pool.putconn(conn)


@app.route("/api/user_profile", methods=["GET"])
def get_user_profile():
    """Возвращает профиль пользователя в формате JSON"""
    if "user_id" not in session:
        return jsonify({"error": "Not authenticated"}), 401

    conn = get_db_connection()
    user_profile = None

    if conn:
        try:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT username, profile_photo, status FROM users WHERE id = %s",
                    (session["user_id"],),
                )
                user_profile = cur.fetchone()
        except Exception as e:
            print(f"Error: {e}")
        finally:
            release_db_connection(conn)

    if user_profile:
        return jsonify(
            {
                "username": user_profile[0],
                "profile_photo": user_profile[1] or "user.png",
                "is_admin": user_profile[2],
            }
        )
    else:
        return jsonify({"error": "User profile not found"}), 404


# Добавить передачу is_admin в функцию index()
@app.route("/")
def index():
    """Главная страница с формами входа и регистрации"""
    # Проверяем авторизацию
    is_authenticated = "user_id" in session
    username = session.get("username")
    profile_photo = None
    is_admin = False  # По умолчанию не админ

    # Если пользователь авторизован, получаем его фото профиля и статус
    if is_authenticated:
        conn = get_db_connection()
        if conn:
            try:
                with conn.cursor() as cur:
                    cur.execute(
                        "SELECT profile_photo, status FROM users WHERE id = %s",
                        (session["user_id"],),
                    )
                    result = cur.fetchone()
                    if result:
                        profile_photo = result[0]
                        is_admin = result[1]  # Получаем статус админа
            except Exception as e:
                print(f"Ошибка при получении данных пользователя: {e}")
            finally:
                release_db_connection(conn)

    return render_template(
        "dashboard.html",
        username=username,
        is_authenticated=is_authenticated,
        profile_photo=profile_photo or "user.png",
        is_admin=is_admin,  # Передаем статус админа в шаблон
    )


@app.route("/dashboard")
def dashboard():
    """Панель управления пользователя после успешного входа"""
    # Получаем параметр сообщения из URL, если он есть
    message = request.args.get("message")

    # Определяем текст сообщения в зависимости от параметра и создаем flash-сообщение
    if message == "login_success":
        flash("Вход выполнен успешно!", "success")
    elif message == "register_success":
        flash("Регистрация успешно завершена!", "success")
    elif message == "logout_success":
        flash("Выход выполнен успешно", "success")

    # Проверяем авторизацию
    is_authenticated = "user_id" in session
    username = session.get("username")
    profile_photo = None
    is_admin = False

    # Если пользователь авторизован, получаем его фото профиля
    if is_authenticated:
        conn = get_db_connection()
        if conn:
            try:
                with conn.cursor() as cur:
                    cur.execute(
                        "SELECT profile_photo, status FROM users WHERE id = %s",
                        (session["user_id"],),
                    )
                    result = cur.fetchone()
                    if result:
                        profile_photo = result[0]
                        is_admin = result[1]  # Получаем статус админа
            except Exception as e:
                print(f"Ошибка при получении данных пользователя: {e}")
            finally:
                release_db_connection(conn)

    # Рендерим шаблон с необходимыми параметрами
    return render_template(
        "dashboard.html",
        username=username,
        is_authenticated=is_authenticated,
        profile_photo=profile_photo or "user.png",
        is_admin=is_admin,  # Передаем статус админа в шаблон
    )


@app.route("/admin")
def admin_panel():
    """Административная панель"""
    if "user_id" not in session:
        flash("Пожалуйста, войдите для доступа к этой странице", "danger")
        return redirect(url_for("login"))

    # Проверяем, имеет ли пользователь права администратора
    conn = get_db_connection()
    is_admin = False
    username = session["username"]
    profile_photo = "user.png"

    if conn:
        try:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT status, profile_photo FROM users WHERE id = %s",
                    (session["user_id"],),
                )
                result = cur.fetchone()
                if result:
                    is_admin = result[0]
                    profile_photo = result[1] or "user.png"
        except Exception as e:
            flash(f"Ошибка при проверке прав доступа: {e}", "danger")
        finally:
            release_db_connection(conn)

    # Если пользователь не админ, перенаправляем на главную
    if not is_admin:
        flash("У вас нет прав для доступа к этой странице", "danger")
        return redirect(url_for("dashboard"))

    # Импортируем функции работы со статьями


@app.route("/register", methods=["GET", "POST"])
def register():
    """Обработка формы регистрации"""
    # Обработка GET-запроса для отображения формы регистрации
    if request.method == "GET":
        return render_template("secondtest.html")

    # Обработка POST-запроса для регистрации пользователя
    try:
        username = request.form["username"]
        email = request.form["email"]
        password = request.form["password"]
        confirm_password = request.form["confirm_password"]

        # Проверка введенных данных
        if not username or not email or not password:
            flash("Все поля должны быть заполнены", "danger")
            return redirect(url_for("register"))

        if password != confirm_password:
            flash("Пароли не совпадают", "danger")
            return redirect(url_for("register"))

        # Хешируем пароль
        hashed_password = generate_password_hash(password)

        conn = get_db_connection()
        if conn:
            try:
                with conn.cursor() as cur:
                    # Проверяем, существует ли пользователь с таким именем или email
                    cur.execute(
                        "SELECT * FROM users WHERE username = %s OR email = %s",
                        (username, email),
                    )
                    existing_user = cur.fetchone()

                    if existing_user:
                        flash(
                            "Пользователь с таким именем или email уже существует",
                            "danger",
                        )
                        return redirect(url_for("register"))

                    # Создаем нового пользователя
                    cur.execute(
                        "INSERT INTO users (username, email, password, status, login_status) VALUES (%s, %s, %s, %s, %s) RETURNING id",
                        (username, email, hashed_password, False, True),
                    )
                    user_id = cur.fetchone()[0]
                    conn.commit()

                    # Создаем сессию для пользователя
                    session["user_id"] = user_id
                    session["username"] = username

                    # Перенаправляем на dashboard с параметром для сообщения
                    return redirect(url_for("dashboard", message="register_success"))
            except Exception as e:
                conn.rollback()
                # Проверяем, не связана ли ошибка с запрещенными словами в имени пользователя
                if "запрещённое слово" in str(e):
                    flash(f"Ошибка: {e}", "danger")
                else:
                    flash(f"Произошла ошибка при регистрации: {e}", "danger")
                return redirect(url_for("register"))
            finally:
                release_db_connection(conn)
    except Exception as e:
        flash(f"Произошла ошибка: {e}", "danger")

    return redirect(url_for("register"))


@app.route("/login", methods=["GET", "POST"])
def login():
    """Обработчик входа пользователя"""
    # Обработка GET-запроса для отображения формы входа
    if request.method == "GET":
        return render_template("test.html")

    # Обработка POST-запроса для входа пользователя
    try:
        username_or_email = request.form["username"]
        password = request.form["password"]

        if not username_or_email or not password:
            flash("Пожалуйста, введите имя пользователя/email и пароль", "danger")
            return redirect(url_for("login"))

        conn = get_db_connection()
        if conn:
            try:
                with conn.cursor() as cur:
                    # Ищем пользователя по имени или email
                    cur.execute(
                        "SELECT id, username, password FROM users WHERE (username = %s OR email = %s)",
                        (username_or_email, username_or_email),
                    )
                    user = cur.fetchone()

                    if user and check_password_hash(user[2], password):
                        # Обновляем статус входа
                        cur.execute(
                            "UPDATE users SET login_status = %s WHERE id = %s",
                            (True, user[0]),
                        )
                        conn.commit()

                        # Создаем сессию
                        session["user_id"] = user[0]
                        session["username"] = user[1]

                        # Перенаправляем на dashboard с параметром для сообщения
                        return redirect(url_for("dashboard", message="login_success"))
                    else:
                        flash("Неверное имя пользователя/email или пароль", "danger")
                        return redirect(url_for("login"))
            except Exception as e:
                conn.rollback()
                flash(f"Произошла ошибка при входе: {e}", "danger")
                return redirect(url_for("login"))
            finally:
                release_db_connection(conn)
    except Exception as e:
        flash(f"Произошла ошибка: {e}", "danger")

    return redirect(url_for("login"))


@app.route("/test")
def test():
    """Страница для перенаправления после успешного входа"""
    if "user_id" not in session:
        flash("Пожалуйста, войдите для доступа к этой странице", "danger")
        return redirect(url_for("login"))

    # Получаем фото профиля
    conn = get_db_connection()
    profile_photo = "user.png"  # Значение по умолчанию
    if conn:
        try:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT profile_photo FROM users WHERE id = %s",
                    (session["user_id"],),
                )
                result = cur.fetchone()
                if result and result[0]:
                    profile_photo = result[0]
        except Exception as e:
            print(f"Ошибка при получении фото профиля: {e}")
        finally:
            release_db_connection(conn)

    return render_template(
        "test.html",
        username=session["username"],
        profile_photo=profile_photo,
        is_authenticated=True,
    )


@app.route("/secondtest")
def secondtest():
    """Страница для перенаправления после успешной регистрации"""
    if "user_id" not in session:
        flash("Пожалуйста, войдите для доступа к этой странице", "danger")
        return redirect(url_for("login"))

    # Получаем фото профиля
    conn = get_db_connection()
    profile_photo = "user.png"  # Значение по умолчанию
    if conn:
        try:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT profile_photo FROM users WHERE id = %s",
                    (session["user_id"],),
                )
                result = cur.fetchone()
                if result and result[0]:
                    profile_photo = result[0]
        except Exception as e:
            print(f"Ошибка при получении фото профиля: {e}")
        finally:
            release_db_connection(conn)

    return render_template(
        "secondtest.html",
        username=session["username"],
        profile_photo=profile_photo,
        is_authenticated=True,
    )


@app.route("/logout")
def logout():
    """Выход пользователя из системы"""
    if "user_id" in session:
        conn = get_db_connection()
        if conn:
            try:
                with conn.cursor() as cur:
                    cur.execute(
                        "UPDATE users SET login_status = %s WHERE id = %s",
                        (False, session["user_id"]),
                    )
                    conn.commit()
            except Exception as e:
                conn.rollback()
                flash(f"Произошла ошибка при выходе: {e}", "danger")
            finally:
                release_db_connection(conn)

    # Очищаем сессию
    session.clear()

    # Перенаправляем на dashboard с параметром для сообщения о выходе
    return redirect(url_for("dashboard", message="logout_success"))


@app.route("/profile", methods=["GET", "POST"])
def profile():
    is_admin = False
    """Страница управления профилем пользователя"""
    if "user_id" not in session:
        flash("Пожалуйста, войдите для доступа к профилю", "danger")
        return redirect(url_for("login"))

    conn = get_db_connection()
    username = session["username"]
    profile_photo = "user.png"  # Значение по умолчанию
    email = ""
    info_profile = ""
    user_score = 0

    # Определение рангов и соответствующих очков
    ranks = [
        {"name": "Рядовой", "score": 0, "icon": "rank_0.png"},
        {"name": "Берсальер", "score": 100, "icon": "rank_1.png"},
        {"name": "Младший лейтенант", "score": 500, "icon": "rank_2.png"},
        {"name": "Лейтенант", "score": 1000, "icon": "rank_3.png"},
        {"name": "Подполковник", "score": 1500, "icon": "rank_4.png"},
        {"name": "Полковник", "score": 3000, "icon": "rank_5.png"},
        {"name": "Майор", "score": 6000, "icon": "rank_6.png"},
        {"name": "Генерал", "score": 10000, "icon": "rank_7.png"},
    ]

    if conn:
        try:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT username, email, profile_photo, info_profile, user_score, status FROM users WHERE id = %s",
                    (session["user_id"],),
                )
                result = cur.fetchone()
                if result:
                    username = result[0]
                    email = result[1]
                    profile_photo = result[2] or "user.png"
                    info_profile = result[3] or ""
                    user_score = result[4] or 0
                    is_admin = result[5]  # Добавляем получение статуса
        except Exception as e:
            flash(f"Ошибка при загрузке профиля: {e}", "danger")
        finally:
            release_db_connection(conn)

    # Определение текущего и следующего рангов
    current_rank = None
    next_rank = None

    for i, rank in enumerate(ranks):
        if user_score >= rank["score"]:
            current_rank = rank
            if i < len(ranks) - 1:
                next_rank = ranks[i + 1]
            else:
                next_rank = rank  # Максимальное звание
        else:
            break

    # Вычисление прогресса к следующему рангу
    if current_rank == next_rank:  # Если максимальное звание
        progress_percentage = 100
        points_to_next_rank = 0
    else:
        total_points_for_level = next_rank["score"] - current_rank["score"]
        points_gained = user_score - current_rank["score"]
        progress_percentage = min(100, (points_gained / total_points_for_level) * 100)
        points_to_next_rank = next_rank["score"] - user_score

    # Определение сообщения о репутации
    if user_score < 100:
        reputation_message = "Начните свой путь к высоким званиям!"
    elif user_score < 1000:
        reputation_message = "У вас хорошая репутация! Так держать!"
    elif user_score < 6000:
        reputation_message = "Ваша репутация высокая! Продолжайте в том же духе!"
    else:
        reputation_message = (
            "Ваша репутация великолепна! Вы настоящий пример для других!"
        )

    is_authenticated = "user_id" in session

    return render_template(
        "profile.html",
        username=username,
        email=email,
        profile_photo=profile_photo,
        info_profile=info_profile,
        is_authenticated=is_authenticated,
        rank_name=current_rank["name"],
        rank_icon=current_rank["icon"],
        next_rank_name=next_rank["name"],
        user_score=user_score,
        next_rank_score=next_rank["score"],
        progress_percentage=progress_percentage,
        points_to_next_rank=points_to_next_rank,
        reputation_message=reputation_message,
        is_admin=is_admin,
    )


@app.route("/update_profile_photo", methods=["POST"])
def update_profile_photo():
    """API для обновления фото профиля"""
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Не авторизован"}), 401

    # Проверяем, что есть файл в запросе
    if "photo" not in request.files:
        return jsonify({"success": False, "message": "Файл не найден"}), 400

    file = request.files["photo"]

    # Если пользователь не выбрал файл, браузер может отправить пустой файл
    if file.filename == "":
        return jsonify({"success": False, "message": "Файл не выбран"}), 400

    # Проверяем расширение файла
    allowed_extensions = {"png", "jpg", "jpeg", "gif"}
    filename_extension = (
        file.filename.rsplit(".", 1)[1].lower() if "." in file.filename else ""
    )
    if filename_extension not in allowed_extensions:
        return jsonify({"success": False, "message": "Недопустимый формат файла"}), 400

    # Сохраняем файл
    try:
        # Генерируем уникальное имя файла
        timestamp = int(time.time())
        filename = f"user_{session['user_id']}_{timestamp}.{filename_extension}"

        # Создаем директорию uploads если она не существует
        upload_folder = os.path.join(app.static_folder, "uploads")
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)

        file_path = os.path.join(upload_folder, filename)
        file.save(file_path)

        # Обновляем информацию в базе данных
        conn = get_db_connection()
        if conn:
            try:
                with conn.cursor() as cur:
                    cur.execute(
                        "UPDATE users SET profile_photo = %s WHERE id = %s",
                        (filename, session["user_id"]),
                    )
                    conn.commit()
                    return jsonify(
                        {
                            "success": True,
                            "filename": filename,
                            "message": "Фото профиля успешно обновлено",
                        }
                    )
            except Exception as e:
                conn.rollback()
                return (
                    jsonify(
                        {
                            "success": False,
                            "message": f"Ошибка обновления в базе данных: {e}",
                        }
                    ),
                    500,
                )
            finally:
                release_db_connection(conn)

        return (
            jsonify({"success": False, "message": "Ошибка подключения к базе данных"}),
            500,
        )

    except Exception as e:
        return (
            jsonify({"success": False, "message": f"Ошибка сохранения файла: {e}"}),
            500,
        )


@app.route("/delete_profile_photo", methods=["POST"])
def delete_profile_photo():
    """API для удаления фото профиля"""
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Не авторизован"}), 401

    # Обновляем информацию в базе данных - устанавливаем дефолтную фотографию
    conn = get_db_connection()
    if conn:
        try:
            with conn.cursor() as cur:
                # Сначала получаем текущее фото для удаления файла
                cur.execute(
                    "SELECT profile_photo FROM users WHERE id = %s",
                    (session["user_id"],),
                )
                current_photo = cur.fetchone()[0]

                # Обновляем запись в базе данных
                cur.execute(
                    "UPDATE users SET profile_photo = %s WHERE id = %s",
                    ("user.png", session["user_id"]),
                )
                conn.commit()

                # Если текущее фото не дефолтное, удаляем файл
                if current_photo and current_photo != "user.png":
                    try:
                        # Путь к файлу фотографии
                        file_path = os.path.join(
                            app.static_folder, "uploads", current_photo
                        )
                        if os.path.exists(file_path):
                            os.remove(file_path)
                    except Exception as e:
                        # Даже если не удалось удалить файл, продолжаем работу
                        print(f"Ошибка при удалении файла: {e}")

                return jsonify(
                    {"success": True, "message": "Фото профиля успешно удалено"}
                )

        except Exception as e:
            conn.rollback()
            return (
                jsonify(
                    {
                        "success": False,
                        "message": f"Ошибка при удалении фото профиля: {e}",
                    }
                ),
                500,
            )
        finally:
            release_db_connection(conn)

    return (
        jsonify({"success": False, "message": "Ошибка подключения к базе данных"}),
        500,
    )


# Add or update this route in your Flask application
@app.route("/update_profile_info", methods=["POST"])
def update_profile_info():
    """API endpoint for updating profile description"""
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Not authorized"}), 401

    data = request.get_json(silent=True)
    if not data or "info_profile" not in data:
        return jsonify({"success": False, "message": "Invalid data"}), 400

    info_profile = data["info_profile"]
    conn = get_db_connection()
    if conn:
        try:
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE users SET info_profile = %s WHERE id = %s",
                    (info_profile, session["user_id"]),
                )
                conn.commit()
                return jsonify(
                    {"success": True, "message": "Profile info updated successfully"}
                )
        except Exception as e:
            conn.rollback()
            return jsonify({"success": False, "message": f"Update error: {e}"}), 500
        finally:
            release_db_connection(conn)

    return jsonify({"success": False, "message": "Database connection error"}), 500


@app.route("/check_username", methods=["POST"])
def check_username():
    """API для проверки имени пользователя на уникальность и запрещенные слова"""
    username = request.form.get("username", "")

    conn = get_db_connection()
    if conn:
        try:
            with conn.cursor() as cur:
                # Проверяем наличие пользователя с таким именем
                cur.execute(
                    "SELECT COUNT(*) FROM users WHERE username = %s", (username,)
                )
                count = cur.fetchone()[0]

                if count > 0:
                    return {
                        "available": False,
                        "message": "Это имя пользователя уже занято",
                    }

                # Проверяем запрещенные слова
                cur.execute(
                    """
                    SELECT EXISTS(
                        SELECT 1 FROM forbidden_words
                        WHERE POSITION(LOWER(word) IN LOWER(%s)) > 0
                    )
                """,
                    (username,),
                )
                has_forbidden = cur.fetchone()[0]

                if has_forbidden:
                    return {
                        "available": False,
                        "message": "Имя содержит запрещенное слово",
                    }

                return {"available": True}
        except Exception as e:
            return {"available": False, "message": f"Ошибка проверки: {e}"}
        finally:
            release_db_connection(conn)

    return {"available": False, "message": "Ошибка подключения к базе данных"}


if __name__ == "__main__":
    app.run(port=5010)
