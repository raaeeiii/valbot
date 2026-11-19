import { motion } from 'framer-motion'

interface Project {
  title: string
  description: string
  image: string
  techStack: {
    name: string
    color: string
  }[]
  liveUrl?: string
  githubUrl?: string
}

const projects: Project[] = [
  {
    title: "AI Trading Bot",
    description: "Automated trading system using machine learning algorithms for market prediction and risk management",
    image: "/projects/trading-bot.png",
    techStack: [
      { name: "Python", color: "bg-blue-500" },
      { name: "TensorFlow", color: "bg-orange-500" },
      { name: "MetaTrader", color: "bg-green-500" }
    ],
    liveUrl: "https://demo-trading-bot.com",
    githubUrl: "https://github.com/raaeeiii/trading-bot"
  },
  {
    title: "Portfolio Website",
    description: "Modern portfolio website built with React and TailwindCSS featuring dark mode and animations",
    image: "/projects/portfolio.png",
    techStack: [
      { name: "React", color: "bg-cyan-500" },
      { name: "TypeScript", color: "bg-blue-600" },
      { name: "Tailwind", color: "bg-teal-500" }
    ],
    liveUrl: "https://raeesportfolio.vercel.app",
    githubUrl: "https://github.com/raaeeiii/portfolio"
  },
  {
    title: "Chat AI Assistant",
    description: "Intelligent chatbot powered by GPT for customer support and task automation",
    image: "/projects/chatbot.png",
    techStack: [
      { name: "Python", color: "bg-blue-500" },
      { name: "OpenAI", color: "bg-purple-500" },
      { name: "Firebase", color: "bg-orange-500" }
    ],
    liveUrl: "https://ai-assistant-demo.com",
    githubUrl: "https://github.com/raaeeiii/ai-assistant"
  }
]

const ProjectsSection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 20
      }
    }
  }

  return (
    <section id="projects" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">
            🚀 Projects I've Built
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <motion.div
                key={project.title}
                variants={itemVariants}
                className="group"
              >
                <div className="relative bg-gray-800 rounded-xl overflow-hidden transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                  {/* Project Image */}
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 transition-opacity duration-300 group-hover:bg-opacity-30" />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {project.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {project.description}
                    </p>

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech.name}
                          className={`${tech.color} bg-opacity-15 text-xs font-medium px-2.5 py-1 rounded-full text-white`}
                        >
                          {tech.name}
                        </span>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center py-2 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium transition-colors duration-300 hover:bg-blue-700"
                        >
                          Live Demo
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center py-2 px-4 rounded-lg bg-gray-700 text-white text-sm font-medium transition-colors duration-300 hover:bg-gray-600"
                        >
                          GitHub
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default ProjectsSection
