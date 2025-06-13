import React from "react";
import { LoadingSpinner } from "../../../components/utils/utils";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading = false,
  confirmText = "Xóa",
  cancelText = "Hủy",
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="delete-modal-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onClose} disabled={isLoading}>
            ×
          </button>
        </div>

        <div className="delete-modal-body">
          <div className="warning-icon">⚠️</div>
          <p>{message}</p>
        </div>

        <div className="delete-modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </button>
          <button className="btn-delete" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <LoadingSpinner size="small" />
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>

        <style>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(2px);
          }

          .delete-modal {
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            max-width: 500px;
            width: 90%;
            max-height: 90vh;
            overflow: hidden;
          }

          .delete-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            border-bottom: 1px solid #e9ecef;
            background-color: #f8f9fa;
          }

          .delete-modal-header h3 {
            margin: 0;
            color: #2c3e50;
            font-size: 1.25rem;
            font-weight: 600;
          }

          .close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #6c757d;
            padding: 0;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
          }

          .close-btn:hover:not(:disabled) {
            background-color: #e9ecef;
            color: #495057;
          }

          .close-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .delete-modal-body {
            padding: 2rem 1.5rem;
            text-align: center;
          }

          .warning-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
          }

          .delete-modal-body p {
            color: #2c3e50;
            font-size: 1rem;
            line-height: 1.5;
            margin: 0;
            white-space: pre-line;
          }

          .delete-modal-footer {
            padding: 1.5rem;
            border-top: 1px solid #e9ecef;
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
            background-color: #f8f9fa;
          }

          .btn-cancel,
          .btn-delete {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 6px;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            min-width: 100px;
            justify-content: center;
          }

          .btn-cancel {
            background-color: #6c757d;
            color: white;
          }

          .btn-cancel:hover:not(:disabled) {
            background-color: #545b62;
          }

          .btn-delete {
            background-color: #e74c3c;
            color: white;
          }

          .btn-delete:hover:not(:disabled) {
            background-color: #c0392b;
          }

          .btn-cancel:disabled,
          .btn-delete:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          @media (max-width: 768px) {
            .delete-modal {
              width: 95%;
              margin: 1rem;
            }

            .delete-modal-footer {
              flex-direction: column;
            }

            .btn-cancel,
            .btn-delete {
              width: 100%;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
