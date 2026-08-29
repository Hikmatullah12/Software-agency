import ecommerceImage from '../assets/images/projects/project-ecommerce.jpg'
import hospitalImage from '../assets/images/projects/project-hospital-management.jpg'
import schoolImage from '../assets/images/projects/project-school-management.jpg'
import restaurantImage from '../assets/images/projects/project-restaurant-website.jpg'
import portfolioImage from '../assets/images/projects/project-portfolio-website.jpg'
import inventoryImage from '../assets/images/projects/project-inventory-management.jpg'

// Static fallback content shown when the database has no projects yet.
export const fallbackProjects = [
  {
    id: 'fallback-ecommerce',
    title: 'E-Commerce Platform',
    image: ecommerceImage,
    description: 'Full-featured online store with payment integration and admin dashboard.',
    techs: ['React', 'Node.js', 'MySQL'],
    category: 'Web Development',
  },
  {
    id: 'fallback-hospital',
    title: 'Hospital Management System',
    image: hospitalImage,
    description: 'Patient records, appointments, billing, and reporting.',
    techs: ['React', 'Express', 'Postgres'],
    category: 'Database Solutions',
  },
  {
    id: 'fallback-school',
    title: 'School Management System',
    image: schoolImage,
    description: 'Attendance, grading, scheduling, and parent portal.',
    techs: ['React', 'Node.js', 'REST API'],
    category: 'Web Development',
  },
  {
    id: 'fallback-restaurant',
    title: 'Restaurant Website',
    image: restaurantImage,
    description: 'Menu, online ordering, and reservation system.',
    techs: ['React', 'Stripe', 'Serverless'],
    category: 'Web Development',
  },
  {
    id: 'fallback-portfolio',
    title: 'Portfolio Website',
    image: portfolioImage,
    description: 'Personal portfolio with projects, blog, and contact form.',
    techs: ['React', 'Vite', 'CSS'],
    category: 'UI/UX Design',
  },
  {
    id: 'fallback-inventory',
    title: 'Inventory Management System',
    image: inventoryImage,
    description: 'Stock tracking, purchase orders, and supplier management.',
    techs: ['Node.js', 'MySQL', 'REST'],
    category: 'IT Consulting',
  },
]
