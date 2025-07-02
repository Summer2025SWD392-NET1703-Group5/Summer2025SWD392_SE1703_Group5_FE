// src/utils/validation.ts

/**
 * Validation utilities for form inputs
 */

// Email validation
export const validateEmail = (email: string): { isValid: boolean; message: string } => {
    if (!email) {
      return { isValid: false, message: 'Email là bắt buộc' };
    }
  
    if (email.length < 5) {
      return { isValid: false, message: 'Email quá ngắn' };
    }
  
    if (email.length > 254) {
      return { isValid: false, message: 'Email quá dài' };
    }
  
    // RFC 5322 compliant email regex (simplified)
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Định dạng email không hợp lệ' };
    }
  
    return { isValid: true, message: '' };
  };
  
  // Password validation
  export const validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (!password) {
      return { isValid: false, message: 'Mật khẩu là bắt buộc' };
    }
  
    if (password.length < 8) {
      return { isValid: false, message: 'Mật khẩu phải có ít nhất 8 ký tự' };
    }
  
    if (password.length > 128) {
      return { isValid: false, message: 'Mật khẩu không được quá 128 ký tự' };
    }
  
    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      return { isValid: false, message: 'Mật khẩu phải chứa ít nhất 1 chữ thường' };
    }
  
    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa' };
    }
  
    // Check for at least one number
    if (!/\d/.test(password)) {
      return { isValid: false, message: 'Mật khẩu phải chứa ít nhất 1 số' };
    }
  
    // Check for at least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return { isValid: false, message: 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt' };
    }
  
    return { isValid: true, message: '' };
  };
  
  // Confirm password validation
  export const validateConfirmPassword = (password: string, confirmPassword: string): { isValid: boolean; message: string } => {
    if (!confirmPassword) {
      return { isValid: false, message: 'Xác nhận mật khẩu là bắt buộc' };
    }
  
    if (password !== confirmPassword) {
      return { isValid: false, message: 'Mật khẩu xác nhận không khớp' };
    }
  
    return { isValid: true, message: '' };
  };
  
  // Name validation
  export const validateName = (name: string): { isValid: boolean; message: string } => {
    if (!name) {
      return { isValid: false, message: 'Họ tên là bắt buộc' };
    }
  
    if (name.trim().length < 2) {
      return { isValid: false, message: 'Họ tên phải có ít nhất 2 ký tự' };
    }
  
    if (name.length > 50) {
      return { isValid: false, message: 'Họ tên không được quá 50 ký tự' };
    }
  
    // Check for valid name characters (letters, spaces, Vietnamese characters)
    const nameRegex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ\s]+$/;
    
    if (!nameRegex.test(name)) {
      return { isValid: false, message: 'Họ tên chỉ được chứa chữ cái và khoảng trắng' };
    }
  
    return { isValid: true, message: '' };
  };
  
  // Phone number validation (Vietnamese format)
  export const validatePhone = (phone: string): { isValid: boolean; message: string } => {
    if (!phone) {
      return { isValid: false, message: 'Số điện thoại là bắt buộc' };
    }
  
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
  
    // Vietnamese phone number formats
    // Mobile: 09x, 08x, 07x, 05x, 03x (10 digits)
    // Landline: 02x (10-11 digits)
    const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$|^(02)[0-9]{8,9}$/;
  
    if (!phoneRegex.test(cleanPhone)) {
      return { isValid: false, message: 'Số điện thoại không hợp lệ' };
    }
  
    return { isValid: true, message: '' };
  };
  
  // Date validation (for date of birth)
  export const validateDateOfBirth = (date: string): { isValid: boolean; message: string } => {
    if (!date) {
      return { isValid: false, message: 'Ngày sinh là bắt buộc' };
    }
  
    const birthDate = new Date(date);
    const today = new Date();
    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 100); // 100 years ago
    const maxDate = new Date();
    maxDate.setFullYear(today.getFullYear() - 13); // Must be at least 13 years old
  
    if (isNaN(birthDate.getTime())) {
      return { isValid: false, message: 'Ngày sinh không hợp lệ' };
    }
  
    if (birthDate < minDate) {
      return { isValid: false, message: 'Ngày sinh không được quá 100 năm' };
    }
  
    if (birthDate > maxDate) {
      return { isValid: false, message: 'Bạn phải ít nhất 13 tuổi' };
    }
  
    return { isValid: true, message: '' };
  };
  
  // Generic required field validation
  export const validateRequired = (value: string, fieldName: string): { isValid: boolean; message: string } => {
    if (!value || value.trim().length === 0) {
      return { isValid: false, message: `${fieldName} là bắt buộc` };
    }
  
    return { isValid: true, message: '' };
  };
  
  // Credit card number validation (basic Luhn algorithm)
  export const validateCreditCard = (cardNumber: string): { isValid: boolean; message: string } => {
    if (!cardNumber) {
      return { isValid: false, message: 'Số thẻ là bắt buộc' };
    }
  
    // Remove all non-digit characters
    const cleanNumber = cardNumber.replace(/\D/g, '');
  
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      return { isValid: false, message: 'Số thẻ phải có từ 13-19 chữ số' };
    }
  
    // Luhn algorithm
    let sum = 0;
    let isEven = false;
  
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber.charAt(i), 10);
  
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
  
      sum += digit;
      isEven = !isEven;
    }
  
    if (sum % 10 !== 0) {
      return { isValid: false, message: 'Số thẻ không hợp lệ' };
    }
  
    return { isValid: true, message: '' };
  };
  
  // CVV validation
  export const validateCVV = (cvv: string): { isValid: boolean; message: string } => {
    if (!cvv) {
      return { isValid: false, message: 'Mã CVV là bắt buộc' };
    }
  
    const cleanCVV = cvv.replace(/\D/g, '');
  
    if (cleanCVV.length < 3 || cleanCVV.length > 4) {
      return { isValid: false, message: 'Mã CVV phải có 3-4 chữ số' };
    }
  
    return { isValid: true, message: '' };
  };
  
  // Expiry date validation (MM/YY format)
  export const validateExpiryDate = (expiryDate: string): { isValid: boolean; message: string } => {
    if (!expiryDate) {
      return { isValid: false, message: 'Ngày hết hạn là bắt buộc' };
    }
  
    const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    
    if (!expiryRegex.test(expiryDate)) {
      return { isValid: false, message: 'Định dạng ngày hết hạn không hợp lệ (MM/YY)' };
    }
  
    const [month, year] = expiryDate.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
    const currentMonth = currentDate.getMonth() + 1;
  
    const expMonth = parseInt(month, 10);
    const expYear = parseInt(year, 10);
  
    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      return { isValid: false, message: 'Thẻ đã hết hạn' };
    }
  
    return { isValid: true, message: '' };
  };
  
  // URL validation
  export const validateURL = (url: string): { isValid: boolean; message: string } => {
    if (!url) {
      return { isValid: true, message: '' }; // URL is optional in most cases
    }
  
    try {
      new URL(url);
      return { isValid: true, message: '' };
    } catch {
      return { isValid: false, message: 'URL không hợp lệ' };
    }
  };
  
  // Postal code validation (Vietnamese format)
  export const validatePostalCode = (postalCode: string): { isValid: boolean; message: string } => {
    if (!postalCode) {
      return { isValid: false, message: 'Mã bưu điện là bắt buộc' };
    }
  
    // Vietnamese postal code format: 6 digits
    const postalRegex = /^[0-9]{6}$/;
  
    if (!postalRegex.test(postalCode)) {
      return { isValid: false, message: 'Mã bưu điện phải có 6 chữ số' };
    }
  
    return { isValid: true, message: '' };
  };
  
  // Password strength checker
  export const getPasswordStrength = (password: string): {
    score: number;
    level: 'weak' | 'fair' | 'good' | 'strong';
    suggestions: string[];
  } => {
    let score = 0;
    const suggestions: string[] = [];
  
    if (password.length >= 8) score += 1;
    else suggestions.push('Sử dụng ít nhất 8 ký tự');
  
    if (/[a-z]/.test(password)) score += 1;
    else suggestions.push('Thêm chữ thường');
  
    if (/[A-Z]/.test(password)) score += 1;
    else suggestions.push('Thêm chữ hoa');
  
    if (/\d/.test(password)) score += 1;
    else suggestions.push('Thêm số');
  
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
    else suggestions.push('Thêm ký tự đặc biệt');
  
    if (password.length >= 12) score += 1;
  
    let level: 'weak' | 'fair' | 'good' | 'strong';
    if (score <= 2) level = 'weak';
    else if (score <= 3) level = 'fair';
    else if (score <= 4) level = 'good';
    else level = 'strong';
  
    return { score, level, suggestions };
  };
  
  // Form validation helper
  export const validateForm = (
    fields: Record<string, any>,
    rules: Record<string, (value: any) => { isValid: boolean; message: string }>
  ): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    let isValid = true;
  
    for (const [fieldName, value] of Object.entries(fields)) {
      if (rules[fieldName]) {
        const validation = rules[fieldName](value);
        if (!validation.isValid) {
          errors[fieldName] = validation.message;
          isValid = false;
        }
      }
    }
  
    return { isValid, errors };
  };
  
  // Sanitize input (basic XSS prevention)
  export const sanitizeInput = (input: string): string => {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  };
  
  // Format phone number for display
  export const formatPhoneNumber = (phone: string): string => {
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length === 10) {
      return cleanPhone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
    }
    
    return phone;
  };
  
  // Format credit card number for display
  export const formatCreditCardNumber = (cardNumber: string): string => {
    const cleanNumber = cardNumber.replace(/\D/g, '');
    return cleanNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
  };
  
  export default {
    validateEmail,
    validatePassword,
    validateConfirmPassword,
    validateName,
    validatePhone,
    validateDateOfBirth,
    validateRequired,
    validateCreditCard,
    validateCVV,
    validateExpiryDate,
    validateURL,
    validatePostalCode,
    getPasswordStrength,
    validateForm,
    sanitizeInput,
    formatPhoneNumber,
    formatCreditCardNumber,
  };
  