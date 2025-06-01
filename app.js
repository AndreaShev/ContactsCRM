const API_URL = 'http://localhost:8000/api/contacts';
const API_TOKEN = 'secret_token';

let contacts = [];
let availableTags = ['Клиент', 'Партнер', 'Коллега', 'Друг', 'VIP'];

// DOM элементы
const contactsContainer = document.getElementById('contacts-container');
const contactModal = document.getElementById('contact-modal');
const contactForm = document.getElementById('contact-form');
const modalTitle = document.getElementById('modal-title');
const addContactBtn = document.getElementById('add-contact-btn');
const cancelBtn = document.getElementById('cancel-btn');
const searchInput = document.getElementById('search-input');
const tagFiltersContainer = document.getElementById('tag-filters');

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    loadContacts();
    initEventListeners();
    renderTagFilters();
});

// Загрузка контактов
async function loadContacts() {
    try {
        const response = await fetch(API_URL, {
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`
            }
        });
        
        if (!response.ok) throw new Error('Ошибка загрузки контактов');
        
        contacts = await response.json();
        renderContacts(contacts);
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось загрузить контакты');
    }
}

// Отрисовка контактов
function renderContacts(contactsToRender) {
    contactsContainer.innerHTML = '';
    
    if (contactsToRender.length === 0) {
        contactsContainer.innerHTML = '<p>Контакты не найдены</p>';
        return;
    }
    
    contactsToRender.forEach(contact => {
        const contactEl = document.createElement('div');
        contactEl.className = 'contact-card';
        contactEl.innerHTML = `
            <h3 class="contact-name">${contact.name}</h3>
            <div class="contact-email">${contact.email}</div>
            ${contact.phone ? `<div class="contact-phone">📞 ${contact.phone}</div>` : ''}
            
            <div class="contact-tags">
                ${(contact.tags || []).map(tag => 
                    `<span class="contact-tag">${tag}</span>`
                ).join('')}
            </div>
            
            ${contact.comment ? `<p>${contact.comment}</p>` : ''}
            
            <div class="actions">
                <button class="btn" onclick="editContact(${contact.id})">Изменить</button>
                <button class="btn btn-danger" onclick="deleteContact(${contact.id})">Удалить</button>
            </div>
        `;
        contactsContainer.appendChild(contactEl);
    });
}

// Инициализация обработчиков событий
function initEventListeners() {
    addContactBtn.addEventListener('click', () => openModal());
    cancelBtn.addEventListener('click', () => closeModal());
    
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveContact();
    });
    
    searchInput.addEventListener('input', () => filterContacts());
    
    // Обработчики для тегов в форме
    document.querySelectorAll('#tag-selector .tag').forEach(tag => {
        tag.addEventListener('click', () => {
            tag.classList.toggle('selected');
        });
    });
    
    // Обработчик для фильтрации по тегам
    tagFiltersContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-tag')) {
            e.target.classList.toggle('active');
            filterContacts();
        }
    });
}

// Открытие модального окна
function openModal(contact = null) {
    if (contact) {
        modalTitle.textContent = 'Изменить контакт';
        document.getElementById('contact-id').value = contact.id;
        document.getElementById('name').value = contact.name;
        document.getElementById('email').value = contact.email;
        document.getElementById('phone').value = contact.phone || '';
        document.getElementById('comment').value = contact.comment || '';
        
        // Сброс тегов
        document.querySelectorAll('#tag-selector .tag').forEach(tag => {
            tag.classList.remove('selected');
            if (contact.tags && contact.tags.includes(tag.dataset.tag)) {
                tag.classList.add('selected');
            }
        });
    } else {
        modalTitle.textContent = 'Добавить контакт';
        contactForm.reset();
        document.querySelectorAll('#tag-selector .tag').forEach(tag => {
            tag.classList.remove('selected');
        });
    }
    
    contactModal.style.display = 'flex';
}

// Закрытие модального окна
function closeModal() {
    contactModal.style.display = 'none';
}

// Сохранение контакта
async function saveContact() {
    const id = document.getElementById('contact-id').value;
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const comment = document.getElementById('comment').value;
    
    // Получение выбранных тегов
    const tags = Array.from(document.querySelectorAll('#tag-selector .tag.selected'))
        .map(tag => tag.dataset.tag);
    
    const contactData = {
        name,
        email,
        phone,
        tags,
        comment
    };
    
    try {
        const url = id ? `${API_URL}/${id}` : API_URL;
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_TOKEN}`
            },
            body: JSON.stringify(contactData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Ошибка сохранения');
        }
        
        closeModal();
        loadContacts();
    } catch (error) {
        console.error('Ошибка:', error);
        alert(`Ошибка сохранения: ${error.message}`);
    }
}

// Редактирование контакта
window.editContact = async function(id) {
    const contact = contacts.find(c => c.id == id);
    if (contact) {
        openModal(contact);
    }
}

// Удаление контакта
window.deleteContact = async function(id) {
    if (!confirm('Вы уверены, что хотите удалить контакт?')) return;
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`
            }
        });
        
        if (!response.ok) throw new Error('Ошибка удаления');
        
        loadContacts();
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось удалить контакт');
    }
}

// Фильтрация контактов
function filterContacts() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedTags = Array.from(document.querySelectorAll('.filter-tag.active'))
        .map(tag => tag.dataset.tag);
    
    let filtered = contacts;
    
    // Фильтрация по поиску
    if (searchTerm) {
        filtered = filtered.filter(contact => 
            contact.name.toLowerCase().includes(searchTerm) || 
            contact.email.toLowerCase().includes(searchTerm)
        );
    }
    
    // Фильтрация по тегам
    if (selectedTags.length > 0) {
        filtered = filtered.filter(contact => 
            contact.tags && selectedTags.every(tag => contact.tags.includes(tag))
        );
    }
    
    renderContacts(filtered);
}

// Отрисовка фильтров по тегам
function renderTagFilters() {
    tagFiltersContainer.innerHTML = '';
    
    availableTags.forEach(tag => {
        const tagEl = document.createElement('div');
        tagEl.className = 'filter-tag';
        tagEl.textContent = tag;
        tagEl.dataset.tag = tag;
        tagFiltersContainer.appendChild(tagEl);
    });
}