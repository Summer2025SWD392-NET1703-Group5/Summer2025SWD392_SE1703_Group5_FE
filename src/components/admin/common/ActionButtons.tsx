import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/SimpleAuthContext';
import { PencilIcon, TrashIcon, EyeIcon, PlusIcon } from '@heroicons/react/24/outline';

interface ActionButtonsProps {
    onView?: () => void;
    editLink?: string;
    onEdit?: () => void;
    onDelete?: () => void;
    hideEdit?: boolean;
    hideDelete?: boolean;
    hideView?: boolean;
    customActions?: React.ReactNode;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
    onView,
    editLink,
    onEdit,
    onDelete,
    hideEdit = false,
    hideDelete = false,
    hideView = false,
    customActions
}) => {
    const { user } = useAuth();
    const canEdit = user?.role === 'Admin';

    return (
        <div className="flex items-center gap-2">
            {onView && !hideView && (
                <button
                    onClick={onView}
                    className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
                    title="Xem chi tiết"
                >
                    <EyeIcon className="h-4 w-4" />
                </button>
            )}

            {canEdit && !hideEdit && (editLink || onEdit) && (
                editLink ? (
                    <Link
                        to={editLink}
                        className="p-2 bg-yellow-500/10 text-yellow-400 rounded-lg hover:bg-yellow-500/20 transition-colors"
                        title="Chỉnh sửa"
                    >
                        <PencilIcon className="h-4 w-4" />
                    </Link>
                ) : (
                    <button
                        onClick={onEdit}
                        className="p-2 bg-yellow-500/10 text-yellow-400 rounded-lg hover:bg-yellow-500/20 transition-colors"
                        title="Chỉnh sửa"
                    >
                        <PencilIcon className="h-4 w-4" />
                    </button>
                )
            )}

            {canEdit && !hideDelete && onDelete && (
                <button
                    onClick={onDelete}
                    className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                    title="Xóa"
                >
                    <TrashIcon className="h-4 w-4" />
                </button>
            )}

            {customActions}
        </div>
    );
};

interface AddButtonProps {
    to: string;
    label: string;
}

export const AddButton: React.FC<AddButtonProps> = ({ to, label }) => {
    const { user } = useAuth();
    const canEdit = user?.role === 'Admin';

    if (!canEdit) return null;

    return (
        <Link
            to={to}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FFD875] to-[#FFE055] text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-[#FFD875]/25 transition-all duration-300 hover:scale-105"
        >
            <PlusIcon className="w-5 h-5" />
            <span>Thêm {label}</span>
        </Link>
    );
};

export default ActionButtons;
