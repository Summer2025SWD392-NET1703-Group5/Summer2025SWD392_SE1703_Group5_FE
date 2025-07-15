 🔄 [BOOKING_PAGE_CLEANUP] User leaving BookingPage - preserving WebSocket for cross-tab sync
 🔍 [BOOKING_PAGE_CLEANUP] Is page reload: true, currentView: payment
 💾 [BOOKING_PAGE_CLEANUP] Saved current view (payment) for reload restoration
 ℹ️ [BOOKING_PAGE_CLEANUP] Preserving payment state - page reload detected
 ⏹️ [useCountdown] Dừng timer cho booking 1409
 ⏹️ [COUNTDOWN] Dừng timer cho booking 1409
 Đóng tất cả menu khi chuyển đến: /showtimes
 Tham số cinema từ URL: null
 Fetching all cinemas...
 Fetching all movies...
 Movies received: Array(44)
 Cinemas received: Array(6)
 Fetching all showtimes with filters: Object
 Fetching all cinemas...
 Cinemas received: Array(6)
 Fetching showtimes for cinema 1 on date 2025-07-15
 Fetching showtimes for cinema 15 on date 2025-07-15
 Fetching showtimes for cinema 5 on date 2025-07-15
 Fetching showtimes for cinema 8 on date 2025-07-15
 Fetching showtimes for cinema 12 on date 2025-07-15
 Fetching showtimes for cinema 2 on date 2025-07-15
:3000/api/cinemas/12/showtimes?date=2025-07-15:1  Failed to load resource: the server responded with a status of 404 (Not Found)
 API Error: AxiosError
 Error fetching cinema showtimes by date: AxiosError
getCinemaShowtimesByDate @ ShowtimesPageService.ts:201
:3000/api/cinemas/8/showtimes?date=2025-07-15:1  Failed to load resource: the server responded with a status of 404 (Not Found)
 API Error: AxiosError
 Error fetching cinema showtimes by date: AxiosError
getCinemaShowtimesByDate @ ShowtimesPageService.ts:201
:3000/api/cinemas/5/showtimes?date=2025-07-15:1  Failed to load resource: the server responded with a status of 404 (Not Found)
 API Error: AxiosError
 Error fetching cinema showtimes by date: AxiosError
getCinemaShowtimesByDate @ ShowtimesPageService.ts:201
:3000/api/cinemas/2/showtimes?date=2025-07-15:1  Failed to load resource: the server responded with a status of 404 (Not Found)
 API Error: AxiosError
 Error fetching cinema showtimes by date: AxiosError
getCinemaShowtimesByDate @ ShowtimesPageService.ts:201
:3000/api/cinemas/15/showtimes?date=2025-07-15:1  Failed to load resource: the server responded with a status of 404 (Not Found)
 API Error: AxiosError
 Error fetching cinema showtimes by date: AxiosError
getCinemaShowtimesByDate @ ShowtimesPageService.ts:201
:3000/api/cinemas/1/showtimes?date=2025-07-15:1  Failed to load resource: the server responded with a status of 404 (Not Found)
 API Error: AxiosError
 Error fetching cinema showtimes by date: AxiosError
getCinemaShowtimesByDate @ ShowtimesPageService.ts:201
 Filtered showtimes: Array(0)
 Fetched showtimes: Array(0)
 Enriched showtimes: Array(0)
 Fetching all showtimes with filters: Object
 Fetching all cinemas...
 Cinemas received: Array(6)
 Fetching showtimes for cinema 1 on date 2025-07-19
 Fetching showtimes for cinema 15 on date 2025-07-19
 Fetching showtimes for cinema 5 on date 2025-07-19
 Fetching showtimes for cinema 8 on date 2025-07-19
 Fetching showtimes for cinema 12 on date 2025-07-19
 Fetching showtimes for cinema 2 on date 2025-07-19
:3000/api/cinemas/15/showtimes?date=2025-07-19:1  Failed to load resource: the server responded with a status of 404 (Not Found)
 API Error: AxiosError
 Error fetching cinema showtimes by date: AxiosError
getCinemaShowtimesByDate @ ShowtimesPageService.ts:201
:3000/api/cinemas/8/showtimes?date=2025-07-19:1  Failed to load resource: the server responded with a status of 404 (Not Found)
 API Error: AxiosError
 Error fetching cinema showtimes by date: AxiosError
getCinemaShowtimesByDate @ ShowtimesPageService.ts:201
:3000/api/cinemas/12/showtimes?date=2025-07-19:1  Failed to load resource: the server responded with a status of 404 (Not Found)
 API Error: AxiosError
 Error fetching cinema showtimes by date: AxiosError
getCinemaShowtimesByDate @ ShowtimesPageService.ts:201
:3000/api/cinemas/5/showtimes?date=2025-07-19:1  Failed to load resource: the server responded with a status of 404 (Not Found)
 API Error: AxiosError
 Error fetching cinema showtimes by date: AxiosError
getCinemaShowtimesByDate @ ShowtimesPageService.ts:201
:3000/api/cinemas/2/showtimes?date=2025-07-19:1  Failed to load resource: the server responded with a status of 404 (Not Found)
 API Error: AxiosError
 Error fetching cinema showtimes by date: AxiosError
getCinemaShowtimesByDate @ ShowtimesPageService.ts:201
 Cinema showtimes received: Object
 Filtered showtimes: Array(3)
 Fetched showtimes: Array(3)
 Fetching room details for ID: 57
 Fetching room details for ID: 57
 Fetching room details for ID: 39
 Fetching seats info for showtime ID: 141
 Fetching seats info for showtime ID: 142
 Fetching seats info for showtime ID: 139
 Showtime seats info received: Object
 Showtime seats info received: Object
 Showtime seats info received: Object
 Enriched showtimes: Array(3)
 User clicked showtime: Object
 Proceeding with booking for showtime: 141
 🔄 [INIT] Found payment data in payment_state_141 and last view was payment, restoring payment view
 🔄 [INIT] Restoring paymentBookingSession from payment_state
 Đóng tất cả menu khi chuyển đến: /booking/141
 🧹 [MANDATORY_CLEANUP] Starting mandatory seat cleanup on page load...
 🧹 [MANDATORY_CLEANUP] Clearing WebSocket seats...
 🧹 Clearing all seats for showtime: 141
 🧹 Cleared 0 selected seats from session storage
 🔧 [BROADCAST_DEBUG] Preparing to broadcast: Object
 🔧 [BROADCAST_DEBUG] BroadcastChannel available: true
 📡 [BROADCAST_SUCCESS] Sent via BroadcastChannel: cancel_booking seat CANCEL_BOOKING to other tabs
 ✅ Cleared all seats for showtime: 141 (WITH cross-tab broadcast for cancel)
 🔍 [MANDATORY_CLEANUP] Is reload: true, Has payment state: true
 💾 [MANDATORY_CLEANUP] Preserving payment state - reload detected with existing payment state
 🧹 [MANDATORY_CLEANUP] Cleared session: booking_session_141
 🧹 [MANDATORY_CLEANUP] Cleared session: galaxy_cinema_session_141
 🧹 [MANDATORY_CLEANUP] Cleared session: bookingData
 🧹 [MANDATORY_CLEANUP] Cleared session: has_pending_booking
 📡 [MANDATORY_CLEANUP] Broadcasted cleanup event
 💾 [MANDATORY_CLEANUP] Preserving current view for payment state restoration
 ✅ [MANDATORY_CLEANUP] Mandatory cleanup completed
 ✅ [PAYMENT_RESTORE] Already in payment view, skipping useEffect restore
 🔍 [PENDING_CHECK] Checking for pending booking on mount...
 📭 [PENDING_CHECK] No pending booking found
 🔄 [BOOKING_PAGE] Current view changed to: payment
 💳 [BOOKING_PAGE] PaymentComponent will be mounted
 📋 BookingPage Debug Info:
 - URL showtimeId: 141
 - location.state: null
 - showtime data: undefined
 - movie data: undefined
 - theater data: undefined
 🚀 BookingPage: Force ensuring WebSocket connection for showtime 141
 🎬 Fetching showtime details for ID: 141
 🔄 Starting auto-reconnect for showtime 141
 🔍 fetchSeats - Seat A6 Price: Object
 🔍 fetchSeats - Seat A7 Price: Object
 🪑 fetchSeats - Setting 35 seats
 ℹ️ Found 3 occupied seats, but NOT clearing all seats to preserve other users' selections
 🔧 [PAYMENT] Processing seats: Object
 ✅ [PAYMENT] Using existing array: Array(3)
 🚀 [useCountdown] Khởi tạo countdown cho booking 1409
countdownService.ts:47 🔄 [COUNTDOWN] Sử dụng timer hiện có cho booking 1409: Object
useCountdown.ts:54 📊 [useCountdown] Booking 1409 - Thời gian còn lại: 265s
useCountdown.ts:61 ▶️ [useCountdown] Bắt đầu timer cho booking 1409
countdownService.ts:185 🚀 [COUNTDOWN] Bắt đầu timer cho booking 1409
PaymentComponent.tsx:129 Đang lấy thông tin điểm của người dùng 9
PaymentComponent.tsx:531 📋 Dữ liệu từ sessionStorage: Object
PaymentComponent.tsx:612 🎭 Đang tải thông tin showtime ID: 141
PaymentComponent.tsx:646 🔄 Auto-selected PayOS for regular user
BookingPage.tsx:467 ✅ [PAYMENT_RESTORE] Already in payment view, skipping useEffect restore
PaymentComponent.tsx:136 ✅ Lấy thông tin điểm thành công: 297500 điểm
PaymentComponent.tsx:615 ✅ Thông tin showtime từ API: Object
BookingPage.tsx:440 ℹ️ [VISIBILITY] Page hidden - preserving state (user might return)
BookingPage.tsx:442 ℹ️ [VISIBILITY] Page visible - user returned
BookingPage.tsx:1003 🔄 [BOOKING_PAGE_CLEANUP] User leaving BookingPage - preserving WebSocket for cross-tab sync
BookingPage.tsx:1010 🔍 [BOOKING_PAGE_CLEANUP] Is page reload: true, currentView: payment
BookingPage.tsx:1025 💾 [BOOKING_PAGE_CLEANUP] Saved current view (payment) for reload restoration
BookingPage.tsx:1030 ℹ️ [BOOKING_PAGE_CLEANUP] Preserving payment state - page reload detected
useCountdown.ts:76 ⏹️ [useCountdown] Dừng timer cho booking 1409
countdownService.ts:196 ⏹️ [COUNTDOWN] Dừng timer cho booking 1409
Header.tsx:100 Đóng tất cả menu khi chuyển đến: /movies
Header.tsx:100 Đóng tất cả menu khi chuyển đến: /movies
MovieList.tsx:92 Đang tải danh sách phim từ API...
MovieList.tsx:142 Kết quả API phim đang chiếu: Array(23)
MovieList.tsx:153 Kết quả API phim sắp chiếu: Array(5)
BookingPage.tsx:64 🔄 [INIT] Found payment data in payment_state_141 and last view was payment, restoring payment view
BookingPage.tsx:99 🔄 [INIT] Restoring paymentBookingSession from payment_state
Header.tsx:100 Đóng tất cả menu khi chuyển đến: /booking/141
BookingPage.tsx:288 🧹 [MANDATORY_CLEANUP] Starting mandatory seat cleanup on page load...
BookingPage.tsx:294 🧹 [MANDATORY_CLEANUP] Clearing WebSocket seats...
webSocketService.ts:1159 🧹 Clearing all seats for showtime: 141
sessionStorageService.ts:99 🧹 Cleared 0 selected seats from session storage
webSocketService.ts:287 🔧 [BROADCAST_DEBUG] Preparing to broadcast: Object
webSocketService.ts:288 🔧 [BROADCAST_DEBUG] BroadcastChannel available: true
webSocketService.ts:300 📡 [BROADCAST_SUCCESS] Sent via BroadcastChannel: cancel_booking seat CANCEL_BOOKING to other tabs
webSocketService.ts:1206 ✅ Cleared all seats for showtime: 141 (WITH cross-tab broadcast for cancel)
BookingPage.tsx:303 🔍 [MANDATORY_CLEANUP] Is reload: true, Has payment state: true
BookingPage.tsx:318 💾 [MANDATORY_CLEANUP] Preserving payment state - reload detected with existing payment state
BookingPage.tsx:324 🧹 [MANDATORY_CLEANUP] Cleared session: booking_session_141
BookingPage.tsx:324 🧹 [MANDATORY_CLEANUP] Cleared session: galaxy_cinema_session_141
BookingPage.tsx:324 🧹 [MANDATORY_CLEANUP] Cleared session: bookingData
BookingPage.tsx:324 🧹 [MANDATORY_CLEANUP] Cleared session: has_pending_booking
BookingPage.tsx:338 📡 [MANDATORY_CLEANUP] Broadcasted cleanup event
BookingPage.tsx:349 💾 [MANDATORY_CLEANUP] Preserving current view for payment state restoration
BookingPage.tsx:352 ✅ [MANDATORY_CLEANUP] Mandatory cleanup completed
BookingPage.tsx:467 ✅ [PAYMENT_RESTORE] Already in payment view, skipping useEffect restore
BookingPage.tsx:598 🔍 [PENDING_CHECK] Checking for pending booking on mount...
BookingPage.tsx:744 📭 [PENDING_CHECK] No pending booking found
BookingPage.tsx:754 🔄 [BOOKING_PAGE] Current view changed to: payment
BookingPage.tsx:758 💳 [BOOKING_PAGE] PaymentComponent will be mounted
BookingPage.tsx:1093 📋 BookingPage Debug Info:
BookingPage.tsx:1094 - URL showtimeId: 141
BookingPage.tsx:1095 - location.state: null
BookingPage.tsx:1096 - showtime data: undefined
BookingPage.tsx:1097 - movie data: undefined
BookingPage.tsx:1098 - theater data: undefined
BookingPage.tsx:1108 🚀 BookingPage: Force ensuring WebSocket connection for showtime 141
BookingPage.tsx:1224 🎬 Fetching showtime details for ID: 141
webSocketService.ts:1486 🔄 Starting auto-reconnect for showtime 141
BookingPage.tsx:1355 🔍 fetchSeats - Seat A6 Price: Object
BookingPage.tsx:1355 🔍 fetchSeats - Seat A7 Price: Object
BookingPage.tsx:1377 🪑 fetchSeats - Setting 35 seats
BookingPage.tsx:1387 ℹ️ Found 3 occupied seats, but NOT clearing all seats to preserve other users' selections
PaymentComponent.tsx:654 🔧 [PAYMENT] Processing seats: Object
PaymentComponent.tsx:686 ✅ [PAYMENT] Using existing array: Array(3)
useCountdown.ts:44 🚀 [useCountdown] Khởi tạo countdown cho booking 1409
countdownService.ts:47 🔄 [COUNTDOWN] Sử dụng timer hiện có cho booking 1409: Object
useCountdown.ts:54 📊 [useCountdown] Booking 1409 - Thời gian còn lại: 245s
useCountdown.ts:61 ▶️ [useCountdown] Bắt đầu timer cho booking 1409
countdownService.ts:185 🚀 [COUNTDOWN] Bắt đầu timer cho booking 1409
PaymentComponent.tsx:129 Đang lấy thông tin điểm của người dùng 9
PaymentComponent.tsx:531 📋 Dữ liệu từ sessionStorage: Object
PaymentComponent.tsx:612 🎭 Đang tải thông tin showtime ID: 141
PaymentComponent.tsx:646 🔄 Auto-selected PayOS for regular user
BookingPage.tsx:467 ✅ [PAYMENT_RESTORE] Already in payment view, skipping useEffect restore
PaymentComponent.tsx:136 ✅ Lấy thông tin điểm thành công: 297500 điểm
PaymentComponent.tsx:615 ✅ Thông tin showtime từ API: Object
PaymentComponent.tsx:852 Gửi request với tham số: Object
PaymentComponent.tsx:862 Kết quả từ API: Object
BookingPage.tsx:440 ℹ️ [VISIBILITY] Page hidden - preserving state (user might return)
BookingPage.tsx:442 ℹ️ [VISIBILITY] Page visible - user returned
BookingPage.tsx:440 ℹ️ [VISIBILITY] Page hidden - preserving state (user might return)
BookingPage.tsx:442 ℹ️ [VISIBILITY] Page visible - user returned


sau khi reload 
 Download the React DevTools for a better development experience: https://reactjs.org/link/react-devtools
 [App] Khởi tạo OptimizedProviders - Chỉ render 1 lần khi app khởi động
 [AuthContext] Initializing auth...
 ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
warnOnce @ react-router-dom.js:4393
logDeprecation @ react-router-dom.js:4396
logV6DeprecationWarnings @ react-router-dom.js:4399
(anonymous) @ react-router-dom.js:5271
commitHookEffectListMount @ chunk-YCOEJRGR.js:16915
commitPassiveMountOnFiber @ chunk-YCOEJRGR.js:18156
commitPassiveMountEffects_complete @ chunk-YCOEJRGR.js:18129
commitPassiveMountEffects_begin @ chunk-YCOEJRGR.js:18119
commitPassiveMountEffects @ chunk-YCOEJRGR.js:18109
flushPassiveEffectsImpl @ chunk-YCOEJRGR.js:19490
flushPassiveEffects @ chunk-YCOEJRGR.js:19447
(anonymous) @ chunk-YCOEJRGR.js:19328
workLoop @ chunk-YCOEJRGR.js:197
flushWork @ chunk-YCOEJRGR.js:176
performWorkUntilDeadline @ chunk-YCOEJRGR.js:384
 ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.
warnOnce @ react-router-dom.js:4393
logDeprecation @ react-router-dom.js:4396
logV6DeprecationWarnings @ react-router-dom.js:4402
(anonymous) @ react-router-dom.js:5271
commitHookEffectListMount @ chunk-YCOEJRGR.js:16915
commitPassiveMountOnFiber @ chunk-YCOEJRGR.js:18156
commitPassiveMountEffects_complete @ chunk-YCOEJRGR.js:18129
commitPassiveMountEffects_begin @ chunk-YCOEJRGR.js:18119
commitPassiveMountEffects @ chunk-YCOEJRGR.js:18109
flushPassiveEffectsImpl @ chunk-YCOEJRGR.js:19490
flushPassiveEffects @ chunk-YCOEJRGR.js:19447
(anonymous) @ chunk-YCOEJRGR.js:19328
workLoop @ chunk-YCOEJRGR.js:197
flushWork @ chunk-YCOEJRGR.js:176
performWorkUntilDeadline @ chunk-YCOEJRGR.js:384
 [userService] Profile loaded: Customer user
 [AuthContext] User authenticated: Customer
 [AuthContext] Auth initialized
 Đóng tất cả menu khi chuyển đến: /booking/141
 🔌 WebSocketService initialized với config: Object
 🔄 Setting up cross-tab sync (BroadcastChannel: true)
 ✅ Cross-tab sync initialized với localStorage fallback
 🔧 [SETUP] Creating BroadcastChannel: galaxy_cinema_seats
 ✅ [SETUP] BroadcastChannel created successfully: BroadcastChannel
 🔧 [SETUP] Adding event listener to BroadcastChannel...
webSocketService.ts:140 ✅ [SETUP] Event listener added to BroadcastChannel
webSocketService.ts:143 ✅ [SETUP] Cross-tab sync initialized với BroadcastChannel
BookingPage.tsx:69 🔄 [INIT] Found payment data in payment_state_141, restoring payment view
BookingPage.tsx:99 🔄 [INIT] Restoring paymentBookingSession from payment_state
BookingPage.tsx:288 🧹 [MANDATORY_CLEANUP] Starting mandatory seat cleanup on page load...
BookingPage.tsx:294 🧹 [MANDATORY_CLEANUP] Clearing WebSocket seats...
webSocketService.ts:1159 🧹 Clearing all seats for showtime: 141
sessionStorageService.ts:99 🧹 Cleared 0 selected seats from session storage
webSocketService.ts:287 🔧 [BROADCAST_DEBUG] Preparing to broadcast: Object
webSocketService.ts:288 🔧 [BROADCAST_DEBUG] BroadcastChannel available: true
webSocketService.ts:300 📡 [BROADCAST_SUCCESS] Sent via BroadcastChannel: cancel_booking seat CANCEL_BOOKING to other tabs
webSocketService.ts:1206 ✅ Cleared all seats for showtime: 141 (WITH cross-tab broadcast for cancel)
BookingPage.tsx:303 🔍 [MANDATORY_CLEANUP] Is reload: true, Has payment state: true
BookingPage.tsx:318 💾 [MANDATORY_CLEANUP] Preserving payment state - reload detected with existing payment state
BookingPage.tsx:324 🧹 [MANDATORY_CLEANUP] Cleared session: booking_session_141
BookingPage.tsx:324 🧹 [MANDATORY_CLEANUP] Cleared session: galaxy_cinema_session_141
BookingPage.tsx:324 🧹 [MANDATORY_CLEANUP] Cleared session: bookingData
BookingPage.tsx:324 🧹 [MANDATORY_CLEANUP] Cleared session: has_pending_booking
BookingPage.tsx:338 📡 [MANDATORY_CLEANUP] Broadcasted cleanup event
BookingPage.tsx:349 💾 [MANDATORY_CLEANUP] Preserving current view for payment state restoration
BookingPage.tsx:352 ✅ [MANDATORY_CLEANUP] Mandatory cleanup completed
BookingPage.tsx:467 ✅ [PAYMENT_RESTORE] Already in payment view, skipping useEffect restore
BookingPage.tsx:598 🔍 [PENDING_CHECK] Checking for pending booking on mount...
BookingPage.tsx:744 📭 [PENDING_CHECK] No pending booking found
BookingPage.tsx:754 🔄 [BOOKING_PAGE] Current view changed to: payment
BookingPage.tsx:758 💳 [BOOKING_PAGE] PaymentComponent will be mounted
BookingPage.tsx:1093 📋 BookingPage Debug Info:
BookingPage.tsx:1094 - URL showtimeId: 141
BookingPage.tsx:1095 - location.state: null
BookingPage.tsx:1096 - showtime data: undefined
BookingPage.tsx:1097 - movie data: undefined
BookingPage.tsx:1098 - theater data: undefined
BookingPage.tsx:1108 🚀 BookingPage: Force ensuring WebSocket connection for showtime 141
BookingPage.tsx:1224 🎬 Fetching showtime details for ID: 141
BookingPage.tsx:1114 🔥 BookingPage: Force reconnecting WebSocket...
webSocketService.ts:1408 🔥 Force reconnecting WebSocket for showtime 141...
webSocketService.ts:1431 🔄 Reconnect attempt 1/3 (delay: 100ms)
webSocketService.ts:1486 🔄 Starting auto-reconnect for showtime 141
webSocketService.ts:930 🔌 Connection state changed: connecting
webSocketService.ts:949 📡 [BROADCAST] Connection state broadcasted: connecting
webSocketService.ts:338 🔄 Đang kết nối WebSocket server...
webSocketService.ts:343 🔑 [DEBUG] Auth token check: Object
webSocketService.ts:930 🔌 Connection state changed: connected
webSocketService.ts:949 📡 [BROADCAST] Connection state broadcasted: connected
webSocketService.ts:384 ✅ WebSocket connected thành công
webSocketService.ts:385 🔌 Client Socket ID: EadaABP-6BD3zW9jAADp
webSocketService.ts:949 📡 [BROADCAST] Connection state broadcasted: connected
webSocketService.ts:1442 ✅ Force reconnect successful on attempt 1
webSocketService.ts:611 🎬 Tham gia showtime room: 141
webSocketService.ts:612 🔌 Using Socket ID: EadaABP-6BD3zW9jAADp
webSocketService.ts:1448 🏠 Rejoined showtime 141 after force reconnect
BookingPage.tsx:1355 🔍 fetchSeats - Seat A6 Price: Object
BookingPage.tsx:1355 🔍 fetchSeats - Seat A7 Price: Object
BookingPage.tsx:1377 🪑 fetchSeats - Setting 35 seats
BookingPage.tsx:1387 ℹ️ Found 3 occupied seats, but NOT clearing all seats to preserve other users' selections
PaymentComponent.tsx:654 🔧 [PAYMENT] Processing seats: Object
PaymentComponent.tsx:686 ✅ [PAYMENT] Using existing array: Array(3)
useCountdown.ts:44 🚀 [useCountdown] Khởi tạo countdown cho booking 1409
countdownService.ts:47 🔄 [COUNTDOWN] Sử dụng timer hiện có cho booking 1409: Object
useCountdown.ts:54 📊 [useCountdown] Booking 1409 - Thời gian còn lại: 202s
useCountdown.ts:61 ▶️ [useCountdown] Bắt đầu timer cho booking 1409
countdownService.ts:185 🚀 [COUNTDOWN] Bắt đầu timer cho booking 1409
PaymentComponent.tsx:129 Đang lấy thông tin điểm của người dùng 9
PaymentComponent.tsx:531 📋 Dữ liệu từ sessionStorage: Object
PaymentComponent.tsx:612 🎭 Đang tải thông tin showtime ID: 141
PaymentComponent.tsx:646 🔄 Auto-selected PayOS for regular user
BookingPage.tsx:467 ✅ [PAYMENT_RESTORE] Already in payment view, skipping useEffect restore
PaymentComponent.tsx:136 ✅ Lấy thông tin điểm thành công: 207500 điểm
PaymentComponent.tsx:615 ✅ Thông tin showtime từ API: Object
webSocketService.ts:452 🪑 Received 35 seats from server
webSocketService.ts:147 🧪 [TEST] Testing BroadcastChannel...
webSocketService.ts:1392 🧪 [TEST] Sending test message via BroadcastChannel: Object
webSocketService.ts:1395 ✅ [TEST] Test message sent successfully
BookingPage.tsx:440 ℹ️ [VISIBILITY] Page hidden - preserving state (user might return)
BookingPage.tsx:442 ℹ️ [VISIBILITY] Page visible - user returned
BookingPage.tsx:440 ℹ️ [VISIBILITY] Page hidden - preserving state (user might return)
BookingPage.tsx:442 ℹ️ [VISIBILITY] Page visible - user returned
