// src/components/admin/common/RichTextEditor.tsx
import React, { useState, useRef } from 'react';
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListBulletIcon,
  NumberedListIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Nhập nội dung...",
  minHeight = "200px",
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertLink = () => {
    const url = prompt('Nhập URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const toolbarButtons = [
    { command: 'bold', icon: BoldIcon, title: 'Bold' },
    { command: 'italic', icon: ItalicIcon, title: 'Italic' },
    { command: 'underline', icon: UnderlineIcon, title: 'Underline' },
    { command: 'insertUnorderedList', icon: ListBulletIcon, title: 'Bullet List' },
    { command: 'insertOrderedList', icon: NumberedListIcon, title: 'Numbered List' },
    { command: 'createLink', icon: LinkIcon, title: 'Link', onClick: insertLink },
  ];

  return (
    <div className={`border rounded-lg ${isFocused ? 'border-yellow-500' : 'border-slate-500'}`}>
      {/* Toolbar */}
      <div className="flex items-center space-x-1 p-2 border-b border-slate-600 bg-slate-700 rounded-t-lg">
        {toolbarButtons.map((button) => (
          <button
            key={button.command}
            type="button"
            onClick={button.onClick || (() => execCommand(button.command))}
            className="p-2 text-gray-400 hover:text-white hover:bg-slate-600 rounded transition-colors"
            title={button.title}
          >
            <button.icon className="w-4 h-4" />
          </button>
        ))}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="p-4 text-white bg-slate-600 rounded-b-lg focus:outline-none"
        style={{ minHeight }}
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        dangerouslySetInnerHTML={{ __html: value }}
        data-placeholder={placeholder}
      />
    </div>
  );
};

export default RichTextEditor;
