import MessageModal from '../MessageModal';

describe('Класс MessageModal', () => {
  let modalElement: HTMLElement;
  let modalBodyElement: HTMLElement;
  let closeButtonElement: HTMLElement;
  let messageModal: MessageModal;
  let activeModalClass: string;
  let closeModalClass: string;

  beforeEach(() => {
    // Настройка элементов DOM
    modalElement = document.createElement('div');
    modalElement.id = 'user-message-modal';
    modalElement.classList.add('modal');

    modalBodyElement = document.createElement('div');
    modalBodyElement.classList.add('user-message-modal__body');
    modalElement.appendChild(modalBodyElement);

    closeButtonElement = document.createElement('button');
    closeButtonElement.classList.add('user-message-modal__close-button');
    modalElement.appendChild(closeButtonElement);

    activeModalClass = 'active';
    closeModalClass = 'closing';

    // Мокаем document.getElementById, чтобы вернуть наш modalElement
    jest.spyOn(document, 'getElementById').mockReturnValue(modalElement);

    // Создаем экземпляр класса MessageModal
    messageModal = new MessageModal();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Метод open()', () => {
    it('должен задать текст сообщения и добавить класс active к модальному окну', () => {
      const message = 'Test message';
      messageModal.open(message);

      expect(modalBodyElement.textContent).toBe(message);
      expect(modalElement.classList.contains(activeModalClass)).toBe(true);
    });

    it('modal или modalBody имеют значение null; ничего не происходит', () => {
      // Мокаем document.getElementById, чтобы вернуть null
      jest.spyOn(document, 'getElementById').mockReturnValue(null);
      expect(() => messageModal.open('message')).not.toThrow();
    });

    it('modalBody имеет значение null; ничего не происходит', () => {
      // Мокаем querySelector для modal, чтобы вернуть null для modalBody
      jest.spyOn(modalElement, 'querySelector').mockImplementation((selector: string) => {
        if (selector === '.user-message-modal__body') {
          return null;
        }
        // Return original for other selectors
        return HTMLElement.prototype.querySelector.call(modalElement, selector);
      });

      // Создаем новый экземпляр, чтобы this.modalBody был null
      const messageModalWithNullBody = new MessageModal();

      expect(() => messageModalWithNullBody.open('message')).not.toThrow();
      expect(modalElement.classList.contains(activeModalClass)).toBe(false);
      expect(modalBodyElement.textContent).toBe('');
    });
  });

  describe('Метод close()', () => {
    it('состояние завершения анимации; должен добавить закрывающий класс \
и удалить активный и закрывающий классы', () => {
      messageModal.open('Test');
      expect(modalElement.classList.contains(activeModalClass)).toBe(true);

      // Шпионим за вызовом removeEventListener, чтобы убедиться, что он вызван
      const removeEventListenerSpy = jest.spyOn(modalElement, 'removeEventListener');

      messageModal.close();

      expect(modalElement.classList.contains(closeModalClass)).toBe(true);

      // Симулируем завершение анимации
      const animationEndEvent = new Event('animationend');
      modalElement.dispatchEvent(animationEndEvent);

      expect(modalElement.classList.contains(activeModalClass)).toBe(false);
      expect(modalElement.classList.contains(closeModalClass)).toBe(false);
      expect(removeEventListenerSpy).toHaveBeenCalledWith('animationend', expect.any(Function));
    });

    it('modal или modalBody имеют значение null; ничего не происходит', () => {
      jest.spyOn(document, 'getElementById').mockReturnValue(null);
      expect(() => messageModal.close()).not.toThrow();
    });

    it('modal имеет закрывающий класс; ничего не происходит', () => {
      modalElement.classList.add(closeModalClass);
      expect(() => messageModal.close()).not.toThrow();
    });
  });

  describe('event listeners', () => {
    it('при нажатия кнопки "Закрыть"; должен вызвать метод close()', () => {
      const closeSpy = jest.spyOn(messageModal, 'close');
      closeButtonElement.click();

      expect(closeSpy).toHaveBeenCalled();
    });

    it('при нажатии на оверлей окна; должен вызвать метод close()', () => {
      const closeSpy = jest.spyOn(messageModal, 'close');

      // Создаем событие клика с целевым объектом modalElement
      const clickEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(clickEvent, 'target', { value: modalElement });
      modalElement.dispatchEvent(clickEvent);
      
      expect(closeSpy).toHaveBeenCalled();
    });

    it('при нажатии на контентную часть модального окна; не должен вызвать метод close()', () => {
      const closeSpy = jest.spyOn(messageModal, 'close');

      // Создаем событие клика с целевым объектом modalBodyElement (не overlay)
      const clickEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(clickEvent, 'target', { value: modalBodyElement });
      modalElement.dispatchEvent(clickEvent);

      expect(closeSpy).not.toHaveBeenCalled();
    });

    it('при нажатии на кнопку ESC и при открытом модальном окне; должен вызвать метод close()', () => {
      const closeSpy = jest.spyOn(messageModal, 'close');
      messageModal.open('Test');

      const keydownEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(keydownEvent);

      expect(closeSpy).toHaveBeenCalled();
    });

    it('при нажатии на кнопку ESC и при закрытом модальном окне; не должен вызвать метод close()', () => {
      const closeSpy = jest.spyOn(messageModal, 'close');

      const keydownEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(keydownEvent);

      expect(closeSpy).not.toHaveBeenCalled();
    });

    it('при нажатии на кнопку Enter; не должен вызвать метод close()', () => {
      const closeSpy = jest.spyOn(messageModal, 'close');
      messageModal.open('Test');

      const keydownEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      document.dispatchEvent(keydownEvent);

      expect(closeSpy).not.toHaveBeenCalled();
    });

    it('при нажатии на кнопку ESC и this.modal равен null; не должен вызвать метод close() \
и не должен выбрасывать ошибку', () => {
      // Мокаем document.getElementById, чтобы вернуть null
      jest.spyOn(document, 'getElementById').mockReturnValue(null);
      
      // Создаем новый экземпляр, чтобы this.modal был null
      const messageModalWithNullModal = new MessageModal();
      const closeSpy = jest.spyOn(messageModalWithNullModal, 'close');

      const keydownEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(keydownEvent);

      expect(closeSpy).not.toHaveBeenCalled();
      expect(() => messageModalWithNullModal.close()).not.toThrow();
    });
  });
});
