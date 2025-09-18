import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const HeatmapProgress = ({ 
  data = [], 
  size = 'medium', // 'small', 'medium', 'large'
  style,
  showLabels = false,
  weeksToShow = 12 
}) => {
  // Generate the last N weeks of data
  const generateWeekData = () => {
    const weeks = [];
    const today = new Date();
    
    for (let weekIndex = weeksToShow - 1; weekIndex >= 0; weekIndex--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (weekIndex * 7));
      
      const weekData = [];
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const currentDate = new Date(weekStart);
        currentDate.setDate(weekStart.getDate() + dayIndex);
        
        // Find activity for this date in provided data
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayActivity = data.find(item => item.date === dateStr);
        
        weekData.push({
          date: dateStr,
          activity: dayActivity?.activity || 0, // 0-4 intensity levels
          tooltip: dayActivity?.tooltip || null,
        });
      }
      
      weeks.push(weekData);
    }
    
    return weeks;
  };

  const weeks = generateWeekData();
  
  const getIntensityColor = (activity) => {
    switch (activity) {
      case 0: return '#EBEDF0'; // No activity
      case 1: return '#C6E48B'; // Low activity
      case 2: return '#7BC96F'; // Medium activity
      case 3: return '#239A3B'; // High activity
      case 4: return '#196127'; // Very high activity
      default: return '#EBEDF0';
    }
  };

  const getCellSize = () => {
    switch (size) {
      case 'small': return 8;
      case 'large': return 16;
      default: return 12; // medium
    }
  };

  const getGap = () => {
    switch (size) {
      case 'small': return 1;
      case 'large': return 3;
      default: return 2; // medium
    }
  };

  const cellSize = getCellSize();
  const gap = getGap();

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Calculate total activity for stats
  const totalActivity = data.reduce((sum, item) => sum + item.activity, 0);
  const activeDays = data.filter(item => item.activity > 0).length;
  const maxStreak = calculateMaxStreak(data);

  function calculateMaxStreak(activityData) {
    let maxStreak = 0;
    let currentStreak = 0;
    
    // Sort by date to ensure proper order
    const sortedData = [...activityData].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    for (const item of sortedData) {
      if (item.activity > 0) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    
    return maxStreak;
  }

  return (
    <View style={[styles.container, style]}>
      {/* Header with stats (only for medium/large sizes) */}
      {size !== 'small' && (
        <View style={styles.header}>
          <Text style={styles.title}>Learning Activity</Text>
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalActivity}</Text>
              <Text style={styles.statLabel}>total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{activeDays}</Text>
              <Text style={styles.statLabel}>active days</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{maxStreak}</Text>
              <Text style={styles.statLabel}>max streak</Text>
            </View>
          </View>
        </View>
      )}

      {/* Heatmap Grid */}
      <View style={styles.heatmapContainer}>
        {/* Day labels (only for medium/large) */}
        {size !== 'small' && showLabels && (
          <View style={styles.dayLabelsContainer}>
            {dayLabels.map((day, index) => (
              <Text key={index} style={[styles.dayLabel, { height: cellSize }]}>
                {day}
              </Text>
            ))}
          </View>
        )}

        {/* Weeks grid */}
        <View style={styles.weeksContainer}>
          {weeks.map((week, weekIndex) => (
            <View 
              key={weekIndex} 
              style={[styles.weekColumn, { gap }]}
            >
              {week.map((day, dayIndex) => (
                <View
                  key={`${weekIndex}-${dayIndex}`}
                  style={[
                    styles.dayCell,
                    {
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: getIntensityColor(day.activity),
                      borderRadius: cellSize * 0.2,
                    }
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
      </View>

      {/* Legend (only for medium/large) */}
      {size !== 'small' && (
        <View style={styles.legend}>
          <Text style={styles.legendLabel}>Less</Text>
          <View style={styles.legendColors}>
            {[0, 1, 2, 3, 4].map((intensity) => (
              <View
                key={intensity}
                style={[
                  styles.legendCell,
                  {
                    backgroundColor: getIntensityColor(intensity),
                    width: cellSize,
                    height: cellSize,
                    borderRadius: cellSize * 0.2,
                  }
                ]}
              />
            ))}
          </View>
          <Text style={styles.legendLabel}>More</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1D29',
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
    lineHeight: 22,
  },
  statLabel: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '500',
    marginTop: 2,
  },
  heatmapContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dayLabelsContainer: {
    marginRight: 8,
    justifyContent: 'space-between',
  },
  dayLabel: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '500',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weeksContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  weekColumn: {
    flexDirection: 'column',
  },
  dayCell: {
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 6,
  },
  legendLabel: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '500',
  },
  legendColors: {
    flexDirection: 'row',
    gap: 2,
  },
  legendCell: {
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
});

export default HeatmapProgress;
