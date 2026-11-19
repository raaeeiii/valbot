import { motion } from 'framer-motion'
import {
  CommandLineIcon,
  CpuChipIcon,
  CodeBracketIcon,
  CircleStackIcon,
  RocketLaunchIcon,
  CubeTransparentIcon,
  CloudArrowUpIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface Skill {
  name: string
  description: string
  Icon: React.ElementType
  color: string
}

const skills: Skill[] = [
  {
    name: 'Python',
    description: 'Advanced Python Development',
    Icon: CommandLineIcon,
    color: 'bg-blue-500'
  },
  {
    name: 'React',
    description: 'Frontend Development',
    Icon: CodeBracketIcon,
    color: 'bg-cyan-500'
  },
  {
    name: 'AI Bots',
    description: 'Chatbot Development',
    Icon: CpuChipIcon,
    color: 'bg-purple-500'
  },
  {
    name: 'Automation',
    description: 'Process Automation',
    Icon: RocketLaunchIcon,
    color: 'bg-green-500'
  },
  {
    name: 'MetaTrader',
    description: 'Trading Automation',
    Icon: ChartBarIcon,
    color: 'bg-yellow-500'
  },
  {
    name: 'Firebase',
    description: 'Backend & Database',
    Icon: CircleStackIcon,
    color: 'bg-orange-500'
  },
  {
    name: 'Cloud',
    description: 'Cloud Services',
    Icon: CloudArrowUpIcon,
    color: 'bg-indigo-500'
  },
  {
    name: 'TailwindCSS',
    description: 'Modern Styling',
    Icon: CubeTransparentIcon,
    color: 'bg-teal-500'
  }
]

const SkillsSection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
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
    <section id="skills" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">
            My Skills
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {skills.map((skill) => (
              <motion.div
                key={skill.name}
                variants={itemVariants}
                className="group"
              >
                <div className="relative p-6 bg-gray-800 rounded-xl hover:bg-gray-750 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                  <div className={`absolute -top-4 -right-4 w-20 h-20 ${skill.color} opacity-10 rounded-full blur-xl group-hover:opacity-20 transition-opacity duration-300`} />
                  <skill.Icon className="w-12 h-12 mb-4 text-gray-300 group-hover:text-white transition-colors duration-300" />
                  <h3 className="text-xl font-semibold mb-2 text-white">
                    {skill.name}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {skill.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default SkillsSection
