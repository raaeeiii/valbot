import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, User, Mail, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react'

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

const ContactSection = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [focused, setFocused] = useState<string | null>(null);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission with FormSubmit (free email service)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setStatus('loading');

    try {
      // Using FormSubmit.co as free email service
      const response = await fetch('https://formsubmit.co/ajax/contact@valbit.in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          _subject: `New message from ${formData.name}`,
          _template: 'table'
        }),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
        setErrors({});
        
        // Reset status after 3 seconds
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        throw new Error('Failed to send message');
      }
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const inputClasses = (name: string) => `
    w-full bg-gray-800/50 border-2 ${
      errors[name as keyof FormErrors] 
        ? 'border-red-500' 
        : focused === name 
        ? 'border-blue-500' 
        : 'border-gray-700'
    } rounded-lg px-4 py-3 text-gray-200 placeholder-gray-500 
    focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300
  `;

  return (
    <section id="contact" className="py-20 bg-gray-900 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto relative z-10"
        >
          {/* Section Header */}
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold text-white mb-4"
            >
              Get In Touch
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-gray-400 text-lg max-w-2xl mx-auto"
            >
              Have a project in mind? Let's work together to bring your ideas to life.
            </motion.p>
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="max-w-2xl mx-auto"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="flex items-center gap-2 text-gray-400 text-sm font-medium mb-2">
                  <User className="w-4 h-4" />
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused(null)}
                  className={inputClasses('name')}
                  placeholder="Your full name"
                  required
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="flex items-center gap-2 text-gray-400 text-sm font-medium mb-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  className={inputClasses('email')}
                  placeholder="your.email@example.com"
                  required
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="flex items-center gap-2 text-gray-400 text-sm font-medium mb-2">
                  <MessageSquare className="w-4 h-4" />
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  onFocus={() => setFocused('message')}
                  onBlur={() => setFocused(null)}
                  rows={5}
                  className={inputClasses('message')}
                  placeholder="Tell me about your project..."
                  required
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className={`
                    w-full flex items-center justify-center gap-3 px-8 py-4 rounded-lg font-semibold
                    text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/50
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
                    ${status === 'loading' ? 'animate-pulse' : ''}
                  `}
                >
                  {status === 'loading' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>
              </div>

              {/* Status Messages */}
              {status === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-green-900/50 border border-green-500/50 text-green-400 flex items-center gap-3"
                >
                  <CheckCircle className="w-5 h-5" />
                  <div>
                    <p className="font-semibold">Message sent successfully!</p>
                    <p className="text-sm">I'll get back to you as soon as possible.</p>
                  </div>
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-red-900/50 border border-red-500/50 text-red-400 flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5" />
                  <div>
                    <p className="font-semibold">Failed to send message</p>
                    <p className="text-sm">Please try again or contact me directly.</p>
                  </div>
                </motion.div>
              )}
            </form>
          </motion.div>

          {/* Background Elements */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-10">
            <div className="w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          </div>
          <div className="absolute top-1/4 right-1/4 transform -translate-x-1/2 -translate-y-1/2 -z-10">
            <div className="w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
