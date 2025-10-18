import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './layout/Navbar';

const blogPosts = [
  {
    id: 1,
    title: 'Sustainable Farming Practices for Small Farmers',
    excerpt: 'Learn how small-scale farmers can implement sustainable practices that benefit both the environment and their crops.',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070',
    author: 'Ravi Kumar',
    authorImage: 'https://images.unsplash.com/photo-1553787499-6f9133860278?w=500',
    date: 'May 15, 2023',
    category: 'Sustainable Farming',
    readTime: '8 min read'
  },
  {
    id: 2,
    title: 'Organic Pest Management Techniques',
    excerpt: 'Discover natural ways to keep pests away from your crops without using harmful chemicals.',
    image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?q=80&w=2070',
    author: 'Priya Singh',
    authorImage: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500',
    date: 'April 22, 2023',
    category: 'Organic Farming',
    readTime: '5 min read'
  },
  {
    id: 3,
    title: 'Seasonal Guide to Growing Vegetables in India',
    excerpt: 'A comprehensive guide to what vegetables to grow during different seasons across various regions in India.',
    image: 'https://images.unsplash.com/photo-1602513292862-42fb40db775b?q=80&w=2076',
    author: 'Ajay Patel',
    authorImage: 'https://images.unsplash.com/photo-1610275280978-51f3f5324c83?w=500',
    date: 'March 10, 2023',
    category: 'Crop Planning',
    readTime: '10 min read'
  },
  {
    id: 4,
    title: 'Water Conservation Methods for Drought-Prone Areas',
    excerpt: 'Innovative techniques to conserve water and maintain crop yield during dry seasons.',
    image: 'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?q=80&w=2070',
    author: 'Kavita Sharma',
    authorImage: 'https://images.unsplash.com/photo-1594547915764-b92fc34c8ad7?w=500',
    date: 'February 28, 2023',
    category: 'Water Management',
    readTime: '7 min read'
  },
  {
    id: 5,
    title: 'Benefits of Direct Farmer-to-Consumer Models',
    excerpt: 'How eliminating middlemen can benefit both farmers and consumers in the agricultural supply chain.',
    image: 'https://images.unsplash.com/photo-1493815793585-d94ccbc86df8?q=80&w=2069',
    author: 'Rahul Verma',
    authorImage: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=500',
    date: 'January 15, 2023',
    category: 'Farm Business',
    readTime: '6 min read'
  },
  {
    id: 6,
    title: 'Traditional Farming Knowledge in Modern Agriculture',
    excerpt: 'How ancient farming wisdom can be integrated with modern techniques for better results.',
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=2070',
    author: 'Anita Desai',
    authorImage: 'https://images.unsplash.com/photo-1589642084211-11f899e5378b?w=500',
    date: 'December 5, 2022',
    category: 'Traditional Farming',
    readTime: '9 min read'
  }
];

const categories = [
  { name: 'Sustainable Farming', count: 12 },
  { name: 'Organic Farming', count: 8 },
  { name: 'Crop Planning', count: 15 },
  { name: 'Water Management', count: 7 },
  { name: 'Farm Business', count: 10 },
  { name: 'Traditional Farming', count: 6 },
  { name: 'Technology', count: 9 }
];

const featuredFarmers = [
  {
    name: 'Ravi Kumar',
    location: 'Nashik, Maharashtra',
    expertise: 'Organic Vegetables',
    image: 'https://images.unsplash.com/photo-1553787499-6f9133860278?w=500'
  },
  {
    name: 'Priya Singh',
    location: 'Shimla, Himachal Pradesh',
    expertise: 'Fruits Specialist',
    image: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500'
  },
  {
    name: 'Ajay Patel',
    location: 'Anand, Gujarat',
    expertise: 'Dairy Farming',
    image: 'https://images.unsplash.com/photo-1610275280978-51f3f5324c83?w=500'
  }
];

const Blog = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-green-700 rounded-xl overflow-hidden mb-12">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 p-8 text-white flex flex-col justify-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Farming Knowledge Hub
              </h1>
              <p className="text-green-100 text-lg mb-6">
                Discover sustainable farming practices, tips, and success stories from farmers across India
              </p>
              <div className="flex space-x-4">
                <button className="bg-white text-green-700 px-6 py-2 rounded-md font-medium">
                  Browse Articles
                </button>
                <button className="border border-white text-white px-6 py-2 rounded-md font-medium">
                  Share Your Story
                </button>
              </div>
            </div>
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070"
                alt="Farming Blog"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3">
            <h2 className="text-2xl font-bold mb-6">Latest Articles</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {blogPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <img 
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex items-center mb-3">
                      <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                        {post.category}
                      </span>
                      <span className="mx-2 text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{post.readTime}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                    <p className="text-gray-600 mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <img 
                          src={post.authorImage}
                          alt={post.author}
                          className="w-8 h-8 rounded-full object-cover mr-2"
                        />
                        <div>
                          <p className="text-sm font-medium">{post.author}</p>
                          <p className="text-xs text-gray-500">{post.date}</p>
                        </div>
                      </div>
                      <Link to={`/blog/${post.id}`} className="text-green-600 text-sm font-medium hover:underline">
                        Read more
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center">
              <button className="bg-white border border-green-600 text-green-600 px-6 py-2 rounded-md font-medium hover:bg-green-50">
                Load More Articles
              </button>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:w-1/3">
            {/* Search Box */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Search Articles</h3>
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Search for topics..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                />
                <button className="absolute right-3 top-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Categories */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.name} className="flex justify-between items-center py-1 border-b border-gray-100">
                    <Link to={`/blog/category/${category.name.toLowerCase().replace(' ', '-')}`} className="text-gray-700 hover:text-green-600">
                      {category.name}
                    </Link>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {category.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Featured Farmers */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Featured Farmers</h3>
              <div className="space-y-4">
                {featuredFarmers.map((farmer) => (
                  <div key={farmer.name} className="flex items-center">
                    <img 
                      src={farmer.image}
                      alt={farmer.name}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <p className="font-medium">{farmer.name}</p>
                      <p className="text-sm text-gray-600">{farmer.expertise}</p>
                      <p className="text-xs text-gray-500">{farmer.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Newsletter */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold mb-3">Subscribe to Newsletter</h3>
              <p className="text-gray-600 text-sm mb-4">
                Get the latest farming tips and news delivered to your inbox
              </p>
              <div className="space-y-2">
                <input 
                  type="email"
                  placeholder="Your email address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                />
                <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog; 