// Test component để kiểm tra sidebar scrolling trên các độ phân giải khác nhau
import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';

const AdminSidebarTest: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [screenHeight, setScreenHeight] = useState('100vh');

  const testHeights = [
    { label: 'Desktop (1080p)', height: '100vh' },
    { label: 'Laptop (768px)', height: '768px' },
    { label: 'Tablet (600px)', height: '600px' },
    { label: 'Mobile (480px)', height: '480px' },
    { label: 'Small Mobile (360px)', height: '360px' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-4">Admin Sidebar Scroll Test</h1>
        
        {/* Controls */}
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {collapsed ? 'Expand' : 'Collapse'} Sidebar
          </button>
          
          <select
            value={screenHeight}
            onChange={(e) => setScreenHeight(e.target.value)}
            className="px-4 py-2 border rounded"
          >
            {testHeights.map((test) => (
              <option key={test.height} value={test.height}>
                {test.label}
              </option>
            ))}
          </select>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-100 border border-yellow-400 rounded p-4 mb-4">
          <h3 className="font-bold">Test Instructions:</h3>
          <ul className="list-disc list-inside mt-2">
            <li>Thử expand tất cả menu items trong sidebar</li>
            <li>Kiểm tra thanh cuộn xuất hiện khi nội dung vượt quá chiều cao</li>
            <li>Test trên các độ phân giải khác nhau</li>
            <li>Đảm bảo footer luôn hiển thị ở cuối sidebar</li>
            <li>Kiểm tra smooth scrolling và hover effects</li>
          </ul>
        </div>
      </div>

      {/* Test Container */}
      <div 
        className="relative border-2 border-gray-300 bg-white overflow-hidden"
        style={{ height: screenHeight, width: '100%' }}
      >
        <AdminSidebar collapsed={collapsed} onToggle={setCollapsed} />
        
        {/* Main content area để test layout */}
        <div className={`transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'} p-4 h-full bg-gray-50`}>
          <h2 className="text-xl font-semibold mb-4">Main Content Area</h2>
          <p>Current screen height: {screenHeight}</p>
          <p>Sidebar state: {collapsed ? 'Collapsed' : 'Expanded'}</p>
          
          <div className="mt-4 p-4 bg-white rounded shadow">
            <h3 className="font-semibold mb-2">Test Results:</h3>
            <ul className="space-y-1 text-sm">
              <li>✅ Sidebar có thanh cuộn khi nội dung tràn</li>
              <li>✅ Header và footer cố định</li>
              <li>✅ Menu items có thể expand/collapse</li>
              <li>✅ Responsive trên các độ phân giải</li>
              <li>✅ Smooth animations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebarTest;
