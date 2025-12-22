# Audio Lesson Module - UI Documentation with Subsections

## Overview
The Audio Lesson module now includes enhanced hierarchical content organization with head titles, sections, subsections, and automatic counting at all levels.

## 🆕 Enhanced Features

### 1. Head Title
- **Purpose**: Main heading/topic for the entire lesson
- **Usage**: Displayed prominently above the lesson content
- **Example**: "Constitutional Law Fundamentals" (head title) > "Article 14 - Right to Equality" (title)

### 2. Hierarchical Structure
- **Lesson**: Main content container with head title and title
- **Sections**: Major divisions within a lesson
- **Subsections**: Detailed breakdowns within sections
- **Auto-counting**: Automatic counting at section and subsection levels

### 3. Automatic Counting System
- **totalSections**: Auto-calculated count of main sections
- **totalSubsections**: Auto-calculated count per section
- **Display**: Shows "X sections, Y subsections" in overview

## 📋 Enhanced Data Structure

### Complete Audio Lesson Schema Format
```json
{
  "_id": "lesson_id",
  "title": "Article 14 - Right to Equality",
  "headTitle": "Constitutional Law Fundamentals",
  "description": "Detailed explanation of Article 14...",
  "totalSections": 3,
  "category": "constitutional-law",
  "sections": [
    {
      "title": "Introduction to Article 14",
      "totalSubsections": 2,
      "englishText": "Article 14 ensures equality before law...",
      "hindiText": "अनुच्छेद 14 कानून के समक्ष समानता सुनिश्चित करता है...",
      "easyEnglishText": "Article 14 means everyone is equal...",
      "easyHindiText": "अनुच्छेद 14 का मतलब है सभी बराबर हैं...",
      "englishAudio": {
        "url": "/uploads/audio/section1-english.mp3",
        "fileName": "intro-article14-en.mp3",
        "fileSize": 1024000
      },
      "hindiAudio": {
        "url": "/uploads/audio/section1-hindi.mp3",
        "fileName": "intro-article14-hi.mp3",
        "fileSize": 987000
      },
      "easyEnglishAudio": {
        "url": "/uploads/audio/section1-easy-english.mp3",
        "fileName": "intro-article14-easy-en.mp3",
        "fileSize": 856000
      },
      "easyHindiAudio": {
        "url": "/uploads/audio/section1-easy-hindi.mp3",
        "fileName": "intro-article14-easy-hi.mp3",
        "fileSize": 798000
      },
      "subsections": [
        {
          "title": "Historical Background",
          "englishText": "The concept originated from...",
          "hindiText": "यह अवधारणा से उत्पन्न हुई...",
          "englishAudio": {
            "url": "/uploads/audio/subsection1-1-english.mp3",
            "fileName": "history-background-en.mp3",
            "fileSize": 512000
          },
          "hindiAudio": {
            "url": "/uploads/audio/subsection1-1-hindi.mp3",
            "fileName": "history-background-hi.mp3",
            "fileSize": 487000
          }
        },
        {
          "title": "Constitutional Provisions",
          "englishText": "Article 14 states that...",
          "hindiText": "अनुच्छेद 14 कहता है कि...",
          "englishAudio": {
            "url": "/uploads/audio/subsection1-2-english.mp3",
            "fileName": "constitutional-provisions-en.mp3",
            "fileSize": 678000
          },
          "hindiAudio": {
            "url": "/uploads/audio/subsection1-2-hindi.mp3",
            "fileName": "constitutional-provisions-hi.mp3",
            "fileSize": 645000
          },
          "easyEnglishAudio": {
            "url": "/uploads/audio/subsection1-2-easy-english.mp3",
            "fileName": "constitutional-provisions-easy-en.mp3",
            "fileSize": 567000
          },
          "easyHindiAudio": {
            "url": "/uploads/audio/subsection1-2-easy-hindi.mp3",
            "fileName": "constitutional-provisions-easy-hi.mp3",
            "fileSize": 534000
          }
        }
      ]
    }
  ],
  "englishAudio": {
    "url": "/uploads/audio/lesson-english.mp3",
    "fileName": "article14-complete-en.mp3",
    "fileSize": 5048576
  },
  "hindiAudio": {
    "url": "/uploads/audio/lesson-hindi.mp3",
    "fileName": "article14-complete-hi.mp3",
    "fileSize": 4987654
  },
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### Audio File Structure
Each level (Lesson, Section, Subsection) can have up to 4 audio variants:
- **englishAudio**: Standard English narration
- **hindiAudio**: Standard Hindi narration  
- **easyEnglishAudio**: Simplified English for beginners
- **easyHindiAudio**: Simplified Hindi for beginners

### Schema Hierarchy
```
AudioLesson
├── englishAudio, hindiAudio (lesson-level audio)
├── englishTranscription, hindiTranscription
├── easyEnglishTranscription, easyHindiTranscription
└── sections[] (AudioSection)
    ├── englishAudio, hindiAudio, easyEnglishAudio, easyHindiAudio
    ├── englishText, hindiText, easyEnglishText, easyHindiText
    └── subsections[] (AudioSubsection)
        ├── englishAudio, hindiAudio, easyEnglishAudio, easyHindiAudio
        └── englishText, hindiText, easyEnglishText, easyHindiText
```

## 🎨 UI Components with Subsections

### 1. Enhanced Lesson Card Component
```jsx
const LessonCard = ({ lesson }) => {
  const totalSubsections = lesson.sections?.reduce(
    (sum, section) => sum + (section.totalSubsections || 0), 0
  );

  return (
    <div className="lesson-card">
      {lesson.headTitle && (
        <div className="head-title">{lesson.headTitle}</div>
      )}
      <h3 className="lesson-title">{lesson.title}</h3>
      <p className="description">{lesson.description}</p>
      <div className="lesson-meta">
        <span className="section-count">
          {lesson.totalSections} sections
          {totalSubsections > 0 && `, ${totalSubsections} subsections`}
        </span>
        <span className="category">{lesson.category}</span>
      </div>
    </div>
  );
};
```

### 2. Hierarchical Section Display
```jsx
const SectionItem = ({ section, index }) => (
  <div className="section-item">
    <div className="section-header">
      <h4 className="section-title">
        {index + 1}. {section.title}
      </h4>
      {section.totalSubsections > 0 && (
        <span className="subsection-badge">
          {section.totalSubsections} subsections
        </span>
      )}
    </div>
    
    {section.subsections && section.subsections.length > 0 && (
      <div className="subsections-list">
        {section.subsections.map((subsection, subIndex) => (
          <div key={subIndex} className="subsection-item">
            <div className="subsection-header">
              <span className="subsection-number">
                {index + 1}.{subIndex + 1}
              </span>
              <h5 className="subsection-title">{subsection.title}</h5>
            </div>
            <div className="subsection-content">
              {subsection.englishText && (
                <p className="text-english">{subsection.englishText}</p>
              )}
              {subsection.hindiText && (
                <p className="text-hindi">{subsection.hindiText}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
```

### 3. Lesson Detail View with Subsections
```jsx
const LessonDetail = ({ lesson }) => {
  const totalSubsections = lesson.sections?.reduce(
    (sum, section) => sum + (section.totalSubsections || 0), 0
  );

  return (
    <div className="lesson-detail">
      <div className="lesson-header">
        {lesson.headTitle && (
          <div className="breadcrumb">
            <span className="head-title">{lesson.headTitle}</span>
            <span className="separator">›</span>
          </div>
        )}
        <h1 className="lesson-title">{lesson.title}</h1>
        <div className="lesson-stats">
          <span>{lesson.totalSections} sections</span>
          {totalSubsections > 0 && (
            <>
              <span>•</span>
              <span>{totalSubsections} subsections</span>
            </>
          )}
          <span>•</span>
          <span>{lesson.category}</span>
        </div>
      </div>
      
      <div className="audio-controls">
        {/* Audio player components */}
      </div>
      
      <div className="sections-list">
        {lesson.sections?.map((section, index) => (
          <SectionItem key={index} section={section} index={index} />
        ))}
      </div>
    </div>
  );
};
```

### 4. Admin Form with Subsection Management
```jsx
const AudioLessonForm = ({ lesson, onSubmit }) => {
  const [formData, setFormData] = useState({
    headTitle: lesson?.headTitle || '',
    title: lesson?.title || '',
    description: lesson?.description || '',
    sections: lesson?.sections || []
  });

  const addSection = () => {
    setFormData({
      ...formData,
      sections: [...formData.sections, {
        title: '',
        startTime: 0,
        endTime: 0,
        subsections: []
      }]
    });
  };

  const addSubsection = (sectionIndex) => {
    const updatedSections = [...formData.sections];
    if (!updatedSections[sectionIndex].subsections) {
      updatedSections[sectionIndex].subsections = [];
    }
    updatedSections[sectionIndex].subsections.push({
      title: '',
      startTime: 0,
      endTime: 0
    });
    setFormData({ ...formData, sections: updatedSections });
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="form-group">
        <label>Head Title (Optional)</label>
        <input
          type="text"
          placeholder="e.g., Constitutional Law Fundamentals"
          value={formData.headTitle}
          onChange={(e) => setFormData({...formData, headTitle: e.target.value})}
        />
      </div>

      <div className="form-group">
        <label>Lesson Title *</label>
        <input
          type="text"
          placeholder="e.g., Article 14 - Right to Equality"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          required
        />
      </div>

      <div className="sections-manager">
        <div className="sections-header">
          <h3>Sections ({formData.sections.length})</h3>
          <button type="button" onClick={addSection}>Add Section</button>
        </div>
        
        {formData.sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="section-editor">
            <div className="section-header">
              <h4>Section {sectionIndex + 1}</h4>
              <span className="subsection-count">
                {section.subsections?.length || 0} subsections
              </span>
            </div>
            
            <input
              type="text"
              placeholder="Section title"
              value={section.title}
              onChange={(e) => {
                const updated = [...formData.sections];
                updated[sectionIndex].title = e.target.value;
                setFormData({ ...formData, sections: updated });
              }}
            />
            
            <div className="subsections-manager">
              <button 
                type="button" 
                onClick={() => addSubsection(sectionIndex)}
              >
                Add Subsection
              </button>
              
              {section.subsections?.map((subsection, subIndex) => (
                <div key={subIndex} className="subsection-editor">
                  <label>Subsection {sectionIndex + 1}.{subIndex + 1}</label>
                  <input
                    type="text"
                    placeholder="Subsection title"
                    value={subsection.title}
                    onChange={(e) => {
                      const updated = [...formData.sections];
                      updated[sectionIndex].subsections[subIndex].title = e.target.value;
                      setFormData({ ...formData, sections: updated });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </form>
  );
};
```

## 📱 Mobile UI with Subsections

### 1. Responsive Hierarchical Layout
```css
.lesson-card {
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.head-title {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.lesson-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.section-item {
  border-left: 3px solid #e0e0e0;
  padding-left: 12px;
  margin-bottom: 16px;
}

.subsection-item {
  border-left: 2px solid #f0f0f0;
  padding-left: 8px;
  margin-left: 16px;
  margin-bottom: 8px;
}

.subsection-number {
  font-size: 12px;
  color: #888;
  font-weight: 500;
  margin-right: 8px;
}

.subsection-badge {
  background: #f3e5f5;
  color: #7b1fa2;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .lesson-card {
    padding: 12px;
  }
  
  .section-item {
    padding-left: 8px;
  }
  
  .subsection-item {
    margin-left: 12px;
    padding-left: 6px;
  }
}
```

### 2. Collapsible Sections
```jsx
const CollapsibleSection = ({ section, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="collapsible-section">
      <div 
        className="section-header clickable"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h4>{index + 1}. {section.title}</h4>
        <div className="section-meta">
          {section.totalSubsections > 0 && (
            <span className="subsection-count">
              {section.totalSubsections} subsections
            </span>
          )}
          <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
            ▼
          </span>
        </div>
      </div>
      
      {isExpanded && section.subsections && (
        <div className="subsections-expanded">
          {section.subsections.map((subsection, subIndex) => (
            <div key={subIndex} className="subsection-item">
              <span className="subsection-number">
                {index + 1}.{subIndex + 1}
              </span>
              <span className="subsection-title">{subsection.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

## 🔄 API Integration

### 1. Fetch Lessons with New Fields
```javascript
const fetchLessons = async (page = 1, limit = 10) => {
  const response = await fetch(`/api/audio-lessons?page=${page}&limit=${limit}`);
  const data = await response.json();
  
  // Data now includes headTitle and totalSections
  return data.items.map(lesson => ({
    ...lesson,
    displayTitle: lesson.headTitle 
      ? `${lesson.headTitle} › ${lesson.title}`
      : lesson.title,
    sectionText: `${lesson.totalSections} section${lesson.totalSections !== 1 ? 's' : ''}`
  }));
};
```

### 2. Create/Update Lesson
```javascript
const saveLessonWithSections = async (lessonData, files) => {
  const formData = new FormData();
  
  // Add text fields
  formData.append('headTitle', lessonData.headTitle || '');
  formData.append('title', lessonData.title);
  formData.append('description', lessonData.description || '');
  formData.append('sections', JSON.stringify(lessonData.sections));
  
  // Add audio files
  if (files.englishAudio) {
    formData.append('englishAudio', files.englishAudio);
  }
  if (files.hindiAudio) {
    formData.append('hindiAudio', files.hindiAudio);
  }
  
  const response = await fetch('/api/admin/audio-lessons', {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};
```

## 🎯 Enhanced User Experience

### 1. Multi-Level Hierarchical Display
```
Constitutional Law Fundamentals
├── Article 14 - Right to Equality (3 sections, 8 subsections)
│   ├── 1. Introduction to Article 14 (2 subsections)
│   │   ├── 1.1 Historical Background
│   │   └── 1.2 Constitutional Provisions
│   ├── 2. Key Principles (3 subsections)
│   │   ├── 2.1 Equality Before Law
│   │   ├── 2.2 Equal Protection of Laws
│   │   └── 2.3 Reasonable Classification
│   └── 3. Case Studies (3 subsections)
├── Article 15 - Prohibition of Discrimination (2 sections, 5 subsections)
└── Article 16 - Equality of Opportunity (4 sections, 7 subsections)
```

### 2. Enhanced Search and Filter
- Filter by head title (topic categories)
- Search within specific sections/subsections
- Sort by complexity (total subsections)
- Filter by content depth (sections with/without subsections)

### 3. Advanced Progress Tracking
```jsx
const DetailedProgress = ({ lesson, progress }) => {
  const totalItems = lesson.sections.reduce((sum, section) => 
    sum + 1 + (section.subsections?.length || 0), 0
  );
  
  const completedItems = progress.sections.reduce((sum, sectionProgress) => 
    sum + (sectionProgress.completed ? 1 : 0) + 
    (sectionProgress.subsections?.filter(sub => sub.completed).length || 0), 0
  );

  return (
    <div className="detailed-progress">
      <div className="progress-overview">
        <span>{completedItems}/{totalItems} items completed</span>
        <span>{Math.round((completedItems/totalItems) * 100)}%</span>
      </div>
      
      <div className="section-progress">
        {lesson.sections.map((section, index) => (
          <div key={index} className="section-progress-item">
            <div className="section-status">
              <span className={`status-indicator ${
                progress.sections[index]?.completed ? 'completed' : 'pending'
              }`} />
              <span>{section.title}</span>
            </div>
            
            {section.subsections && (
              <div className="subsection-progress">
                {section.subsections.map((subsection, subIndex) => (
                  <div key={subIndex} className="subsection-status">
                    <span className={`status-indicator small ${
                      progress.sections[index]?.subsections?.[subIndex]?.completed 
                        ? 'completed' : 'pending'
                    }`} />
                    <span>{subsection.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 4. Content Navigation
```jsx
const LessonNavigator = ({ lesson, onNavigate }) => {
  const navigationItems = [];
  
  lesson.sections.forEach((section, sectionIndex) => {
    navigationItems.push({
      type: 'section',
      title: section.title,
      index: sectionIndex,
      hasAudio: !!(section.englishAudio || section.hindiAudio)
    });
    
    section.subsections?.forEach((subsection, subIndex) => {
      navigationItems.push({
        type: 'subsection',
        title: subsection.title,
        sectionIndex,
        subIndex,
        hasAudio: !!(subsection.englishAudio || subsection.hindiAudio)
      });
    });
  });

  return (
    <div className="lesson-navigator">
      <h4>Content Navigation</h4>
      <div className="navigation-items">
        {navigationItems.map((item, index) => (
          <div 
            key={index}
            className={`nav-item ${item.type}`}
            onClick={() => onNavigate(item)}
          >
            <span className="nav-title">{item.title}</span>
            {item.hasAudio && (
              <span className="audio-indicator">🎧</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 📊 Analytics Dashboard

### 1. Content Overview
- Total lessons by head title
- Average sections per lesson
- Most popular topics (by head title)

### 2. Usage Statistics
- Section completion rates
- Time spent per section
- Popular lesson sequences

## 🔧 Implementation Checklist

### Backend Changes ✅
- [x] Added `headTitle` field to schema
- [x] Added `totalSections` field with auto-calculation
- [x] Added `AudioSubsection` schema for nested content
- [x] Added `totalSubsections` field per section
- [x] Updated DTOs for create/update operations with subsections
- [x] Modified service to handle subsection counting
- [x] Enhanced file deletion to include subsection audio files

### Frontend Tasks
- [ ] Update lesson card components with subsection counts
- [ ] Implement hierarchical section/subsection display
- [ ] Create collapsible section components for mobile
- [ ] Add subsection management to admin forms
- [ ] Implement multi-level progress tracking
- [ ] Create content navigation with subsection support
- [ ] Update search/filter for subsection content
- [ ] Enhance mobile responsiveness for nested content

### Testing Requirements
- [ ] Test auto-calculation of section and subsection counts
- [ ] Verify hierarchical display in various contexts
- [ ] Test form validation with nested subsections
- [ ] Mobile UI testing for collapsible sections
- [ ] API integration testing with subsection data
- [ ] Performance testing with deeply nested content
- [ ] Audio file cleanup testing for subsections

## 🎨 Design Guidelines

### Typography Hierarchy
1. **Head Title**: 12px, uppercase, muted color
2. **Lesson Title**: 18px, bold, primary color
3. **Section Count**: 12px, badge style, accent color

### Color Scheme
- Head Title: `#666666`
- Lesson Title: `#1a1a1a`
- Section Count Badge: `#1976d2` background, `#ffffff` text
- Description: `#555555`

### Spacing
- Head Title to Lesson Title: 4px
- Lesson Title to Description: 8px
- Description to Meta: 12px