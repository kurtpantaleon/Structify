import SubHeading2 from '../../../components/SubHeading2';
import Header from '../../../components/Header';
import LessonPages from '../../../components/LessonPages';
import LessonFooter from '../../../components/LessonFooter';
import CodeExampleLesson from '../../../components/CodeExampleLesson';

import Bullet1 from '../../../assets/image/Lesson2.1/image1.png';
import Bullet2 from '../../../assets/image/Lesson2.1/image2.png';
import Bullet3 from '../../../assets/image/Lesson2.1/image3.png';

import BigLeftNextIcon from '../../../assets/images/Big Left Next Icon.png';
import BigRightNextIcon from '../../../assets/images/Big Right Next Icon.png';

import React, { useState } from 'react'; // React and useState hook
import { useNavigate } from 'react-router-dom'; // For navigation between pages

export default function L2Page1() {
  const navigate = useNavigate(); // Hook to trigger route changes
  const [currentIndex, setCurrentIndex] = useState(0); // Track current lesson index

  // Array code example for slide 3
  const arrayCodeExample = [
    {
      javascript: `// JavaScript Array Example
// Modern array operations with ES6+ features
const scores = [98, 87, 92, 75, 88];

// Accessing elements
console.log(scores[0]); // Output: 98

// Adding elements
scores.push(100); // Add to end
scores.unshift(95); // Add to beginning

// Removing elements
scores.pop(); // Remove from end
scores.shift(); // Remove from beginning

// Modern array methods
const doubledScores = scores.map(score => score * 2);
const highScores = scores.filter(score => score >= 90);
const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

// Array destructuring
const [first, second, ...rest] = scores;`,

      python: `# Python List Example
# Python's list is a dynamic array implementation
scores = [98, 87, 92, 75, 88]

# Accessing elements
print(scores[0])  # Output: 98
print(scores[-1])  # Last element: 88

# Adding elements
scores.append(100)  # Add to end
scores.insert(0, 95)  # Add to beginning

# Removing elements
scores.pop()  # Remove from end
scores.pop(0)  # Remove from beginning

# List comprehensions
doubled_scores = [score * 2 for score in scores]
high_scores = [score for score in scores if score >= 90]
average_score = sum(scores) / len(scores)

# List slicing
first_two = scores[:2]
last_three = scores[-3:]`,

      cpp: `// C++ Vector Example
// Using std::vector for dynamic arrays
#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>

int main() {
    std::vector<int> scores = {98, 87, 92, 75, 88};
    
    // Accessing elements
    std::cout << scores[0] << std::endl;  // Output: 98
    
    // Adding elements
    scores.push_back(100);  // Add to end
    scores.insert(scores.begin(), 95);  // Add to beginning
    
    // Removing elements
    scores.pop_back();  // Remove from end
    scores.erase(scores.begin());  // Remove from beginning
    
    // Vector operations
    std::vector<int> doubled_scores;
    std::transform(scores.begin(), scores.end(), 
                  std::back_inserter(doubled_scores),
                  [](int score) { return score * 2; });
    
    // Calculate average
    double average = std::accumulate(scores.begin(), scores.end(), 0.0) / scores.size();
    
    return 0;
}`,

      csharp: `// C# List Example
// Using List<T> for dynamic arrays
using System;
using System.Collections.Generic;
using System.Linq;

class Program {
    static void Main() {
        // Initialize list
        List<int> scores = new List<int> { 98, 87, 92, 75, 88 };
        
        // Accessing elements
        Console.WriteLine(scores[0]);  // Output: 98
        
        // Adding elements
        scores.Add(100);  // Add to end
        scores.Insert(0, 95);  // Add to beginning
        
        // Removing elements
        scores.RemoveAt(scores.Count - 1);  // Remove from end
        scores.RemoveAt(0);  // Remove from beginning
        
        // LINQ operations
        var doubledScores = scores.Select(score => score * 2).ToList();
        var highScores = scores.Where(score => score >= 90).ToList();
        double averageScore = scores.Average();
        
        // Collection initializer
        var firstTwo = scores.Take(2).ToList();
        var lastThree = scores.Skip(Math.Max(0, scores.Count - 3)).ToList();
    }
}`,

      java: `// Java ArrayList Example
// Using ArrayList for dynamic arrays
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class Main {
    public static void main(String[] args) {
        // Initialize list
        List<Integer> scores = new ArrayList<>();
        scores.add(98);
        scores.add(87);
        scores.add(92);
        scores.add(75);
        scores.add(88);
        
        // Accessing elements
        System.out.println(scores.get(0));  // Output: 98
        
        // Adding elements
        scores.add(100);  // Add to end
        scores.add(0, 95);  // Add to beginning
        
        // Removing elements
        scores.remove(scores.size() - 1);  // Remove from end
        scores.remove(0);  // Remove from beginning
        
        // Stream operations
        List<Integer> doubledScores = scores.stream()
            .map(score -> score * 2)
            .collect(Collectors.toList());
            
        List<Integer> highScores = scores.stream()
            .filter(score -> score >= 90)
            .collect(Collectors.toList());
            
        double averageScore = scores.stream()
            .mapToInt(Integer::intValue)
            .average()
            .orElse(0.0);
            
        // Sublist operations
        List<Integer> firstTwo = scores.subList(0, Math.min(2, scores.size()));
        List<Integer> lastThree = scores.subList(
            Math.max(0, scores.size() - 3), 
            scores.size()
        );
    }
}`
    }
  ];

  // Lesson content stored in an array
  const lessons = [
    {
      description: (
        <>
          Arrays are a{' '}
          <span className="font-extrabold text-yellow-400 animate-pulse">
            list of items stored in a specific order.
          </span>{' '}
        </>
      ),
      mediaType: 'image',
      image: Bullet1,
    },
    {
      description: (
        <>
          In Array each element has an  {' '}
          <span className="font-extrabold text-green-400 animate-pulse">
            index
          </span>{' '}
          (position).
        </>
      ),
      mediaType: 'image',
      image: Bullet2,
    },
    {
      description: (
        <>
          <span className="font-extrabold text-blue-400 animate-pulse">
            Code Example:
          </span>{' '}
          Storing the top 5 student scores.
        </>
      ),
      mediaType: 'code',
      image: null,
    }
  ];

  // Move to next lesson if not last
  const nextLesson = () => {
    if (currentIndex < lessons.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  // Move to previous lesson if not first
  const prevLesson = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-b from-[#1F274D] to-[#0E1328] text-white flex flex-col font-sans relative">
      <Header />

      {/* Top bar with navigation arrows + progress bar */}
      <SubHeading2
        progress={currentIndex + 1} // 1-based progress index
        totalSteps={lessons.length}
        exitPath="/mainPage"
        onNext={nextLesson}
        onPrev={prevLesson}
      />

      {/* Lesson content area */}
      <div className="flex-grow flex flex-col justify-center items-center gap-8 overflow-y-auto px-4 animate-fade-in">
        {currentIndex < 2 ? (
          <LessonPages
            title={
              <span className="text-3xl font-black text-center text-teal-400 drop-shadow-md">
                Types of Basic Data Structures
              </span>
            }
            lessons={lessons}
            currentIndex={currentIndex}
            nextLesson={nextLesson}
            prevLesson={prevLesson}
            leftIcon={BigLeftNextIcon}
            rightIcon={BigRightNextIcon}
          />
        ) : (
          <div className="w-full max-w-4xl mx-auto">
            <CodeExampleLesson
              title={<span className="text-3xl font-black text-center text-blue-400 drop-shadow-md">Array Example</span>}
              description={"How to store and access values in an array."}
              codeExamples={arrayCodeExample}
              currentIndex={0}
              nextLesson={nextLesson}
              prevLesson={prevLesson}
              leftIcon={BigLeftNextIcon}
              rightIcon={BigRightNextIcon}
            />
          </div>
        )}
      </div>

      {/* Conditionally render the footer button when at last lesson */}
      {currentIndex === lessons.length - 1 && (
        <LessonFooter
          buttonText="Continue"
          onClick={() => navigate('/l2page2')}
          className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-lg font-bold py-3 px-6 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
        />
      )}
    </div>
  );
}

 
