/**
 * Formats a number to Indian Rupee format
 * Indian numbering system: 1,00,000 = 1 lakh, 1,00,00,000 = 1 crore
 * @param {number} amount - The amount to format
 * @param {boolean} includeSymbol - Whether to include the ₹ symbol
 * @return {string} The formatted amount
 */
export const formatIndianRupee = (amount, includeSymbol = true) => {
    if (amount === undefined || amount === null) return includeSymbol ? '₹0' : '0';
    
    // Convert to string and remove any existing commas
    const numStr = String(amount).replace(/,/g, '');
    
    // Handle non-numbers
    if (isNaN(Number(numStr))) return includeSymbol ? '₹0' : '0';
    
    // Parse the string to a number
    const num = parseFloat(numStr);
    
    // Format according to Indian numbering system
    let result = '';
    const str = Math.floor(Math.abs(num)).toString();
    
    // Handle the case where the number is less than 1000
    if (str.length <= 3) {
      result = str;
    } else {
      // Add commas for thousands and above
      let firstPart = str.substring(0, str.length - 3);
      const lastPart = str.substring(str.length - 3);
      
      // Add commas after every 2 digits from the right in the first part
      if (firstPart.length > 2) {
        const firstPartRev = firstPart.split('').reverse().join('');
        let formattedFirstPartRev = '';
        
        for (let i = 0; i < firstPartRev.length; i++) {
          formattedFirstPartRev += firstPartRev[i];
          if ((i + 1) % 2 === 0 && i !== firstPartRev.length - 1) {
            formattedFirstPartRev += ',';
          }
        }
        
        firstPart = formattedFirstPartRev.split('').reverse().join('');
      }
      
      result = firstPart + ',' + lastPart;
    }
    
    // Add negative sign if needed
    if (num < 0) {
      result = '-' + result;
    }
    
    // Add decimal part if it exists
    const decimalPart = (Math.abs(num) % 1).toFixed(2).substring(2);
    if (decimalPart !== '00') {
      result += '.' + decimalPart;
    }
    
    return includeSymbol ? `₹${result}` : result;
  };