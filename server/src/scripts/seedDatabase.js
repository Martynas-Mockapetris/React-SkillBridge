import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import User from '../models/User.js'
import Project from '../models/Project.js'
import Announcement from '../models/Announcement.js'

dotenv.config()

// Helper function to get random element from array
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)]

// Helper function to get random number between min and max
const randomNum = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

// Generate avatar URL using UI Avatars (based on name)
// Generate avatar URL using Pravatar.cc
const generateAvatar = () => {
  const randomSeed = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  return `https://i.pravatar.cc/150?u=${randomSeed}`
}

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Check if data already exists
    const userCount = await User.countDocuments({})
    const projectCount = await Project.countDocuments({})
    const announcementCount = await Announcement.countDocuments({})

    if (userCount > 0 || projectCount > 0 || announcementCount > 0) {
      console.log('⚠️  Database already contains data. Skipping seed...')
      console.log(`   Users: ${userCount}, Projects: ${projectCount}, Announcements: ${announcementCount}`)
      process.exit(0)
    }

    console.log('Seeding database with comprehensive data...')

    const hashedPassword = await bcrypt.hash('password123', 10)

    // ========== CREATE 11 USERS ==========
    const users = [
      // 4 Freelancers
      {
        firstName: 'John',
        lastName: 'Developer',
        email: 'john@example.com',
        password: hashedPassword,
        userType: 'freelancer',
        profilePicture: generateAvatar(),
        location: 'Berlin, Germany',
        bio: 'Expert React developer with 5+ years experience',
        hourlyRate: 75,
        experienceLevel: 'expert',
        skills: 'React, Node.js, JavaScript, TypeScript'
      },
      {
        firstName: 'Sarah',
        lastName: 'Designer',
        email: 'sarah@example.com',
        password: hashedPassword,
        userType: 'freelancer',
        profilePicture: generateAvatar(),
        location: 'Amsterdam, Netherlands',
        bio: 'UI/UX designer with 4 years in web applications',
        hourlyRate: 65,
        experienceLevel: 'intermediate',
        skills: 'Figma, UI Design, UX Design, Prototyping'
      },
      {
        firstName: 'Mike',
        lastName: 'FullStack',
        email: 'mike@example.com',
        password: hashedPassword,
        userType: 'freelancer',
        profilePicture: generateAvatar(),
        location: 'London, UK',
        bio: 'Full stack developer specializing in MERN stack',
        hourlyRate: 80,
        experienceLevel: 'expert',
        skills: 'React, Node.js, MongoDB, PostgreSQL'
      },
      {
        firstName: 'Emma',
        lastName: 'DevOps',
        email: 'emma@example.com',
        password: hashedPassword,
        userType: 'freelancer',
        profilePicture: generateAvatar(),
        location: 'Stockholm, Sweden',
        bio: 'DevOps engineer with AWS expertise',
        hourlyRate: 90,
        experienceLevel: 'expert',
        skills: 'AWS, Docker, Kubernetes, CI/CD'
      },
      // 5 Clients
      {
        firstName: 'Tech',
        lastName: 'Startup',
        email: 'startup1@example.com',
        password: hashedPassword,
        userType: 'client',
        profilePicture: generateAvatar(),
        location: 'Berlin, Germany',
        bio: 'Growing tech startup looking for talented developers'
      },
      {
        firstName: 'Digital',
        lastName: 'Agency',
        email: 'agency@example.com',
        password: hashedPassword,
        userType: 'client',
        profilePicture: generateAvatar(),
        location: 'Paris, France',
        bio: 'Digital agency delivering web solutions'
      },
      {
        firstName: 'SaaS',
        lastName: 'Company',
        email: 'saas@example.com',
        password: hashedPassword,
        userType: 'client',
        profilePicture: generateAvatar(),
        location: 'Stockholm, Sweden',
        bio: 'SaaS platform development company'
      },
      {
        firstName: 'E-Commerce',
        lastName: 'Corp',
        email: 'ecommerce@example.com',
        password: hashedPassword,
        userType: 'client',
        profilePicture: generateAvatar(),
        location: 'Amsterdam, Netherlands',
        bio: 'Large e-commerce platform'
      },
      {
        firstName: 'Mobile',
        lastName: 'Ventures',
        email: 'mobile@example.com',
        password: hashedPassword,
        userType: 'client',
        profilePicture: generateAvatar(),
        location: 'London, UK',
        bio: 'Mobile app development company'
      },
      // 2 Both (can be client and freelancer)
      {
        firstName: 'Alex',
        lastName: 'MultiTalent',
        email: 'alex@example.com',
        password: hashedPassword,
        userType: 'both',
        profilePicture: generateAvatar('Alex', 'MultiTalent'),
        location: 'Barcelona, Spain',
        bio: 'Full stack developer and project manager',
        hourlyRate: 70,
        experienceLevel: 'expert',
        skills: 'React, Node.js, Project Management'
      },
      {
        firstName: 'Lisa',
        lastName: 'Consultant',
        email: 'lisa@example.com',
        password: hashedPassword,
        userType: 'both',
        profilePicture: generateAvatar('Lisa', 'Consultant'),
        location: 'Vienna, Austria',
        bio: 'Developer and tech consultant',
        hourlyRate: 85,
        experienceLevel: 'expert',
        skills: 'Full Stack, Architecture, Consulting'
      }
    ]

    const createdUsers = await User.insertMany(users)
    console.log(`✅ Created ${createdUsers.length} users`)

    // Separate users by type
    const freelancers = createdUsers.filter((u) => u.userType === 'freelancer')
    const clients = createdUsers.filter((u) => u.userType === 'client')
    const both = createdUsers.filter((u) => u.userType === 'both')
    const allFreelancers = [...freelancers, ...both] // Include 'both' users

    // ========== CREATE PROJECTS ==========
    const projects = []

    // Helper to create project
    const createProject = (user, title, description, category, budget, skills, status, daysUntilDeadline) => ({
      user: user._id,
      title,
      description,
      category,
      budget,
      skills,
      status,
      deadline: new Date(Date.now() + daysUntilDeadline * 24 * 60 * 60 * 1000)
    })

    // ===== ACTIVE PROJECTS (1-3 per client/both) =====
    for (const client of [...clients, ...both]) {
      const numProjects = randomNum(1, 3)
      for (let i = 0; i < numProjects; i++) {
        const projectTypes = [
          {
            title: 'Web Development Project',
            description: 'Build a modern web application with React and Node.js backend integration',
            category: 'Web Development',
            budget: randomNum(1500, 4000),
            skills: ['React', 'Node.js', 'MongoDB']
          },
          {
            title: 'Mobile App Development',
            description: 'Create a cross-platform mobile application with native features',
            category: 'Mobile Development',
            budget: randomNum(3000, 6000),
            skills: ['React Native', 'Node.js']
          },
          {
            title: 'UI/UX Design Project',
            description: 'Complete UI/UX design for web platform with prototypes',
            category: 'UI/UX Design',
            budget: randomNum(1000, 2500),
            skills: ['Figma', 'UI Design', 'Prototyping']
          },
          {
            title: 'Backend API Development',
            description: 'Build robust REST API with authentication and security',
            category: 'Backend Development',
            budget: randomNum(2000, 3500),
            skills: ['Node.js', 'Express', 'MongoDB']
          },
          {
            title: 'DevOps & Infrastructure',
            description: 'Setup cloud infrastructure and CI/CD pipelines',
            category: 'DevOps',
            budget: randomNum(1500, 3000),
            skills: ['AWS', 'Docker', 'Kubernetes']
          }
        ]

        const projectType = randomItem(projectTypes)
        projects.push(
          createProject(
            client,
            projectType.title,
            projectType.description,
            projectType.category,
            projectType.budget,
            projectType.skills,
            'active',
            randomNum(14, 90) // Varied deadline: 14-90 days
          )
        )
      }
    }

    // ===== DRAFT PROJECTS (2 additional for 1 client) =====
    const draftClientIndex = randomNum(0, clients.length - 1)
    const draftClient = clients[draftClientIndex]
    for (let i = 0; i < 2; i++) {
      projects.push(
        createProject(
          draftClient,
          `Draft Project ${i + 1}`,
          'This is a draft project not yet published. Still in planning phase.',
          'Web Development',
          randomNum(1000, 2000),
          ['React', 'JavaScript'],
          'draft',
          randomNum(21, 60) // Varied deadline: 21-60 days
        )
      )
    }

    // ===== COMPLETED PROJECTS (1-3 for 3 clients) =====
    const clientsWithCompleted = clients.slice(0, 3)
    const completedProjectsByClient = []

    for (const client of clientsWithCompleted) {
      const numCompleted = randomNum(1, 3)
      for (let i = 0; i < numCompleted; i++) {
        const assignedFreelancer = randomItem(allFreelancers)
        const budget = randomNum(1500, 4000)
        const completedProject = createProject(
          client,
          `Completed Project - ${assignedFreelancer.firstName}`,
          `Successfully completed project assigned to ${assignedFreelancer.firstName}. High quality delivery.`,
          randomItem(['Web Development', 'Backend Development', 'UI/UX Design', 'Mobile Development']),
          budget,
          randomItem([
            ['React', 'JavaScript'],
            ['Node.js', 'MongoDB'],
            ['Figma', 'UI Design'],
            ['AWS', 'Docker']
          ]),
          'completed',
          -randomNum(7, 60) // Past deadline (7-60 days ago)
        )
        completedProject.assignee = assignedFreelancer._id
        completedProject.submission = {
          submittedAt: new Date(Date.now() - randomNum(1, 30) * 24 * 60 * 60 * 1000),
          submittedBy: assignedFreelancer._id,
          links: [],
          files: [],
          note: 'Project completed successfully and delivered on time'
        }
        completedProject.review = {
          decision: 'accepted',
          feedback: 'Excellent work! Delivered on time and exceeded expectations.',
          reviewedAt: new Date(),
          reviewedBy: client._id
        }
        projects.push(completedProject)
        completedProjectsByClient.push(completedProject)
      }
    }

    const createdProjects = await Project.insertMany(projects)
    console.log(`✅ Created ${createdProjects.length} projects`)
    console.log(`   - Active projects: ${projects.filter((p) => p.status === 'active').length}`)
    console.log(`   - Draft projects: ${projects.filter((p) => p.status === 'draft').length}`)
    console.log(`   - Completed projects: ${projects.filter((p) => p.status === 'completed').length}`)

    // ========== CREATE ANNOUNCEMENTS ==========
    const announcements = [
      {
        userId: freelancers[0]._id,
        title: 'React & Node.js Development',
        background: 'Expert React developer with 5+ years. Specialize in scalable web applications and modern JavaScript.',
        hourlyRate: 75,
        skills: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
        isActive: true
      },
      {
        userId: freelancers[1]._id,
        title: 'UI/UX Design Services',
        background: '4 years of design experience. Create beautiful interfaces that users love.',
        hourlyRate: 65,
        skills: ['Figma', 'UI Design', 'UX Design', 'Prototyping'],
        isActive: true
      },
      {
        userId: freelancers[2]._id,
        title: 'Full Stack Development',
        background: 'Full stack expert. Ready for complex MERN stack projects.',
        hourlyRate: 80,
        skills: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
        isActive: true
      },
      {
        userId: freelancers[3]._id,
        title: 'DevOps & Cloud Engineering',
        background: '6+ years in AWS, Docker, and Kubernetes. Build scalable infrastructure.',
        hourlyRate: 90,
        skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
        isActive: true
      },
      {
        userId: both[0]._id,
        title: 'Full Stack Developer & Manager',
        background: 'Develop code and manage projects. Full stack expertise with leadership.',
        hourlyRate: 70,
        skills: ['React', 'Node.js', 'Project Management', 'Architecture'],
        isActive: true
      },
      {
        userId: both[1]._id,
        title: 'Tech Architect & Consultant',
        background: 'Senior developer providing architecture and consulting services.',
        hourlyRate: 85,
        skills: ['Full Stack', 'System Design', 'Consulting', 'Cloud'],
        isActive: true
      },
      {
        userId: freelancers[0]._id,
        title: 'React Performance Optimization',
        background: 'Specialized in optimizing React applications for speed and scalability.',
        hourlyRate: 85,
        skills: ['React', 'Performance', 'JavaScript'],
        isActive: false
      }
    ]

    const createdAnnouncements = await Announcement.insertMany(announcements)
    console.log(`✅ Created ${createdAnnouncements.length} announcements`)
    console.log(`   - Active: ${createdAnnouncements.filter((a) => a.isActive).length}`)
    console.log(`   - Paused: ${createdAnnouncements.filter((a) => !a.isActive).length}`)

    console.log('\n✅ Database seeded successfully!')
    console.log('\n📊 Summary:')
    console.log(`   Users: ${createdUsers.length} (4 freelancers, 5 clients, 2 both)`)
    console.log(
      `   Projects: ${createdProjects.length} (${projects.filter((p) => p.status === 'active').length} active, ${projects.filter((p) => p.status === 'draft').length} draft, ${projects.filter((p) => p.status === 'completed').length} completed)`
    )
    console.log(`   Announcements: ${createdAnnouncements.length}`)
    console.log(`   Completed Projects Assigned: ${completedProjectsByClient.length}`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seedDatabase()
