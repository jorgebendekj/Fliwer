class Toast {
  
  _createToastElement(message, type) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      z-index: 10000;
      padding: 15px 20px;
      background-color: ${type === 'danger' ? '#d9534f' : '#5cb85c'};
      color: white;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      font-size: 14px;
      max-width: 400px;
      word-wrap: break-word;
      animation: fadeIn 0.3s ease-in;
    `;
    
    toast.textContent = message;
    
    // Add close button
    const closeBtn = document.createElement('span');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = `
      float: right;
      margin-left: 15px;
      font-weight: bold;
      cursor: pointer;
      font-size: 20px;
      line-height: 1;
    `;
    closeBtn.onclick = () => toast.remove();
    toast.appendChild(closeBtn);
    
    // Add animation styles if not already added
    if (!document.getElementById('toast-animations')) {
      const style = document.createElement('style');
      style.id = 'toast-animations';
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    return toast;
  }

  _showToast(message, type, delay = 3000) {
    if (!message) return;
    
    const toast = this._createToastElement(message, type);
    document.body.appendChild(toast);
    
    // Position based on type
    if (type === 'danger') {
      toast.style.bottom = '20px';
      toast.style.left = '50%';
      toast.style.transform = 'translateX(-50%)';
    } else {
      toast.style.top = '70px';
      toast.style.right = '20px';
    }
    
    // Auto remove after delay
    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, delay);
  }

  notification(text){
    // Try jQuery notify if available, otherwise use fallback
    if (window.$ && window.$.notify) {
      window.$.notify({message: text},{
        element: 'body',
        type: "success",
        allow_dismiss: true,
        placement: {
          from: "top",
          align: "right"
        },
        offset: {
          y:70,
          x:0
        },
        delay: 3000,
        timer: 100,
        animate: {
          enter: 'animated fadeInRight',
          exit: 'animated fadeOutRight'
        }
      });
    } else {
      this._showToast(text, 'success', 3000);
    }
  }

  error(text){
    // Try jQuery notify if available, otherwise use fallback
    if (window.$ && window.$.notify) {
      window.$.notify({message: text},{
        element: 'body',
        type: "danger",
        allow_dismiss: true,
        placement: {
          from: "bottom",
          align: "center"
        },
        offset: {
          y:20
        },
        delay: 5000,
        timer: 100,
        animate: {
          enter: 'animated fadeInUp',
          exit: 'animated fadeOutDown'
        }
      });
    } else {
      this._showToast(text, 'danger', 5000);
    }
  }
}

export var toast = new Toast();
