document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('form-success');
    const formInputs = contactForm.querySelectorAll('.form-control');
    
    // Añadir efectos visuales a los inputs
    formInputs.forEach(input => {
        // Añadir clase cuando el input tiene contenido
        input.addEventListener('input', function() {
            if (this.value.trim() !== '') {
                this.classList.add('has-content');
            } else {
                this.classList.remove('has-content');
            }
        });
        
        // Animación para los iconos
        const wrapper = input.closest('.input-wrapper');
        if (wrapper) {
            const icon = wrapper.querySelector('.input-icon');
            if (icon) {
                input.addEventListener('focus', () => {
                    icon.classList.add('icon-active');
                });
                
                input.addEventListener('blur', () => {
                    if (input.value.trim() === '') {
                        icon.classList.remove('icon-active');
                    }
                });
            }
        }
    });
    
    // Validación del formulario
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let isValid = true;
        const name = document.getElementById('name');
        const email = document.getElementById('email');
        const subject = document.getElementById('subject');
        const message = document.getElementById('message');
        
        // Reset validación
        formInputs.forEach(input => {
            input.classList.remove('input-error');
            const errorMsg = input.parentElement.querySelector('.error-message');
            if (errorMsg) errorMsg.remove();
        });
        
        // Validar nombre
        if (name.value.trim() === '') {
            showError(name, 'Por favor, introduce tu nombre');
            isValid = false;
        }
        
        // Validar email
        if (email.value.trim() === '') {
            showError(email, 'Por favor, introduce tu email');
            isValid = false;
        } else if (!isValidEmail(email.value)) {
            showError(email, 'Por favor, introduce un email válido');
            isValid = false;
        }
        
        // Validar asunto
        if (subject.value.trim() === '') {
            showError(subject, 'Por favor, introduce un asunto');
            isValid = false;
        }
        
        // Validar mensaje
        if (message.value.trim() === '') {
            showError(message, 'Por favor, introduce tu mensaje');
            isValid = false;
        }
        
        // Si todo es válido, mostrar mensaje de éxito
        if (isValid) {
            // Aquí normalmente enviarías los datos al servidor
            // Por ahora, simulamos una respuesta exitosa
            contactForm.classList.add('form-submitting');
            
            setTimeout(() => {
                contactForm.classList.remove('form-submitting');
                contactForm.style.opacity = '0';
                
                setTimeout(() => {
                    formSuccess.classList.remove('hidden');
                    formSuccess.style.opacity = '0';
                    
                    setTimeout(() => {
                        formSuccess.style.opacity = '1';
                    }, 50);
                    
                    // Reset del formulario después de mostrar el éxito
                    setTimeout(() => {
                        contactForm.reset();
                        formInputs.forEach(input => input.classList.remove('has-content'));
                        
                        formSuccess.style.opacity = '0';
                        
                        setTimeout(() => {
                            formSuccess.classList.add('hidden');
                            contactForm.style.opacity = '1';
                        }, 500);
                    }, 3000);
                }, 300);
            }, 1000);
        }
    });
    
    // Función para mostrar errores
    function showError(input, message) {
        input.classList.add('input-error');
        const wrapper = input.closest('.input-wrapper');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        if (wrapper) {
            wrapper.appendChild(errorDiv);
        } else {
            input.parentElement.appendChild(errorDiv);
        }
    }
    
    // Validar formato de email
    function isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    // Efecto para el botón de envío
    const submitBtn = contactForm.querySelector('.submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.style.setProperty('--x-pos', `${x}px`);
            this.style.setProperty('--y-pos', `${y}px`);
        });
    }
});