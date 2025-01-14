import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClock, FaCheck, FaPause, FaEye, FaBriefcase, FaLightbulb } from 'react-icons/fa';

const ProjectsList = () => {
  const navigate = useNavigate();
  const [projectType, setProjectType] = useState('all');

  const projects = [
    {
      id: 1,
      title: 'E-commerce Website Development',
      type: 'freelance',
      status: 'active',
      budget: '$5,000',
      deadline: '2024-03-15',
      progress: 75,
      description: 'Full-stack e-commerce platform with payment integration'
    },
    {
      id: 2,
      title: 'Mobile App UI Design',
      type: 'created',
      status: 'completed',
      budget: '$3,000',
      deadline: '2024-02-28',
      progress: 100,
      description: 'UI/UX design for iOS and Android application'
    },
    {
      id: 3,
      title: 'Backend API Development',
      type: 'created',
      status: 'paused',
      budget: '$4,500',
      deadline: '2024-04-01',
      progress: 30,
      description: 'RESTful API development with Node.js and Express'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <FaClock className="text-blue-500" />;
      case 'completed':
        return <FaCheck className="text-green-500" />;
      case 'paused':
        return <FaPause className="text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-blue-500/10 text-blue-500';
      case 'completed':
        return 'bg-green-500/10 text-green-500';
      case 'paused':
        return 'bg-yellow-500/10 text-yellow-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const filteredProjects = projectType === 'all' ? projects : projects.filter((project) => project.type === projectType);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold theme-text">My Projects</h2>
        <button onClick={() => navigate('/projects/new')} className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all duration-300">
          New Project
        </button>
      </div>

      {/* Project Type Filter */}
      <div className="flex gap-4 flex-wrap">
        <button
          onClick={() => setProjectType('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300
            ${projectType === 'all' ? 'bg-accent text-white' : 'bg-accent/10 text-accent'}`}>
          All Projects
        </button>
        <button
          onClick={() => setProjectType('freelance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300
            ${projectType === 'freelance' ? 'bg-accent text-white' : 'bg-accent/10 text-accent'}`}>
          <FaBriefcase />
          Freelance Work
        </button>
        <button
          onClick={() => setProjectType('created')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300
            ${projectType === 'created' ? 'bg-accent text-white' : 'bg-accent/10 text-accent'}`}>
          <FaLightbulb />
          My Listings
        </button>
      </div>

      <div className="grid gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="p-6 rounded-lg bg-gradient-to-br dark:from-light/10 dark:to-light/5 from-primary/10 to-primary/5 hover:shadow-lg transition-all duration-300 group">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {project.type === 'freelance' ? <FaBriefcase className="text-accent text-xl" /> : <FaLightbulb className="text-accent text-xl" />}
                  <h3 className="text-xl font-semibold theme-text">{project.title}</h3>
                </div>
                <p className="theme-text-secondary text-sm mb-3">{project.description}</p>
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getStatusColor(project.status)}`}>
                    {getStatusIcon(project.status)}
                    <span className="capitalize text-sm">{project.status}</span>
                  </div>
                  <div className="theme-text-secondary text-sm">Due: {project.deadline}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="theme-text font-bold">{project.budget}</div>
                <button
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="mt-2 flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 text-accent hover:bg-accent hover:text-white transition-all duration-300">
                  <FaEye />
                  <span>View</span>
                </button>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between mb-2">
                <span className="theme-text-secondary text-sm">Progress</span>
                <span className="theme-text-secondary text-sm">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-accent h-2.5 rounded-full transition-all duration-300" style={{ width: `${project.progress}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsList;
