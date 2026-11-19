const HeroSection = () => {
  const scrollToContact = () => {
    const contactSection = document.getElementById('contact')
    contactSection?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="space-y-12">
          {/* Profile Image */}
          <div className="relative mx-auto w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 animate-pulse blur-xl opacity-30"></div>
            <img
              src="/profile.png"
              alt="Rahib RK"
              className="relative rounded-full w-full h-full object-cover shadow-2xl"
            />
          </div>

          {/* Text Content */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                RAHIB RK
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
              AI & Automation Developer | Python, Bots, Full-Stack
            </p>

            {/* CTA Button */}
            <div className="pt-6">
              <button
                onClick={scrollToContact}
                className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg
                         shadow-lg transition-all duration-300 ease-in-out
                         hover:bg-blue-700 hover:shadow-xl hover:-translate-y-1
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Contact Me
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-blue-50 to-transparent opacity-30 transform rotate-12"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-indigo-50 to-transparent opacity-30 transform -rotate-12"></div>
      </div>
    </section>
  )
}

export default HeroSection
