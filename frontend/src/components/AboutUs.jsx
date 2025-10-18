import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './layout/Navbar';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-12">
          <div className="relative h-96">
            <img 
              src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070" 
              alt="Farm fields"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="text-center text-white p-6">
                <h1 className="text-4xl font-bold mb-4">Our Mission</h1>
                <p className="text-xl max-w-3xl">
                  Connecting farmers directly with consumers to build a sustainable, fair, and transparent food system
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Our Story */}
        <div className="mb-16">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Story</h2>
            <p className="text-gray-600 leading-relaxed">
              FarmFresh Market was born out of a simple idea - what if we could eliminate the many middlemen in the agricultural supply chain and connect farmers directly with consumers? Founded in 2020 by a group of agricultural enthusiasts and tech professionals, we set out to create a platform that would benefit both farmers and consumers while promoting sustainable agriculture.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1593179357196-acaa7052d878?q=80&w=2070" 
                alt="Farmers at work"
                className="w-full h-80 object-cover rounded-lg shadow-md mb-6"
              />
              <h3 className="text-xl font-bold mb-3">The Problem We're Solving</h3>
              <p className="text-gray-600">
                For too long, farmers have received only a small fraction of the final selling price of their produce, while consumers pay high prices for products that have passed through numerous intermediaries. This system is inefficient, leads to food waste, and disconnects people from the source of their food.
              </p>
            </div>
            
            <div>
              <img 
                src="https://images.unsplash.com/photo-1465362351212-25e40f454e6c?q=80&w=2070" 
                alt="Fresh produce"
                className="w-full h-80 object-cover rounded-lg shadow-md mb-6"
              />
              <h3 className="text-xl font-bold mb-3">Our Solution</h3>
              <p className="text-gray-600">
                FarmFresh Market creates a direct channel between farmers and consumers through our digital platform. Farmers list their products, set their own prices, and receive fair compensation for their work. Consumers get access to fresher, more affordable products while supporting local agriculture and knowing exactly where their food comes from.
              </p>
            </div>
          </div>
        </div>
        
        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="bg-green-100 w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Fair Compensation</h3>
              <p className="text-gray-600">
                We believe farmers should receive a fair price for their products. Our model ensures farmers get up to 80% of the final selling price, compared to 20-40% in traditional retail.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="bg-green-100 w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Sustainability</h3>
              <p className="text-gray-600">
                We promote environmentally sustainable farming practices and work only with farmers who share our commitment to soil health, biodiversity, and responsible resource management.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="bg-green-100 w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Transparency</h3>
              <p className="text-gray-600">
                We believe consumers have the right to know where their food comes from. Every product includes information about the farm, farming practices, and harvest date.
              </p>
            </div>
          </div>
        </div>
        
        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-4">Our Team</h2>
          <p className="text-gray-600 text-center max-w-3xl mx-auto mb-12">
            We're a diverse team of agricultural experts, technologists, and business professionals united by our passion for sustainable food systems.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-40 h-40 rounded-full overflow-hidden mx-auto mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1949" 
                  alt="Vikram Mehta"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold">Vikram Mehta</h3>
              <p className="text-gray-600">Founder & CEO</p>
            </div>
            
            <div className="text-center">
              <div className="w-40 h-40 rounded-full overflow-hidden mx-auto mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976" 
                  alt="Priya Singh"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold">Priya Singh</h3>
              <p className="text-gray-600">Agricultural Director</p>
            </div>
            
            <div className="text-center">
              <div className="w-40 h-40 rounded-full overflow-hidden mx-auto mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1974" 
                  alt="Rahul Sharma"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold">Rahul Sharma</h3>
              <p className="text-gray-600">Technology Head</p>
            </div>
            
            <div className="text-center">
              <div className="w-40 h-40 rounded-full overflow-hidden mx-auto mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961" 
                  alt="Neha Patel"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold">Neha Patel</h3>
              <p className="text-gray-600">Operations Manager</p>
            </div>
          </div>
        </div>
        
        {/* Impact Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Our Impact</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
              <p className="text-gray-600">Farmers Supported</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">50,000+</div>
              <p className="text-gray-600">Happy Customers</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">30%</div>
              <p className="text-gray-600">Average Savings for Consumers</p>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                <h3 className="text-2xl font-bold mb-4">Join Our Mission</h3>
                <p className="text-gray-600 mb-6">
                  Whether you're a farmer looking to expand your reach, a consumer who wants access to fresher produce, or someone passionate about sustainable food systems, we invite you to join our growing community.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/contact" className="bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700">
                    Partner With Us
                  </Link>
                  <Link to="/register" className="border border-green-600 text-green-600 px-6 py-3 rounded-md font-medium hover:bg-green-50">
                    Sign Up Now
                  </Link>
                </div>
              </div>
              <div className="md:w-1/2">
                <img 
                  src="https://images.unsplash.com/photo-1589923158776-cb4485d99fd6?q=80&w=2070" 
                  alt="Community farming"
                  className="w-full rounded-lg shadow-md"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Testimonials */}
        <div>
          <h2 className="text-3xl font-bold text-center mb-12">What People Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974" 
                    alt="Ramesh Patel"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold">Ramesh Patel</h3>
                  <p className="text-sm text-gray-600">Tomato Farmer, Gujarat</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Before joining FarmFresh Market, I struggled to get fair prices for my tomatoes. Now I earn nearly double and have direct relationships with my customers who appreciate the quality of my produce."
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <img 
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1976" 
                    alt="Anita Desai"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold">Anita Desai</h3>
                  <p className="text-sm text-gray-600">Customer, Mumbai</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "The quality of produce from FarmFresh Market is exceptional. I love knowing exactly which farm my food comes from, and the prices are actually lower than what I used to pay at premium supermarkets."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs; 