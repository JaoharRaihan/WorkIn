import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';

const TestsScreen = ({ navigation }) => {
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Comprehensive test data
  const mockTests = [
    // Programming Tests
    {
      id: 1,
      title: 'JavaScript Fundamentals',
      description: 'Master variables, functions, and basic concepts',
      category: 'programming',
      difficulty: 'Beginner',
      duration: '30 min',
      questions: 25,
      badge: 'JavaScript Basic',
      color: '#F7DF1E',
      icon: 'code',
      points: 100,
      participants: 12547,
    },
    {
      id: 2,
      title: 'Advanced JavaScript',
      description: 'Closures, prototypes, async/await mastery',
      category: 'programming',
      difficulty: 'Advanced',
      duration: '60 min',
      questions: 40,
      badge: 'JavaScript Expert',
      color: '#F7DF1E',
      icon: 'code',
      points: 200,
      participants: 3421,
    },
    {
      id: 3,
      title: 'React Development',
      description: 'Hooks, state management, component patterns',
      category: 'programming',
      difficulty: 'Intermediate',
      duration: '45 min',
      questions: 30,
      badge: 'React Developer',
      color: '#61DAFB',
      icon: 'layers',
      points: 150,
      participants: 8932,
    },
    {
      id: 4,
      title: 'React Advanced Patterns',
      description: 'Custom hooks, context, performance optimization',
      category: 'programming',
      difficulty: 'Advanced',
      duration: '75 min',
      questions: 45,
      badge: 'React Expert',
      color: '#61DAFB',
      icon: 'layers',
      points: 250,
      participants: 1876,
    },
    {
      id: 5,
      title: 'Node.js Backend',
      description: 'Express, APIs, middleware, authentication',
      category: 'programming',
      difficulty: 'Intermediate',
      duration: '50 min',
      questions: 35,
      badge: 'Backend Developer',
      color: '#68A063',
      icon: 'server',
      points: 180,
      participants: 5432,
    },
    {
      id: 6,
      title: 'Python Fundamentals',
      description: 'Syntax, data structures, OOP basics',
      category: 'programming',
      difficulty: 'Beginner',
      duration: '40 min',
      questions: 28,
      badge: 'Python Basic',
      color: '#3776AB',
      icon: 'code',
      points: 120,
      participants: 15672,
    },
    {
      id: 7,
      title: 'Python Data Science',
      description: 'Pandas, NumPy, data manipulation',
      category: 'data-science',
      difficulty: 'Intermediate',
      duration: '60 min',
      questions: 38,
      badge: 'Data Analyst',
      color: '#3776AB',
      icon: 'analytics',
      points: 200,
      participants: 6543,
    },
    
    // Design Tests
    {
      id: 8,
      title: 'UI/UX Design Principles',
      description: 'Design thinking, user experience fundamentals',
      category: 'design',
      difficulty: 'Beginner',
      duration: '35 min',
      questions: 22,
      badge: 'Design Thinker',
      color: '#FF6B6B',
      icon: 'brush',
      points: 110,
      participants: 9876,
    },
    {
      id: 9,
      title: 'Advanced UX Research',
      description: 'User research, testing, personas, journey mapping',
      category: 'design',
      difficulty: 'Advanced',
      duration: '55 min',
      questions: 32,
      badge: 'UX Researcher',
      color: '#FF6B6B',
      icon: 'people',
      points: 190,
      participants: 2341,
    },
    {
      id: 10,
      title: 'Figma Mastery',
      description: 'Components, auto-layout, prototyping',
      category: 'design',
      difficulty: 'Intermediate',
      duration: '45 min',
      questions: 26,
      badge: 'Figma Expert',
      color: '#F24E1E',
      icon: 'shapes',
      points: 140,
      participants: 7654,
    },
    
    // Data Science Tests
    {
      id: 11,
      title: 'Machine Learning Basics',
      description: 'Algorithms, supervised learning, model evaluation',
      category: 'data-science',
      difficulty: 'Intermediate',
      duration: '70 min',
      questions: 42,
      badge: 'ML Practitioner',
      color: '#FF9500',
      icon: 'stats-chart',
      points: 220,
      participants: 4321,
    },
    {
      id: 12,
      title: 'SQL Database Design',
      description: 'Queries, joins, normalization, performance',
      category: 'data-science',
      difficulty: 'Intermediate',
      duration: '50 min',
      questions: 35,
      badge: 'Database Expert',
      color: '#336791',
      icon: 'server',
      points: 170,
      participants: 8765,
    },
    
    // DevOps Tests
    {
      id: 13,
      title: 'Docker Fundamentals',
      description: 'Containers, images, Docker Compose',
      category: 'devops',
      difficulty: 'Beginner',
      duration: '40 min',
      questions: 28,
      badge: 'Container Basic',
      color: '#2496ED',
      icon: 'cube',
      points: 130,
      participants: 5432,
    },
    {
      id: 14,
      title: 'Kubernetes Deployment',
      description: 'Pods, services, deployments, scaling',
      category: 'devops',
      difficulty: 'Advanced',
      duration: '80 min',
      questions: 48,
      badge: 'K8s Engineer',
      color: '#326CE5',
      icon: 'grid',
      points: 280,
      participants: 1234,
    },
    {
      id: 15,
      title: 'AWS Cloud Basics',
      description: 'EC2, S3, Lambda, IAM fundamentals',
      category: 'devops',
      difficulty: 'Intermediate',
      duration: '55 min',
      questions: 38,
      badge: 'Cloud Practitioner',
      color: '#FF9900',
      icon: 'cloud',
      points: 190,
      participants: 6789,
    },
    
    // Marketing Tests
    {
      id: 16,
      title: 'Digital Marketing Strategy',
      description: 'SEO, SEM, social media, content strategy',
      category: 'marketing',
      difficulty: 'Intermediate',
      duration: '45 min',
      questions: 32,
      badge: 'Digital Marketer',
      color: '#E91E63',
      icon: 'megaphone',
      points: 160,
      participants: 7891,
    },
    {
      id: 17,
      title: 'Analytics & Data Insights',
      description: 'Google Analytics, conversion tracking, KPIs',
      category: 'marketing',
      difficulty: 'Advanced',
      duration: '50 min',
      questions: 35,
      badge: 'Analytics Expert',
      color: '#E91E63',
      icon: 'trending-up',
      points: 180,
      participants: 3456,
    },
    
    // Product Management Tests
    {
      id: 18,
      title: 'Product Strategy Fundamentals',
      description: 'Market research, roadmaps, stakeholder management',
      category: 'product',
      difficulty: 'Intermediate',
      duration: '50 min',
      questions: 34,
      badge: 'Product Strategist',
      color: '#9C27B0',
      icon: 'rocket',
      points: 175,
      participants: 4567,
    },
    {
      id: 19,
      title: 'Agile & Scrum Mastery',
      description: 'Sprint planning, user stories, team dynamics',
      category: 'product',
      difficulty: 'Advanced',
      duration: '60 min',
      questions: 40,
      badge: 'Scrum Master',
      color: '#9C27B0',
      icon: 'people',
      points: 200,
      participants: 2987,
    },
    
    // Business Tests
    {
      id: 20,
      title: 'Financial Analysis',
      description: 'P&L, cash flow, financial modeling',
      category: 'business',
      difficulty: 'Advanced',
      duration: '65 min',
      questions: 42,
      badge: 'Financial Analyst',
      color: '#4CAF50',
      icon: 'bar-chart',
      points: 210,
      participants: 3210,
    },
    {
      id: 21,
      title: 'Business Strategy',
      description: 'Strategic planning, competitive analysis, SWOT',
      category: 'business',
      difficulty: 'Intermediate',
      duration: '55 min',
      questions: 38,
      badge: 'Strategy Expert',
      color: '#4CAF50',
      icon: 'trending-up',
      points: 180,
      participants: 4567,
    },
    {
      id: 22,
      title: 'Operations Management',
      description: 'Process optimization, supply chain, quality control',
      category: 'business',
      difficulty: 'Advanced',
      duration: '70 min',
      questions: 45,
      badge: 'Operations Manager',
      color: '#4CAF50',
      icon: 'settings',
      points: 220,
      participants: 2890,
    },

    // Cybersecurity Tests
    {
      id: 23,
      title: 'Network Security Fundamentals',
      description: 'Firewalls, encryption, network protocols',
      category: 'cybersecurity',
      difficulty: 'Intermediate',
      duration: '60 min',
      questions: 40,
      badge: 'Security Specialist',
      color: '#D32F2F',
      icon: 'shield',
      points: 200,
      participants: 3456,
    },
    {
      id: 24,
      title: 'Ethical Hacking',
      description: 'Penetration testing, vulnerability assessment',
      category: 'cybersecurity',
      difficulty: 'Advanced',
      duration: '90 min',
      questions: 50,
      badge: 'Ethical Hacker',
      color: '#D32F2F',
      icon: 'bug',
      points: 300,
      participants: 1234,
    },
    {
      id: 25,
      title: 'Cloud Security',
      description: 'AWS security, IAM, compliance frameworks',
      category: 'cybersecurity',
      difficulty: 'Advanced',
      duration: '75 min',
      questions: 42,
      badge: 'Cloud Security Expert',
      color: '#D32F2F',
      icon: 'cloud-lock',
      points: 250,
      participants: 2567,
    },

    // Mobile Development Tests
    {
      id: 26,
      title: 'React Native Development',
      description: 'Cross-platform mobile apps, navigation, APIs',
      category: 'mobile',
      difficulty: 'Intermediate',
      duration: '60 min',
      questions: 35,
      badge: 'Mobile Developer',
      color: '#61DAFB',
      icon: 'phone-portrait',
      points: 180,
      participants: 5678,
    },
    {
      id: 27,
      title: 'iOS Swift Development',
      description: 'Swift fundamentals, UIKit, Core Data',
      category: 'mobile',
      difficulty: 'Advanced',
      duration: '80 min',
      questions: 48,
      badge: 'iOS Developer',
      color: '#007AFF',
      icon: 'logo-apple',
      points: 250,
      participants: 3421,
    },
    {
      id: 28,
      title: 'Android Kotlin Development',
      description: 'Kotlin, Android SDK, Material Design',
      category: 'mobile',
      difficulty: 'Advanced',
      duration: '75 min',
      questions: 45,
      badge: 'Android Developer',
      color: '#3DDC84',
      icon: 'logo-android',
      points: 240,
      participants: 4123,
    },

    // AI/ML Tests
    {
      id: 29,
      title: 'Deep Learning Fundamentals',
      description: 'Neural networks, TensorFlow, PyTorch',
      category: 'ai-ml',
      difficulty: 'Advanced',
      duration: '90 min',
      questions: 55,
      badge: 'AI Engineer',
      color: '#FF6F00',
      icon: 'library',
      points: 300,
      participants: 2345,
    },
    {
      id: 30,
      title: 'Computer Vision',
      description: 'Image processing, CNN, object detection',
      category: 'ai-ml',
      difficulty: 'Expert',
      duration: '100 min',
      questions: 60,
      badge: 'Computer Vision Expert',
      color: '#FF6F00',
      icon: 'eye',
      points: 350,
      participants: 987,
    },
    {
      id: 31,
      title: 'Natural Language Processing',
      description: 'Text analysis, sentiment analysis, transformers',
      category: 'ai-ml',
      difficulty: 'Advanced',
      duration: '85 min',
      questions: 50,
      badge: 'NLP Specialist',
      color: '#FF6F00',
      icon: 'chatbubbles',
      points: 280,
      participants: 1567,
    },

    // Healthcare Tests
    {
      id: 32,
      title: 'Healthcare Data Analytics',
      description: 'Medical data analysis, HIPAA compliance',
      category: 'healthcare',
      difficulty: 'Intermediate',
      duration: '70 min',
      questions: 40,
      badge: 'Healthcare Analyst',
      color: '#4FC3F7',
      icon: 'medical',
      points: 220,
      participants: 2890,
    },
    {
      id: 33,
      title: 'Telemedicine Technology',
      description: 'Remote patient monitoring, digital health',
      category: 'healthcare',
      difficulty: 'Advanced',
      duration: '60 min',
      questions: 35,
      badge: 'Digital Health Expert',
      color: '#4FC3F7',
      icon: 'heart',
      points: 200,
      participants: 1876,
    },
    {
      id: 34,
      title: 'Medical Device Software',
      description: 'FDA regulations, device validation, safety',
      category: 'healthcare',
      difficulty: 'Expert',
      duration: '95 min',
      questions: 52,
      badge: 'MedTech Engineer',
      color: '#4FC3F7',
      icon: 'hardware-chip',
      points: 320,
      participants: 654,
    },

    // Finance/FinTech Tests
    {
      id: 35,
      title: 'Blockchain & Cryptocurrency',
      description: 'DeFi, smart contracts, blockchain technology',
      category: 'fintech',
      difficulty: 'Advanced',
      duration: '80 min',
      questions: 45,
      badge: 'Blockchain Developer',
      color: '#FFC107',
      icon: 'link',
      points: 260,
      participants: 3456,
    },
    {
      id: 36,
      title: 'Algorithmic Trading',
      description: 'Trading algorithms, market analysis, risk management',
      category: 'fintech',
      difficulty: 'Expert',
      duration: '100 min',
      questions: 55,
      badge: 'Quant Developer',
      color: '#FFC107',
      icon: 'pulse',
      points: 340,
      participants: 1234,
    },
    {
      id: 37,
      title: 'Payment Systems',
      description: 'Digital payments, PCI compliance, fraud detection',
      category: 'fintech',
      difficulty: 'Intermediate',
      duration: '65 min',
      questions: 38,
      badge: 'Payment Expert',
      color: '#FFC107',
      icon: 'card',
      points: 210,
      participants: 4567,
    },

    // E-commerce Tests
    {
      id: 38,
      title: 'E-commerce Platform Development',
      description: 'Shopping carts, payment integration, inventory',
      category: 'ecommerce',
      difficulty: 'Intermediate',
      duration: '70 min',
      questions: 42,
      badge: 'E-commerce Developer',
      color: '#8BC34A',
      icon: 'storefront',
      points: 220,
      participants: 5432,
    },
    {
      id: 39,
      title: 'Digital Commerce Strategy',
      description: 'Omnichannel, customer journey, conversion optimization',
      category: 'ecommerce',
      difficulty: 'Advanced',
      duration: '60 min',
      questions: 35,
      badge: 'Commerce Strategist',
      color: '#8BC34A',
      icon: 'trending-up',
      points: 190,
      participants: 3210,
    },
    {
      id: 40,
      title: 'Supply Chain Technology',
      description: 'Logistics automation, inventory management, IoT',
      category: 'ecommerce',
      difficulty: 'Advanced',
      duration: '75 min',
      questions: 45,
      badge: 'Supply Chain Expert',
      color: '#8BC34A',
      icon: 'cube-outline',
      points: 240,
      participants: 2345,
    },

    // Gaming Tests
    {
      id: 41,
      title: 'Game Development Unity',
      description: 'Unity engine, C# scripting, 2D/3D games',
      category: 'gaming',
      difficulty: 'Intermediate',
      duration: '80 min',
      questions: 45,
      badge: 'Game Developer',
      color: '#673AB7',
      icon: 'game-controller',
      points: 250,
      participants: 4321,
    },
    {
      id: 42,
      title: 'Game Design Principles',
      description: 'Gameplay mechanics, level design, user experience',
      category: 'gaming',
      difficulty: 'Intermediate',
      duration: '65 min',
      questions: 38,
      badge: 'Game Designer',
      color: '#673AB7',
      icon: 'brush',
      points: 200,
      participants: 3456,
    },
    {
      id: 43,
      title: 'Multiplayer Game Architecture',
      description: 'Networking, real-time systems, server architecture',
      category: 'gaming',
      difficulty: 'Expert',
      duration: '100 min',
      questions: 58,
      badge: 'Multiplayer Expert',
      color: '#673AB7',
      icon: 'people',
      points: 350,
      participants: 987,
    },

    // Education Technology Tests
    {
      id: 44,
      title: 'Learning Management Systems',
      description: 'LMS development, content delivery, assessments',
      category: 'edtech',
      difficulty: 'Intermediate',
      duration: '55 min',
      questions: 32,
      badge: 'EdTech Developer',
      color: '#795548',
      icon: 'school',
      points: 170,
      participants: 2987,
    },
    {
      id: 45,  
      title: 'Educational Data Analytics',
      description: 'Learning analytics, student performance, predictive modeling',
      category: 'edtech',
      difficulty: 'Advanced',
      duration: '70 min',
      questions: 40,
      badge: 'Learning Analyst',
      color: '#795548',
      icon: 'analytics',
      points: 220,
      participants: 1876,
    },
    {
      id: 46,
      title: 'Virtual Reality Education',
      description: 'VR learning experiences, immersive content, accessibility',
      category: 'edtech',
      difficulty: 'Advanced',
      duration: '75 min',
      questions: 42,
      badge: 'VR Education Expert',
      color: '#795548',
      icon: 'glasses',
      points: 240,
      participants: 1234,
    },

    // IoT Tests
    {
      id: 47,
      title: 'IoT Device Programming',
      description: 'Embedded systems, sensors, microcontrollers',
      category: 'iot',
      difficulty: 'Intermediate',
      duration: '70 min',
      questions: 40,
      badge: 'IoT Developer',
      color: '#607D8B',
      icon: 'hardware-chip',
      points: 220,
      participants: 3456,
    },
    {
      id: 48,
      title: 'Industrial IoT Solutions',
      description: 'Manufacturing automation, predictive maintenance',
      category: 'iot',
      difficulty: 'Advanced',
      duration: '80 min',
      questions: 48,
      badge: 'IIoT Specialist',
      color: '#607D8B',
      icon: 'construct',
      points: 260,
      participants: 2123,
    },
    {
      id: 49,
      title: 'Smart Home Technology',
      description: 'Home automation, voice assistants, security systems',
      category: 'iot',
      difficulty: 'Intermediate',
      duration: '60 min',
      questions: 35,
      badge: 'Smart Home Expert',
      color: '#607D8B',
      icon: 'home',
      points: 190,
      participants: 4567,
    },

    // Sales Tests
    {
      id: 50,
      title: 'Sales Strategy & Process',
      description: 'Sales methodology, pipeline management, CRM',
      category: 'sales',
      difficulty: 'Intermediate',
      duration: '50 min',
      questions: 32,
      badge: 'Sales Professional',
      color: '#FF5722',
      icon: 'trending-up',
      points: 160,
      participants: 6789,
    },
    {
      id: 51,
      title: 'B2B Sales Technology',
      description: 'Sales automation, lead generation, account management',
      category: 'sales',
      difficulty: 'Advanced',
      duration: '65 min',
      questions: 38,
      badge: 'Sales Tech Expert',
      color: '#FF5722',
      icon: 'business',
      points: 200,
      participants: 3456,
    },
    {
      id: 52,
      title: 'Customer Success Management',
      description: 'Retention strategies, upselling, customer health scoring',
      category: 'sales',
      difficulty: 'Advanced',
      duration: '60 min',
      questions: 35,
      badge: 'Customer Success Manager',
      color: '#FF5722',
      icon: 'people',
      points: 190,
      participants: 2890,
    },
  ];

  const categories = [
    { id: 'all', name: 'All Tests', icon: 'apps', count: 52 },
    { id: 'programming', name: 'Programming', icon: 'code', count: 6 },
    { id: 'design', name: 'Design', icon: 'brush', count: 3 },
    { id: 'data-science', name: 'Data Science', icon: 'analytics', count: 3 },
    { id: 'devops', name: 'DevOps', icon: 'server', count: 3 },
    { id: 'marketing', name: 'Marketing', icon: 'megaphone', count: 2 },
    { id: 'product', name: 'Product', icon: 'rocket', count: 2 },
    { id: 'business', name: 'Business', icon: 'briefcase', count: 3 },
    { id: 'cybersecurity', name: 'Cybersecurity', icon: 'shield', count: 3 },
    { id: 'mobile', name: 'Mobile Dev', icon: 'phone-portrait', count: 3 },
    { id: 'ai-ml', name: 'AI/ML', icon: 'library', count: 3 },
    { id: 'healthcare', name: 'Healthcare', icon: 'medical', count: 3 },
    { id: 'fintech', name: 'FinTech', icon: 'card', count: 3 },
    { id: 'ecommerce', name: 'E-commerce', icon: 'storefront', count: 3 },
    { id: 'gaming', name: 'Gaming', icon: 'game-controller', count: 3 },
    { id: 'edtech', name: 'EdTech', icon: 'school', count: 3 },
    { id: 'iot', name: 'IoT', icon: 'hardware-chip', count: 3 },
    { id: 'sales', name: 'Sales', icon: 'trending-up', count: 3 },
  ];

  useEffect(() => {
    loadTests();
  }, []);

  useEffect(() => {
    filterTests();
  }, [tests, searchQuery, selectedCategory]);

  const loadTests = async () => {
    setTests(mockTests);
  };

  const filterTests = () => {
    let filtered = tests;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(test => test.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(test =>
        test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredTests(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTests();
    setRefreshing(false);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return '#4CAF50';
      case 'Intermediate': return '#FF9800';
      case 'Advanced': return '#F44336';
      default: return '#757575';
    }
  };

  const renderCategoryTab = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryTab,
        selectedCategory === item.id && styles.categoryTabActive
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Ionicons 
        name={item.icon} 
        size={20} 
        color={selectedCategory === item.id ? '#007AFF' : '#666'} 
      />
      <Text style={[
        styles.categoryTabText,
        selectedCategory === item.id && styles.categoryTabTextActive
      ]}>
        {item.name} ({item.count})
      </Text>
    </TouchableOpacity>
  );

  const renderTestCard = ({ item }) => (
    <Card style={styles.testCard}>
      <View style={styles.testHeader}>
        <View style={[styles.testIcon, { backgroundColor: item.color + '20' }]}>
          <Ionicons name={item.icon} size={24} color={item.color} />
        </View>
        <View style={styles.testInfo}>
          <Text style={styles.testTitle}>{item.title}</Text>
          <Text style={styles.testDescription}>{item.description}</Text>
        </View>
        <Badge 
          text={item.difficulty}
          color={getDifficultyColor(item.difficulty)}
          size="small"
        />
      </View>
      
      <View style={styles.testStats}>
        <View style={styles.testStat}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.testStatText}>{item.duration}</Text>
        </View>
        <View style={styles.testStat}>
          <Ionicons name="help-circle-outline" size={16} color="#666" />
          <Text style={styles.testStatText}>{item.questions} questions</Text>
        </View>
        <View style={styles.testStat}>
          <Ionicons name="star-outline" size={16} color="#666" />
          <Text style={styles.testStatText}>{item.points} pts</Text>
        </View>
        <View style={styles.testStat}>
          <Ionicons name="people-outline" size={16} color="#666" />
          <Text style={styles.testStatText}>{item.participants.toLocaleString()}</Text>
        </View>
      </View>
      
      <View style={styles.testActions}>
        <Button
          title="Start Test"
          onPress={() => navigation.navigate('MCQTest', { 
            testId: item.id, 
            test: {
              id: item.id,
              title: item.title,
              description: item.description,
              difficulty: item.difficulty,
              duration: parseInt(item.duration.replace(' min', '')),
              questions: item.questions,
              badge: item.badge,
              points: item.points,
              category: item.category,
              passingScore: 70
            }
          })}
          style={styles.startButton}
        />
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => navigation.navigate('TestDetail', { 
            testId: item.id,
            test: {
              id: item.id,
              title: item.title,
              description: item.description,
              difficulty: item.difficulty,
              duration: item.duration,
              questions: item.questions,
              badge: item.badge,
              points: item.points,
              category: item.category,
              skills: [item.category]
            }
          })}
        >
          <Ionicons name="information-circle-outline" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tests</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('TestHistory')}
          style={styles.historyButton}
        >
          <Ionicons name="time-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tests..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={categories}
        renderItem={renderCategoryTab}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      />

      <FlatList
        data={filteredTests}
        renderItem={renderTestCard}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#007AFF"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.testsContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  historyButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  categoryTabActive: {
    backgroundColor: '#007AFF20',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  categoryTabText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryTabTextActive: {
    color: '#007AFF',
  },
  testsContainer: {
    padding: 20,
  },
  testCard: {
    marginBottom: 15,
    padding: 20,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  testIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  testInfo: {
    flex: 1,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  testDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  testStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  testStat: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  testStatText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  testActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  startButton: {
    flex: 1,
    marginRight: 10,
  },
  infoButton: {
    padding: 10,
  },
});

export default TestsScreen;
