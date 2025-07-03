import React from 'react';

interface ButtonWithSpinnerProps {
    onClick: () => void;
    loading: boolean;
    loadingText?: string;
    defaultText?: string;
    className?: string;
    children: React.ReactNode;
    disabled?: boolean;
}

const ButtonWithSpinner: React.FC<ButtonWithSpinnerProps> = ({
    onClick,
    loading,
    loadingText,
    defaultText,
    className,
    children,
    disabled = false
}) => {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={loading || disabled}
            className={className || "bg-[#FFD875] text-black px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 shadow-[0_0_15px_0_rgba(255,216,117,0.3)] hover:shadow-[0_0_20px_5px_rgba(255,216,117,0.5)] disabled:opacity-70 disabled:cursor-not-allowed"}
        >
            {loading && (
                <div className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            )}
            {children || (loading ? loadingText : defaultText)}
        </button>
    );
};

export default ButtonWithSpinner; 