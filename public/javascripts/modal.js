const Modal = {
    show(options) {
        const modal = document.createElement('div');
        modal.className = 'custom-modal';

        const content = `
      <div class="custom-modal-content">
        ${options.title ? `<div class="custom-modal-title">${options.title}</div>` : ''}
        <div class="custom-modal-body">${options.message}</div>
        <div class="custom-modal-buttons">
          ${options.showCancel ?
                `<button class="cancel">${options.cancelText || '取消'}</button>`
                : ''
            }
          <button class="confirm">${options.confirmText || '确定'}</button>
        </div>
      </div>
    `;

        modal.innerHTML = content;
        document.body.appendChild(modal);
        modal.style.display = 'block';

        return new Promise((resolve) => {
            modal.querySelector('.confirm').onclick = () => {
                document.body.removeChild(modal);
                resolve(true);
            };

            if (options.showCancel) {
                modal.querySelector('.cancel').onclick = () => {
                    document.body.removeChild(modal);
                    resolve(false);
                };
            }
        });
    },

    alert(message, title = '') {
        return this.show({
            title,
            message,
            showCancel: false
        });
    },

    confirm(message, title = '') {
        return this.show({
            title,
            message,
            showCancel: true
        });
    }
};