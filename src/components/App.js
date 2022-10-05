import React from "react";
import Header from "./Header";
import Main from "./Main";
import Footer from "./Footer";
import PopupWithForm from "./PopupWithForm";
import EditProfilePopup from "./EditProfilePopup";
import EditAvatarPopup from "./EditAvatarPopup";
import AppPlacePopup from "./AddPlacePopup";
import ImagePopup from "./ImagePopup";
import api from "../utils/Api";
import { CurrentUserContext } from "../context/CurrentUserContext";

function App() {
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] =
    React.useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] =
    React.useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false);
  const [selectedCard, setSelectedCard] = React.useState({});
  const [currentUser, setCurrentUser] = React.useState("");
  const [cards, setCards] = React.useState([]);

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

  function handleCardDelete(card) {
    api
      .deleteCard(card)
      .then(() => {
        setCards(cards.filter((state) => state._id !== card._id));
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

  function closeAllPopups() {
    setIsEditProfilePopupOpen(false);
    setIsEditAvatarPopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setSelectedCard({});
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
      <CurrentUserContext.Provider value={currentUser}>
        <Header />
        <Main
          onEditProfile={handleEditProfileClick}
          onAddPlace={handleAddPlaceClick}
          onEditAvatar={handleEditAvatarClick}
          onCardClick={handleCardClick}
          onCardLike={handleCardLike}
          onCardDelete={handleCardDelete}
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

        <PopupWithForm name="detite-card" title="Вы уверены?" />

        <ImagePopup card={selectedCard} onClose={handleClosePopupsClick} />
        <Footer />
      </CurrentUserContext.Provider>
    </div>
  );
}

export default App;
