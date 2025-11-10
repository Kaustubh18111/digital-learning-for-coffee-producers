// Hardcoded course definition for immediate availability without Firestore
export const HARDCODED_COURSE = {
  id: 'low-intervention-farming',
  title: 'Low Intervention Farming',
  description: 'A course on low-intervention and regenerative farming principles.',
  // Provide a few placeholder modules; replace VIDEO_ID_x with real IDs later if desired
  modules: [
    {
      id: 'intro',
      title: 'Introduction to Low Intervention',
      video_url: 'https://www.youtube.com/embed/8q_1dD3G1-s'
    },
    {
      id: 'soil-health',
      title: 'Soil Health Basics',
      video_url: 'https://www.youtube.com/embed/VIDEO_ID_2'
    },
    {
      id: 'water-management',
      title: 'Water Management for Resilience',
      video_url: 'https://www.youtube.com/embed/VIDEO_ID_3'
    }
  ]
};
