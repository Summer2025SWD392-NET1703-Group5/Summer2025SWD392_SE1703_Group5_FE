import React, { useState, useEffect } from 'react';
import { UserIcon, XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { cinemaService } from '../../../services/cinemaService';
import apiClient from '../../../services/apiClient';

interface User {
    User_ID: number;
    Full_Name?: string;
    Email: string;
    Phone_Number?: string;
    Cinema_ID?: number | null;
    Cinema_Name?: string | null;
    Name?: string; // Some APIs might return Name instead of Full_Name
    Role?: string;
}

interface Cinema {
    Cinema_ID: number;
    Cinema_Name: string;
}

interface StaffAssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    cinema: Cinema | null;
    onSuccess: () => void;
    type: 'manager' | 'staff';
}

const StaffAssignmentModal: React.FC<StaffAssignmentModalProps> = ({
    isOpen,
    onClose,
    cinema,
    onSuccess,
    type
}) => {
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentManager, setCurrentManager] = useState<User | null>(null);
    const [currentStaff, setCurrentStaff] = useState<User[]>([]);
    const [validationError, setValidationError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && cinema) {
            fetchUsers();
            if (type === 'manager') {
                fetchCurrentManager();
            } else {
                fetchCurrentStaff();
            }
        }
        // Reset state when the modal opens/closes
        return () => {
            setSelectedUserId(null);
            setSearchTerm('');
            setValidationError(null);
        };
    }, [isOpen, cinema, type]);

    const fetchCurrentManager = async () => {
        if (!cinema) return;
        try {
            const manager = await cinemaService.getCinemaManager(cinema.Cinema_ID);
            // Normalize the manager object to match our User interface
            if (manager) {
                const normalizedManager: User = {
                    ...manager,
                    Full_Name: (manager as any).Full_Name || (manager as any).Name || 'Unknown Manager'
                };
                setCurrentManager(normalizedManager);
            } else {
                setCurrentManager(null);
            }
        } catch (error) {
            console.error(`Error fetching current manager for cinema ${cinema.Cinema_ID}:`, error);
        }
    };

    const fetchCurrentStaff = async () => {
        if (!cinema) return;
        try {
            const staff = await cinemaService.getCinemaStaff(cinema.Cinema_ID);
            // Normalize the staff objects to match our User interface
            const normalizedStaff: User[] = (staff || []).map((s: any) => ({
                ...s,
                Full_Name: s.Full_Name || s.Name || 'Unknown Staff'
            }));
            setCurrentStaff(normalizedStaff);
        } catch (error) {
            console.error(`Error fetching current staff for cinema ${cinema.Cinema_ID}:`, error);
        }
    };

    const fetchUsers = async () => {
        if (!cinema) return;

        setIsLoading(true);
        try {
            let fetchedUsers: User[] = [];
            if (type === 'manager') {
                // Sử dụng API endpoint mới để lấy danh sách quản lý
                fetchedUsers = await cinemaService.getAllManagers();
            } else {
                // Sử dụng API endpoint mới để lấy danh sách nhân viên
                fetchedUsers = await cinemaService.getAllStaff();
            }

            console.log(`Fetched ${type}s:`, fetchedUsers);

            // Ensure we have valid users with Full_Name or Name property
            const validUsers = fetchedUsers.filter(user => user && (user.Full_Name || user.Name));
            
            // Normalize the Full_Name property for consistency
            const normalizedUsers = validUsers.map(user => ({
                ...user,
                Full_Name: user.Full_Name || user.Name || 'Unknown User'
            }));
            
            setUsers(normalizedUsers);
        } catch (error) {
            console.error(`Error fetching ${type}s:`, error);
            toast.error(`Không thể tải danh sách ${type === 'manager' ? 'quản lý' : 'nhân viên'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const validateAssignment = (userId: number): boolean => {
        setValidationError(null);

        if (type === 'manager') {
            // Kiểm tra nếu đã có manager cho rạp này
            if (currentManager) {
                if (currentManager.User_ID === userId) {
                    const managerName = currentManager.Full_Name || currentManager.Name || 'Manager hiện tại';
                    setValidationError(`${managerName} đã là quản lý của rạp này.`);
                    return false;
                }
                // Cho phép thay thế manager hiện tại mà không cảnh báo
                return true;
            }
        } else {
            // Kiểm tra nếu nhân viên đã được phân công cho rạp này
            const existingStaff = currentStaff.find(staff => staff.User_ID === userId);
            if (existingStaff) {
                const staffName = existingStaff.Full_Name || existingStaff.Name || 'Nhân viên này';
                setValidationError(`${staffName} đã được phân công cho rạp này.`);
                return false;
            }

            // Kiểm tra nếu nhân viên đã được phân công cho rạp khác
            const selectedUser = users.find(user => user.User_ID === userId);
            if (selectedUser && selectedUser.Cinema_ID && selectedUser.Cinema_ID !== cinema?.Cinema_ID) {
                const userName = selectedUser.Full_Name || selectedUser.Name || 'Nhân viên này';
                setValidationError(`${userName} đã được phân công cho rạp ${selectedUser.Cinema_Name}. Một nhân viên chỉ có thể được phân công cho một rạp.`);
                return false;
            }
        }

        return true;
    };

    const handleAssign = async () => {
        if (!cinema || !selectedUserId) {
            toast.error(`Vui lòng chọn ${type === 'manager' ? 'quản lý' : 'nhân viên'}`);
            return;
        }

        // Validate trước khi phân công
        if (!validateAssignment(selectedUserId)) {
            return;
        }

        setLoading(true);
        try {
            // Sử dụng API endpoint mới cho cả manager và staff
            const assignmentData = {
                userId: selectedUserId,
                role: type === 'manager' ? "Manager" : "Staff",
                cinemaId: cinema.Cinema_ID
            };

            // Call the new API endpoint using apiClient
            const response = await apiClient.post('/user/assign-to-cinema', assignmentData);
            const responseData = response.data;

            if (!responseData.success) {
                // Sử dụng message từ API response
                throw new Error(responseData.message || responseData.error || `Phân công ${type === 'manager' ? 'quản lý' : 'nhân viên'} thất bại`);
            }

            // Log success response for debugging
            console.log('Assignment successful:', responseData);

            // Sử dụng message từ API response nếu có, hoặc tạo message phù hợp
            let successMessage = responseData.message;
            if (!successMessage) {
                if (type === 'manager') {
                    const selectedUser = users.find(u => u.User_ID === selectedUserId);
                    const userName = selectedUser?.Full_Name || selectedUser?.Name || 'Quản lý';
                    successMessage = currentManager
                        ? `Đã thay thế quản lý thành công. ${userName} hiện là quản lý mới của rạp.`
                        : 'Quản lý đã được phân công thành công';
                } else {
                    successMessage = 'Nhân viên đã được phân công thành công';
                }
            }

            toast.success(successMessage);
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(`Error assigning ${type}:`, error);

            // Ưu tiên message từ API response
            let errorMessage = '';

            // Nếu có response data từ API
            if (error.message && error.message !== 'Failed to fetch') {
                try {
                    // Nếu error.message là JSON string
                    const errorData = JSON.parse(error.message);
                    errorMessage = errorData.message || '';

                    // Nếu có errors array, thêm vào message
                    if (errorData.errors && Array.isArray(errorData.errors)) {
                        errorMessage += '\n' + errorData.errors.join('\n');
                    }
                } catch {
                    // Nếu không phải JSON, sử dụng error.message trực tiếp
                    errorMessage = error.message;
                }
            }

            // Nếu vẫn chưa có message, thử lấy từ response khác
            if (!errorMessage) {
                if (error.response?.data?.message) {
                    errorMessage = error.response.data.message;

                    // Thêm errors nếu có
                    if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
                        errorMessage += '\n' + error.response.data.errors.join('\n');
                    }
                } else if (error.response?.data?.error) {
                    errorMessage = error.response.data.error;
                }
            }

            // Chỉ hiển thị message từ API, không có fallback message mặc định
            if (errorMessage) {
                toast.error(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const userName = (user?.Full_Name || user?.Name || '').toLowerCase();
        const userEmail = (user?.Email || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        return userName.includes(search) || userEmail.includes(search);
    });

    if (!isOpen) return null;

    return (
        <div
            className="fixed top-0 left-0 w-screen h-screen bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 9999
            }}
            onClick={onClose}
        >
            <div
                className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden transform transition-all"
                style={{
                    position: 'relative',
                    zIndex: 10000
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-slate-700 px-6 py-4 flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white flex items-center">
                        <UserIcon className="w-5 h-5 mr-2 text-[#FFD875]" />
                        {type === 'manager' ? 'Phân công quản lý' : 'Phân công nhân viên'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="mb-4">
                        <h4 className="text-white font-medium mb-2">Rạp:</h4>
                        <div className="bg-slate-700 py-2 px-4 rounded-lg text-white">
                            <div className="mb-1">{cinema?.Cinema_Name}</div>
                            <div className="text-xs text-[#FFD875]">ID: {cinema?.Cinema_ID}</div>
                        </div>
                    </div>

                    {type === 'manager' && currentManager && (
                        <div className="mb-4 bg-slate-700/50 rounded-lg p-3 border border-[#FFD875]/30">
                            <div className="text-sm text-white">
                                <span className="text-[#FFD875] font-medium">Quản lý hiện tại:</span> {currentManager.Full_Name || currentManager.Name || 'Quản lý'}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                                {currentManager.Email} (ID: {currentManager.User_ID})
                            </div>
                            <div className="text-xs text-amber-300 mt-2 italic">
                                * Chọn quản lý mới sẽ thay thế quản lý hiện tại
                            </div>
                        </div>
                    )}

                    {type === 'staff' && currentStaff.length > 0 && (
                        <div className="mb-4 bg-slate-700/50 rounded-lg p-3 border border-[#FFD875]/30">
                            <div className="text-sm text-white">
                                <span className="text-[#FFD875] font-medium">Nhân viên hiện tại ({currentStaff.length}):</span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1 max-h-20 overflow-y-auto">
                                {currentStaff.map((staff) => (
                                    <div key={staff.User_ID} className="mb-1">
                                        {staff.Full_Name || staff.Name || 'Nhân viên'} (ID: {staff.User_ID})
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {validationError && (
                        <div className="mb-4 bg-amber-900/30 rounded-lg p-3 border border-amber-500/30 flex items-start">
                            <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-amber-200">{validationError}</div>
                        </div>
                    )}

                    <div className="mb-6">
                        <label className="text-white font-medium mb-2 block">
                            {type === 'manager' ? 'Chọn quản lý:' : 'Chọn nhân viên:'}
                        </label>

                        <div className="mb-2">
                            <input
                                type="text"
                                placeholder={type === 'manager' ? "Tìm quản lý..." : "Tìm nhân viên..."}
                                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-[#FFD875] focus:outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="max-h-60 overflow-y-auto bg-slate-700 rounded-lg border border-slate-600">
                            {isLoading ? (
                                <div className="text-center py-4 text-gray-400">Đang tải...</div>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map(user => (
                                    <div
                                        key={user.User_ID}
                                        className={`px-4 py-3 cursor-pointer hover:bg-slate-600 border-b border-slate-600 last:border-0 ${selectedUserId === user.User_ID ? 'bg-slate-600' : ''
                                            }`}
                                        onClick={() => setSelectedUserId(user.User_ID)}
                                    >
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-[#FFD875] text-black rounded-full flex items-center justify-center mr-3 font-bold">
                                                {(() => {
                                                    const name = user.Full_Name || user.Name;
                                                    return name ? name.charAt(0).toUpperCase() : '?';
                                                })()}
                                            </div>
                                            <div>
                                                <div className="text-white font-medium">
                                                    {user.Full_Name || user.Name || 'Không có tên'}
                                                    <span className="text-xs text-[#FFD875] ml-2">ID: {user.User_ID}</span>
                                                </div>
                                                <div className="text-gray-400 text-sm">{user.Email || 'Không có email'}</div>
                                                {user.Cinema_ID && user.Cinema_Name && (
                                                    <div className="text-xs text-[#FFD875] mt-1">
                                                        Đang phân công: {user.Cinema_Name}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-gray-400">
                                    {searchTerm ? "Không tìm thấy kết quả" : "Không có dữ liệu"}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleAssign}
                            disabled={loading || !selectedUserId}
                            className={`px-4 py-2 text-black rounded-lg transition-colors ${loading || !selectedUserId
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-[#FFD875] hover:bg-opacity-80 btn-glow'
                                }`}
                        >
                            {loading ? "Đang xử lý..." : "Phân công"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffAssignmentModal; 