import LessonFooter from '../../../components/LessonFooter';
import SubHeading2 from '../../../components/SubHeading2';
import Header from '../../../components/Header';
import CodeExampleLesson from '../../../components/CodeExampleLesson';

import BigLeftNextIcon from '../../../assets/images/Big Left Next Icon.png';
import BigRightNextIcon from '../../../assets/images/Big Right Next Icon.png';

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Page6() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Code examples for different data structures
  const codeExamples = [
    // Slide 1: Arrays
    {
      javascript: `// Array implementation
const numbers = [1, 2, 3, 4, 5];

// Accessing elements
console.log(numbers[0]); // Output: 1

// Adding elements
numbers.push(6); // Add to end
numbers.unshift(0); // Add to beginning

// Removing elements
numbers.pop(); // Remove from end
numbers.shift(); // Remove from beginning

// Array methods
numbers.map(x => x * 2); // Transform elements
numbers.filter(x => x > 3); // Filter elements
numbers.reduce((a, b) => a + b, 0); // Sum all elements`,
      python: `# Array implementation (using list)
numbers = [1, 2, 3, 4, 5]

# Accessing elements
print(numbers[0])  # Output: 1

# Adding elements
numbers.append(6)  # Add to end
numbers.insert(0, 0)  # Add to beginning

# Removing elements
numbers.pop()  # Remove from end
numbers.pop(0)  # Remove from beginning

# List methods
[x * 2 for x in numbers]  # Transform elements
[x for x in numbers if x > 3]  # Filter elements
sum(numbers)  # Sum all elements`,
      cpp: `// Array implementation
#include <vector>
#include <iostream>

int main() {
    std::vector<int> numbers = {1, 2, 3, 4, 5};
    
    // Accessing elements
    std::cout << numbers[0] << std::endl;  // Output: 1
    
    // Adding elements
    numbers.push_back(6);  // Add to end
    numbers.insert(numbers.begin(), 0);  // Add to beginning
    
    // Removing elements
    numbers.pop_back();  // Remove from end
    numbers.erase(numbers.begin());  // Remove from beginning
    
    // Vector methods
    for(int& num : numbers) {
        num *= 2;  // Transform elements
    }
    
    return 0;
}`
    },
    // Slide 2: Linked Lists
    {
      javascript: `// Linked List implementation
class Node {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
  }

  // Add node to end
  append(value) {
    const newNode = new Node(value);
    if (!this.head) {
      this.head = newNode;
      return;
    }
    let current = this.head;
    while (current.next) {
      current = current.next;
    }
    current.next = newNode;
  }

  // Print all nodes
  print() {
    let current = this.head;
    while (current) {
      console.log(current.value);
      current = current.next;
    }
  }
}

// Usage
const list = new LinkedList();
list.append(1);
list.append(2);
list.append(3);
list.print();`,
      python: `# Linked List implementation
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None
    
    # Add node to end
    def append(self, value):
        new_node = Node(value)
        if not self.head:
            self.head = new_node
            return
        current = self.head
        while current.next:
            current = current.next
        current.next = new_node
    
    # Print all nodes
    def print(self):
        current = self.head
        while current:
            print(current.value)
            current = current.next

# Usage
list = LinkedList()
list.append(1)
list.append(2)
list.append(3)
list.print()`,
      cpp: `// Linked List implementation
#include <iostream>

class Node {
public:
    int value;
    Node* next;
    Node(int val) : value(val), next(nullptr) {}
};

class LinkedList {
public:
    Node* head;
    LinkedList() : head(nullptr) {}
    
    // Add node to end
    void append(int value) {
        Node* newNode = new Node(value);
        if (!head) {
            head = newNode;
            return;
        }
        Node* current = head;
        while (current->next) {
            current = current->next;
        }
        current->next = newNode;
    }
    
    // Print all nodes
    void print() {
        Node* current = head;
        while (current) {
            std::cout << current->value << std::endl;
            current = current->next;
        }
    }
};

int main() {
    LinkedList list;
    list.append(1);
    list.append(2);
    list.append(3);
    list.print();
    return 0;
}`
    },
    // Slide 3: Stacks
    {
      javascript: `// Stack implementation
class Stack {
  constructor() {
    this.items = [];
  }

  push(item) {
    this.items.push(item);
  }

  pop() {
    return this.items.pop();
  }

  peek() {
    return this.items[this.items.length - 1];
  }
}

// Usage
const stack = new Stack();
stack.push(1);
stack.push(2);
console.log(stack.pop()); // Output: 2`,
      python: `# Stack implementation
class Stack:
    def __init__(self):
        self.items = []
    
    def push(self, item):
        self.items.append(item)
    
    def pop(self):
        return self.items.pop()
    
    def peek(self):
        return self.items[-1]

# Usage
stack = Stack()
stack.push(1)
stack.push(2)
print(stack.pop())  # Output: 2`,
      cpp: `// Stack implementation
#include <iostream>
#include <stack>

int main() {
    std::stack<int> stack;
    stack.push(1);
    stack.push(2);
    std::cout << stack.top() << std::endl;  // Output: 2
    stack.pop();
    return 0;
}`
    }
  ];

  const nextLesson = () => {
    if (currentIndex < codeExamples.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevLesson = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#1F274D] to-[#0E1328] text-white flex flex-col font-sans relative">
      <Header />

      {/* Top bar with navigation arrows + progress bar */}
      <div className="w-full max-w-7xl mx-auto mt-2 px-2">
        <SubHeading2
          progress={currentIndex + 1}
          totalSteps={codeExamples.length}
          exitPath="/mainPage"
          onNext={nextLesson}
          onPrev={prevLesson}
        />
      </div>

      {/* Lesson content area, centered and card-like */}
      <div className="flex-grow flex flex-col justify-center items-center gap-8 overflow-y-auto px-2 py-6 animate-fade-in">
        <div className="w-full max-w-7xl mx-auto bg-[#232b4d]/80 rounded-3xl shadow-2xl border border-blue-500/30 p-0 sm:p-4 md:p-8 flex flex-col items-center transition-all duration-300">
          <CodeExampleLesson
            title={
              currentIndex === 0 ? (
                <span className="text-3xl font-black text-center text-teal-400 drop-shadow-md">Arrays</span>
              ) : currentIndex === 1 ? (
                <span className="text-3xl font-black text-center text-green-400 drop-shadow-md">Linked Lists</span>
              ) : (
                <span className="text-3xl font-black text-center text-blue-400 drop-shadow-md">Stacks</span>
              )
            }
            description={
              currentIndex === 0 ? "Arrays: Store multiple values in a fixed order." :
              currentIndex === 1 ? "Linked Lists: Use nodes to store elements dynamically." :
              "Stacks: Follow LIFO (Last-In, First-Out) rules for data insertion and removal."
            }
            codeExamples={codeExamples}
            currentIndex={currentIndex}
            nextLesson={nextLesson}
            prevLesson={prevLesson}
            leftIcon={BigLeftNextIcon}
            rightIcon={BigRightNextIcon}
          />
        </div>
      </div>

      {/* Conditionally render the footer button when at last lesson */}
      <div className="w-full max-w-7xl mx-auto pb-8 flex justify-center">
        {currentIndex === codeExamples.length - 1 && (
          <LessonFooter
            buttonText="Continue"
            onClick={() => navigate('/page7')}
            className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-lg font-bold py-3 px-6 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
          />
        )}
      </div>
    </div>
  );
}

