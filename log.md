BookingPage.tsx:743 🔄 [BOOKING_PAGE_CLEANUP] User leaving BookingPage - preserving WebSocket for cross-tab sync
Header.tsx:100 Đóng tất cả menu khi chuyển đến: /profile
ProfileInfo.tsx:123 User data in ProfileInfo: {User_ID: 9, Full_Name: 'Nguyen Van Phuc', Email: 'user@gmail.com', Phone_Number: '0987654324', Date_Of_Birth: '2004-01-13T00:00:00.000Z', …}
userService.ts:33 [userService] Profile loaded: Customer user
ProfileInfo.tsx:123 User data in ProfileInfo: {User_ID: 9, Full_Name: 'Nguyen Van Phuc', Email: 'user@gmail.com', Phone_Number: '0987654324', Date_Of_Birth: '2004-01-13T00:00:00.000Z', …}
Header.tsx:100 Đóng tất cả menu khi chuyển đến: /profile/tickets
apiClient.ts:55 API Request: GET http://localhost:3000/api/ticket/my-tickets
apiClient.ts:89 API Response (/ticket/my-tickets): 200
MyTickets.tsx:63 API response: {success: true, total: 33, tickets: Array(33)}
MyTickets.tsx:423 Full ticket object: {ticket_id: 1632, ticket_code: 'S48AYJVE', booking_id: 1333, status: 'Active', is_checked_in: false, …}
MyTickets.tsx:458 Start time value: 09:00:00 Type: string
MyTickets.tsx:423 Full ticket object: {ticket_id: 575, ticket_code: 'MYZS3HL5', booking_id: 424, status: 'Active', is_checked_in: false, …}
MyTickets.tsx:458 Start time value: 10:15:00 Type: string
MyTickets.tsx:423 Full ticket object: {ticket_id: 526, ticket_code: 'YO08CMQA', booking_id: 375, status: 'Active', is_checked_in: false, …}
MyTickets.tsx:458 Start time value: 10:00:00 Type: string
MyTickets.tsx:423 Full ticket object: {ticket_id: 455, ticket_code: 'DBWMN8OX', booking_id: 332, status: 'Active', is_checked_in: false, …}
MyTickets.tsx:458 Start time value: 04:45:00 Type: string
MyTickets.tsx:423 Full ticket object: {ticket_id: 447, ticket_code: 'GF4OAV1S', booking_id: 324, status: 'Active', is_checked_in: false, …}
MyTickets.tsx:458 Start time value: 10:00:00 Type: string
Header.tsx:100 Đóng tất cả menu khi chuyển đến: /profile/bookings
CountdownTimer.tsx:85 Khởi tạo countdown timer cho booking 1333
CountdownTimer.tsx:55 Booking 1333 - Tạo từ -25179s trước, còn lại: 25479s
CountdownTimer.tsx:55 Booking 1333 - Tạo từ -25178s trước, còn lại: 25478s
CountdownTimer.tsx:55 Booking 1333 - Tạo từ -25177s trước, còn lại: 25477s
CountdownTimer.tsx:124 Cleanup timer cho booking 1333
CountdownTimer.tsx:85 Khởi tạo countdown timer cho booking 1333
CountdownTimer.tsx:55 Booking 1333 - Tạo từ -25177s trước, còn lại: 25477s
CountdownTimer.tsx:55 Booking 1333 - Tạo từ -25176s trước, còn lại: 25476s
BookingHistory.tsx:87 🗑️ [CANCEL_BOOKING] Clearing payment state for cancelled booking 1333
BookingHistory.tsx:93 🔍 [CANCEL_BOOKING] Cancelled booking structure: {Booking_ID: 1333, Booking_Date: '2025-07-14T10:04:49.033Z', Payment_Deadline: '2025-07-14T10:09:49.033Z', Total_Amount: 81000, Status: 'Pending', …}
BookingHistory.tsx:94 🔍 [CANCEL_BOOKING] Available keys: (12) ['Booking_ID', 'Booking_Date', 'Payment_Deadline', 'Total_Amount', 'Status', 'Seats', 'MovieName', 'RoomName', 'Show_Date', 'Start_Time', 'PaymentMethod', 'PosterURL']
BookingHistory.tsx:124 ⚠️ [CANCEL_BOOKING] No showtimeId found for booking 1333, clearing all payment states
confirmCancelBooking @ BookingHistory.tsx:124
await in confirmCancelBooking
callCallback2 @ chunk-YCOEJRGR.js?v=53a3cfb5:3674
invokeGuardedCallbackDev @ chunk-YCOEJRGR.js?v=53a3cfb5:3699
invokeGuardedCallback @ chunk-YCOEJRGR.js?v=53a3cfb5:3733
invokeGuardedCallbackAndCatchFirstError @ chunk-YCOEJRGR.js?v=53a3cfb5:3736
executeDispatch @ chunk-YCOEJRGR.js?v=53a3cfb5:7014
processDispatchQueueItemsInOrder @ chunk-YCOEJRGR.js?v=53a3cfb5:7034
processDispatchQueue @ chunk-YCOEJRGR.js?v=53a3cfb5:7043
dispatchEventsForPlugins @ chunk-YCOEJRGR.js?v=53a3cfb5:7051
(anonymous) @ chunk-YCOEJRGR.js?v=53a3cfb5:7174
batchedUpdates$1 @ chunk-YCOEJRGR.js?v=53a3cfb5:18913
batchedUpdates @ chunk-YCOEJRGR.js?v=53a3cfb5:3579
dispatchEventForPluginEventSystem @ chunk-YCOEJRGR.js?v=53a3cfb5:7173
dispatchEventWithEnableCapturePhaseSelectiveHydrationWithoutDiscreteEventReplay @ chunk-YCOEJRGR.js?v=53a3cfb5:5478
dispatchEvent @ chunk-YCOEJRGR.js?v=53a3cfb5:5472
dispatchDiscreteEvent @ chunk-YCOEJRGR.js?v=53a3cfb5:5449
BookingHistory.tsx:133 🗑️ [CANCEL_BOOKING] Cleared fallback payment state: payment_state_137
BookingHistory.tsx:133 🗑️ [CANCEL_BOOKING] Cleared fallback payment state: payment_state_140
BookingHistory.tsx:141 🗑️ [CANCEL_BOOKING] Cleared fallback session: bookingData
BookingHistory.tsx:141 🗑️ [CANCEL_BOOKING] Cleared fallback session: has_pending_booking
CountdownTimer.tsx:124 Cleanup timer cho booking 1333
Header.tsx:100 Đóng tất cả menu khi chuyển đến: /showtimes
ShowtimePage.tsx:205 Tham số cinema từ URL: null
ShowtimesPageService.ts:136 Fetching all cinemas...
ShowtimesPageService.ts:220 Fetching all movies...
ShowtimesPageService.ts:223 Movies received: (44) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
ShowtimesPageService.ts:139 Cinemas received: (6) [{…}, {…}, {…}, {…}, {…}, {…}]
ShowtimesPageService.ts:312 Fetching all showtimes with filters: {date: '2025-07-14', cinemaId: undefined, movieId: undefined, roomType: undefined, timeSlot: undefined}
ShowtimesPageService.ts:136 Fetching all cinemas...
ShowtimesPageService.ts:139 Cinemas received: (6) [{…}, {…}, {…}, {…}, {…}, {…}]
ShowtimesPageService.ts:285 Fetching showtimes for cinema 1 on date 2025-07-14
ShowtimesPageService.ts:285 Fetching showtimes for cinema 15 on date 2025-07-14
ShowtimesPageService.ts:285 Fetching showtimes for cinema 5 on date 2025-07-14
ShowtimesPageService.ts:285 Fetching showtimes for cinema 8 on date 2025-07-14
ShowtimesPageService.ts:285 Fetching showtimes for cinema 12 on date 2025-07-14
ShowtimesPageService.ts:285 Fetching showtimes for cinema 2 on date 2025-07-14
ShowtimesPageService.ts:287  GET http://localhost:3000/api/cinemas/12/showtimes?date=2025-07-14 404 (Not Found)
dispatchXhrRequest @ axios.js?v=31343a40:1651
xhr @ axios.js?v=31343a40:1531
dispatchRequest @ axios.js?v=31343a40:2006
Promise.then
_request @ axios.js?v=31343a40:2209
request @ axios.js?v=31343a40:2118
Axios.<computed> @ axios.js?v=31343a40:2246
wrap @ axios.js?v=31343a40:8
getCinemaShowtimesByDate @ ShowtimesPageService.ts:287
(anonymous) @ ShowtimesPageService.ts:350
getAllShowtimes @ ShowtimesPageService.ts:348
await in getAllShowtimes
fetchShowtimesWithData @ ShowtimePage.tsx:263
fetchInitialData @ ShowtimePage.tsx:239
await in fetchInitialData
(anonymous) @ ShowtimePage.tsx:248
commitHookEffectListMount @ chunk-YCOEJRGR.js?v=53a3cfb5:16915
commitPassiveMountOnFiber @ chunk-YCOEJRGR.js?v=53a3cfb5:18156
commitPassiveMountEffects_complete @ chunk-YCOEJRGR.js?v=53a3cfb5:18129
commitPassiveMountEffects_begin @ chunk-YCOEJRGR.js?v=53a3cfb5:18119
commitPassiveMountEffects @ chunk-YCOEJRGR.js?v=53a3cfb5:18109
flushPassiveEffectsImpl @ chunk-YCOEJRGR.js?v=53a3cfb5:19490
flushPassiveEffects @ chunk-YCOEJRGR.js?v=53a3cfb5:19447
commitRootImpl @ chunk-YCOEJRGR.js?v=53a3cfb5:19416
commitRoot @ chunk-YCOEJRGR.js?v=53a3cfb5:19277
performSyncWorkOnRoot @ chunk-YCOEJRGR.js?v=53a3cfb5:18895
flushSyncCallbacks @ chunk-YCOEJRGR.js?v=53a3cfb5:9119
(anonymous) @ chunk-YCOEJRGR.js?v=53a3cfb5:18627
errorHandler.ts:16 API Error: AxiosError {message: 'Request failed with status code 404', name: 'AxiosError', code: 'ERR_BAD_REQUEST', config: {…}, request: XMLHttpRequest, …}
ShowtimesPageService.ts:295 Error fetching cinema showtimes by date: AxiosError {message: 'Request failed with status code 404', name: 'AxiosError', code: 'ERR_BAD_REQUEST', config: {…}, request: XMLHttpRequest, …}
getCinemaShowtimesByDate @ ShowtimesPageService.ts:295
await in getCinemaShowtimesByDate
(anonymous) @ ShowtimesPageService.ts:350
getAllShowtimes @ ShowtimesPageService.ts:348
await in getAllShowtimes
fetchShowtimesWithData @ ShowtimePage.tsx:263
fetchInitialData @ ShowtimePage.tsx:239
await in fetchInitialData
(anonymous) @ ShowtimePage.tsx:248
commitHookEffectListMount @ chunk-YCOEJRGR.js?v=53a3cfb5:16915
commitPassiveMountOnFiber @ chunk-YCOEJRGR.js?v=53a3cfb5:18156
commitPassiveMountEffects_complete @ chunk-YCOEJRGR.js?v=53a3cfb5:18129
commitPassiveMountEffects_begin @ chunk-YCOEJRGR.js?v=53a3cfb5:18119
commitPassiveMountEffects @ chunk-YCOEJRGR.js?v=53a3cfb5:18109
flushPassiveEffectsImpl @ chunk-YCOEJRGR.js?v=53a3cfb5:19490
flushPassiveEffects @ chunk-YCOEJRGR.js?v=53a3cfb5:19447
commitRootImpl @ chunk-YCOEJRGR.js?v=53a3cfb5:19416
commitRoot @ chunk-YCOEJRGR.js?v=53a3cfb5:19277
performSyncWorkOnRoot @ chunk-YCOEJRGR.js?v=53a3cfb5:18895
flushSyncCallbacks @ chunk-YCOEJRGR.js?v=53a3cfb5:9119
(anonymous) @ chunk-YCOEJRGR.js?v=53a3cfb5:18627
ShowtimesPageService.ts:287  GET http://localhost:3000/api/cinemas/15/showtimes?date=2025-07-14 404 (Not Found)
dispatchXhrRequest @ axios.js?v=31343a40:1651
xhr @ axios.js?v=31343a40:1531
dispatchRequest @ axios.js?v=31343a40:2006
Promise.then
_request @ axios.js?v=31343a40:2209
request @ axios.js?v=31343a40:2118
Axios.<computed> @ axios.js?v=31343a40:2246
wrap @ axios.js?v=31343a40:8
getCinemaShowtimesByDate @ ShowtimesPageService.ts:287
(anonymous) @ ShowtimesPageService.ts:350
getAllShowtimes @ ShowtimesPageService.ts:348
await in getAllShowtimes
fetchShowtimesWithData @ ShowtimePage.tsx:263
fetchInitialData @ ShowtimePage.tsx:239
await in fetchInitialData
(anonymous) @ ShowtimePage.tsx:248
commitHookEffectListMount @ chunk-YCOEJRGR.js?v=53a3cfb5:16915
commitPassiveMountOnFiber @ chunk-YCOEJRGR.js?v=53a3cfb5:18156
commitPassiveMountEffects_complete @ chunk-YCOEJRGR.js?v=53a3cfb5:18129
commitPassiveMountEffects_begin @ chunk-YCOEJRGR.js?v=53a3cfb5:18119
commitPassiveMountEffects @ chunk-YCOEJRGR.js?v=53a3cfb5:18109
flushPassiveEffectsImpl @ chunk-YCOEJRGR.js?v=53a3cfb5:19490
flushPassiveEffects @ chunk-YCOEJRGR.js?v=53a3cfb5:19447
commitRootImpl @ chunk-YCOEJRGR.js?v=53a3cfb5:19416
commitRoot @ chunk-YCOEJRGR.js?v=53a3cfb5:19277
performSyncWorkOnRoot @ chunk-YCOEJRGR.js?v=53a3cfb5:18895
flushSyncCallbacks @ chunk-YCOEJRGR.js?v=53a3cfb5:9119
(anonymous) @ chunk-YCOEJRGR.js?v=53a3cfb5:18627
errorHandler.ts:16 API Error: AxiosError {message: 'Request failed with status code 404', name: 'AxiosError', code: 'ERR_BAD_REQUEST', config: {…}, request: XMLHttpRequest, …}
ShowtimesPageService.ts:295 Error fetching cinema showtimes by date: AxiosError {message: 'Request failed with status code 404', name: 'AxiosError', code: 'ERR_BAD_REQUEST', config: {…}, request: XMLHttpRequest, …}
getCinemaShowtimesByDate @ ShowtimesPageService.ts:295
await in getCinemaShowtimesByDate
(anonymous) @ ShowtimesPageService.ts:350
getAllShowtimes @ ShowtimesPageService.ts:348
await in getAllShowtimes
fetchShowtimesWithData @ ShowtimePage.tsx:263
fetchInitialData @ ShowtimePage.tsx:239
await in fetchInitialData
(anonymous) @ ShowtimePage.tsx:248
commitHookEffectListMount @ chunk-YCOEJRGR.js?v=53a3cfb5:16915
commitPassiveMountOnFiber @ chunk-YCOEJRGR.js?v=53a3cfb5:18156
commitPassiveMountEffects_complete @ chunk-YCOEJRGR.js?v=53a3cfb5:18129
commitPassiveMountEffects_begin @ chunk-YCOEJRGR.js?v=53a3cfb5:18119
commitPassiveMountEffects @ chunk-YCOEJRGR.js?v=53a3cfb5:18109
flushPassiveEffectsImpl @ chunk-YCOEJRGR.js?v=53a3cfb5:19490
flushPassiveEffects @ chunk-YCOEJRGR.js?v=53a3cfb5:19447
commitRootImpl @ chunk-YCOEJRGR.js?v=53a3cfb5:19416
commitRoot @ chunk-YCOEJRGR.js?v=53a3cfb5:19277
performSyncWorkOnRoot @ chunk-YCOEJRGR.js?v=53a3cfb5:18895
flushSyncCallbacks @ chunk-YCOEJRGR.js?v=53a3cfb5:9119
(anonymous) @ chunk-YCOEJRGR.js?v=53a3cfb5:18627
ShowtimesPageService.ts:292 Cinema showtimes received: {cinema_id: 1, cinema_name: 'Galaxy Bảo Lộc', date: '2025-07-14', movies: Array(1)}
ShowtimesPageService.ts:287  GET http://localhost:3000/api/cinemas/8/showtimes?date=2025-07-14 404 (Not Found)
dispatchXhrRequest @ axios.js?v=31343a40:1651
xhr @ axios.js?v=31343a40:1531
dispatchRequest @ axios.js?v=31343a40:2006
Promise.then
_request @ axios.js?v=31343a40:2209
request @ axios.js?v=31343a40:2118
Axios.<computed> @ axios.js?v=31343a40:2246
wrap @ axios.js?v=31343a40:8
getCinemaShowtimesByDate @ ShowtimesPageService.ts:287
(anonymous) @ ShowtimesPageService.ts:350
getAllShowtimes @ ShowtimesPageService.ts:348
await in getAllShowtimes
fetchShowtimesWithData @ ShowtimePage.tsx:263
fetchInitialData @ ShowtimePage.tsx:239
await in fetchInitialData
(anonymous) @ ShowtimePage.tsx:248
commitHookEffectListMount @ chunk-YCOEJRGR.js?v=53a3cfb5:16915
commitPassiveMountOnFiber @ chunk-YCOEJRGR.js?v=53a3cfb5:18156
commitPassiveMountEffects_complete @ chunk-YCOEJRGR.js?v=53a3cfb5:18129
commitPassiveMountEffects_begin @ chunk-YCOEJRGR.js?v=53a3cfb5:18119
commitPassiveMountEffects @ chunk-YCOEJRGR.js?v=53a3cfb5:18109
flushPassiveEffectsImpl @ chunk-YCOEJRGR.js?v=53a3cfb5:19490
flushPassiveEffects @ chunk-YCOEJRGR.js?v=53a3cfb5:19447
commitRootImpl @ chunk-YCOEJRGR.js?v=53a3cfb5:19416
commitRoot @ chunk-YCOEJRGR.js?v=53a3cfb5:19277
performSyncWorkOnRoot @ chunk-YCOEJRGR.js?v=53a3cfb5:18895
flushSyncCallbacks @ chunk-YCOEJRGR.js?v=53a3cfb5:9119
(anonymous) @ chunk-YCOEJRGR.js?v=53a3cfb5:18627
errorHandler.ts:16 API Error: AxiosError {message: 'Request failed with status code 404', name: 'AxiosError', code: 'ERR_BAD_REQUEST', config: {…}, request: XMLHttpRequest, …}
ShowtimesPageService.ts:295 Error fetching cinema showtimes by date: AxiosError {message: 'Request failed with status code 404', name: 'AxiosError', code: 'ERR_BAD_REQUEST', config: {…}, request: XMLHttpRequest, …}
getCinemaShowtimesByDate @ ShowtimesPageService.ts:295
await in getCinemaShowtimesByDate
(anonymous) @ ShowtimesPageService.ts:350
getAllShowtimes @ ShowtimesPageService.ts:348
await in getAllShowtimes
fetchShowtimesWithData @ ShowtimePage.tsx:263
fetchInitialData @ ShowtimePage.tsx:239
await in fetchInitialData
(anonymous) @ ShowtimePage.tsx:248
commitHookEffectListMount @ chunk-YCOEJRGR.js?v=53a3cfb5:16915
commitPassiveMountOnFiber @ chunk-YCOEJRGR.js?v=53a3cfb5:18156
commitPassiveMountEffects_complete @ chunk-YCOEJRGR.js?v=53a3cfb5:18129
commitPassiveMountEffects_begin @ chunk-YCOEJRGR.js?v=53a3cfb5:18119
commitPassiveMountEffects @ chunk-YCOEJRGR.js?v=53a3cfb5:18109
flushPassiveEffectsImpl @ chunk-YCOEJRGR.js?v=53a3cfb5:19490
flushPassiveEffects @ chunk-YCOEJRGR.js?v=53a3cfb5:19447
commitRootImpl @ chunk-YCOEJRGR.js?v=53a3cfb5:19416
commitRoot @ chunk-YCOEJRGR.js?v=53a3cfb5:19277
performSyncWorkOnRoot @ chunk-YCOEJRGR.js?v=53a3cfb5:18895
flushSyncCallbacks @ chunk-YCOEJRGR.js?v=53a3cfb5:9119
(anonymous) @ chunk-YCOEJRGR.js?v=53a3cfb5:18627
ShowtimesPageService.ts:287  GET http://localhost:3000/api/cinemas/5/showtimes?date=2025-07-14 404 (Not Found)
dispatchXhrRequest @ axios.js?v=31343a40:1651
xhr @ axios.js?v=31343a40:1531
dispatchRequest @ axios.js?v=31343a40:2006
Promise.then
_request @ axios.js?v=31343a40:2209
request @ axios.js?v=31343a40:2118
Axios.<computed> @ axios.js?v=31343a40:2246
wrap @ axios.js?v=31343a40:8
getCinemaShowtimesByDate @ ShowtimesPageService.ts:287
(anonymous) @ ShowtimesPageService.ts:350
getAllShowtimes @ ShowtimesPageService.ts:348
await in getAllShowtimes
fetchShowtimesWithData @ ShowtimePage.tsx:263
fetchInitialData @ ShowtimePage.tsx:239
await in fetchInitialData
(anonymous) @ ShowtimePage.tsx:248
commitHookEffectListMount @ chunk-YCOEJRGR.js?v=53a3cfb5:16915
commitPassiveMountOnFiber @ chunk-YCOEJRGR.js?v=53a3cfb5:18156
commitPassiveMountEffects_complete @ chunk-YCOEJRGR.js?v=53a3cfb5:18129
commitPassiveMountEffects_begin @ chunk-YCOEJRGR.js?v=53a3cfb5:18119
commitPassiveMountEffects @ chunk-YCOEJRGR.js?v=53a3cfb5:18109
flushPassiveEffectsImpl @ chunk-YCOEJRGR.js?v=53a3cfb5:19490
flushPassiveEffects @ chunk-YCOEJRGR.js?v=53a3cfb5:19447
commitRootImpl @ chunk-YCOEJRGR.js?v=53a3cfb5:19416
commitRoot @ chunk-YCOEJRGR.js?v=53a3cfb5:19277
performSyncWorkOnRoot @ chunk-YCOEJRGR.js?v=53a3cfb5:18895
flushSyncCallbacks @ chunk-YCOEJRGR.js?v=53a3cfb5:9119
(anonymous) @ chunk-YCOEJRGR.js?v=53a3cfb5:18627
errorHandler.ts:16 API Error: AxiosError {message: 'Request failed with status code 404', name: 'AxiosError', code: 'ERR_BAD_REQUEST', config: {…}, request: XMLHttpRequest, …}
ShowtimesPageService.ts:295 Error fetching cinema showtimes by date: AxiosError {message: 'Request failed with status code 404', name: 'AxiosError', code: 'ERR_BAD_REQUEST', config: {…}, request: XMLHttpRequest, …}
getCinemaShowtimesByDate @ ShowtimesPageService.ts:295
await in getCinemaShowtimesByDate
(anonymous) @ ShowtimesPageService.ts:350
getAllShowtimes @ ShowtimesPageService.ts:348
await in getAllShowtimes
fetchShowtimesWithData @ ShowtimePage.tsx:263
fetchInitialData @ ShowtimePage.tsx:239
await in fetchInitialData
(anonymous) @ ShowtimePage.tsx:248
commitHookEffectListMount @ chunk-YCOEJRGR.js?v=53a3cfb5:16915
commitPassiveMountOnFiber @ chunk-YCOEJRGR.js?v=53a3cfb5:18156
commitPassiveMountEffects_complete @ chunk-YCOEJRGR.js?v=53a3cfb5:18129
commitPassiveMountEffects_begin @ chunk-YCOEJRGR.js?v=53a3cfb5:18119
commitPassiveMountEffects @ chunk-YCOEJRGR.js?v=53a3cfb5:18109
flushPassiveEffectsImpl @ chunk-YCOEJRGR.js?v=53a3cfb5:19490
flushPassiveEffects @ chunk-YCOEJRGR.js?v=53a3cfb5:19447
commitRootImpl @ chunk-YCOEJRGR.js?v=53a3cfb5:19416
commitRoot @ chunk-YCOEJRGR.js?v=53a3cfb5:19277
performSyncWorkOnRoot @ chunk-YCOEJRGR.js?v=53a3cfb5:18895
flushSyncCallbacks @ chunk-YCOEJRGR.js?v=53a3cfb5:9119
(anonymous) @ chunk-YCOEJRGR.js?v=53a3cfb5:18627
ShowtimesPageService.ts:292 Cinema showtimes received: {cinema_id: 2, cinema_name: 'Galaxy Thủ Đức', date: '2025-07-14', movies: Array(1)}
ShowtimesPageService.ts:401 Filtered showtimes: (2) [{…}, {…}]
ShowtimePage.tsx:264 Fetched showtimes: (2) [{…}, {…}]
ShowtimesPageService.ts:152 Fetching room details for ID: 21
ShowtimesPageService.ts:152 Fetching room details for ID: 1
ShowtimesPageService.ts:446 Fetching seats info for showtime ID: 140
ShowtimesPageService.ts:446 Fetching seats info for showtime ID: 137
ShowtimesPageService.ts:449 Showtime seats info received: {Showtime_ID: 140, Movie_ID: 11, Cinema_Room_ID: 21, Room_Name: 'Phòng 01', Show_Date: '2025-07-14', …}
ShowtimesPageService.ts:449 Showtime seats info received: {Showtime_ID: 137, Movie_ID: 7, Cinema_Room_ID: 1, Room_Name: 'Phòng 01', Show_Date: '2025-07-14', …}
ShowtimePage.tsx:333 Enriched showtimes: (2) [{…}, {…}]
ShowtimePage.tsx:146 User clicked showtime: {id: 140, movieId: 11, cinemaId: 1, roomId: 21, startTime: '09:00', …}
ShowtimePage.tsx:172 Proceeding with booking for showtime: 140
Header.tsx:100 Đóng tất cả menu khi chuyển đến: /booking/140
BookingPage.tsx:283 ⏳ [PAYMENT_RESTORE] Waiting for data to load before restoring...
BookingPage.tsx:402 🔍 [PENDING_CHECK] Checking for pending booking on mount...
BookingPage.tsx:548 📭 [PENDING_CHECK] No pending booking found
BookingPage.tsx:558 🔄 [BOOKING_PAGE] Current view changed to: seats
BookingPage.tsx:560 🎬 [BOOKING_PAGE] SeatSelection component will be mounted/remounted
BookingPage.tsx:814 📋 BookingPage Debug Info:
BookingPage.tsx:815 - URL showtimeId: 140
BookingPage.tsx:816 - location.state: null
BookingPage.tsx:817 - showtime data: undefined
BookingPage.tsx:818 - movie data: undefined
BookingPage.tsx:819 - theater data: undefined
BookingPage.tsx:829 🚀 BookingPage: Force ensuring WebSocket connection for showtime 140
BookingPage.tsx:945 🎬 Fetching showtime details for ID: 140
webSocketService.ts:1486 🔄 Starting auto-reconnect for showtime 140
BookingPage.tsx:1076 🔍 fetchSeats - Seat A6 Price: {seatId: 'A6', rawSeatData: {…}, apiPrice: 81000, finalPrice: 81000, seatType: 'Regular', …}
BookingPage.tsx:1076 🔍 fetchSeats - Seat A7 Price: {seatId: 'A7', rawSeatData: {…}, apiPrice: 81000, finalPrice: 81000, seatType: 'Regular', …}
BookingPage.tsx:1098 🪑 fetchSeats - Setting 50 seats
BookingPage.tsx:1101 🔍 fetchSeats - Seat A10 final: {id: 'A10', name: 'A10', row: 'A', number: 10, type: 'standard', …}
useWebSocket.ts:797 ✅ WebSocket event listeners registered
useWebSocket.ts:862 🔄 Backup auto-connect: WebSocket disconnected, reconnecting...
SeatSelection.tsx:81 🔌 SeatSelection WebSocket: Disconnected (disconnected)
SeatSelection.tsx:87 🚀 SeatSelection mounted, ensuring WebSocket connection...
SeatSelection.tsx:92 🔄 Force connecting WebSocket...
useWebSocket.ts:186 🚀 Hook connect() called for showtime: 140
webSocketService.ts:333 ✅ WebSocket đã kết nối
SeatSelection.tsx:116 🔄 WebSocket disconnected, attempting reconnect...
SeatSelection.tsx:332 💾 Restoring 1 seats from session: ['D10']
BookingPage.tsx:287 🔍 [PAYMENT_RESTORE] Checking for payment state to restore...
BookingPage.tsx:295 🔍 [PAYMENT_RESTORE] URL showtimeId: 140, state showtimeId: 140
BookingPage.tsx:304 🔍 [PAYMENT_RESTORE] Is page reload: true
BookingPage.tsx:154 🔧 [DEBUG] loadPaymentState called with targetShowtimeId: 140, showtimeId: 140, using: 140
BookingPage.tsx:165 📭 [PAYMENT_STATE] No saved state found for key: payment_state_140
BookingPage.tsx:380 ℹ️ [PAYMENT_RESTORE] No valid payment state found, staying in seats view
useWebSocket.ts:189 🔌 WebSocket connect result: true
useWebSocket.ts:199 🔌 Connected to WebSocket for showtime 140 - NO CLEARING on reload
useWebSocket.ts:201 🎬 Calling joinShowtime for: 140
webSocketService.ts:611 🎬 Tham gia showtime room: 140
webSocketService.ts:612 🔌 Using Socket ID: K7JePskasokzpBI4AAIU
SeatSelection.tsx:226 🎯 Selected seats: 1 (D10)
webSocketService.ts:804 🔒 Chọn ghế D10 cho user 9 trong showtime 140
sessionStorageService.ts:61 💾 Saved seat D10 to session storage
webSocketService.ts:817 📡 [SELECT_SEAT] Broadcasting seat selection: D10 by user 9
webSocketService.ts:818 🔧 [SELECT_SEAT] BroadcastChannel status: true
webSocketService.ts:819 🔧 [SELECT_SEAT] Current showtime: 140
webSocketService.ts:287 🔧 [BROADCAST_DEBUG] Preparing to broadcast: {seatId: 'D10', userId: '9', showtimeId: '140', action: 'selected', timestamp: 1752462323925}
webSocketService.ts:288 🔧 [BROADCAST_DEBUG] BroadcastChannel available: true
webSocketService.ts:300 📡 [BROADCAST_SUCCESS] Sent via BroadcastChannel: selected seat D10 to other tabs
webSocketService.ts:823 ✅ [SELECT_SEAT] Cross-tab broadcast completed for seat selection
webSocketService.ts:824 🔧 [SELECT_SEAT] Final userId used: 9
SeatSelection.tsx:81 🔌 SeatSelection WebSocket: Connected (connected)
BookingPage.tsx:1339 🪑 Selected 1 seats: D10
BookingPage.tsx:1349 📋 Updated booking session: {id: 'booking-1752462323667', movieId: '1', cinemaId: '1', showtimeId: '140', selectedSeats: Array(1), …}
BookingPage.tsx:1339 🪑 Selected 1 seats: D10
SeatSelection.tsx:92 🔄 Force connecting WebSocket...
useWebSocket.ts:186 🚀 Hook connect() called for showtime: 140
webSocketService.ts:333 ✅ WebSocket đã kết nối
useWebSocket.ts:189 🔌 WebSocket connect result: true
useWebSocket.ts:199 🔌 Connected to WebSocket for showtime 140 - NO CLEARING on reload
useWebSocket.ts:201 🎬 Calling joinShowtime for: 140
webSocketService.ts:611 🎬 Tham gia showtime room: 140
webSocketService.ts:612 🔌 Using Socket ID: K7JePskasokzpBI4AAIU
useWebSocket.ts:373 🪑 [SEATS_STATE] Received 50 seats from server
useWebSocket.ts:374 🔍 [SEATS_STATE] Status breakdown: {available: 50}
webSocketService.ts:804 🔒 Chọn ghế D10 cho user 9 trong showtime 140
sessionStorageService.ts:61 💾 Saved seat D10 to session storage
webSocketService.ts:817 📡 [SELECT_SEAT] Broadcasting seat selection: D10 by user 9
webSocketService.ts:818 🔧 [SELECT_SEAT] BroadcastChannel status: true
webSocketService.ts:819 🔧 [SELECT_SEAT] Current showtime: 140
webSocketService.ts:287 🔧 [BROADCAST_DEBUG] Preparing to broadcast: {seatId: 'D10', userId: '9', showtimeId: '140', action: 'selected', timestamp: 1752462324017}
webSocketService.ts:288 🔧 [BROADCAST_DEBUG] BroadcastChannel available: true
webSocketService.ts:300 📡 [BROADCAST_SUCCESS] Sent via BroadcastChannel: selected seat D10 to other tabs
webSocketService.ts:823 ✅ [SELECT_SEAT] Cross-tab broadcast completed for seat selection
webSocketService.ts:824 🔧 [SELECT_SEAT] Final userId used: 9
BookingPage.tsx:1339 🪑 Selected 1 seats: D10
BookingPage.tsx:1339 🪑 Selected 1 seats: D10
webSocketService.ts:804 🔒 Chọn ghế D10 cho user 9 trong showtime 140
sessionStorageService.ts:61 💾 Saved seat D10 to session storage
webSocketService.ts:817 📡 [SELECT_SEAT] Broadcasting seat selection: D10 by user 9
webSocketService.ts:818 🔧 [SELECT_SEAT] BroadcastChannel status: true
webSocketService.ts:819 🔧 [SELECT_SEAT] Current showtime: 140
webSocketService.ts:287 🔧 [BROADCAST_DEBUG] Preparing to broadcast: {seatId: 'D10', userId: '9', showtimeId: '140', action: 'selected', timestamp: 1752462324040}
webSocketService.ts:288 🔧 [BROADCAST_DEBUG] BroadcastChannel available: true
webSocketService.ts:300 📡 [BROADCAST_SUCCESS] Sent via BroadcastChannel: selected seat D10 to other tabs
webSocketService.ts:823 ✅ [SELECT_SEAT] Cross-tab broadcast completed for seat selection
webSocketService.ts:824 🔧 [SELECT_SEAT] Final userId used: 9
BookingPage.tsx:1339 🪑 Selected 1 seats: D10
BookingPage.tsx:1339 🪑 Selected 1 seats: D10
useWebSocket.ts:373 🪑 [SEATS_STATE] Received 50 seats from server
useWebSocket.ts:374 🔍 [SEATS_STATE] Status breakdown: {available: 49, selected: 1}
BookingPage.tsx:1339 🪑 Selected 1 seats: D10
BookingPage.tsx:1339 🪑 Selected 1 seats: D10
BookingPage.tsx:1339 🪑 Selected 1 seats: D10
BookingPage.tsx:1339 🪑 Selected 1 seats: D10
BookingPage.tsx:1339 🪑 Selected 1 seats: D10
BookingPage.tsx:1339 🪑 Selected 1 seats: D10
webSocketService.ts:499 🔧 [FRONTEND_DEBUG] Raw data received: {"seatId":"D10","userId":9,"status":"selected","success":true}
webSocketService.ts:500 🔧 [FRONTEND_DEBUG] data.seatId type: string, value: D10
webSocketService.ts:501 🔧 [FRONTEND_DEBUG] data.userId type: number, value: 9
webSocketService.ts:502 🔒 Ghế D10 được chọn bởi user 9
webSocketService.ts:503 🔌 Socket ID nhận event: K7JePskasokzpBI4AAIU
webSocketService.ts:504 📊 Event data: {seatId: 'D10', userId: 9, status: 'selected', success: true}
BookingPage.tsx:1339 🪑 Selected 1 seats: D10
BookingPage.tsx:1339 🪑 Selected 1 seats: D10
BookingPage.tsx:1339 🪑 Selected 1 seats: D10
BookingPage.tsx:1339 🪑 Selected 1 seats: D10
webSocketService.ts:499 🔧 [FRONTEND_DEBUG] Raw data received: {"seatId":"D10","userId":9,"status":"selected","success":true}
webSocketService.ts:500 🔧 [FRONTEND_DEBUG] data.seatId type: string, value: D10
webSocketService.ts:501 🔧 [FRONTEND_DEBUG] data.userId type: number, value: 9
webSocketService.ts:502 🔒 Ghế D10 được chọn bởi user 9
webSocketService.ts:503 🔌 Socket ID nhận event: K7JePskasokzpBI4AAIU
webSocketService.ts:504 📊 Event data: {seatId: 'D10', userId: 9, status: 'selected', success: true}
BookingPage.tsx:1339 🪑 Selected 1 seats: D10
BookingPage.tsx:1339 🪑 Selected 1 seats: D10
webSocketService.ts:499 🔧 [FRONTEND_DEBUG] Raw data received: {"seatId":"D10","userId":9,"status":"selected","success":true}
webSocketService.ts:500 🔧 [FRONTEND_DEBUG] data.seatId type: string, value: D10
webSocketService.ts:501 🔧 [FRONTEND_DEBUG] data.userId type: number, value: 9
webSocketService.ts:502 🔒 Ghế D10 được chọn bởi user 9
webSocketService.ts:503 🔌 Socket ID nhận event: K7JePskasokzpBI4AAIU
webSocketService.ts:504 📊 Event data: {seatId: 'D10', userId: 9, status: 'selected', success: true}
BookingPage.tsx:1339 🪑 Selected 1 seats: D10
BookingPage.tsx:1339 🪑 Selected 1 seats: D10
SeatSelection.tsx:92 🔄 Force connecting WebSocket...
useWebSocket.ts:186 🚀 Hook connect() called for showtime: 140
webSocketService.ts:333 ✅ WebSocket đã kết nối
useWebSocket.ts:189 🔌 WebSocket connect result: true
useWebSocket.ts:199 🔌 Connected to WebSocket for showtime 140 - NO CLEARING on reload
useWebSocket.ts:201 🎬 Calling joinShowtime for: 140
webSocketService.ts:611 🎬 Tham gia showtime room: 140
webSocketService.ts:612 🔌 Using Socket ID: K7JePskasokzpBI4AAIU
BookingPage.tsx:1339 🪑 Selected 1 seats: D10
BookingPage.tsx:1339 🪑 Selected 1 seats: D10
BookingPage.tsx:1339 🪑 Selected 1 seats: D10
BookingPage.tsx:1339 🪑 Selected 1 seats: D10
