import productData from './productData.json';

const companyInfo = {
name: "Techligence",
founded: 2020,
mission: "To advance the future of automation and artificial intelligence.",
contact: "contact@airobotics.com",
};

export const processQuery = async (query) => {
const lowerCaseQuery = query.toLowerCase();

// Greeting
if (lowerCaseQuery.includes('hello') || lowerCaseQuery.includes('hi')) {
return "Hello! How can I assist you today with your questions about AI, Robotics, or our products?";
}

// Company Information
if (lowerCaseQuery.includes('company') && lowerCaseQuery.includes('name')) {
return `Our company is called ${companyInfo.name}.`;
}

if (lowerCaseQuery.includes('mission') || lowerCaseQuery.includes('about')) {
return companyInfo.mission;
}

if (lowerCaseQuery.includes('contact') || lowerCaseQuery.includes('email')) {
return `You can contact us at: ${companyInfo.contact}.`;
}

// Product Information
if (lowerCaseQuery.includes('products') || lowerCaseQuery.includes('list')) {
const productNames = productData.products.map(p => p.name).join(', ');
return `We offer the following products: ${productNames}. Which one would you like to know more about?`;
}

const foundProduct = productData.products.find(p => lowerCaseQuery.includes(p.name.toLowerCase()));

if (foundProduct) {
if (lowerCaseQuery.includes('price')) {
    return `The price of the ${foundProduct.name} is $${foundProduct.price}.`;
}
if (lowerCaseQuery.includes('description')) {
    return foundProduct.description;
}
return `The ${foundProduct.name} is one of our flagship products. It features: ${foundProduct.features.join(', ')}. What else would you like to know?`;
}

// Fallback response
return "I'm sorry, I don't have information on that. Could you please ask about our products, company, or general AI and robotics topics?";
};