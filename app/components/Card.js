import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const Card = ({ 
  children, 
  title, 
  subtitle, 
  onPress, 
  style, 
  headerStyle,
  variant = 'default' 
}) => {
  const cardStyles = [
    styles.card,
    styles[variant],
    style
  ];

  const CardContent = (
    <View style={cardStyles}>
      {(title || subtitle) && (
        <View style={[styles.header, headerStyle]}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        {CardContent}
      </TouchableOpacity>
    );
  }

  return CardContent;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  content: {
    flex: 1,
  },
  
  // Variants
  default: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  elevated: {
    elevation: 4,
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  flat: {
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: '#F2F2F7',
  },
});

export default Card;
