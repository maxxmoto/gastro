document.addEventListener('DOMContentLoaded', function () {
    initHeader();
    initMobileMenu();
    initAnimations();
    initModal();
    initForms();
    initPhoneMask();
    initSmoothScroll();
});

function initHeader() {
    const header = document.querySelector('.header');
    let lastScroll = 0;

    window.addEventListener('scroll', function () {
        const currentScroll = window.scrollY;

        if (currentScroll > 50) {
            header.classList.add('header--scroll');
        } else {
            header.classList.remove('header--scroll');
        }

        if (currentScroll > lastScroll && currentScroll > 300) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }

        lastScroll = currentScroll;
    }, { passive: true });
}

function initMobileMenu() {
    const burger = document.querySelector('.header__burger');
    const nav = document.querySelector('.header__nav');
    const links = document.querySelectorAll('.header__nav-link');

    if (!burger || !nav) return;

    burger.addEventListener('click', function () {
        const isActive = nav.classList.toggle('active');
        burger.classList.toggle('active');
        burger.setAttribute('aria-expanded', isActive);
        document.body.style.overflow = isActive ? 'hidden' : '';
    });

    links.forEach(function (link) {
        link.addEventListener('click', function () {
            nav.classList.remove('active');
            burger.classList.remove('active');
            burger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    });

    document.addEventListener('click', function (e) {
        if (!nav.contains(e.target) && !burger.contains(e.target) && nav.classList.contains('active')) {
            nav.classList.remove('active');
            burger.classList.remove('active');
            burger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    });
}

function initAnimations() {
    const elements = document.querySelectorAll('.animate');

    if (!elements.length) return;

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(function (el) {
        observer.observe(el);
    });
}

function initModal() {
    const modal = document.getElementById('consultModal');
    const openButtons = document.querySelectorAll('[data-modal="consult"]');
    const closeBtn = modal ? modal.querySelector('.modal__close') : null;
    const overlay = modal ? modal.querySelector('.modal__overlay') : null;
    const form = modal ? modal.querySelector('#consultForm') : null;
    const success = modal ? modal.querySelector('.form__success') : null;

    if (!modal) return;

    function openModal(service) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        if (form && success) {
            form.style.display = '';
            success.style.display = 'none';
        }

        if (service && form) {
            const serviceInput = form.querySelector('input[name="service"]');
            if (serviceInput) serviceInput.value = service;
        }

        const firstInput = modal.querySelector('input:not([type="hidden"])');
        if (firstInput) setTimeout(function () { firstInput.focus(); }, 100);
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    openButtons.forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const service = btn.getAttribute('data-service') || '';
            openModal(service);
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

function initForms() {
    document.querySelectorAll('.form').forEach(function (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const submitBtn = form.querySelector('.form__submit');
            const successBlock = form.querySelector('.form__success');
            const formData = new FormData(form);
            let isValid = true;

            form.querySelectorAll('.form__input, .form__textarea').forEach(function (input) {
                if (input.hasAttribute('required') && !input.value.trim()) {
                    input.classList.add('error');
                    isValid = false;
                } else {
                    input.classList.remove('error');
                }
            });

            if (!isValid) {
                showToast('Пожалуйста, заполните все обязательные поля', 'error');
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Отправка...';

            fetch('/submit-form', {
                method: 'POST',
                body: formData
            })
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    if (data.success) {
                        if (successBlock) {
                            form.style.display = 'none';
                            successBlock.style.display = 'block';
                        } else {
                            showToast(data.message, 'success');
                            form.reset();
                        }
                    } else {
                        showToast(data.message || 'Ошибка отправки', 'error');
                    }
                })
                .catch(function () {
                    showToast('Ошибка соединения. Попробуйте позже.', 'error');
                })
                .finally(function () {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Отправить';
                });
        });
    });
}

function initPhoneMask() {
    document.querySelectorAll('input[type="tel"]').forEach(function (input) {
        input.addEventListener('input', function () {
            let value = this.value.replace(/\D/g, '');

            if (!value.startsWith('7') && !value.startsWith('8')) {
                value = '7' + value;
            }

            if (value.startsWith('8')) {
                value = '7' + value.slice(1);
            }

            let formatted = '+7';
            if (value.length > 1) {
                formatted += ' (' + value.slice(1, 4);
            }
            if (value.length >= 5) {
                formatted += ') ' + value.slice(4, 7);
            }
            if (value.length >= 8) {
                formatted += '-' + value.slice(7, 9);
            }
            if (value.length >= 10) {
                formatted += '-' + value.slice(9, 11);
            }

            this.value = formatted;
        });
    });
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

function showToast(message, type) {
    type = type || 'success';

    var existing = document.querySelector('.toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.className = 'toast toast--' + type;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(function () {
        toast.classList.add('active');
    });

    setTimeout(function () {
        toast.classList.remove('active');
        setTimeout(function () { toast.remove(); }, 300);
    }, 4000);
}

if (window.netlifyIdentity) {
    window.netlifyIdentity.on('init', function (user) {
        if (!user) {
            window.netlifyIdentity.on('login', function () {
                document.location.href = '/admin/';
            });
        }
    });
}
