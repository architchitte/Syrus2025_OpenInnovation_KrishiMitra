import React, { useState } from 'react';
import Navbar from './layout/Navbar';

const faqItems = [
  {
    question: 'How do I place an order?',
    answer: 'You can place an order by browsing our products, adding items to your cart, and proceeding to checkout. You can also place orders directly through WhatsApp for a faster experience.'
  },
  {
    question: 'What are the delivery charges?',
    answer: 'Delivery is free for orders above ₹500. For orders below ₹500, a delivery fee of ₹40 is applied.'
  },
  {
    question: 'How long will it take to receive my order?',
    answer: 'Most orders are delivered within 24-48 hours depending on your location. We prioritize freshness, so we harvest many items only after you place an order.'
  },
  {
    question: 'Can I track my order?',
    answer: 'Yes, once your order is confirmed, you will receive an order tracking link via SMS and email. You can also track your order from the "Orders" section in your account.'
  },
  {
    question: 'What if I receive damaged products?',
    answer: 'We have a strict quality control process, but if you receive any damaged or spoiled products, please contact our support team within 24 hours with photos, and we will arrange for a replacement or refund.'
  },
  {
    question: 'How do I cancel my order?',
    answer: 'You can cancel your order within 2 hours of placing it through your account or by contacting our customer support. After this window, the order may already be in preparation for dispatch.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit/debit cards, UPI payments, net banking, and cash on delivery. For WhatsApp orders, we also offer direct bank transfers.'
  },
  {
    question: 'Are all products organic?',
    answer: 'We offer both organic and conventionally grown products. All organic products are clearly labeled with an "Organic" tag. We ensure that even our conventional products are grown with minimal chemical inputs.'
  }
];

const Support = () => {
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const toggleQuestion = (index) => {
    setActiveQuestion(activeQuestion === index ? null : index);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, this would send the form data to a server
    alert('Thank you for your message. Our support team will get back to you shortly.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-12 text-center">
          <h1 className="text-3xl font-bold mb-4">How Can We Help You?</h1>
          <p className="text-gray-600 max-w-3xl mx-auto mb-6">
            Our team is dedicated to providing the best support for all your farming-related needs. Browse our resources or get in touch with us directly.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#faq" className="bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700">
              Browse FAQs
            </a>
            <a href="#contact" className="border border-green-600 text-green-600 px-6 py-3 rounded-md font-medium hover:bg-green-50">
              Contact Support
            </a>
            <a href="tel:+919876543210" className="flex items-center border border-gray-300 px-6 py-3 rounded-md font-medium hover:bg-gray-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              +91 98765 43210
            </a>
          </div>
        </div>
        
        {/* Support Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Email Support</h3>
            <p className="text-gray-600 mb-4">
              For all general inquiries and non-urgent issues
            </p>
            <a href="mailto:support@farmfresh.com" className="text-green-600 font-medium hover:underline">
              support@farmfresh.com
            </a>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">WhatsApp Support</h3>
            <p className="text-gray-600 mb-4">
              For quick responses and order-related queries
            </p>
            <a href="https://wa.me/919876543210" className="text-green-600 font-medium hover:underline">
              +91 98765 43210
            </a>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Phone Support</h3>
            <p className="text-gray-600 mb-4">
              Available 9 AM to 8 PM, seven days a week
            </p>
            <a href="tel:+919876543210" className="text-green-600 font-medium hover:underline">
              +91 98765 43210
            </a>
          </div>
        </div>
        
        {/* FAQ Section */}
        <div id="faq" className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {faqItems.map((item, index) => (
              <div key={index} className="border-b border-gray-100 last:border-0">
                <button 
                  onClick={() => toggleQuestion(index)}
                  className="w-full text-left px-6 py-4 focus:outline-none flex justify-between items-center"
                >
                  <span className="font-medium">{item.question}</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-5 w-5 transform transition-transform ${activeQuestion === index ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div 
                  className={`px-6 pb-4 transition-all duration-200 ease-in-out ${
                    activeQuestion === index ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden'
                  }`}
                >
                  <p className="text-gray-600">{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Contact Form */}
        <div id="contact" className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input 
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input 
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <select 
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  required
                >
                  <option value="">Select a subject</option>
                  <option value="Order Issue">Order Issue</option>
                  <option value="Payment Issue">Payment Issue</option>
                  <option value="Delivery Issue">Delivery Issue</option>
                  <option value="Product Quality">Product Quality</option>
                  <option value="Returns/Refunds">Returns/Refunds</option>
                  <option value="Account Issues">Account Issues</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Message
              </label>
              <textarea 
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows="5"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                required
              ></textarea>
            </div>
            <button 
              type="submit"
              className="bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700"
            >
              Submit Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Support; 