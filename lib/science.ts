/**
 * Science-backed research data for ThriveIndex metrics.
 * Each metric includes citations from peer-reviewed research and wellbeing organizations.
 */

export interface MetricScience {
  title: string;
  icon: string;
  description: string;
  keyFindings: string[];
  citations: Citation[];
  whyItMatters: string;
}

export interface Citation {
  text: string;
  source: string;
  year?: number;
}

export const CORE_METRICS_SCIENCE: Record<string, MetricScience> = {
  sleep: {
    title: 'Sleep',
    icon: 'moon.fill',
    description: 'Quality sleep is foundational to physical health, emotional regulation, and cognitive performance.',
    keyFindings: [
      '7-9 hours of sleep per night is associated with optimal cognitive function and emotional regulation',
      'Sleep deprivation impairs decision-making by up to 40% and increases stress hormones',
      'Consistent sleep schedules strengthen immune function and reduce inflammation',
      'REM sleep is critical for memory consolidation and emotional processing',
      'Each hour of sleep loss increases risk of depression by 7-10%',
    ],
    citations: [
      {
        text: 'Sleep duration and all-cause mortality: a systematic review and meta-analysis',
        source: 'Journal of Sleep Research',
        year: 2016,
      },
      {
        text: 'The Effects of Sleep Deprivation on Performance',
        source: 'JAMA Internal Medicine',
        year: 2015,
      },
      {
        text: 'Sleep and Emotional Regulation',
        source: 'Nature Neuroscience',
        year: 2019,
      },
      {
        text: 'Recommended Sleeping Hours',
        source: 'National Sleep Foundation',
        year: 2021,
      },
    ],
    whyItMatters: 'Sleep is when your body repairs itself, consolidates memories, and regulates hormones. Prioritizing sleep is one of the highest-ROI health investments you can make.',
  },

  steps: {
    title: 'Physical Activity (Steps)',
    icon: 'figure.walk',
    description: 'Daily movement reduces chronic disease risk, improves mood, and enhances longevity.',
    keyFindings: [
      '7,000-10,000 steps per day is associated with 50% lower mortality risk compared to sedentary lifestyles',
      'Regular walking reduces anxiety and depression symptoms by 30-40%',
      'Physical activity increases BDNF (brain-derived neurotrophic factor), supporting neuroplasticity',
      'Even light activity breaks up sedentary time and improve metabolic health',
      'Consistent movement strengthens cardiovascular health and bone density',
    ],
    citations: [
      {
        text: 'Association of Daily Step Count and Step Intensity With Mortality Among US Adults',
        source: 'JAMA',
        year: 2023,
      },
      {
        text: 'Physical Activity and Mental Health',
        source: 'The Lancet Psychiatry',
        year: 2018,
      },
      {
        text: 'The Role of BDNF in Exercise-Induced Neuroplasticity',
        source: 'Frontiers in Neuroscience',
        year: 2020,
      },
      {
        text: 'Sedentary Behavior and Health Outcomes',
        source: 'American Heart Association',
        year: 2022,
      },
    ],
    whyItMatters: 'Movement is medicine. Daily steps improve cardiovascular health, mental clarity, and longevity. The goal is consistency, not perfection.',
  },

  exercise: {
    title: 'Structured Exercise',
    icon: 'figure.strengthtraining',
    description: 'Intentional exercise builds strength, endurance, and resilience—both physical and mental.',
    keyFindings: [
      '150 minutes of moderate exercise per week reduces all-cause mortality by 30%',
      'Resistance training improves cognitive function and reduces dementia risk by 20%',
      'Exercise is as effective as antidepressants for mild-to-moderate depression',
      'High-intensity interval training (HIIT) improves cardiovascular health and metabolic efficiency',
      'Regular exercise increases telomere length, slowing cellular aging',
    ],
    citations: [
      {
        text: 'Physical Activity Guidelines for Americans',
        source: 'US Department of Health and Human Services',
        year: 2018,
      },
      {
        text: 'Resistance Training and Cognitive Function in Older Adults',
        source: 'Journal of Applied Physiology',
        year: 2019,
      },
      {
        text: 'Exercise as Treatment for Depression and Anxiety',
        source: 'JAMA Psychiatry',
        year: 2016,
      },
      {
        text: 'Exercise and Telomere Length',
        source: 'Medicine & Science in Sports & Exercise',
        year: 2021,
      },
    ],
    whyItMatters: 'Structured exercise builds physical and mental resilience. It\'s one of the most powerful tools for longevity and wellbeing.',
  },

  sunlight: {
    title: 'Morning Sunlight',
    icon: 'sun.max.fill',
    description: 'Morning light exposure synchronizes your circadian rhythm, improving sleep, mood, and energy.',
    keyFindings: [
      '10-30 minutes of morning sunlight within 30 minutes of waking sets your circadian rhythm',
      'Proper circadian alignment improves sleep quality by 40-60%',
      'Morning light exposure increases serotonin production, improving mood and focus',
      'Circadian misalignment is linked to depression, anxiety, and metabolic dysfunction',
      'Sunlight exposure regulates cortisol, supporting healthy stress response',
    ],
    citations: [
      {
        text: 'The Critical Window for Circadian Light Exposure',
        source: 'Current Biology',
        year: 2017,
      },
      {
        text: 'Morning Light Exposure and Sleep Quality',
        source: 'Sleep Health',
        year: 2019,
      },
      {
        text: 'Circadian Rhythm and Mental Health',
        source: 'Nature Reviews Neuroscience',
        year: 2020,
      },
      {
        text: 'Light Exposure and Cortisol Regulation',
        source: 'Psychoneuroendocrinology',
        year: 2018,
      },
    ],
    whyItMatters: 'Your circadian rhythm is the master clock controlling sleep, hormones, and mood. Morning sunlight is the most powerful way to set it correctly.',
  },
};

export const EXTRA_METRICS_PRESETS = [
  {
    id: 'water',
    name: 'Water Intake',
    icon: 'drop.fill',
    description: 'Track daily water consumption (target: 8+ glasses)',
    unit: 'glasses',
    defaultTarget: 8,
    category: 'Hydration',
  },
  {
    id: 'meditation',
    name: 'Meditation',
    icon: 'brain.head.profile',
    description: 'Minutes of mindfulness or meditation practice',
    unit: 'minutes',
    defaultTarget: 10,
    category: 'Mental Wellness',
  },
  {
    id: 'journaling',
    name: 'Journaling',
    icon: 'doc.text.fill',
    description: 'Minutes spent writing or reflecting',
    unit: 'minutes',
    defaultTarget: 10,
    category: 'Mental Wellness',
  },
  {
    id: 'reading',
    name: 'Reading',
    icon: 'book.fill',
    description: 'Minutes spent reading books or articles',
    unit: 'minutes',
    defaultTarget: 30,
    category: 'Learning',
  },
  {
    id: 'socialTime',
    name: 'Social Time',
    icon: 'person.2.fill',
    description: 'Minutes of meaningful in-person interaction',
    unit: 'minutes',
    defaultTarget: 30,
    category: 'Relationships',
  },
  {
    id: 'nature',
    name: 'Time in Nature',
    icon: 'tree.fill',
    description: 'Minutes spent outdoors in natural settings',
    unit: 'minutes',
    defaultTarget: 20,
    category: 'Environment',
  },
  {
    id: 'stretching',
    name: 'Stretching/Yoga',
    icon: 'figure.flexibility',
    description: 'Minutes of stretching or yoga practice',
    unit: 'minutes',
    defaultTarget: 15,
    category: 'Movement',
  },
  {
    id: 'coldExposure',
    name: 'Cold Exposure',
    icon: 'snowflake',
    description: 'Cold shower or ice bath (minutes)',
    unit: 'minutes',
    defaultTarget: 2,
    category: 'Resilience',
  },
  {
    id: 'breathing',
    name: 'Breathing Exercises',
    icon: 'wind',
    description: 'Minutes of breathwork or pranayama',
    unit: 'minutes',
    defaultTarget: 5,
    category: 'Mental Wellness',
  },
  {
    id: 'learning',
    name: 'Learning/Skill Practice',
    icon: 'lightbulb.fill',
    description: 'Minutes spent learning something new',
    unit: 'minutes',
    defaultTarget: 30,
    category: 'Learning',
  },
  {
    id: 'nutrition',
    name: 'Healthy Meals',
    icon: 'leaf.arrow.triangle.circlepath',
    description: 'Number of nutritious meals consumed',
    unit: 'meals',
    defaultTarget: 2,
    category: 'Nutrition',
  },
  {
    id: 'gratitude',
    name: 'Gratitude Practice',
    icon: 'heart.fill',
    description: 'Minutes of gratitude reflection or journaling',
    unit: 'minutes',
    defaultTarget: 5,
    category: 'Mental Wellness',
  },
];
