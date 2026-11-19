interface Highlight {
  label: string
  value: string
  icon: string
}

const highlights: Highlight[] = [
  {
    label: "Years Experience",
    value: "5+",
    icon: "⏳"
  },
  {
    label: "Projects Completed",
    value: "50+",
    icon: "🎯"
  },
  {
    label: "Happy Clients",
    value: "30+",
    icon: "🤝"
  },
  {
    label: "Technologies",
    value: "15+",
    icon: "💻"
  }
]

const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            About Me
          </h2>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Profile Image */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* Background glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              
              {/* Image container */}
              <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-gray-800 shadow-2xl">
                <img
                  src="/profile.png"
                  alt="Rahib RK"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Right column - Bio and Highlights */}
          <div className="space-y-8">
            {/* Bio */}
            <div className="space-y-6">
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                Hi there! I'm Rahib RK, a passionate AI and Automation Developer with expertise in Python, React, and modern web technologies. I specialize in creating intelligent solutions that help businesses automate their processes and enhance user experiences.
              </p>
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                With a strong foundation in both frontend and backend development, I bring ideas to life through clean code and intuitive design. I'm constantly learning and adapting to new technologies to deliver cutting-edge solutions.
              </p>
            </div>

            {/* Highlights Grid */}
            <div className="grid grid-cols-2 gap-6">
              {highlights.map((highlight, index) => (
                <div
                  key={index}
                  className="p-6 bg-gray-800/50 rounded-xl backdrop-blur-sm
                           transform transition-all duration-300 hover:scale-105"
                >
                  <span className="text-3xl mb-4" role="img" aria-label={highlight.label}>
                    {highlight.icon}
                  </span>
                  <div className="mt-2">
                    <h3 className="text-3xl font-bold text-white mb-1">
                      {highlight.value}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {highlight.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
          <div className="absolute w-96 h-96 bg-blue-500/5 rounded-full filter blur-3xl"></div>
          <div className="absolute w-96 h-96 bg-indigo-500/5 rounded-full filter blur-3xl -translate-x-1/2"></div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection
