document.addEventListener('DOMContentLoaded', () => {
    // 1. INITIALIZE LUCIDE ICONS
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. HEADER SCROLL EFFECT
    const header = document.getElementById('main-header');
    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on load

    // 3. MOBILE MENU TOGGLE
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const closeMobileBtn = document.getElementById('close-mobile-btn');
    const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    const toggleMobileMenu = (open) => {
        if (open) {
            mobileNavOverlay.classList.add('open');
            document.body.style.overflow = 'hidden';
        } else {
            mobileNavOverlay.classList.remove('open');
            document.body.style.overflow = '';
        }
    };

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', () => toggleMobileMenu(true));
    if (closeMobileBtn) closeMobileBtn.addEventListener('click', () => toggleMobileMenu(false));
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => toggleMobileMenu(false));
    });

    // 4. SMOOTH SCROLL & ACTIVE NAV LINKS
    const navLinks = document.querySelectorAll('.nav-link:not(.nav-btn-scroll)');
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        let scrollY = window.pageYOffset;
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 150;
            const sectionId = current.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });

    // 5. MENU FILTER LOGIC
    const filterBtns = document.querySelectorAll('.filter-btn');
    const menuCards = document.querySelectorAll('.menu-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.getAttribute('data-category');

            menuCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                if (category === 'all' || cardCategory === category) {
                    card.style.display = 'flex';
                    card.style.animation = 'scaleUp 0.4s ease forwards';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // 6. TESTIMONIALS SLIDER
    const track = document.getElementById('testimonials-track');
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');
    let currentSlide = 0;

    const updateSlider = (index) => {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        currentSlide = index;

        track.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        dots.forEach(dot => dot.classList.remove('active'));
        dots[currentSlide].classList.add('active');
    };

    if (prevBtn) prevBtn.addEventListener('click', () => updateSlider(currentSlide - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => updateSlider(currentSlide + 1));
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const index = parseInt(dot.getAttribute('data-index'));
            updateSlider(index);
        });
    });

    // Auto play testimonials
    let sliderInterval = setInterval(() => {
        updateSlider(currentSlide + 1);
    }, 6000);

    const resetInterval = () => {
        clearInterval(sliderInterval);
        sliderInterval = setInterval(() => {
            updateSlider(currentSlide + 1);
        }, 6000);
    };

    [prevBtn, nextBtn, ...dots].forEach(elem => {
        if (elem) elem.addEventListener('click', resetInterval);
    });

    // 7. BOOKING WIZARD LOGIC

    // Booking state object
    const bookingState = {
        date: '',
        time: '',
        guests: 0,
        zone: 'main-hall',
        tableId: '',
        tableSeats: 0,
        custName: '',
        custPhone: '',
        custEmail: '',
        custNotes: ''
    };

    // DOM Elements
    const stepIndicators = document.querySelectorAll('.step-indicator');
    const stepLines = document.querySelectorAll('.step-line');
    const panels = document.querySelectorAll('.wizard-panel');

    // Date range configurations (prevent booking in the past)
    const dateInput = document.getElementById('booking-date');
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    dateInput.min = todayStr;

    // Helper: navigation between wizard steps
    const goToStep = (stepNumber) => {
        // Step index is stepNumber - 1
        panels.forEach((panel, index) => {
            if (index === stepNumber - 1) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });

        // Update step headers
        stepIndicators.forEach((indicator, index) => {
            const stepVal = index + 1;
            indicator.classList.remove('active', 'completed');
            
            if (stepVal === stepNumber) {
                indicator.classList.add('active');
            } else if (stepVal < stepNumber) {
                indicator.classList.add('completed');
            }
        });

        // Update step lines
        stepLines.forEach((line, index) => {
            const lineVal = index + 1;
            line.classList.remove('filled');
            if (lineVal < stepNumber) {
                line.classList.add('filled');
            }
        });

        // Auto scroll to booking wizard top
        document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
    };

    // STEP 1 VALIDATION & NAV
    const btnGotoStep2 = document.getElementById('btn-goto-step2');
    btnGotoStep2.addEventListener('click', () => {
        let isValid = true;
        const timeInput = document.getElementById('booking-time');
        const guestsInput = document.getElementById('booking-guests');
        
        // Reset error styling
        document.querySelectorAll('.input-error').forEach(err => err.style.display = 'none');

        if (!dateInput.value) {
            document.getElementById('error-date').style.display = 'block';
            isValid = false;
        } else {
            // Check if selected date is in the past
            const selectedDate = new Date(dateInput.value);
            const currentDate = new Date(todayStr);
            if (selectedDate < currentDate) {
                document.getElementById('error-date').style.display = 'block';
                isValid = false;
            }
        }

        if (!timeInput.value) {
            document.getElementById('error-time').style.display = 'block';
            isValid = false;
        }

        if (!guestsInput.value) {
            document.getElementById('error-guests').style.display = 'block';
            isValid = false;
        }

        if (isValid) {
            bookingState.date = dateInput.value;
            bookingState.time = timeInput.value;
            bookingState.guests = parseInt(guestsInput.value);
            
            // Render table grid layouts and update messages
            updateTableStatusMap();
            goToStep(2);
        }
    });

    // STEP 2: FLOOR PLAN ZONE TABS & TABLE SELECTION
    const zoneTabs = document.querySelectorAll('.zone-tab');
    const zoneGrids = document.querySelectorAll('.floor-grid');
    const tableNodes = document.querySelectorAll('.table-node');
    const selectedTableMsg = document.getElementById('selected-table-message');

    // Switch zone floors
    zoneTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            zoneTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const zoneName = tab.getAttribute('data-zone');
            bookingState.zone = zoneName;

            zoneGrids.forEach(grid => {
                if (grid.getAttribute('id') === `zone-${zoneName}`) {
                    grid.classList.add('active');
                } else {
                    grid.classList.remove('active');
                }
            });
        });
    });

    // Handle interactive tables click mapping
    tableNodes.forEach(node => {
        node.addEventListener('click', () => {
            const status = node.getAttribute('data-status');
            if (status === 'occupied') return; // Do nothing if occupied

            const tableId = node.getAttribute('data-table-id');
            const seats = parseInt(node.getAttribute('data-seats'));

            // Reset previously selected tables in all grids
            tableNodes.forEach(t => {
                if (t.getAttribute('data-status') === 'selected') {
                    t.setAttribute('data-status', 'available');
                }
            });

            // Set this node to selected
            node.setAttribute('data-status', 'selected');
            bookingState.tableId = tableId;
            bookingState.tableSeats = seats;

            // Feedback strings
            let zoneNameVN = '';
            if (bookingState.zone === 'main-hall') zoneNameVN = 'Sảnh Chính';
            else if (bookingState.zone === 'vip-room') zoneNameVN = 'Phòng VIP';
            else if (bookingState.zone === 'terrace') zoneNameVN = 'Ban Công';

            let msg = `Đã chọn **Bàn ${tableId}** (${seats} Ghế) tại **${zoneNameVN}**.`;
            
            // Warnings check
            if (seats < bookingState.guests) {
                msg += ` <span style="color: var(--warning); display: block; margin-top: 0.2rem;"><i data-lucide="alert-triangle" style="width: 14px; height: 14px; vertical-align: middle;"></i> Lưu ý: Bàn này có ${seats} chỗ, nhỏ hơn số lượng ${bookingState.guests} khách đặt. Bạn có thể cần thuê thêm bàn phụ.</span>`;
            }
            
            selectedTableMsg.innerHTML = msg;
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        });
    });

    // Keep table records updated based on date/time availability
    function updateTableStatusMap() {
        const storedBookings = getBookingsFromStorage();
        
        // Find bookings with identical date and time
        const matchingBookings = storedBookings.filter(b => b.date === bookingState.date && b.time === bookingState.time);
        const occupiedTableIds = matchingBookings.map(b => b.tableId);

        tableNodes.forEach(node => {
            const tableId = node.getAttribute('data-table-id');
            
            // Default check from html template
            const defaultOccupied = node.getAttribute('data-table-id') === 'M3' || 
                                    node.getAttribute('data-table-id') === 'M6' || 
                                    node.getAttribute('data-table-id') === 'VIP-Imperial' || 
                                    node.getAttribute('data-table-id') === 'T3';

            if (occupiedTableIds.includes(tableId) || defaultOccupied) {
                node.setAttribute('data-status', 'occupied');
            } else {
                node.setAttribute('data-status', 'available');
            }
        });

        // Reset state & text
        bookingState.tableId = '';
        bookingState.tableSeats = 0;
        selectedTableMsg.innerHTML = 'Chưa có bàn nào được chọn. Vui lòng bấm vào bàn trống trên sơ đồ.';
    }

    // Step 2 buttons navigation
    const btnBackToStep1 = document.getElementById('btn-back-to-step1');
    const btnGotoStep3 = document.getElementById('btn-goto-step3');

    btnBackToStep1.addEventListener('click', () => goToStep(1));
    btnGotoStep3.addEventListener('click', () => {
        if (!bookingState.tableId) {
            selectedTableMsg.innerHTML = `<span style="color: var(--error);"><i data-lucide="alert-circle" style="width: 14px; height: 14px; vertical-align: middle;"></i> Bạn chưa lựa chọn bàn ăn nào! Hãy bấm chọn bàn trống trên sơ đồ.</span>`;
            if (typeof lucide !== 'undefined') lucide.createIcons();
            return;
        }
        goToStep(3);
    });

    // STEP 3: CONTACT FORM SUBMISSION
    const btnBackToStep2 = document.getElementById('btn-back-to-step2');
    const btnSubmitBooking = document.getElementById('btn-submit-booking');

    btnBackToStep2.addEventListener('click', () => goToStep(2));
    btnSubmitBooking.addEventListener('click', () => {
        let isValid = true;
        const nameInput = document.getElementById('cust-name');
        const phoneInput = document.getElementById('cust-phone');
        const emailInput = document.getElementById('cust-email');
        const termsInput = document.getElementById('cust-terms');
        const notesInput = document.getElementById('cust-notes');

        // Reset errors
        document.querySelectorAll('.input-error').forEach(err => err.style.display = 'none');

        // Validate customer name
        if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
            document.getElementById('error-cust-name').style.display = 'block';
            isValid = false;
        }

        // Validate phone number: 10 digit regex (e.g. 0901234567, 03, 05, 07, 08)
        const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
        if (!phoneRegex.test(phoneInput.value.trim())) {
            document.getElementById('error-cust-phone').style.display = 'block';
            isValid = false;
        }

        // Validate email address regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) {
            document.getElementById('error-cust-email').style.display = 'block';
            isValid = false;
        }

        // Validate checkbox terms agree
        if (!termsInput.checked) {
            document.getElementById('error-cust-terms').style.display = 'block';
            isValid = false;
        }

        if (isValid) {
            // Populate customer details to booking payload
            bookingState.custName = nameInput.value.trim();
            bookingState.custPhone = phoneInput.value.trim();
            bookingState.custEmail = emailInput.value.trim();
            bookingState.custNotes = notesInput.value.trim();

            // Generate Booking ticket details and write to local Storage
            const bookingId = 'AR-' + Math.floor(100000 + Math.random() * 900000);
            const bookingPayload = {
                id: bookingId,
                ...bookingState,
                createdAt: new Date().toISOString()
            };

            // Save booking item
            saveBookingToStorage(bookingPayload);

            // Populate visual ticket nodes
            document.getElementById('ticket-code').textContent = `#${bookingId}`;
            document.getElementById('ticket-cust-name').textContent = bookingPayload.custName;
            document.getElementById('ticket-cust-phone').textContent = bookingPayload.custPhone;
            
            // Format dates neatly: YYYY-MM-DD to DD/MM/YYYY
            const parts = bookingPayload.date.split('-');
            const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
            document.getElementById('ticket-date').textContent = formattedDate;
            document.getElementById('ticket-time').textContent = bookingPayload.time;
            
            // Zone Vietnamese names mapping
            let zoneNameVN = '';
            if (bookingPayload.zone === 'main-hall') zoneNameVN = 'Sảnh Chính';
            else if (bookingPayload.zone === 'vip-room') zoneNameVN = 'Phòng VIP';
            else if (bookingPayload.zone === 'terrace') zoneNameVN = 'Ban Công';
            document.getElementById('ticket-zone').textContent = zoneNameVN;
            
            document.getElementById('ticket-table').textContent = `Bàn ${bookingPayload.tableId} (${bookingPayload.tableSeats} Ghế)`;
            
            const notesVal = bookingPayload.custNotes ? bookingPayload.custNotes : 'Không có yêu cầu đặc biệt.';
            document.getElementById('ticket-notes').textContent = notesVal;

            // Show confirmation panel
            goToStep(4);

            // Reload Booking list
            renderBookingsHistory();
        }
    });

    // STEP 4 ACTIONS (Back to booking or scroll to history)
    const btnBookAnother = document.getElementById('btn-book-another');
    const btnViewHistoryScroll = document.getElementById('btn-view-history-scroll');

    const resetBookingForm = () => {
        // Clear wizard state inputs
        dateInput.value = '';
        document.getElementById('booking-time').value = '';
        document.getElementById('booking-guests').value = '';
        document.getElementById('cust-name').value = '';
        document.getElementById('cust-phone').value = '';
        document.getElementById('cust-email').value = '';
        document.getElementById('cust-notes').value = '';
        document.getElementById('cust-terms').checked = false;
        
        // Reset selections
        tableNodes.forEach(t => {
            if (t.getAttribute('data-status') === 'selected') {
                t.setAttribute('data-status', 'available');
            }
        });
        bookingState.tableId = '';
        selectedTableMsg.innerHTML = 'Chưa có bàn nào được chọn. Vui lòng bấm vào bàn trống trên sơ đồ.';
    };

    btnBookAnother.addEventListener('click', () => {
        resetBookingForm();
        goToStep(1);
    });

    btnViewHistoryScroll.addEventListener('click', (e) => {
        e.preventDefault();
        resetBookingForm();
        goToStep(1); // Set state back to step 1 silently for next flows
        document.getElementById('history').scrollIntoView({ behavior: 'smooth' });
    });


    // 8. LOCALSTORAGE DATA HANDLERS

    function getBookingsFromStorage() {
        const data = localStorage.getItem('aura_bookings');
        return data ? JSON.parse(data) : [];
    }

    function saveBookingToStorage(booking) {
        const bookings = getBookingsFromStorage();
        bookings.unshift(booking); // Add to the top of list
        localStorage.setItem('aura_bookings', JSON.stringify(bookings));
    }

    function removeBookingFromStorage(bookingId) {
        let bookings = getBookingsFromStorage();
        bookings = bookings.filter(b => b.id !== bookingId);
        localStorage.setItem('aura_bookings', JSON.stringify(bookings));
    }

    function updateBookingInStorage(updatedBooking) {
        let bookings = getBookingsFromStorage();
        const index = bookings.findIndex(b => b.id === updatedBooking.id);
        if (index !== -1) {
            bookings[index] = { ...bookings[index], ...updatedBooking };
            localStorage.setItem('aura_bookings', JSON.stringify(bookings));
        }
    }


    // 9. BOOKING HISTORY RENDERERS & DASHBOARD ACTIONS

    const bookingsListContainer = document.getElementById('history-bookings-list');
    const emptyStateElement = document.getElementById('history-empty-state');
    const btnClearHistory = document.getElementById('btn-clear-history');

    // Wipe all history list
    btnClearHistory.addEventListener('click', () => {
        if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử đặt chỗ trên trình duyệt này?')) {
            localStorage.removeItem('aura_bookings');
            renderBookingsHistory();
        }
    });

    function renderBookingsHistory() {
        const bookings = getBookingsFromStorage();
        
        // Clean list
        const cards = bookingsListContainer.querySelectorAll('.history-card');
        cards.forEach(card => card.remove());

        if (bookings.length === 0) {
            emptyStateElement.style.display = 'flex';
            btnClearHistory.style.display = 'none';
        } else {
            emptyStateElement.style.display = 'none';
            btnClearHistory.style.display = 'inline-flex';

            bookings.forEach(booking => {
                const card = document.createElement('div');
                card.className = 'history-card';
                card.setAttribute('data-booking-id', booking.id);

                // Date formatting
                const dateParts = booking.date.split('-');
                const formattedDateStr = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

                // Zone names mapping
                let zoneNameVN = '';
                if (booking.zone === 'main-hall') zoneNameVN = 'Sảnh Chính';
                else if (booking.zone === 'vip-room') zoneNameVN = 'Phòng VIP';
                else if (booking.zone === 'terrace') zoneNameVN = 'Ban Công';

                card.innerHTML = `
                    <div>
                        <div class="card-top">
                            <div>
                                <span class="t-label">MÃ ĐẶT BÀN</span>
                                <h4 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: var(--accent-gold); margin-top: 0.1rem;">#${booking.id}</h4>
                            </div>
                            <span class="card-badge status-upcoming">Sắp Diễn Ra</span>
                        </div>
                        <div class="card-body-details" style="margin-top: 1.5rem;">
                            <div class="detail-line">
                                <i data-lucide="user"></i>
                                <span>Khách hàng: <strong>${booking.custName}</strong></span>
                            </div>
                            <div class="detail-line">
                                <i data-lucide="calendar"></i>
                                <span>Ngày đặt: <strong>${formattedDateStr}</strong></span>
                            </div>
                            <div class="detail-line">
                                <i data-lucide="clock"></i>
                                <span>Thời gian: <strong>${booking.time}</strong></span>
                            </div>
                            <div class="detail-line">
                                <i data-lucide="users"></i>
                                <span>Số khách: <strong>${booking.guests} người</strong></span>
                            </div>
                            <div class="detail-line">
                                <i data-lucide="navigation"></i>
                                <span>Bàn: <strong>Bàn ${booking.tableId} (${zoneNameVN})</strong></span>
                            </div>
                            ${booking.custNotes ? `
                            <div class="detail-line" style="align-items: flex-start;">
                                <i data-lucide="message-square" style="margin-top: 0.2rem;"></i>
                                <span style="font-style: italic; font-size: 0.82rem;">"${booking.custNotes}"</span>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="card-actions">
                        <button class="btn-card-edit" data-id="${booking.id}"><i data-lucide="edit-3" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 0.3rem;"></i> Đổi Lịch</button>
                        <button class="btn-card-cancel" data-id="${booking.id}" title="Hủy bàn đặt"><i data-lucide="trash-2" style="width: 16px; height: 16px;"></i></button>
                    </div>
                `;

                bookingsListContainer.appendChild(card);
            });

            // Bind actions to card buttons
            bindCardActions();
        }

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    function bindCardActions() {
        // Edit button mapping
        const editBtns = document.querySelectorAll('.btn-card-edit');
        editBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const bookingId = btn.getAttribute('data-id');
                openEditModal(bookingId);
            });
        });

        // Cancel/Delete button mapping
        const cancelBtns = document.querySelectorAll('.btn-card-cancel');
        cancelBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const bookingId = btn.getAttribute('data-id');
                if (confirm(`Bạn có chắc chắn muốn hủy lượt đặt bàn #${bookingId}?`)) {
                    removeBookingFromStorage(bookingId);
                    renderBookingsHistory();
                }
            });
        });
    }


    // 10. EDIT RESERVATION MODAL CONTROLLER
    const editModal = document.getElementById('edit-booking-modal');
    const editForm = document.getElementById('edit-booking-form');
    const btnCloseModal = document.getElementById('btn-close-edit-modal');
    const btnCancelModal = document.getElementById('btn-cancel-edit-modal');
    
    // Set edit dates values constraint (prevent past dates)
    const editDateInput = document.getElementById('edit-date');
    editDateInput.min = todayStr;

    function openEditModal(bookingId) {
        const bookings = getBookingsFromStorage();
        const booking = bookings.find(b => b.id === bookingId);
        if (!booking) return;

        // Fill modal fields
        document.getElementById('edit-booking-id').value = booking.id;
        editDateInput.value = booking.date;
        document.getElementById('edit-time').value = booking.time;
        document.getElementById('edit-guests').value = booking.guests;
        document.getElementById('edit-notes').value = booking.custNotes || '';

        // Open modal popup animation
        editModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeEditModal() {
        editModal.classList.remove('open');
        document.body.style.overflow = '';
    }

    if (btnCloseModal) btnCloseModal.addEventListener('click', closeEditModal);
    if (btnCancelModal) btnCancelModal.addEventListener('click', closeEditModal);

    // Edit modal form submission
    if (editForm) {
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const bookingId = document.getElementById('edit-booking-id').value;
            const updatedData = {
                id: bookingId,
                date: editDateInput.value,
                time: document.getElementById('edit-time').value,
                guests: parseInt(document.getElementById('edit-guests').value),
                custNotes: document.getElementById('edit-notes').value.trim()
            };

            // Update in storage
            updateBookingInStorage(updatedData);

            // Re-render dashboard history and close modal
            renderBookingsHistory();
            closeEditModal();
        });
    }

    // Initialize list load
    renderBookingsHistory();
});
