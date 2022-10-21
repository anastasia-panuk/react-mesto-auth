import React from "react";
import { Route, Switch, useHistory, Link } from "react-router-dom";
import Header from "./Header";
import Main from "./Main";
import Footer from "./Footer";
import EditProfilePopup from "./EditProfilePopup";
import EditAvatarPopup from "./EditAvatarPopup";
import AppPlacePopup from "./AddPlacePopup";
import InfoTooltip from "./InfoTooltip";
import DeliteCardConformPopup from "./DeliteCardConformPopup";
import ImagePopup from "./ImagePopup";
import api from "../utils/Api";
import {
  userAuthorization,
  userAutentification,
  getToken,
} from "../utils/AuthApi";
import Register from "./Register";
import Login from "./Login";
import ProtectedRoute from "./ProtectedRoute";
import { CurrentUserContext } from "../context/CurrentUserContext";

function App() {
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] =
    React.useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] =
    React.useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false);
  const [isRegistrationConfirmOpen, setIsRegistrationConfirmOpen] =
    React.useState(false);
  const [selectedCard, setSelectedCard] = React.useState({});
  const [currentUser, setCurrentUser] = React.useState("");
  const [cards, setCards] = React.useState([]);
  const [isDeleteCardConfirmOpen, setIsDeleteCardConfirmOpen] =
    React.useState(null);

  const [loggedIn, setLoggedIn] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [isSucsessfulRequest, setIsSucsessfulRequest] = React.useState(false);

  const history = useHistory();

  React.useEffect(() => {
    const initialData = [
      api.getUserInfoFromServer(currentUser),
      api.getCardsFromServer(),
    ];

    Promise.all(initialData)
      .then(([user, cards]) => {
        setCurrentUser(user);
        setCards(cards);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  React.useEffect(() => {
    checkToken();
  }, [history]);

  React.useEffect(() => {
    if (
      isEditProfilePopupOpen ||
      isEditAvatarPopupOpen ||
      isAddPlacePopupOpen ||
      selectedCard.link
    ) {
      function handleEscKeyPress(e) {
        if (e.key === "Escape") {
          closeAllPopups();
        }
      }
      document.addEventListener("keydown", handleEscKeyPress);

      return () => {
        document.removeEventListener("keydown", handleEscKeyPress);
      };
    }
  }, [
    isEditProfilePopupOpen,
    isEditAvatarPopupOpen,
    isAddPlacePopupOpen,
    selectedCard,
  ]);

  function handleAddPlaceSubmit(card) {
    api
      .addNewCard(card)
      .then((newCard) => {
        setCards([newCard, ...cards]);
        closeAllPopups();
      })
      .catch((err) => console.log(err));
  }

  function handleCardLike(card) {
    const isLiked = card.likes.some((i) => i._id === currentUser._id);
    api
      .changeLikeCardStatus(card._id, !isLiked)
      .then((newCard) => {
        setCards((state) =>
          state.map((c) => (c._id === card._id ? newCard : c))
        );
      })
      .catch((err) => console.log(err));
  }

  function handleDeleteCardConfirm(card) {
    setIsDeleteCardConfirmOpen(card);
  }

  function handleCardDelete() {
    const cardID = isDeleteCardConfirmOpen._id;
    api
      .deleteCard(cardID)
      .then(() => {
        setCards(cards.filter((state) => state._id !== cardID));
        closeAllPopups();
      })
      .catch((err) => console.log(err));
  }

  function handleCardClick(selectedCard) {
    setSelectedCard(selectedCard);
  }

  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true);
  }

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true);
  }

  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(true);
  }

  function handleRagisterUserData(password, email) {
    return userAutentification(password, email).then(() => {
      setIsSucsessfulRequest(true);
      setIsRegistrationConfirmOpen(true);
      history.push("/sign-in");
    });
  }

  function handleLogin(password, email) {
    return userAuthorization(password, email)
      .then(({ token }) => {
        if (!token) throw new Error("Нет токена!");
        localStorage.setItem("jwt", token);
        setLoggedIn(true);
        setEmail(email);
        history.push("/main");
      })
      .catch(() => {
        setIsSucsessfulRequest(false);
        setIsRegistrationConfirmOpen(true);
      });
  }

  const checkToken = () => {
    const jwt = localStorage.getItem("jwt");

    if (jwt) {
      getToken(jwt)
        .then((res) => {
          setLoggedIn(true);
          setEmail(res.data.email);
          history.push("/main");
        })
        .catch((res) => {
          if (res.status === 400) {
            return `${res.status} - не передано одно из полей`;
          } else if (res.status === 401) {
            return `${res.status} - пользователь с email не найден`;
          }
        });
    }
  };

  function handleLogout() {
    localStorage.removeItem("jwt");
    setLoggedIn(false);
    setEmail("");
    history.push("/sign-in");
  }

  function closeAllPopups() {
    setIsEditProfilePopupOpen(false);
    setIsEditAvatarPopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setSelectedCard({});
    setIsDeleteCardConfirmOpen(null);
    setIsRegistrationConfirmOpen(false);
  }

  function handleClosePopupsClick(e) {
    if (
      e.target.classList.contains("popup") ||
      e.target.classList.contains("popup__close-button")
    ) {
      closeAllPopups();
    }
  }

  function handleUpdateUser(user) {
    api
      .editUserInfo(user)
      .then((updUser) => {
        setCurrentUser({
          ...currentUser,
          name: updUser.name,
          about: updUser.about,
        });
        closeAllPopups();
      })
      .catch((err) => console.log(err));
  }

  function handleUpdateAvatar(user) {
    api
      .editUserAvatar(user)
      .then((updAvatar) => {
        setCurrentUser({
          ...currentUser,
          avatar: updAvatar.avatar,
        });
        closeAllPopups();
      })
      .catch((err) => console.log(err));
  }

  return (
    <div className="page">
      <Switch>
        <CurrentUserContext.Provider value={currentUser}>
          <Header
            onLogout={handleLogout}
            email={<p className="header__user-email">{email}</p>}
          />

          <ProtectedRoute exact path={"/"} loggedIn={loggedIn}></ProtectedRoute>

          <Route path={"/sign-up"}>
            <Register onRegisterSubmit={handleRagisterUserData} />
            <p className="welcome__loggin-text">
              Уже зарегистрированы?
              <Link to="/sign-in" className="welcome__loggin-link">
                {" "}
                Войти
              </Link>
            </p>
          </Route>

          <Route path={"/sign-in"}>
            <Login onLoginSubmit={handleLogin} />
          </Route>

          <InfoTooltip
            name="login-confirm"
            isOpen={isRegistrationConfirmOpen}
            isOk={isSucsessfulRequest}
            onClose={handleClosePopupsClick}
          />

          <ProtectedRoute path={"/main"} loggedIn={loggedIn}>
            <Main
              onEditProfile={handleEditProfileClick}
              onAddPlace={handleAddPlaceClick}
              onEditAvatar={handleEditAvatarClick}
              onCardClick={handleCardClick}
              onCardLike={handleCardLike}
              onCardDelete={handleDeleteCardConfirm}
              cards={cards}
            />
            <EditProfilePopup
              isOpen={isEditProfilePopupOpen}
              onClose={handleClosePopupsClick}
              onUpdateUser={handleUpdateUser}
            />

            <EditAvatarPopup
              isOpen={isEditAvatarPopupOpen}
              onClose={handleClosePopupsClick}
              onUpdateAvatar={handleUpdateAvatar}
            />

            <AppPlacePopup
              isOpen={isAddPlacePopupOpen}
              onClose={handleClosePopupsClick}
              onAddPlace={handleAddPlaceSubmit}
            />

            <DeliteCardConformPopup
              isOpen={isDeleteCardConfirmOpen}
              onClose={handleClosePopupsClick}
              onCardDeleteConform={handleCardDelete}
            />

            <ImagePopup card={selectedCard} onClose={handleClosePopupsClick} />
          </ProtectedRoute>

          <Footer />
        </CurrentUserContext.Provider>
      </Switch>
    </div>
  );
}

export default App;
