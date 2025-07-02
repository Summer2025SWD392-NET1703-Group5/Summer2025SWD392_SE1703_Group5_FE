import React, { useState } from 'react';
import { 
  CreditCardIcon, 
  PlusCircleIcon, 
  PencilIcon, 
  TrashIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface PaymentMethod {
  id: string;
  type: 'credit' | 'debit' | 'banking';
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  isDefault: boolean;
  bankName?: string;
  bankLogo?: string;
}

const PaymentMethods: React.FC = () => {
  // Mock payment methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'card1',
      type: 'credit',
      cardNumber: '4111 1111 1111 1111',
      cardHolder: 'NGUYEN VAN A',
      expiryDate: '12/25',
      isDefault: true,
      bankName: 'Visa',
      bankLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png'
    },
    {
      id: 'card2',
      type: 'credit',
      cardNumber: '5555 5555 5555 4444',
      cardHolder: 'NGUYEN VAN A',
      expiryDate: '10/26',
      isDefault: false,
      bankName: 'Mastercard',
      bankLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png'
    },
    {
      id: 'card3',
      type: 'banking',
      cardNumber: '9704 0000 0000 0018',
      cardHolder: 'NGUYEN VAN A',
      expiryDate: '09/27',
      isDefault: false,
      bankName: 'Techcombank',
      bankLogo: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Techcombank_logo.png'
    }
  ]);

  const [isAddingCard, setIsAddingCard] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  
  const [newCard, setNewCard] = useState<Omit<PaymentMethod, 'id' | 'isDefault'>>({
    type: 'credit',
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    bankName: ''
  });

  const maskCardNumber = (cardNumber: string) => {
    const visiblePart = cardNumber.slice(-4);
    const maskedPart = cardNumber.slice(0, -4).replace(/[0-9]/g, '*');
    return maskedPart + visiblePart;
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(prev => 
      prev.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
  };

  const handleDeleteCard = (id: string) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== id));
  };

  const handleAddCard = () => {
    const newId = `card${paymentMethods.length + 1}`;
    setPaymentMethods(prev => [
      ...prev,
      {
        ...newCard,
        id: newId,
        isDefault: prev.length === 0
      }
    ]);
    setNewCard({
      type: 'credit',
      cardNumber: '',
      cardHolder: '',
      expiryDate: '',
      bankName: ''
    });
    setIsAddingCard(false);
  };

  const handleUpdateCard = (id: string) => {
    setPaymentMethods(prev => 
      prev.map(method => 
        method.id === id 
          ? { ...method, ...newCard } 
          : method
      )
    );
    setEditingCardId(null);
  };

  const startEditing = (card: PaymentMethod) => {
    setNewCard({
      type: card.type,
      cardNumber: card.cardNumber,
      cardHolder: card.cardHolder,
      expiryDate: card.expiryDate,
      bankName: card.bankName
    });
    setEditingCardId(card.id);
  };

  const getCardTypeIcon = (type: string, bankName?: string) => {
    if (bankName === 'Visa') {
      return (
        <div className="w-10 h-6 bg-white rounded flex items-center justify-center">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" 
            alt="Visa" 
            className="h-3"
          />
        </div>
      );
    } else if (bankName === 'Mastercard') {
      return (
        <div className="w-10 h-6 bg-white rounded flex items-center justify-center">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" 
            alt="Mastercard" 
            className="h-4"
          />
        </div>
      );
    } else {
      return <CreditCardIcon className="w-6 h-6 text-gray-400" />;
    }
  };

  return (
    <div className="animate-fadeInUp">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-normal text-white flex items-center">
          <CreditCardIcon className="w-6 h-6 mr-2" />
          Phương thức thanh toán
        </h2>
        <button
          onClick={() => setIsAddingCard(true)}
          className="btn-primary flex items-center space-x-1"
          disabled={isAddingCard}
        >
          <PlusCircleIcon className="w-4 h-4" />
          <span>Thêm thẻ mới</span>
        </button>
      </div>

      {/* Card List */}
      <div className="space-y-4 mb-8">
        {paymentMethods.map((card) => (
          <div 
            key={card.id}
            className={`glass-dark rounded-xl p-5 border transition-all duration-300 ${
              card.isDefault 
                ? 'border-[#ffd875]/30 bg-[#ffd875]/5' 
                : 'border-gray-700/50'
            }`}
          >
            {editingCardId === card.id ? (
              // Edit Card Form
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm font-light mb-2">
                      Số thẻ
                    </label>
                    <input
                      type="text"
                      value={newCard.cardNumber}
                      onChange={(e) => setNewCard({...newCard, cardNumber: e.target.value})}
                      className="w-full p-3 glass-dark text-white rounded-lg border border-gray-600 focus:border-[#ffd875] focus:outline-none transition-colors"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-light mb-2">
                      Tên chủ thẻ
                    </label>
                    <input
                      type="text"
                      value={newCard.cardHolder}
                      onChange={(e) => setNewCard({...newCard, cardHolder: e.target.value})}
                      className="w-full p-3 glass-dark text-white rounded-lg border border-gray-600 focus:border-[#ffd875] focus:outline-none transition-colors"
                      placeholder="NGUYEN VAN A"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-light mb-2">
                      Ngày hết hạn
                    </label>
                    <input
                      type="text"
                      value={newCard.expiryDate}
                      onChange={(e) => setNewCard({...newCard, expiryDate: e.target.value})}
                      className="w-full p-3 glass-dark text-white rounded-lg border border-gray-600 focus:border-[#ffd875] focus:outline-none transition-colors"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-light mb-2">
                      Ngân hàng
                    </label>
                    <input
                      type="text"
                      value={newCard.bankName || ''}
                      onChange={(e) => setNewCard({...newCard, bankName: e.target.value})}
                      className="w-full p-3 glass-dark text-white rounded-lg border border-gray-600 focus:border-[#ffd875] focus:outline-none transition-colors"
                      placeholder="Tên ngân hàng"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setEditingCardId(null)}
                    className="flex items-center space-x-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    <span>Hủy</span>
                  </button>
                  <button
                    onClick={() => handleUpdateCard(card.id)}
                    className="flex items-center space-x-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-400 transition-colors"
                  >
                    <CheckIcon className="w-4 h-4" />
                    <span>Lưu</span>
                  </button>
                </div>
              </div>
            ) : (
              // Card Display
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getCardTypeIcon(card.type, card.bankName)}
                    <span className="font-normal text-white">{card.bankName || 'Thẻ tín dụng'}</span>
                    {card.isDefault && (
                      <span className="text-xs bg-[#ffd875]/20 text-[#ffd875] px-2 py-0.5 rounded-full">
                        Mặc định
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEditing(card)}
                      className="p-1.5 text-gray-400 hover:text-white transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="p-1.5 text-red-400 hover:text-red-300 transition-colors"
                      disabled={card.isDefault}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400 font-light">Số thẻ:</span>
                    <p className="text-white mt-1 font-mono">{maskCardNumber(card.cardNumber)}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-light">Tên chủ thẻ:</span>
                    <p className="text-white mt-1">{card.cardHolder}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-light">Ngày hết hạn:</span>
                    <p className="text-white mt-1">{card.expiryDate}</p>
                  </div>
                </div>
                {!card.isDefault && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleSetDefault(card.id)}
                      className="text-sm text-[#ffd875] hover:text-[#ffb347] transition-colors"
                    >
                      Đặt làm mặc định
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add New Card Form */}
      {isAddingCard && (
        <div className="glass-dark rounded-xl p-5 border border-gray-700/50 mb-6">
          <h3 className="text-lg font-normal text-white mb-4">Thêm thẻ mới</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm font-light mb-2">
                  Số thẻ
                </label>
                <input
                  type="text"
                  value={newCard.cardNumber}
                  onChange={(e) => setNewCard({...newCard, cardNumber: e.target.value})}
                  className="w-full p-3 glass-dark text-white rounded-lg border border-gray-600 focus:border-[#ffd875] focus:outline-none transition-colors"
                  placeholder="1234 5678 9012 3456"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-light mb-2">
                  Tên chủ thẻ
                </label>
                <input
                  type="text"
                  value={newCard.cardHolder}
                  onChange={(e) => setNewCard({...newCard, cardHolder: e.target.value})}
                  className="w-full p-3 glass-dark text-white rounded-lg border border-gray-600 focus:border-[#ffd875] focus:outline-none transition-colors"
                  placeholder="NGUYEN VAN A"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-light mb-2">
                  Ngày hết hạn
                </label>
                <input
                  type="text"
                  value={newCard.expiryDate}
                  onChange={(e) => setNewCard({...newCard, expiryDate: e.target.value})}
                  className="w-full p-3 glass-dark text-white rounded-lg border border-gray-600 focus:border-[#ffd875] focus:outline-none transition-colors"
                  placeholder="MM/YY"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-light mb-2">
                  Ngân hàng
                </label>
                <input
                  type="text"
                  value={newCard.bankName || ''}
                  onChange={(e) => setNewCard({...newCard, bankName: e.target.value})}
                  className="w-full p-3 glass-dark text-white rounded-lg border border-gray-600 focus:border-[#ffd875] focus:outline-none transition-colors"
                  placeholder="Tên ngân hàng"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsAddingCard(false)}
                className="flex items-center space-x-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
                <span>Hủy</span>
              </button>
              <button
                onClick={handleAddCard}
                className="flex items-center space-x-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-400 transition-colors"
                disabled={!newCard.cardNumber || !newCard.cardHolder || !newCard.expiryDate}
              >
                <CheckIcon className="w-4 h-4" />
                <span>Thêm thẻ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {paymentMethods.length === 0 && !isAddingCard && (
        <div className="text-center py-12">
          <CreditCardIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-normal text-gray-400 mb-2">Chưa có phương thức thanh toán</h3>
          <p className="text-gray-500 mb-6">Thêm phương thức thanh toán để đặt vé nhanh chóng.</p>
          <button 
            onClick={() => setIsAddingCard(true)}
            className="btn-primary"
          >
            Thêm thẻ mới
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentMethods; 