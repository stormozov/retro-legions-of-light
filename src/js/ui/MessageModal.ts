/**
 * Класс для работы с модальным окном сообщений игроку.
 */
export default class MessageModal {
  private modal: HTMLElement | null;
  private modalBody: HTMLElement | null;
  private closeButton: HTMLElement | null;
  private modalActiveClass = 'active';

  constructor() {
    this.modal = document.getElementById('user-message-modal');
    this.modalBody = this.modal?.querySelector('.user-message-modal__body') || null;
    this.closeButton = this.modal?.querySelector('.user-message-modal__close-button') || null;

    this.initEventListeners();
  }

  /**
   * Инициализирует обработчики событий для модального окна сообщений игроку.
   */
  private initEventListeners(): void {
    this.handleCloseModalWithBtn();
    this.handleCloseModalWithOverlay();
    this.handleCloseModalWithEsc();
  }

  /**
   * Открывает модальное окно сообщений игроку с заданным текстом.
   * 
   * @param message - Текст сообщения.
   */
  open(message: string): void {
    if (!this.modal || !this.modalBody) return;
    this.modalBody.textContent = message;
    this.modal.classList.add(this.modalActiveClass);
  }

  /**
   * Закрывает модальное окно сообщений игроку.
   */
  close(): void {
    if (!this.modal) return;
    if (this.modal.classList.contains('closing')) return;

    this.modal.classList.add('closing');

    const onAnimationEnd = () => {
      this.modal.classList.remove(this.modalActiveClass);
      this.modal.classList.remove('closing');
      this.modal.removeEventListener('animationend', onAnimationEnd);
    };

    this.modal.addEventListener('animationend', onAnimationEnd);
  }

  /**
   * Закрывает модальное окно сообщений игроку с помощью кнопки.
   * @private
   */
  private handleCloseModalWithBtn(): void {
    if (this.closeButton) {
      this.closeButton.addEventListener('click', () => this.close());
    }
  }

  /**
   * Закрывает модальное окно сообщений игроку с помощью оверлея.
   * @private
   */
  private handleCloseModalWithOverlay(): void {
    if (this.modal) {
      this.modal.addEventListener('click', (event) => {
        if (event.target === this.modal) this.close();
      });
    }
  }

  /**
   * Закрывает модальное окно сообщений игроку с помощью клавиши Escape.
   * @private
   */
  private handleCloseModalWithEsc(): void {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.modal?.classList.contains(this.modalActiveClass)) {
        this.close();
      }
    });
  }
}
