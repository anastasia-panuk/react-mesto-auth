function PopupWithForm({ name, isOpen, onClose, title, children, onSubmit }) {
  return (
    <section
      className={`popup popup_type_${name} popup${isOpen ? "_opened" : ""}`}
      onClick={onClose}
    >
      <div className="popup__container">
        <button
          className="popup__close-button"
          type="button"
          aria-label="Закрыть"
          onClick={onClose}
        ></button>
        <form
          className="popup__form edit-popup-form"
          name={`${name}`}
          onSubmit={onSubmit}
        >
          <h2 className={`popup__${title}`}>{title}</h2>
          {children}
          <button
            className="popup__submit-button"
            type="submit"
            aria-label="Сохранить"
          >
            Сохранить
          </button>
        </form>
      </div>
    </section>
  );
}

export default PopupWithForm;
