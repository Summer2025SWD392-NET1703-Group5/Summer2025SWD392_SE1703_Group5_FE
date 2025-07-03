import { useState, Fragment } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

interface CreatableComboboxProps {
    label: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    error?: string;
    required?: boolean;
    className?: string;
    labelClassName?: string;
    iconLeft?: boolean;
    icon?: React.ReactNode;
}

const CreatableCombobox: React.FC<CreatableComboboxProps> = ({
    label,
    options,
    value,
    onChange,
    placeholder,
    error,
    required = false,
    className = "",
    labelClassName = "",
    iconLeft = true,
    icon
}) => {
    const [query, setQuery] = useState('');

    const filteredOptions =
        query === ''
            ? options
            : options.filter((option) =>
                option.toLowerCase().includes(query.toLowerCase())
            );

    const isNewOption = query !== '' && !options.some(opt => opt.toLowerCase() === query.toLowerCase());

    return (
        <div>
            <Combobox
                as="div"
                value={value}
                onChange={onChange}
                nullable
            >
                <Combobox.Label className={`block text-sm font-medium mb-2 ${labelClassName || 'text-gray-300'}`}>
                    {label} {required && <span className="text-red-500">*</span>}
                </Combobox.Label>
                <div className="relative">
                    {iconLeft && icon && (
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                            {icon}
                        </div>
                    )}
                    <Combobox.Input
                        className={`w-full ${iconLeft ? 'pl-10' : 'pl-3'} pr-10 py-3 bg-slate-700 text-white rounded-lg border ${error ? 'border-red-500' : 'border-slate-500'} focus:border-[#FFD875] focus:ring focus:ring-[#FFD875]/20 focus:outline-none transition-colors duration-300 ${className}`}
                        onChange={(event) => setQuery(event.target.value)}
                        displayValue={(item: string) => item}
                        placeholder={placeholder}
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                        <ChevronUpDownIcon className="h-5 w-5 text-[#FFD875]" aria-hidden="true" />
                    </Combobox.Button>

                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                        afterLeave={() => setQuery('')}
                    >
                        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-slate-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            {isNewOption && (
                                <Combobox.Option
                                    value={query}
                                    className={({ active }) =>
                                        `relative cursor-pointer select-none py-2 pl-4 pr-4 ${active ? 'bg-[#FFD875] text-black shadow-[0_0_10px_0_rgba(255,216,117,0.5)]' : 'text-[#FFD875]'}`
                                    }
                                >
                                    Tạo mới "{query}"
                                </Combobox.Option>
                            )}
                            {filteredOptions.map((option) => (
                                <Combobox.Option
                                    key={option}
                                    value={option}
                                    className={({ active }) =>
                                        `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-[#FFD875] text-black shadow-[0_0_10px_0_rgba(255,216,117,0.5)]' : 'text-white'}`
                                    }
                                >
                                    {({ selected, active }) => (
                                        <>
                                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{option}</span>
                                            {selected ? (
                                                <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-black' : 'text-[#FFD875]'}`}>
                                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                </span>
                                            ) : null}
                                        </>
                                    )}
                                </Combobox.Option>
                            ))}
                        </Combobox.Options>
                    </Transition>
                </div>
            </Combobox>
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
};

export default CreatableCombobox; 