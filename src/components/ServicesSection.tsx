import { motion } from 'framer-motion'
import {
  WindowIcon,
  RocketLaunchIcon,
  PaintBrushIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline'

interface Service {
  title: string
  description: string
  Icon: React.ElementType
  gradient: string
}

const services: Service[] = [
  {
    title: "Web Development",
    description: "Building modern, responsive websites and web applications using React, Next.js, and other cutting-edge technologies.",
    Icon: WindowIcon,
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    title: "AI Development",
    description: "Creating intelligent solutions and automation systems powered by machine learning and artificial intelligence.",
    Icon: CpuChipIcon,
    gradient: "from-indigo-500 to-purple-500"
  },
  {
    title: "Bot Building",
    description: "Developing smart chatbots and automation tools that streamline processes and enhance user interactions.",
    Icon: RocketLaunchIcon,
    gradient: "from-purple-500 to-pink-500"
  },
  {
    title: "Frontend Design",
    description: "Crafting beautiful, intuitive user interfaces with modern design principles and smooth animations.",
    Icon: PaintBrushIcon,
    gradient: "from-pink-500 to-rose-500"
  }
]

const ServiceCard = ({ title, description, Icon, gradient, index }: Service & { index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{
      duration: 0.5,
      delay: index * 0.2,
      ease: [0.43, 0.13, 0.23, 0.96]
    }}
    viewport={{ once: true }}
    className="group relative p-8 rounded-2xl transition-all duration-300
               hover:scale-[1.02] cursor-pointer"
  >
    {/* Glass Background */}
    <div className="absolute inset-0 rounded-2xl bg-gray-800/50 backdrop-blur-xl
                    group-hover:bg-gray-800/70 transition-colors duration-300
                    border border-gray-700/50"></div>

    {/* Content */}
    <div className="relative space-y-6">
      {/* Icon */}
      <div className={`w-14 h-14 rounded-xl p-3.5 bg-gradient-to-br ${gradient}
                      transform transition-transform duration-300
                      group-hover:scale-110 group-hover:rotate-6`}>
        <Icon className="w-full h-full text-white" />
      </div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-white group-hover:text-transparent
                     group-hover:bg-clip-text group-hover:bg-gradient-to-r
                     group-hover:from-white group-hover:to-gray-400
                     transition-colors duration-300">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-400 text-base leading-relaxed">
        {description}
      </p>

      {/* Learn More Link */}
      <div className="flex items-center text-gray-300 group-hover:text-white transition-colors">
        <span className="text-sm font-semibold">Learn More</span>
        <svg
          className="w-4 h-4 ml-2 transform transition-transform duration-300
                   group-hover:translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </div>
  </motion.div>
)

const ServicesSection = () => {
  return (
    <section id="services" className="py-20 bg-gray-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            What I Offer
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-6"></div>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Specialized services tailored to bring your ideas to life with modern technology
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} index={index} />
          ))}
        </div>
      </div>

      {/* Decorative background blur */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full filter blur-3xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-pink-500/20 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </div>
    </section>
  )
}

export default ServicesSection
