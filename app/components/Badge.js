import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Badge = ({ 
  text, 
  variant = 'default', 
  size = 'medium',
  style,
  textStyle 
}) => {
  const badgeStyles = [
    styles.badge,
    styles[variant],
    styles[size],
    style
  ];

  const badgeTextStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    textStyle
  ];

  return (
    <View style={badgeStyles}>
      <Text style={badgeTextStyles}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Variants
  default: {
    backgroundColor: '#F2F2F7',
  },
  primary: {
    backgroundColor: '#007AFF',
  },
  success: {
    backgroundColor: '#34C759',
  },
  warning: {
    backgroundColor: '#FF9500',
  },
  danger: {
    backgroundColor: '#FF3B30',
  },
  verified: {
    backgroundColor: '#30D158',
  },
  skill: {
    backgroundColor: '#5856D6',
  },
  
  // Text variants
  defaultText: {
    color: '#000000',
  },
  primaryText: {
    color: '#ffffff',
  },
  successText: {
    color: '#ffffff',
  },
  warningText: {
    color: '#ffffff',
  },
  dangerText: {
    color: '#ffffff',
  },
  verifiedText: {
    color: '#ffffff',
  },
  skillText: {
    color: '#ffffff',
  },
  
  // Sizes
  small: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  medium: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  large: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  
  // Text sizes
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },
});

export default Badge;
