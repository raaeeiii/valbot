import React, { useState } from 'react';
import { Send, User, Mail, MessageSquare } from 'lucide-react';
import emailjs from '@emailjs/browser';

interface FormData {
  name: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setStatus('sending');

    try {
      // Replace with your EmailJS service ID, template ID, and public key
      await emailjs.send(
        'YOUR_SERVICE_ID',
        'YOUR_TEMPLATE_ID',
        {
          from_name: formData.name,
          from_email: formData.email,
          message: formData.message,
        },
        'YOUR_PUBLIC_KEY'
      );

      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => setStatus('idle'), 5000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <User size={20} />
          <span>Name</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-4 py-2 rounded-lg border ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700`}
          placeholder="Your name"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <Mail size={20} />
          <span>Email</span>
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-4 py-2 rounded-lg border ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700`}
          placeholder="your.email@example.com"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <MessageSquare size={20} />
          <span>Message</span>
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={5}
          className={`w-full px-4 py-2 rounded-lg border ${
            errors.message ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700`}
          placeholder="Your message..."
        />
        {errors.message && <p className="text-red-500 text-sm">{errors.message}</p>}
      </div>

      <button
        type="submit"
        disabled={status === 'sending'}
        className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg
                   bg-blue-600 hover:bg-blue-700 text-white font-medium
                   transition-colors duration-200 
                   disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <Send size={20} />
        {status === 'sending' ? 'Sending...' : 'Send Message'}
      </button>

      {/* Status Messages */}
      {status === 'success' && (
        <div className="p-4 rounded-lg bg-green-100 text-green-700 dark:bg-green-800/30 dark:text-green-400">
          Message sent successfully! I'll get back to you soon.
        </div>
      )}
      
      {status === 'error' && (
        <div className="p-4 rounded-lg bg-red-100 text-red-700 dark:bg-red-800/30 dark:text-red-400">
          Failed to send message. Please try again later.
        </div>
      )}
    </form>
  );
};

export default ContactForm;
